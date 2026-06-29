# Virtual Masonry Gallery

A virtualized masonry photo gallery with a Midjourney-style lightbox, built with Vite + React + TypeScript + Tailwind. It's built around two hard problems: keeping the DOM tiny while scrolling thousands of images, and a modal that survives deep linking, the back button, and reloads. Images come from the [Pixabay API](https://pixabay.com/api/docs/).

## Features

- **Custom window virtualization** — only the cards in (or near) the viewport are ever in the DOM. A live "N of M images in DOM" counter proves it.
- **True column-packed masonry** — each image drops into the shortest column, so there are no row gaps. Heights come from the real aspect ratio, so nothing reflows when images load.
- **Midjourney-style modal** — large image on a blurred backdrop, metadata panel, and a thumbnail rail. Navigate with **← / → / ↑ / ↓** keys or by **scrolling** over the image (velocity-proportional). Close with Esc, the backdrop, or the × button.
- **Route-driven lightbox** — clicking a card opens the modal over the still-scrolled grid (React Router's background-location pattern). The URL deep-links, browser-back closes it, and a hard reload falls back to a full detail page.
- **Open in new tab** — cards are real links, so right-/cmd-click opens the detail page in a new tab.
- **Infinite scroll** with skeleton placeholders (initial load and load-more), an intersection-observer sentinel, and graceful end-of-results handling.
- **Responsive** 2 / 3 / 4 / 5 columns and a dark theme throughout.

## Setup

Pixabay requires a free API key (the free tier allows 100 requests/minute).

1. Sign in at [pixabay.com/api/docs](https://pixabay.com/api/docs/) — your key is shown on that page.
2. Copy `.env.example` to `.env.local` and paste your key:
   ```
   VITE_PIXABAY_API_KEY=your_key_here
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev      # http://localhost:5173
   npm run build    # type-check + production build
   ```

Without a key the app loads and shows a setup hint instead of images. The key file is gitignored.

## How it works

- **Virtualization** ([`MasonryGrid.tsx`](src/components/MasonryGrid.tsx)) — positions for every photo are precomputed (shortest-column packing); the container reserves the full scroll height; on scroll, only the cards intersecting the viewport plus an overscan band are mounted. No virtualization library — it's hand-rolled because row-based virtualizers can't do gap-free column packing.
- **Routing** ([`router/index.tsx`](src/router/index.tsx)) — `/photo/:id` renders the modal over the gallery when a `background` location travels through router state, or the full [`PhotoDetailPage`](src/pages/PhotoDetailPage.tsx) on a direct load. Because the browser persists router state across reloads, a reloaded modal URL ignores the stale `background` and shows the detail page.
- **Zero-fetch modal** — the photo object travels through `location.state.photo`, so opening the modal makes no network request; [`usePhotoById`](src/hooks/usePhotoById.ts) only fetches as a fallback (e.g. direct loads).
- **Images** ([`lib/pixabay.ts`](src/lib/pixabay.ts)) — `sizedUrl` picks the smallest Pixabay size bucket (180/340/640) that covers each card ×DPR; the modal uses the larger image. The feed rotates queries per page for variety, and `ORIENTATION` (vertical / horizontal / all) controls the mix.
- **No layout shift** — every card reserves its final height from the real `width`/`height` before the image loads; a placeholder sits underneath and cached images skip the skeleton entirely.

## Project structure

```
src/
  pages/        GalleryPage, PhotoDetailPage
  components/   MasonryGrid, ImageCard, PhotoModal, PhotoStage, ThumbnailStrip,
                Header, Notice, ApiKeyBanner, TagPill, SkeletonGrid
  hooks/        useInfinitePhotos, usePhotoById, useRelated, useLayout
  lib/          pixabay (API + image sizing), photosStore (context)
  router/       index.tsx (background-location modal pattern)
  types.ts      Pixabay + normalized Photo types
```

## Tech stack

Vite · React 18 · TypeScript · Tailwind CSS · React Router v6 · react-intersection-observer · lucide-react · Pixabay API
