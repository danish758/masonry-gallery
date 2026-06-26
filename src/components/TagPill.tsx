import type { ReactNode } from 'react';

/** A single accent-tinted tag pill. */
export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs"
      style={{ backgroundColor: 'rgba(108, 142, 245, 0.15)', color: '#6c8ef5' }}
    >
      {children}
    </span>
  );
}
