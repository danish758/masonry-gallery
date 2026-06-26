import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Photo } from '../types';

interface PhotosStore {
  /** All photos currently loaded into the gallery grid. */
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
  /** Return the photos surrounding `id` (`radius` before and after, plus it). */
  surrounding: (id: string, radius?: number) => Photo[];
}

const Ctx = createContext<PhotosStore | null>(null);

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotosState] = useState<Photo[]>([]);
  const photosRef = useRef<Photo[]>([]);

  const setPhotos = useCallback((next: Photo[]) => {
    photosRef.current = next;
    setPhotosState(next);
  }, []);

  const surrounding = useCallback((id: string, radius = 2): Photo[] => {
    const list = photosRef.current;
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return [];
    const start = Math.max(0, idx - radius);
    const end = Math.min(list.length, idx + radius + 1);
    return list.slice(start, end);
  }, []);

  const value = useMemo<PhotosStore>(
    () => ({ photos, setPhotos, surrounding }),
    [photos, setPhotos, surrounding]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePhotosStore(): PhotosStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePhotosStore must be used within <PhotosProvider>');
  return ctx;
}
