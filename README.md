# Virtual Masonry Image Gallery

A virtualized masonry photo gallery built with Vite + React + TypeScript + Tailwind, using the [Picsum Photos](https://picsum.photos) API. Features a Midjourney-style photo modal with the React Router v6 `location.state` background pattern.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## How it works

- **Routing** (`src/router/index.tsx`) — `/photo/:id` renders a **modal over the gallery** when navigated from inside the app (a `background` location travels through router state), or the full **`PhotoDetailPage`** when opened directly / refreshed.
- **Zero-fetch modal** — the photo object travels through `location.state.photo`, so opening the modal makes no network request (`usePhotoById` only fetches as a fallback).
- **Virtualization** (`src/components/MasonryGrid.tsx`) — `useWindowVirtualizer` mounts only the rows in view. The header counter ("N of M images in DOM") is live proof.
- **No layout shift** — every card reserves its final height (derived from the real `width/height` aspect ratio) before the image loads; a dark skeleton sits underneath.
- **Infinite scroll** — `react-intersection-observer` sentinel triggers the next 50-image batch; stops when Picsum returns an empty page.
- **Tags** (`src/lib/tags.ts`) — Picsum has none, so 2–3 stable tags are derived deterministically from the photo id.

## Structure

```
src/
  pages/        GalleryPage, PhotoDetailPage
  components/   MasonryGrid, ImageCard, PhotoModal, ThumbnailStrip, PhotoStage
  hooks/        useInfinitePhotos, usePhotoById, useNeighbors, useRelated, useLayout
  lib/          picsum (API), tags, photosStore (context)
  router/       index.tsx (background-location modal pattern)
```
