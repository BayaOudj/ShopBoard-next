import Link from 'next/link'
import { cn } from '../../shared/lib/utils'
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Shopboard home"
      className={cn(
        'inline-flex items-center font-bold tracking-[-1.3px] whitespace-nowrap',
        compact
          ? 'text-logo-compact'
          : 'text-logo lg:pl-1.5 lg:text-logo-desktop',
      )}
    >
      {!compact && (
        <span
          className="mr-2 grid size-8 place-items-center rounded-icon bg-(image:--background-image-brand) text-logo shadow-inset-light"
          aria-hidden="true"
        >
          ▦
        </span>
      )}
      shopboard<span className="text-brand-dot">.</span>
    </Link>
  )
}
