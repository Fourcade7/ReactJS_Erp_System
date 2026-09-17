import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'
import Button from './Button'

const DropdownContext = createContext(null)

/**
 * Menyu `position: fixed` bilan portalda chiziladi, shuning uchun roʻyxat yoki
 * jadval kabi `overflow: hidden` konteynerlar ichida ham kesilib qolmaydi.
 */
function Dropdown({ className, children, onToggle, ...props }) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const menuRef = useRef(null)

  const close = useCallback(() => {
    setOpen(false)
    onToggle?.(false)
  }, [onToggle])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      if (toggleRef.current?.contains(e.target)) return
      if (menuRef.current?.contains(e.target)) return
      close()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close()
        toggleRef.current?.focus?.()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open, close])

  const value = useMemo(
    () => ({
      open,
      toggleRef,
      menuRef,
      close,
      toggle: () => {
        setOpen((prev) => {
          onToggle?.(!prev)
          return !prev
        })
      },
    }),
    [open, close, onToggle],
  )

  return (
    <DropdownContext.Provider value={value}>
      <div className={cn('relative inline-block', className)} {...props}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

function DropdownToggle({
  as: Component,
  variant = 'secondary',
  size = 'md',
  caret = true,
  className,
  children,
  ...props
}) {
  const ctx = useContext(DropdownContext)
  const shared = {
    ref: ctx.toggleRef,
    'aria-haspopup': 'menu',
    'aria-expanded': ctx.open,
    onClick: (e) => {
      e.preventDefault()
      e.stopPropagation()
      ctx.toggle()
    },
  }

  // `as="div"` kabi maxsus tugma koʻrinishlari uchun uslub berilmaydi.
  if (Component && Component !== 'button') {
    return (
      <Component
        {...shared}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            ctx.toggle()
          }
        }}
        className={cn('cursor-pointer select-none', className)}
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} {...shared} {...props}>
      {children}
      {caret && (
        <ChevronDown
          className={cn('transition-transform duration-200', ctx.open && 'rotate-180')}
          aria-hidden="true"
        />
      )}
    </Button>
  )
}

function DropdownMenu({ align = 'start', className, children, ...props }) {
  const ctx = useContext(DropdownContext)
  const [pos, setPos] = useState(null)

  useLayoutEffect(() => {
    if (!ctx.open) {
      setPos(null)
      return
    }
    const anchor = ctx.toggleRef.current
    const menu = ctx.menuRef.current
    if (!anchor || !menu) return

    const a = anchor.getBoundingClientRect()
    const m = menu.getBoundingClientRect()
    const gap = 6
    const margin = 8

    let left = align === 'end' ? a.right - m.width : a.left
    left = Math.min(Math.max(margin, left), window.innerWidth - m.width - margin)

    const below = window.innerHeight - a.bottom
    const openUp = below < m.height + gap + margin && a.top > below
    const top = openUp ? a.top - m.height - gap : a.bottom + gap

    setPos({ top, left })
  }, [ctx.open, ctx.toggleRef, ctx.menuRef, align])

  if (!ctx.open) return null

  return createPortal(
    <div
      ref={ctx.menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={cn(
        'z-[1090] min-w-44 animate-pop-in overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop',
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}

function DropdownItem({
  as: Component = 'button',
  variant,
  disabled,
  className,
  children,
  onClick,
  ...props
}) {
  const ctx = useContext(DropdownContext)
  return (
    <Component
      role="menuitem"
      type={Component === 'button' ? 'button' : undefined}
      disabled={Component === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
        ctx?.close()
      }}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-fg transition-colors',
        'hover:bg-surface-2 focus-visible:bg-surface-2',
        variant === 'danger' && 'text-danger-soft-fg hover:bg-danger-soft',
        disabled && 'pointer-events-none opacity-40',
        '[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

function DropdownDivider({ className, ...props }) {
  return <div className={cn('my-1 h-px bg-line', className)} {...props} />
}

function DropdownHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** react-bootstrap dagi `DropdownButton` ning qisqartmasi. */
function DropdownButton({
  title,
  variant = 'secondary',
  size = 'md',
  align = 'start',
  className,
  menuClassName,
  children,
  ...props
}) {
  return (
    <Dropdown className={className} {...props}>
      <DropdownToggle variant={variant} size={size}>
        {title}
      </DropdownToggle>
      <DropdownMenu align={align} className={menuClassName}>
        {children}
      </DropdownMenu>
    </Dropdown>
  )
}

Dropdown.Toggle = DropdownToggle
Dropdown.Menu = DropdownMenu
Dropdown.Item = DropdownItem
Dropdown.Divider = DropdownDivider
Dropdown.Header = DropdownHeader

export default Dropdown
export { Dropdown, DropdownButton }
