import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ImageCard } from './ImageCard';
import { useColumnCount, useElementWidth } from '../hooks/useLayout';
import type { Photo } from '../types';

const GAP = 12;
const OVERSCAN = 600; // px rendered above/below the viewport

interface MasonryGridProps {
  photos: Photo[];
  onCardClick: (photo: Photo) => void;
  /** Reports how many cards are currently mounted in the DOM (virtualization proof). */
  onRenderedCountChange: (count: number) => void;
}

interface Placed {
  photo: Photo;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * True column-packed masonry with window virtualization.
 *
 * Layout: each photo is placed into the currently-shortest column (the same
 * packing CSS `columns` does), so columns stay balanced and there are no gaps
 * below short cards. Heights come from the real aspect ratio, so nothing
 * reflows once images load.
 *
 * Virtualization: positions are precomputed once, then only the cards whose
 * vertical span intersects the viewport (plus overscan) are mounted — the DOM
 * stays small no matter how many photos are loaded.
 */
export function MasonryGrid({
  photos,
  onCardClick,
  onRenderedCountChange,
}: MasonryGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(parentRef);
  const columnCount = useColumnCount();

  const columnWidth =
    containerWidth > 0
      ? (containerWidth - GAP * (columnCount - 1)) / columnCount
      : 0;

  // Pack photos into the shortest column; record absolute positions + total height.
  const { placements, totalHeight } = useMemo(() => {
    const columnHeights = new Array(columnCount).fill(0);
    const placed: Placed[] = [];

    if (columnWidth > 0) {
      for (const photo of photos) {
        const height = Math.round(columnWidth / (photo.width / photo.height));
        // Shortest column wins.
        let col = 0;
        for (let c = 1; c < columnCount; c++) {
          if (columnHeights[c] < columnHeights[col]) col = c;
        }
        const x = col * (columnWidth + GAP);
        const y = columnHeights[col];
        placed.push({ photo, x, y, width: columnWidth, height });
        columnHeights[col] = y + height + GAP;
      }
    }

    return {
      placements: placed,
      totalHeight: Math.max(0, ...columnHeights) - GAP,
    };
  }, [photos, columnCount, columnWidth]);

  // Offset of the grid from the top of the document — needed for window scroll.
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      setScrollMargin(rect.top + window.scrollY);
    }
  });

  // Track the viewport window (throttled to one update per animation frame).
  const [viewport, setViewport] = useState({ top: 0, height: 0 });
  
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setViewport({ top: window.scrollY, height: window.innerHeight });
    };
    const onScrollOrResize = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The visible slice: cards intersecting [viewport ± overscan] in grid space.
  const visible = useMemo(() => {
    const top = viewport.top - scrollMargin - OVERSCAN;
    const bottom = viewport.top - scrollMargin + viewport.height + OVERSCAN;
    return placements.filter((p) => p.y < bottom && p.y + p.height > top);
  }, [placements, viewport, scrollMargin]);

  useEffect(() => {
    onRenderedCountChange(visible.length);
  }, [visible, onRenderedCountChange]);

  return (
    <div
      ref={parentRef}
      className="relative w-full"
      style={{ height: totalHeight }}
    >
      {visible.map((p) => (
        <div
          key={p.photo.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: p.width,
            height: p.height,
          }}
        >
          <ImageCard
            photo={p.photo}
            width={p.width}
            height={p.height}
            onClick={onCardClick}
          />
        </div>
      ))}
    </div>
  );
}
