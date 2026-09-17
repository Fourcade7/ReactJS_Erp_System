import { Children, isValidElement, useState } from 'react'
import { cn } from '../lib/cn'

/** Faqat metama'lumot tashuvchi element — render qilishni `Tabs` bajaradi. */
function Tab({ children }) {
  return <>{children}</>
}

/**
 * Boshqariladigan yoki boshqarilmaydigan tab paneli.
 * `variant`: 'underline' (standart), 'pills' yoki 'segmented'.
 */
function Tabs({
  activeKey,
  defaultActiveKey,
  onSelect,
  variant = 'underline',
  justified = false,
  className,
  navClassName,
  contentClassName,
  children,
  ...props
}) {
  const panes = Children.toArray(children).filter(isValidElement)
  const [uncontrolled, setUncontrolled] = useState(
    defaultActiveKey ?? panes[0]?.props?.eventKey,
  )
  const current = activeKey ?? uncontrolled

  const select = (key) => {
    if (activeKey === undefined) setUncontrolled(key)
    onSelect?.(key)
  }

  const activePane = panes.find((p) => p.props.eventKey === current)

  const isSegmented = variant === 'segmented'
  const isPills = variant === 'pills'

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        role="tablist"
        className={cn(
          'flex items-center gap-1 overflow-x-auto overflow-y-hidden',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          variant === 'underline' && 'shadow-[inset_0_-1px_0_var(--border)]',
          isSegmented && 'w-fit rounded-xl border border-line bg-surface-2 p-1',
          justified && 'w-full [&>button]:flex-1',
          navClassName,
        )}
      >
        {panes.map((pane) => {
          const { eventKey, title, disabled } = pane.props
          const active = eventKey === current
          return (
            <button
              key={eventKey}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => select(eventKey)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-all duration-150',
                'disabled:cursor-not-allowed disabled:opacity-40',
                '[&_svg]:size-3.5 [&_svg]:shrink-0',
                variant === 'underline' &&
                  cn(
                    'border-b-2 px-3 py-2.5 text-[13px]',
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:border-line-strong hover:text-fg',
                  ),
                isPills &&
                  cn(
                    'rounded-lg px-3 py-1.5 text-[13px]',
                    active
                      ? 'bg-primary-soft text-primary-soft-fg'
                      : 'text-muted hover:bg-surface-2 hover:text-fg',
                  ),
                isSegmented &&
                  cn(
                    'justify-center rounded-lg px-3 py-1.5 text-xs',
                    active
                      ? 'bg-surface text-fg shadow-soft'
                      : 'text-muted hover:text-fg',
                  ),
              )}
            >
              {title}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        className={cn('animate-fade-in pt-4', contentClassName)}
        key={current}
      >
        {activePane?.props?.children}
      </div>
    </div>
  )
}

export default Tabs
export { Tabs, Tab }
