import { useEffect, useState, type RefObject } from 'react';

/** Column count matching the masonry breakpoints: 2 / 3 / 4. */
export function useColumnCount(): number {
  const compute = () => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const [columns, setColumns] = useState(compute);

  useEffect(() => {
    const onResize = () => setColumns(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return columns;
}

/** Track the rendered width of an element via ResizeObserver. */
export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
