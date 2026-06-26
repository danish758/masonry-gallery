import type { ReactNode } from 'react';

interface NoticeProps {
  children: ReactNode;
  /** Extra utilities — pass spacing/padding here (e.g. "mb-4 p-3"). */
  className?: string;
}

/** A bordered surface box for inline messages (errors, hints, banners). */
export function Notice({ children, className = '' }: NoticeProps) {
  return (
    <div
      className={`rounded-lg border border-subtle bg-surface text-sm text-text-secondary ${className}`}
    >
      {children}
    </div>
  );
}
