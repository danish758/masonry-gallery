import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface HeaderProps {
  /** Right-side content (the DOM counter, a back link, etc.). */
  children?: ReactNode;
  /** Inner container max-width utility, to match each page's content width. */
  maxWidthClass?: string;
}

/** Sticky top bar with the brand on the left and a flexible right slot. */
export function Header({ children, maxWidthClass = 'max-w-[1600px]' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-subtle bg-bg/80 backdrop-blur">
      <div
        className={`mx-auto flex ${maxWidthClass} items-center justify-between gap-4 px-4 py-3`}
      >
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-text-primary"
        >
          Masonry<span className="text-accent">Gallery</span>
        </Link>
        {children}
      </div>
    </header>
  );
}
