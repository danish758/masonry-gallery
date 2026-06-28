import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { sizedUrl } from '../lib/pixabay';
import type { Photo } from '../types';

interface ImageCardProps {
  photo: Photo;
  /** Rendered card width in px (one column). */
  width: number;
  /** Rendered card height in px, derived from the real aspect ratio. */
  height: number;
  onClick: (photo: Photo) => void;
}

/** A plain left-click opens the modal; modifier-clicks fall through to the
 * browser so "open in new tab/window" works and loads the detail page. */
function isModifiedClick(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * A single masonry card. It is a real link (`/photo/:id`) so it can be opened
 * in a new tab, but plain clicks are intercepted for the in-app modal.
 *
 * The container reserves its final height *before* the image loads (height is
 * computed from the known aspect ratio), so the grid never reflows — only a
 * dark skeleton swaps out for the image.
 */
export function ImageCard({ photo, width, height, onClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When a virtualized card re-mounts, the image may already be cached — show it
  // immediately instead of flashing the skeleton.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <a
      href={`/photo/${photo.id}`}
      onClick={(e) => {
        if (isModifiedClick(e)) return; // let the browser open a new tab
        e.preventDefault();
        onClick(photo);
      }}
      style={{ width, height, backgroundColor: photo.color }}
      className="group relative block shrink-0 overflow-hidden rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Photo by ${photo.author}`}
    >
      {/* Skeleton — the photo's dominant color, sits under the image until it loads. */}
      {!loaded && (
        <div
          className="absolute inset-0 skeleton-pulse"
          style={{ backgroundColor: photo.color }}
          aria-hidden
        />
      )}

      <img
        ref={imgRef}
        src={sizedUrl(photo, width, height)}
        alt={`Photo by ${photo.author}`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtle hover gradient + author. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="text-sm font-medium text-text-primary">
          {photo.author}
        </span>
      </div>
    </a>
  );
}
