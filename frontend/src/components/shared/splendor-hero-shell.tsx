import { cn } from '@/lib/utils';

type SplendorHeroShellProps = {
  children: React.ReactNode;
  /** Wider shell (e.g. lobby with a large room code). */
  wide?: boolean;
  /** Extra inner padding for content-heavy screens. */
  spacious?: boolean;
  className?: string;
};

/**
 * Shared royal Splendor frame: gilt border, velvet panel, corners, halo.
 * Pair with utility classes in globals.css (`.splendor-*`).
 */
export default function SplendorHeroShell({
  children,
  wide = false,
  spacious = false,
  className,
}: SplendorHeroShellProps) {
  return (
    <article className={cn('splendor-hero', wide && 'splendor-hero--wide', className)}>
      <div className="splendor-hero__frame">
        <div className={cn('splendor-hero__panel', spacious && 'splendor-hero__panel--spacious')}>
          <div className="splendor-hero__filigree" aria-hidden />
          <div className="splendor-hero__corner splendor-hero__corner--tl" aria-hidden />
          <div className="splendor-hero__corner splendor-hero__corner--tr" aria-hidden />
          <div className="splendor-hero__corner splendor-hero__corner--bl" aria-hidden />
          <div className="splendor-hero__corner splendor-hero__corner--br" aria-hidden />
          <div
            className="splendor-hero__halo pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            aria-hidden
          />
          {children}
        </div>
      </div>
    </article>
  );
}
