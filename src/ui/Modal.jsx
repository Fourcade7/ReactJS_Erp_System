import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

/** `Modal.Header closeButton` yopish funksiyasini shu kontekstdan oladi. */
const ModalContext = createContext({ onHide: undefined })

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[min(1100px,95vw)]',
}

/**
 * Yengil modal: portal orqali `body` ga chiqadi, Escape bilan yopiladi,
 * ochiq turganda sahifa skroll qilinmaydi va fokus dialog ichida ushlab turiladi.
 * API react-bootstrap bilan bir xil: `show`, `onHide`, `centered`, `size`.
 */
function Modal({
  show,
  onHide,
  centered = true,
  size = 'md',
  backdrop = true,
  scrollable = false,
  className,
  contentClassName,
  children,
  ...props
}) {
  const dialogRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const ctx = useMemo(() => ({ onHide }), [onHide])

  // Chaqiruvchilar `onHide` ni inline funksiya qilib beradi (har renderda yangi).
  // Effekt unga bogʻlansa, har bir harf kiritilganda fokus dialogdan chiqib,
  // birinchi inputga qaytib ketadi — shuning uchun oxirgi qiymat ref da saqlanadi.
  const onHideRef = useRef(onHide)
  useEffect(() => {
    onHideRef.current = onHide
  }, [onHide])

  useEffect(() => {
    if (!show) return

    restoreFocusRef.current = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onHideRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    const focusTimer = window.setTimeout(() => {
      const target = dialogRef.current?.querySelector(
        'input:not([type="hidden"]), textarea, select, button',
      )
      target?.focus()
    }, 40)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      window.clearTimeout(focusTimer)
      restoreFocusRef.current?.focus?.()
    }
  }, [show])

  if (!show) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[1080] flex justify-center overflow-y-auto p-4 sm:p-6',
        centered ? 'items-center' : 'items-start pt-[8vh]',
        className,
      )}
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-[2px] animate-fade-in"
        onClick={backdrop ? () => onHide?.() : undefined}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full animate-slide-up rounded-2xl border border-line bg-surface shadow-pop',
          sizes[size] ?? sizes.md,
          scrollable && 'flex max-h-[85vh] flex-col',
          contentClassName,
        )}
        {...props}
      >
        <ModalContext.Provider value={ctx}>{children}</ModalContext.Provider>
      </div>
    </div>,
    document.body,
  )
}

function ModalHeader({ closeButton, onHide, className, children, ...props }) {
  const ctx = useContext(ModalContext)
  const close = onHide ?? ctx.onHide
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-line px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {closeButton && (
        <button
          type="button"
          aria-label="Закрыть"
          onClick={() => close?.()}
          data-modal-close="true"
          className="-mr-1 -mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function ModalTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-[15px] font-semibold text-fg', className)} {...props}>
      {children}
    </h3>
  )
}

function ModalBody({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 text-[13px] text-muted', className)} {...props}>
      {children}
    </div>
  )
}

function ModalFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5 rounded-b-2xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
export { Modal }
