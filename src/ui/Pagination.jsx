import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '../lib/cn'

/** Joriy sahifa atrofida oyna + chetlarda ellipsis bilan sahifa raqamlari. */
function buildPages(page, pageCount, siblings = 1) {
  const total = siblings * 2 + 5
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const left = Math.max(2, page - siblings)
  const right = Math.min(pageCount - 1, page + siblings)
  const items = [1]

  if (left > 2) items.push('left-gap')
  for (let i = left; i <= right; i += 1) items.push(i)
  if (right < pageCount - 1) items.push('right-gap')
  items.push(pageCount)

  return items
}

const cellBase =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium ' +
  'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-35'

/**
 * Sahifalagich. `page` 1 dan boshlanadi; `onChange` yangi sahifa raqamini qaytaradi.
 */
function Pagination({ page, pageCount: rawPageCount, onChange, siblings = 1, className, ...props }) {
  // Roʻyxat bitta sahifaga sigʻsa yoki boʻsh boʻlsa ham sahifalagich doim koʻrinadi.
  const pageCount = Math.max(1, Number(rawPageCount) || 0)

  const go = (next) => {
    const clamped = Math.min(Math.max(1, next), pageCount)
    if (clamped !== page) onChange?.(clamped)
  }

  return (
    <nav
      aria-label="Постраничная навигация"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-soft',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="Первая страница"
        disabled={page === 1}
        onClick={() => go(1)}
        className={cn(cellBase, 'text-subtle hover:bg-surface-2 hover:text-fg')}
      >
        <ChevronsLeft className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Предыдущая страница"
        disabled={page === 1}
        onClick={() => go(page - 1)}
        className={cn(cellBase, 'text-subtle hover:bg-surface-2 hover:text-fg')}
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {buildPages(page, pageCount, siblings).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => go(item)}
            className={cn(
              cellBase,
              'tnum',
              item === page
                ? 'bg-primary text-primary-fg shadow-soft'
                : 'text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-xs text-subtle select-none">
            …
          </span>
        ),
      )}

      <button
        type="button"
        aria-label="Следующая страница"
        disabled={page === pageCount}
        onClick={() => go(page + 1)}
        className={cn(cellBase, 'text-subtle hover:bg-surface-2 hover:text-fg')}
      >
        <ChevronRight className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Последняя страница"
        disabled={page === pageCount}
        onClick={() => go(pageCount)}
        className={cn(cellBase, 'text-subtle hover:bg-surface-2 hover:text-fg')}
      >
        <ChevronsRight className="size-3.5" />
      </button>
    </nav>
  )
}

export default Pagination
export { Pagination }
