import { sizedUrl } from '../lib/pixabay';
import type { Photo } from '../types';

interface ThumbnailStripProps {
  photos: Photo[];
  activeId: string;
  onSelect: (photo: Photo) => void;
}

/** Vertical strip of surrounding thumbnails; the active one is accent-bordered. */
export function ThumbnailStrip({ photos, activeId, onSelect }: ThumbnailStripProps) {
  return (
    <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-y-auto md:overflow-x-hidden">
      {photos.map((photo) => {
        const active = photo.id === activeId;
        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            aria-current={active}
            className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all md:w-full ${
              active
                ? 'border-accent ring-1 ring-accent'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={sizedUrl(photo, 200, 150)}
              alt={`Photo by ${photo.author}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
