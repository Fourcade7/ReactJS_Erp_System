import { Search, X } from 'lucide-react'
import { cn } from '../lib/cn'

/** Ikonka va tozalash tugmasi bilan qidiruv maydoni. */
function SearchField({ value, onChange, onClear, placeholder = 'Поиск...', className, ...props }) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-9 text-[13px] text-fg outline-none',
          'transition-[border-color,box-shadow] placeholder:text-subtle',
          'focus:border-primary focus:ring-4 focus:ring-[var(--ring)]',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить"
          className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export default SearchField
export { SearchField }
