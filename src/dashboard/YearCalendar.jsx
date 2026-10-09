import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { formatMoney, plural, SALES } from '../lib/format'
import { useRequest } from '../lib/useRequest'
import { Alert, Button, Spinner } from '../ui'
import { getCalendar } from './DashboardApi'
import { buildYearGrid, levelScale, MONTH_LABELS } from './calendarGrid'
import { useChartColors } from './chartColors'
import { formatDate } from './range'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const METRICS = [
  { key: 'salesCount', label: 'Продажи' },
  { key: 'revenue', label: 'Выручка' },
]
/** Bitta rang, och → to'q (ketma-ket shkala). 0-daraja — neytral katak. */
const LEVEL_ALPHA = [0, 0.25, 0.48, 0.72, 1]

const weekdayName = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('ru-RU', { weekday: 'short', timeZone: 'UTC' })

function describe(date, day) {
  const head = `${weekdayName(date)}, ${formatDate(date)}`
  if (!day || (!day.salesCount && !day.revenue)) return `${head} — продаж нет`
  return `${head} — ${plural(day.salesCount, SALES)} · ${formatMoney(day.revenue)} сум`
}

/**
 * GitHub uslubidagi yillik faollik kalendari. Yil tepadagi ‹ › bilan almashadi
 * (birinchi savdo yilidan joriy yilgacha). Katakni bosish — dashboard o'sha kunga o'tadi.
 * Klaviatura va ekran o'quvchilari uchun pastda oylar jadvali bor.
 */
function YearCalendar({ initialYear, onSelectDay }) {
  const c = useChartColors()
  const [year, setYear] = useState(initialYear)
  const [metric, setMetric] = useState('salesCount')
  const [focus, setFocus] = useState(null)

  // Yangi yil yuklanguncha eskisi xira holda turadi (sakrash bo'lmasin).
  const { data: shown, error, loading } = useRequest(() => getCalendar(year), `calendar-${year}`)

  const grid = useMemo(() => buildYearGrid(year), [year])
  const byDate = useMemo(() => new Map((shown?.days ?? []).map((d) => [d.date, d])), [shown])
  const level = useMemo(() => levelScale((shown?.days ?? []).map((d) => d[metric])), [shown, metric])

  const months = useMemo(
    () =>
      MONTH_LABELS.map((label, m) => {
        const prefix = `${year}-${String(m + 1).padStart(2, '0')}`
        const days = (shown?.days ?? []).filter((d) => d.date.startsWith(prefix))
        return {
          label,
          salesCount: days.reduce((sum, d) => sum + d.salesCount, 0),
          revenue: days.reduce((sum, d) => sum + d.revenue, 0),
          activeDays: days.filter((d) => d.salesCount > 0).length,
        }
      }),
    [shown, year],
  )
  const best = useMemo(
    () => (shown?.days ?? []).reduce((top, d) => (!top || d[metric] > top[metric] ? d : top), null),
    [shown, metric],
  )

  const today = shown?.today
  const fill = (lvl) => (lvl > 0 ? `rgb(${c.primaryRgb} / ${LEVEL_ALPHA[lvl]})` : undefined)
  const canPrev = shown ? year > shown.firstYear : false
  const canNext = shown ? year < shown.lastYear : false

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1">
          <Button
            variant="outline-secondary"
            size="sm"
            icon
            aria-label="Предыдущий год"
            disabled={!canPrev || loading}
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-fg" aria-live="polite">
            {year}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            icon
            aria-label="Следующий год"
            disabled={!canNext || loading}
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight />
          </Button>
        </div>

        <div role="group" aria-label="Показатель" className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition',
                metric === m.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {loading && <Spinner size="sm" />}

        {shown && (
          <p className="ml-auto text-xs text-muted">
            {plural(shown.totals.salesCount, SALES)} · {formatMoney(shown.totals.revenue)} сум ·{' '}
            {plural(shown.totals.activeDays, ['активный день', 'активных дня', 'активных дней'])}
          </p>
        )}
      </div>

      {error && <Alert variant="danger">{error.message}</Alert>}

      <div className={cn('overflow-x-auto pb-1 transition-opacity', loading && 'opacity-60')}>
        <div
          role="img"
          aria-label={`Календарь продаж за ${year} год. Значения по месяцам — в таблице ниже.`}
          className="grid min-w-[42rem] gap-[3px]"
          style={{ gridTemplateColumns: `1.75rem repeat(${grid.weeks.length}, minmax(0, 1fr))` }}
        >
          {/* Oy nomlari qatori */}
          <span />
          {grid.weeks.map((_, w) => {
            const month = grid.months.find((m) => m.column === w)
            return (
              <span key={`m${w}`} className="relative h-4 text-[10px] leading-4 text-subtle">
                {month && <span className="absolute left-0 whitespace-nowrap">{month.label}</span>}
              </span>
            )
          })}

          {WEEKDAYS.map((name, d) => (
            <div key={name} className="contents">
              <span className="self-center pr-1 text-[10px] text-subtle">{d % 2 === 0 ? name : ''}</span>
              {grid.weeks.map((week) => {
                const cell = week[d]
                if (!cell.inYear) return <span key={cell.date} />
                const future = today && cell.date > today
                const day = byDate.get(cell.date)
                const lvl = level(day?.[metric] ?? 0)
                const text = describe(cell.date, day)
                return (
                  <button
                    key={cell.date}
                    type="button"
                    tabIndex={-1}
                    title={future ? undefined : text}
                    aria-hidden="true"
                    disabled={future}
                    onMouseEnter={() => setFocus(text)}
                    onMouseLeave={() => setFocus(null)}
                    onClick={() => onSelectDay?.(cell.date)}
                    className={cn(
                      'aspect-square w-full rounded-[3px] transition-transform',
                      future ? 'cursor-default bg-surface-2 opacity-40' : 'hover:scale-125 hover:ring-2 hover:ring-[var(--ring)]',
                      !future && lvl === 0 && 'bg-surface-2',
                      cell.date === today && 'ring-1 ring-fg/40',
                    )}
                    style={{ background: fill(lvl) }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-subtle">
        <span className="min-h-4 text-muted" aria-live="polite">
          {focus ??
            (best
              ? `Лучший день: ${describe(best.date, best)}. Нажмите на день, чтобы открыть его статистику.`
              : 'Нажмите на день, чтобы открыть его статистику.')}
        </span>
        <span className="inline-flex items-center gap-1">
          Меньше
          {LEVEL_ALPHA.map((alpha, lvl) => (
            <span
              key={lvl}
              aria-hidden="true"
              className={cn('size-3 rounded-[3px]', lvl === 0 && 'bg-surface-2')}
              style={{ background: fill(lvl) }}
            />
          ))}
          Больше
        </span>
      </div>

      <details className="group rounded-lg border border-line">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs text-muted transition hover:text-fg">
          Таблица по месяцам за {year}
        </summary>
        <table className="w-full border-t border-line text-[12px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-subtle">
              <th className="px-3 py-1.5 text-left font-semibold">Месяц</th>
              <th className="px-3 py-1.5 text-right font-semibold">Продаж</th>
              <th className="px-3 py-1.5 text-right font-semibold">Выручка</th>
              <th className="px-3 py-1.5 text-right font-semibold">Активных дней</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.label} className="border-t border-line">
                <td className="px-3 py-1.5 text-muted">{m.label}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{m.salesCount}</td>
                <td className="px-3 py-1.5 text-right font-medium tabular-nums text-fg">{formatMoney(m.revenue)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{m.activeDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default YearCalendar
