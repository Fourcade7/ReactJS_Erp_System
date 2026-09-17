import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/cn'

const base =
  'relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ' +
  '[&_svg]:shrink-0'

/**
 * Variant nomlari Bootstrap bilan bir xil saqlangan, shuning uchun mavjud
 * ekranlardagi `variant="outline-primary"` kabi qiymatlar ishlayveradi.
 */
const variants = {
  primary:
    'bg-primary text-primary-fg shadow-soft hover:bg-primary-hover hover:shadow-raised',
  secondary:
    'bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong',
  success: 'bg-success text-white shadow-soft hover:brightness-110',
  danger: 'bg-danger text-white shadow-soft hover:bg-danger-hover',
  warning: 'bg-warning text-[oklch(0.25_0.06_72)] shadow-soft hover:brightness-105',
  info: 'bg-info text-white shadow-soft hover:brightness-110',
  light: 'bg-surface text-fg border border-line hover:bg-surface-2',
  dark: 'bg-fg text-app shadow-soft hover:opacity-90',

  'outline-primary':
    'border border-primary/45 text-primary bg-transparent hover:bg-primary-soft hover:border-primary',
  'outline-secondary':
    'border border-line text-muted bg-transparent hover:bg-surface-2 hover:text-fg hover:border-line-strong',
  'outline-success':
    'border border-success/45 text-success-soft-fg bg-transparent hover:bg-success-soft hover:border-success',
  'outline-danger':
    'border border-danger/45 text-danger-soft-fg bg-transparent hover:bg-danger-soft hover:border-danger',
  'outline-warning':
    'border border-warning/50 text-warning-soft-fg bg-transparent hover:bg-warning-soft hover:border-warning',
  'outline-info':
    'border border-info/45 text-info-soft-fg bg-transparent hover:bg-info-soft hover:border-info',
  'outline-dark':
    'border border-line-strong text-fg bg-transparent hover:bg-surface-2',

  ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-fg',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline px-0',
}

const sizes = {
  xs: 'h-7 px-2.5 text-[11px] [&_svg]:size-3.5',
  sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
  md: 'h-9 px-3.5 text-[13px] [&_svg]:size-4',
  lg: 'h-11 px-5 text-sm [&_svg]:size-[18px]',
}

const iconSizes = {
  xs: 'size-7 px-0',
  sm: 'size-8 px-0',
  md: 'size-9 px-0',
  lg: 'size-11 px-0',
}

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    icon = false,
    block = false,
    loading = false,
    className,
    children,
    type,
    disabled,
    ...props
  },
  ref,
) {
  const isNativeButton = Component === 'button'

  return (
    <Component
      ref={ref}
      type={isNativeButton ? type || 'button' : type}
      disabled={isNativeButton ? disabled || loading : undefined}
      aria-disabled={!isNativeButton && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      className={cn(
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        icon && (iconSizes[size] ?? iconSizes.md),
        block && 'w-full',
        !isNativeButton && (disabled || loading) && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  )
})

export default Button
export { Button }
