import { cn } from '../lib/cn'
import { formatMoney } from '../lib/format'

/**
 * Gorizontal ustunlar ro'yxati (bitta seriya → bitta rang). Qiymat har doim matn
 * bo'lib ustun oxirida turadi, shuning uchun tooltip shart emas va rang yolg'iz
 * ma'no tashimaydi. Ustun: 10px qalinlik, chap tomonda to'g'ri, oxiri 4px yumaloq.
 */
function BarList({ items, format = formatMoney, emptyText = 'Нет данных', className }) {
  if (!items.length) {
    return <p className={cn('py-6 text-center text-xs text-subtle', className)}>{emptyText}</p>
  }

  const max = Math.max(...items.map((item) => item.value), 0)

  return (
    <ul className={cn('m-0 flex list-none flex-col gap-2.5 p-0', className)}>
      {items.map((item) => (
        <li
          key={item.key ?? item.label}
          className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-3 text-[13px] sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto]"
        >
          <span className="truncate text-muted" title={item.label}>
            {item.label}
          </span>
          <span className="block h-2.5 border-l border-line-strong" aria-hidden="true">
            <span
              className="block h-full rounded-r-[4px] bg-primary"
              style={{ width: `${max > 0 ? Math.max(0, (item.value / max) * 100) : 0}%` }}
            />
          </span>
          <span className="whitespace-nowrap text-right tabular-nums">
            <span className="font-medium text-fg">{format(item.value)}</span>
            {item.hint && <span className="ml-1.5 text-[11px] text-subtle">{item.hint}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default BarList
