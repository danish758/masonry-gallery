import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { MasonryGrid } from '../components/MasonryGrid';
import { Header } from '../components/Header';
import { ApiKeyBanner } from '../components/ApiKeyBanner';
import { Notice } from '../components/Notice';
import { SkeletonGrid } from '../components/SkeletonGrid';
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

        {photos.length === 0 ? (
          // Initial load — skeleton placeholders instead of a spinner.
          hasPixabayKey && <SkeletonGrid count={12} />
        ) : (
          <MasonryGrid
            photos={photos}
            onCardClick={openPhoto}
            onRenderedCountChange={setRenderedCount}
          />
        )}

        {/* Sentinel + infinite-scroll loading state. */}
        <div className="py-6">
          {isFetching && photos.length > 0 && <SkeletonGrid count={6} />}
          {!hasMore && photos.length > 0 && (
            <p className="py-2 text-center text-sm text-text-secondary">
              You've reached the end — {photos.length} photos.
            </p>
          )}
          <div ref={ref} style={{ height: 1 }} />
        </div>
      </main>
    </div>
  );
}
