// Varied aspect ratios so the placeholder grid looks like real masonry.
const RATIOS = [1.4, 0.75, 1.1, 0.85, 1.5, 0.7, 1.2, 0.95, 1.3, 0.8, 1.0, 0.9];

/**
 * A block of masonry placeholder cards (CSS-columns layout). Used for the
 * initial load and the infinite-scroll footer instead of a spinner.
 */
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse rounded-lg bg-skeleton"
          style={{ aspectRatio: String(RATIOS[i % RATIOS.length]) }}
        />
      ))}
    </div>
  );
}
