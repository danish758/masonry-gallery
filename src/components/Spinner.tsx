import { Loader2 } from 'lucide-react';

/** Accent loading spinner. */
export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-6 w-6 animate-spin text-accent ${className}`} />;
}
