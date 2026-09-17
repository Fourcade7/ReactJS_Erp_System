import { cn } from '../lib/cn'

/**
 * Kartaga oʻxshash roʻyxat: tashqi ramka bitta, elementlar orasida ingichka chiziq.
 * `as` orqali `ul`/`ol` qilib ishlatish mumkin.
 */
function ListGroup({ as: Component = 'div', flush = false, className, children, ...props }) {
  return (
    <Component
      className={cn(
        'w-full list-none divide-y divide-line',
        !flush &&
          'overflow-hidden rounded-card border border-line bg-surface shadow-soft',
        Component !== 'div' && 'm-0 p-0',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

function ListGroupItem({
  as: Component = 'div',
  active = false,
  action = false,
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'flex items-center gap-3 bg-surface px-4 py-2.5 text-[13px] text-fg transition-colors duration-150',
        (action || props.onClick) && 'cursor-pointer',
        'hover:bg-surface-2',
        active && 'bg-primary-soft hover:bg-primary-soft',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

ListGroup.Item = ListGroupItem

export default ListGroup
export { ListGroup, ListGroupItem }
