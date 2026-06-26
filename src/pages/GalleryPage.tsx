import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { MasonryGrid } from '../components/MasonryGrid';
import { Header } from '../components/Header';
import { ApiKeyBanner } from '../components/ApiKeyBanner';
import { Notice } from '../components/Notice';
import { Spinner } from '../components/Spinner';
import { useInfinitePhotos } from '../hooks/useInfinitePhotos';
import { usePhotosStore } from '../lib/photosStore';
import { hasPixabayKey } from '../lib/pixabay';
import type { Photo } from '../types';

export function GalleryPage() {
  const { photos, fetchNextPage, isFetching, hasMore, error } =
    useInfinitePhotos();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPhotos } = usePhotosStore();
  const [renderedCount, setRenderedCount] = useState(0);

  // Keep the shared store in sync so the modal can find thumbnail neighbors.
  useEffect(() => {
    setPhotos(photos);
  }, [photos, setPhotos]);

  // Infinite-scroll sentinel.
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && !isFetching && hasMore) fetchNextPage();
  }, [inView, isFetching, hasMore, fetchNextPage]);

  const openPhoto = (photo: Photo) => {
    // background keeps the gallery (and its scroll position) mounted behind the
    // modal; photo travels through state so the modal needs no network request.
    navigate(`/photo/${photo.id}`, {
      state: { background: location, photo },
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header>
        <div className="rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">{renderedCount}</span> of{' '}
          <span className="font-medium text-text-primary">{photos.length}</span>{' '}
          images in DOM
        </div>
      </Header>

      <main className="mx-auto max-w-[1600px] px-4 py-4">
        {!hasPixabayKey && <ApiKeyBanner />}
        {error && hasPixabayKey && <Notice className="mb-4 p-3">{error}</Notice>}

        <MasonryGrid
          photos={photos}
          onCardClick={openPhoto}
          onRenderedCountChange={setRenderedCount}
        />

        {/* Sentinel + loading state. */}
        <div className="flex flex-col items-center justify-center py-8">
          {isFetching && <Spinner />}
          {!hasMore && photos.length > 0 && (
            <span className="text-sm text-text-secondary">
              You've reached the end — {photos.length} photos.
            </span>
          )}
          <div ref={ref} style={{ height: 1 }} />
        </div>
      </main>
    </div>
  );
}
