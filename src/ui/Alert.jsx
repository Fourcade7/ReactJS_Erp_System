import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../lib/cn'
import { t } from '../i18n'

const variants = {
  success: {
    box: 'border-success/25 bg-success-soft text-success-soft-fg',
    Icon: CheckCircle2,
  },
  danger: {
    box: 'border-danger/25 bg-danger-soft text-danger-soft-fg',
    Icon: XCircle,
  },
  warning: {
    box: 'border-warning/30 bg-warning-soft text-warning-soft-fg',
    Icon: AlertTriangle,
  },
  info: {
    box: 'border-info/25 bg-info-soft text-info-soft-fg',
    Icon: Info,
  },
  primary: {
    box: 'border-primary/25 bg-primary-soft text-primary-soft-fg',
    Icon: Info,
  },
}

function Alert({
  variant = 'info',
  dismissible = false,
  onClose,
  icon = true,
  className,
  children,
  ...props
}) {
  const { box, Icon } = variants[variant] ?? variants.info

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] leading-snug',
        box,
        className,
      )}
      {...props}
    >
      {icon && <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          aria-label={t('Закрыть')}
          onClick={onClose}
          className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export default Alert
export { Alert }
