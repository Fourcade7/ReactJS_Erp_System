import { cn } from '../lib/cn'

/** Kichik tanlov guruhi (filtr / tur). `count` berilsa yorliq yonida soni chiqadi. */
function Segmented({ options, value, onChange, label, className }) {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex flex-wrap rounded-lg border border-line bg-surface-2 p-0.5', className)}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition',
            value === option.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
          )}
        >
          {option.label}
          {option.count !== undefined && <span className="ml-1 tabular-nums text-subtle">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}

export default Segmented
