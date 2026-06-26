import { useEffect, useState } from 'react';
import { fetchPhotoById } from '../lib/pixabay';
import type { Photo } from '../types';

export interface UsePhotoByIdResult {
  photo: Photo | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch a single photo by id from /id/{id}/info. If `initial` is supplied
 * (e.g. the photo travelled through router state), it is used immediately and
 * no network request is made — this is what keeps modal opens zero-fetch.
 */
export function usePhotoById(
  id: string | undefined,
  initial?: Photo | null
): UsePhotoByIdResult {
  const [photo, setPhoto] = useState<Photo | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // Already have the right photo from state — skip the request entirely.
    if (initial && initial.id === id) {
      setPhoto(initial);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPhotoById(id)
      .then((p) => {
        if (!cancelled) setPhoto(p);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load photo');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, initial]);

  return { photo, loading, error };
}
