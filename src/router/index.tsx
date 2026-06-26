import { useRef } from 'react';
import { Route, Routes, useLocation, type Location } from 'react-router-dom';
import { GalleryPage } from '../pages/GalleryPage';
import { PhotoDetailPage } from '../pages/PhotoDetailPage';
import { PhotoModal } from '../components/PhotoModal';

/** True when the document was loaded via a full-page reload. */
function wasReloaded(): boolean {
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === 'reload';
}

/**
 * Background-location modal pattern (React Router v6).
 *
 * - Navigating to /photo/:id from inside the app passes `state.background` =
 *   the gallery location. The primary <Routes> renders that background, so the
 *   gallery stays mounted, and the modal <Routes> renders on top.
 * - Opening /photo/:id directly (new tab) or refreshing has no usable
 *   background, so the primary <Routes> matches /photo/:id and renders the full
 *   PhotoDetailPage.
 *
 * Reload caveat: the browser persists `location.state` (including `background`)
 * across a hard reload. So when the page was reloaded, we ignore the background
 * for the *initial* history entry — refreshing the modal URL falls back to the
 * detail page — while still honoring it again once the user navigates onward.
 */
export function App() {
  const location = useLocation();
  const isReload = useRef(wasReloaded());
  const initialKey = useRef(location.key);

  const onRestoredInitialEntry =
    isReload.current && location.key === initialKey.current;

  const background = onRestoredInitialEntry
    ? undefined
    : (location.state as { background?: Location } | null)?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/photo/:id" element={<PhotoDetailPage />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/photo/:id" element={<PhotoModal />} />
        </Routes>
      )}
    </>
  );
}
