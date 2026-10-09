import { Inbox } from 'lucide-react'
import { cn } from '../lib/cn'
import { t } from '../i18n'

const spinnerSizes = {
  xs: 'size-3 border-[1.5px]',
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-9 border-[3px]',
}

const spinnerTones = {
  primary: 'border-primary/25 border-t-primary',
  muted: 'border-line-strong border-t-fg',
  success: 'border-success/25 border-t-success',
  danger: 'border-danger/25 border-t-danger',
  light: 'border-white/30 border-t-white',
}

/** Aylanuvchi yuklanish indikatori. */
function Spinner({ size = 'md', variant = 'primary', className, label = t('Загрузка'), ...props }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full',
        spinnerSizes[size] ?? spinnerSizes.md,
        spinnerTones[variant] ?? spinnerTones.primary,
        className,
      )}
      {...props}
    />
  )
}

const barTones = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

/**
 * Progress bar. `animated` bilan (yoki `now` berilmaganda) aniqlanmagan
 * holatdagi sirpanuvchi chiziq koʻrsatiladi.
 */
function ProgressBar({
  now,
  max = 100,
  variant = 'primary',
  animated = false,
  size = 'md',
  label,
  className,
  ...props
}) {
  const indeterminate = animated || now == null
  const pct = Math.min(100, Math.max(0, ((now ?? 0) / max) * 100))
  const tone = barTones[variant] ?? barTones.primary

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-surface-3',
        size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5',
        className,
      )}
      {...props}
    >
      {indeterminate ? (
        <div className={cn('absolute inset-y-0 w-2/5 animate-indeterminate rounded-full', tone)} />
      ) : (
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone)}
          style={{ width: `${pct}%` }}
        />
      )}
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}

/**
 * Balandlik boʻyicha silliq ochilish/yopilish.
 * JS bilan oʻlchash oʻrniga grid-template-rows (0fr → 1fr) ishlatiladi —
 * brauzer balandlikni oʻzi animatsiya qiladi, shuning uchun kechikish va
 * sakrash boʻlmaydi. Yopiq holatda ichki maydonlarga Tab bilan kirib boʻlmaydi.
 */
function Collapse({ in: open, className, children, ...props }) {
  return (
    <div
      aria-hidden={!open}
      inert={!open ? true : undefined}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className,
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

/** Maʼlumot yuklanayotganda joy egallab turuvchi kulrang blok. */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-3', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Roʻyxat boʻsh boʻlganda koʻrsatiladigan holat. */
function EmptyState({ icon: Icon = Inbox, title, description, action, className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <span className="mb-1 inline-flex size-10 items-center justify-center rounded-full bg-surface-2 text-subtle">
        <Icon className="size-5" />
      </span>
      <p className="text-[13px] font-medium text-fg">{title}</p>
      {description && <p className="max-w-sm text-xs text-subtle">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { Spinner, ProgressBar, Collapse, Skeleton, EmptyState }
