import { cn } from '../lib/cn'

const tones = {
  neutral: 'bg-surface-2 text-muted border-line',
  primary: 'bg-primary-soft text-primary-soft-fg border-primary/20',
  success: 'bg-success-soft text-success-soft-fg border-success/20',
  warning: 'bg-warning-soft text-warning-soft-fg border-warning/25',
  danger: 'bg-danger-soft text-danger-soft-fg border-danger/20',
  info: 'bg-info-soft text-info-soft-fg border-info/20',
  solid: 'bg-fg text-app border-transparent',
}

/** Kichik holat yorligʻi. `bg` propi Bootstrap nomlari bilan mos keladi. */
function Badge({ bg = 'neutral', pill = true, dot = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap',
        pill ? 'rounded-full' : 'rounded-md',
        tones[bg] ?? tones.neutral,
        '[&_svg]:size-3',
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}

export default Badge
export { Badge }
