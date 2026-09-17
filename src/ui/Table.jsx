import { cn } from '../lib/cn'

/**
 * Yopishqoq sarlavhali, zich jadval. Gorizontal skroll konteyner ichida
 * boʻlgani uchun tor ekranlarda ham maketi buzilmaydi.
 */
function Table({
  striped = false,
  hover = true,
  bordered = false,
  responsive = true,
  className,
  wrapperClassName,
  children,
  ...props
}) {
  const table = (
    <table
      className={cn(
        'w-full border-collapse text-left text-[13px]',
        '[&_th]:whitespace-nowrap [&_th]:bg-surface-2 [&_th]:px-3.5 [&_th]:py-2.5',
        '[&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-subtle',
        '[&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle',
        '[&_thead_tr]:border-b [&_thead_tr]:border-line',
        '[&_tbody_tr]:border-b [&_tbody_tr]:border-line [&_tbody_tr:last-child]:border-0',
        '[&_tbody_tr]:transition-colors',
        hover && '[&_tbody_tr:hover]:bg-surface-2',
        striped && '[&_tbody_tr:nth-child(odd)]:bg-surface-2/60',
        bordered && '[&_td]:border [&_th]:border [&_td]:border-line [&_th]:border-line',
        '[&_tfoot_td]:border-t [&_tfoot_td]:border-line [&_tfoot_td]:font-semibold',
        className,
      )}
      {...props}
    >
      {children}
    </table>
  )

  if (!responsive) return table

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-card border border-line bg-surface shadow-soft',
        wrapperClassName,
      )}
    >
      {table}
    </div>
  )
}

export default Table
export { Table }
