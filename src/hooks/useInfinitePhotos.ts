import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPhotoList } from '../lib/pixabay';
import type { Photo } from '../types';

const PER_PAGE = 24;

export interface UseInfinitePhotosResult {
  photos: Photo[];
  fetchNextPage: () => void;
  isFetching: boolean;
  hasMore: boolean;
  error: string | null;
}

/**
 * Infinite-scroll data source for the gallery grid. Fetches the Picsum list 50
 * images at a time, dedupes, and stops when Picsum returns an empty page.
 */
export function useInfinitePhotos(): UseInfinitePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const seenIds = useRef<Set<string>>(new Set());
  // Guard against overlapping fetches (StrictMode double-invoke, fast scroll).
  const inFlight = useRef(false);

  const fetchNextPage = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setIsFetching(true);
    setError(null);

    try {
      const page = pageRef.current;
      const batch = await fetchPhotoList(page, PER_PAGE);

      if (batch.length === 0) {
        setHasMore(false);
        return;
      }

      const fresh = batch.filter((p) => !seenIds.current.has(p.id));
      fresh.forEach((p) => seenIds.current.add(p.id));

      if (fresh.length > 0) setPhotos((prev) => [...prev, ...fresh]);
      pageRef.current = page + 1;

      // A short final page means we've reached the end of Picsum's catalogue.
      if (batch.length < PER_PAGE) setHasMore(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      inFlight.current = false;
      setIsFetching(false);
    }
  }, [hasMore]);

  // Initial load.
  useEffect(() => {
    fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { photos, fetchNextPage, isFetching, hasMore, error };
}
