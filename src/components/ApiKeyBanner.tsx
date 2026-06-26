import { Notice } from './Notice';

/** Setup hint shown when no Pixabay API key is configured. */
export function ApiKeyBanner() {
  return (
    <Notice className="mb-4 p-4">
      <p className="mb-1 font-medium text-text-primary">Pixabay API key needed</p>
      <p>
        Create a free key at{' '}
        <a
          href="https://pixabay.com/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          pixabay.com/api/docs
        </a>
        , then add{' '}
        <code className="text-text-primary">VITE_PIXABAY_API_KEY=your_key</code> to a{' '}
        <code className="text-text-primary">.env.local</code> file and restart the
        dev server.
      </p>
    </Notice>
  );
}
