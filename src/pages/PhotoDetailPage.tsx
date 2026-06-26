import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PhotoStage } from '../components/PhotoStage';
import { Header } from '../components/Header';
import { Notice } from '../components/Notice';
import { usePhotoById } from '../hooks/usePhotoById';
import { useRelated } from '../hooks/useRelated';
import { sizedUrl } from '../lib/pixabay';
import type { Photo } from '../types';

function StageSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
      <div className="flex flex-col gap-3 p-3 md:flex-row">
        <div className="aspect-[3/4] w-full skeleton-pulse rounded-lg bg-skeleton md:w-3/4" />
        <div className="flex gap-2 md:w-44 md:flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] w-24 skeleton-pulse rounded-md bg-skeleton md:w-full"
            />
          ))}
        </div>
      </div>
      <div className="h-12 border-t border-subtle" />
    </div>
  );
}

export function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { photo, loading, error } = usePhotoById(id);
  const related = useRelated(id);

  // No in-memory grid on a direct load, so the strip is the photo plus a few
  // related images.
  const neighbors = photo ? [photo, ...related].slice(0, 7) : [];

  // Thumbnail selection stays on the detail page (no background state); replace
  // keeps browsing out of the history stack.
  const selectThumb = (thumb: Photo) => {
    navigate(`/photo/${thumb.id}`, { replace: true });
  };

  // Related click → a fresh full-page navigation (no background → detail page).
  const openRelated = (rel: Photo) => {
    navigate(`/photo/${rel.id}`);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header maxWidthClass="max-w-[1200px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to gallery
        </Link>
      </Header>

      <main className="mx-auto max-w-[1200px] px-4 py-6">
        {error && <Notice className="mb-4 p-3">{error}</Notice>}

        {loading || !photo ? (
          <StageSkeleton />
        ) : (
          <PhotoStage
            photo={photo}
            neighbors={neighbors.length > 0 ? neighbors : [photo]}
            onSelectThumb={selectThumb}
          />
        )}

        {/* Related images. */}
        <section className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            More photos
          </h2>
          <div className="masonry-grid">
            {related.map((rel) => (
              <a
                key={rel.id}
                href={`/photo/${rel.id}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  openRelated(rel);
                }}
                className="block w-full overflow-hidden rounded-lg bg-skeleton outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <img
                  src={sizedUrl(rel, 400, Math.round(400 / (rel.width / rel.height)))}
                  alt={`Photo by ${rel.author}`}
                  loading="lazy"
                  style={{ aspectRatio: `${rel.width} / ${rel.height}` }}
                  className="w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
