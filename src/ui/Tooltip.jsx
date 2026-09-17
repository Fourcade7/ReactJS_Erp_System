import { cloneElement, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'

/** Tooltip qobigʻi — mazmunni oʻrab, uslub beradi. */
function Tooltip({ className, children, ...props }) {
  return (
    <div
      role="tooltip"
      className={cn(
        'max-w-xs rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs text-fg shadow-pop',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Bolasini hover/fokus qilganda `overlay` ni portalda koʻrsatadi.
 * Joylashuv `fixed` hisoblanadi, shuning uchun kesuvchi konteynerlarga bogʻliq emas.
 */
function OverlayTrigger({ placement = 'top', overlay, delay = 80, children }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const anchorRef = useRef(null)
  const floatRef = useRef(null)
  const timerRef = useRef(null)

  const show = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setOpen(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setOpen(false)
    setPos(null)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    const float = floatRef.current
    if (!anchor || !float) return

    const a = anchor.getBoundingClientRect()
    const f = float.getBoundingClientRect()
    const gap = 8
    const margin = 8

    let top
    let left
    switch (placement) {
      case 'bottom':
        top = a.bottom + gap
        left = a.left + a.width / 2 - f.width / 2
        break
      case 'left':
        top = a.top + a.height / 2 - f.height / 2
        left = a.left - f.width - gap
        break
      case 'right':
        top = a.top + a.height / 2 - f.height / 2
        left = a.right + gap
        break
      default:
        top = a.top - f.height - gap
        left = a.left + a.width / 2 - f.width / 2
    }

    // Koʻrinish maydonidan chiqib ketmasligi uchun chegaralarga qisamiz.
    left = Math.min(Math.max(margin, left), window.innerWidth - f.width - margin)
    top = Math.min(Math.max(margin, top), window.innerHeight - f.height - margin)

    setPos({ top, left })
  }, [open, placement])

  const child = cloneElement(children, {
    ref: anchorRef,
    onMouseEnter: (e) => {
      children.props.onMouseEnter?.(e)
      show()
    },
    onMouseLeave: (e) => {
      children.props.onMouseLeave?.(e)
      hide()
    },
    onFocus: (e) => {
      children.props.onFocus?.(e)
      show()
    },
    onBlur: (e) => {
      children.props.onBlur?.(e)
      hide()
    },
  })

  return (
    <>
      {child}
      {open &&
        createPortal(
          <div
            ref={floatRef}
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
            }}
            className="pointer-events-none z-[1100] animate-pop-in"
          >
            {overlay}
          </div>,
          document.body,
        )}
    </>
  )
}

export { Tooltip, OverlayTrigger }
export default Tooltip
