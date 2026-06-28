import type { Photo, PixabayHit, PixabayResponse } from '../types';

const BASE = 'https://pixabay.com/api/';
const KEY = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined;

/** True when an API key is configured (used to show a setup hint in the UI). */
export const hasPixabayKey = Boolean(KEY);

/** Crisp on retina without ballooning bytes. */
const DPR = Math.min(2, Math.ceil((globalThis.devicePixelRatio as number) || 1));

// Pixabay's webformat URL ends in `_640.jpg`. Only these buckets actually
// exist — `_960`/`_1280` return HTTP 400, so anything bigger must use largeUrl.
const BUCKETS = [180, 340, 640];

async function api(params: Record<string, string>): Promise<PixabayResponse> {
  if (!KEY) {
    throw new Error(
      'Missing Pixabay API key. Add VITE_PIXABAY_API_KEY to a .env.local file and restart the dev server.'
    );
  }
  const qs = new URLSearchParams({ key: KEY, ...params }).toString();
  const res = await fetch(`${BASE}?${qs}`);

  if (res.status === 429)
    throw new Error('Pixabay rate limit reached (429). The free limit is 100 requests/minute.');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Paging past the end of a query returns a 400 — treat as "no more".
    if (res.status === 400 && /out of valid range/i.test(text)) {
      return { total: 0, totalHits: 0, hits: [] };
    }
    throw new Error(`Pixabay request failed: ${res.status}`);
  }
  return (await res.json()) as PixabayResponse;
}

function normalize(h: PixabayHit): Photo {
  const tags = h.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
  return {
    id: String(h.id),
    author: h.user || 'Unknown',
    authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    width: h.imageWidth,
    height: h.imageHeight,
    color: '#2a2a38',
    description: null,
    previewUrl: h.webformatURL,
    largeUrl: h.largeImageURL,
    pageUrl: h.pageURL,
    tags,
  };
}

// Feed orientation: 'all' (mixed), 'horizontal', or 'vertical'.
const ORIENTATION = 'all';

// Rotated across pages so the feed stays varied.
const QUERIES = [
  'nature',
  'landscape',
  'architecture',
  'travel',
  'street',
  'ocean',
  'mountains',
  'city',
  'flowers',
  'forest',
] as const;

/**
 * One page of the gallery feed, rotating the query each page for variety.
 * Real (uncropped) aspect ratios come from imageWidth/Height.
 */
export async function fetchPhotoList(page: number, perPage = 24): Promise<Photo[]> {
  const query = QUERIES[(page - 1) % QUERIES.length];
  const subPage = Math.floor((page - 1) / QUERIES.length) + 1;
  const data = await api({
    q: query,
    image_type: 'photo',
    orientation: ORIENTATION,
    safesearch: 'true',
    per_page: String(perPage),
    page: String(subPage),
  });
  return data.hits.map(normalize);
}

/** Single photo by id (direct URL loads). */
export async function fetchPhotoById(id: string): Promise<Photo> {
  const data = await api({ id });
  if (!data.hits.length) throw new Error(`Photo ${id} not found`);
  return normalize(data.hits[0]);
}

/** A batch of photos for the detail page (related grid + thumbnails). */
export async function fetchRandom(count: number): Promise<Photo[]> {
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const page = 1 + Math.floor(Math.random() * 8);
  const data = await api({
    q: query,
    image_type: 'photo',
    orientation: ORIENTATION,
    safesearch: 'true',
    per_page: String(Math.max(3, count)),
    page: String(page),
  });
  return data.hits.map(normalize);
}

/**
 * Pick the smallest Pixabay size bucket that covers the requested box (×DPR),
 * capped at the 640 webformat ceiling. Cards/thumbnails never need more than
 * 640px — going larger (the 1280px image) just makes the grid slow. The big
 * modal/detail view uses `photo.largeUrl` directly instead.
 */
export function sizedUrl(photo: Photo, width: number, height: number): string {
  const target = Math.ceil(Math.max(width, height) * DPR);
  const bucket = BUCKETS.find((b) => b >= target) ?? 640;
  return photo.previewUrl.replace(/_\d+(\.[a-z]+)$/i, `_${bucket}$1`);
}
