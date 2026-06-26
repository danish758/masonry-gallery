import { useEffect, useState } from 'react';
import { fetchRandom } from '../lib/pixabay';
import type { Photo } from '../types';

/**
 * A batch of random portrait photos for the detail page (used both for the
 * thumbnail strip and the "More photos" grid). `seedId` re-fetches when the
 * active photo changes; the active photo itself is filtered out.
 */
export function useRelated(seedId: string | undefined, count = 12): Photo[] {
  const [related, setRelated] = useState<Photo[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchRandom(count)
      .then((batch) => {
        if (cancelled) return;
        setRelated(batch.filter((p) => p.id !== seedId).slice(0, count));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });

    return () => {
      cancelled = true;
    };
  }, [seedId, count]);

  return related;
}
