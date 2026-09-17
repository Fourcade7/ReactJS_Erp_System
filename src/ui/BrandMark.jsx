import { Layers } from 'lucide-react'
import { cn } from '../lib/cn'

/**
 * Tizim belgisi — boshqa ikonkalar bilan bir uslubda (lucide, chiziqli).
 * Menyudagi boʻlim ikonkalari kabi ramkali plitka ichida turadi va
 * temaga qarab ranglari avtomatik oʻzgaradi. `public/favicon.svg` shu belgi.
 */
function BrandMark({ className, iconClassName, title }) {
  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-primary shadow-soft',
        className,
      )}
    >
      <Layers className={cn('size-4', iconClassName)} strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

export default BrandMark
export { BrandMark }
