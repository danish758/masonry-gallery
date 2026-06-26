/** Raw hit shape returned by the Pixabay API (the subset we use). */
export interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string; // comma-separated
  webformatURL: string; // ≤640px, size bucket is swappable
  largeImageURL: string; // ≤1280px
  imageWidth: number; // original dimensions → real aspect ratio
  imageHeight: number;
  webformatWidth: number;
  webformatHeight: number;
  user: string;
  user_id: number;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
}

/** Normalized photo used throughout the app. */
export interface Photo {
  id: string;
  author: string;
  /** Link to the photographer's Pixabay profile. */
  authorUrl: string;
  width: number;
  height: number;
  /** Skeleton placeholder color (Pixabay gives none, so a neutral default). */
  color: string;
  description: string | null;
  /** Resizable preview URL (webformat) — base for grid/thumbnail sizes. */
  previewUrl: string;
  /** Larger image (≤1280px) for the modal / detail view. */
  largeUrl: string;
  /** Pixabay page for the photo (attribution + download). */
  pageUrl: string;
  tags: string[];
}
