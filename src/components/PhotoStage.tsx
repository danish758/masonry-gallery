import { Download } from 'lucide-react';
import { ThumbnailStrip } from './ThumbnailStrip';
import { TagPill } from './TagPill';
import type { Photo } from '../types';

interface PhotoStageProps {
  photo: Photo;
  neighbors: Photo[];
  onSelectThumb: (photo: Photo) => void;
}

/**
 * Large image on the left, surrounding thumbnails on the right, and a metadata
 * bar (photographer, tags, download) below. Shared by the in-app modal and the
 * direct-load detail page.
 */
export function PhotoStage({ photo, neighbors, onSelectThumb }: PhotoStageProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-subtle bg-surface">
      <div className="flex flex-col gap-3 p-3 md:flex-row">
        {/* Large image (~75% width), shown whole (no crop). */}
        <div className="flex min-h-0 flex-1 items-center justify-center md:w-3/4">
          <img
            src={photo.largeUrl}
            alt={photo.description ?? `Photo by ${photo.author}`}
            className="max-h-[70vh] w-full rounded-lg object-contain"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          />
        </div>

        {/* Thumbnail strip (right). */}
        <div className="md:w-44 md:shrink-0">
          <ThumbnailStrip
            photos={neighbors}
            activeId={photo.id}
            onSelect={onSelectThumb}
          />
        </div>
      </div>

      {/* Metadata bar. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-subtle px-4 py-3">
        <span className="text-sm text-text-secondary">
          By{' '}
          <a
            href={photo.authorUrl}
            target="_blank"
            rel="noreferrer"
            className="text-text-primary hover:text-accent"
          >
            {photo.author}
          </a>
        </span>

        <div className="flex flex-wrap gap-1.5">
          {photo.tags.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>

        <a
          href={photo.largeUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Download size={16} />
          Download
        </a>
      </div>
    </div>
  );
}
