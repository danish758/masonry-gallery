import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Download, ExternalLink, X } from 'lucide-react';
import { usePhotoById } from '../hooks/usePhotoById';
import { usePhotosStore } from '../lib/photosStore';
import { sizedUrl } from '../lib/pixabay';
import { TagPill } from './TagPill';
import type { Photo } from '../types';

interface ModalState {
  background?: Location;
  photo?: Photo;
}

/**
 * Midjourney-style modal: full-width, blurred backdrop (the gallery shows
 * through), with three regions — large image on the left, a darker metadata
 * panel in the middle, and a narrow thumbnail rail pinned to the right edge.
 * The active thumbnail is enlarged rather than bordered.
 *
 * Reads the photo straight from router state → zero network request on open.
 */
export function PhotoModal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ModalState | null;
  const background = state?.background;

  const { surrounding } = usePhotosStore();
  const { photo } = usePhotoById(id, state?.photo ?? null);

  const close = useCallback(() => navigate(-1), [navigate]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Lock background scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const selectThumb = (thumb: Photo) => {
    navigate(`/photo/${thumb.id}`, {
      replace: true,
      state: { background, photo: thumb },
    });
  };

  if (!photo) return null;

  // A wide window so the right rail looks full, like Midjourney.
  const neighbors = (() => {
    const list = surrounding(photo.id, 6);
    return list.length > 0 ? list : [photo];
  })();

  return (
    <div className="fixed inset-0 z-50">
      {/* Blurred backdrop — the gallery stays visible but defocused. */}
      <div
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-2xl"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-full w-full flex-col md:flex-row"
      >
        {/* Left: large image over the blur. */}
        <div
          onClick={close}
          className="flex flex-1 items-center justify-center p-4 md:p-10"
        >
          <img
            src={photo.largeUrl}
            alt={photo.description ?? `Photo by ${photo.author}`}
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            className="max-h-[55vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl md:max-h-[88vh]"
          />
        </div>

        {/* Right: metadata panel + thumbnail rail (shared darker background). */}
        <div className="relative flex shrink-0 border-t border-subtle bg-[#0a0a0e]/95 md:h-full md:border-l md:border-t-0">
          {/* Close button — sits just left of the panel on desktop. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary md:right-auto md:-left-12 md:top-4"
          >
            <X size={20} />
          </button>

          {/* Middle: metadata text panel. */}
          <div className="flex w-full flex-col gap-4 overflow-y-auto p-6 md:w-[340px]">
            <div>
              <a
                href={photo.authorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] font-medium text-text-primary hover:text-accent"
              >
                {photo.author}
              </a>
              <div className="mt-0.5 text-xs text-text-secondary">
                #{photo.id} · {photo.width} × {photo.height}
              </div>
            </div>

            {photo.description && (
              <p className="text-sm leading-relaxed text-text-secondary">
                {photo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {photo.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <a
                href={photo.largeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Download size={15} />
                Download
              </a>
              <a
                href={photo.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Pixabay
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Right: thumbnail rail. Active thumb is enlarged, not bordered. */}
          <div className="flex max-h-[28vh] flex-row items-center gap-2 overflow-x-auto overflow-y-hidden p-3 md:max-h-full md:w-[104px] md:flex-col md:items-end md:overflow-y-auto md:overflow-x-hidden">
            {neighbors.map((thumb) => {
              const active = thumb.id === photo.id;
              const size = active ? 84 : 54;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => selectThumb(thumb)}
                  aria-current={active}
                  style={{ width: size, height: size }}
                  className={`shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                    active ? 'opacity-100 shadow-lg' : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={sizedUrl(thumb, 168, 168)}
                    alt={`Photo by ${thumb.author}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
