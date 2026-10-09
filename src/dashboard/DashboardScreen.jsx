import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  History,
  Minus,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Undo2,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { formatCompact, formatMoney, plural, RECORDS, SALES } from '../lib/format'
import { NavbarScreen } from '../navbar/NavbarContent'
import { Alert, Button, Card, Container, EmptyState, Form, Spinner, Table } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { useRequest } from '../lib/useRequest'
import { getDashboard, getHistory, getKpis } from './DashboardApi'
import { ChartLegend, ColumnChart, DonutChart, TrendChart } from './charts'
import YearCalendar from './YearCalendar'
import { useChartColors } from './chartColors'
import { formatShare } from './segments'

// To'lov usullari donutda doim shu tartibda va o'z ranglarida turadi.
const PAYMENT_ORDER = ['Наличные', 'Банковская карта', 'Click', 'Payme', 'Uzum']
import {
  GRANULARITIES,
  PRESETS,
  autoGranularity,
  bucketLabel,
  formatDate,
  granularityAllowed,
  isValidDate,
  percentChange,
} from './range'

// ------------------------------------------------------------------ kichik qismlar

/**
 * O'zgarish belgisi: yo'nalish strelka + ishora bilan, rang — yaxshi/yomon ekaniga qarab
 * (`good`: 'up' | 'down' | null). Rang yolg'iz ma'no tashimaydi.
 */
function Delta({ current, previous, good = 'up', suffix }) {
  const change = percentChange(current, previous)
  if (change === null) {
    return <span className="text-[11px] text-subtle">нет данных для сравнения{suffix ? ` ${suffix}` : ''}</span>
  }
  const flat = Math.abs(change) < 0.05
  const up = change > 0
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
  const tone =
    flat || !good ? 'text-muted' : (up === (good === 'up')) ? 'text-success-soft-fg' : 'text-danger-soft-fg'
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-medium', tone)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {up ? '+' : flat ? '' : '−'}
      {Math.abs(change).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%
      {suffix && <span className="ml-1 font-normal text-subtle">{suffix}</span>}
    </span>
  )
}

const KPI_LABELS = {
  day: { title: 'Сегодня', vs: 'к вчера' },
  week: { title: 'Эта неделя', vs: 'к прошлой неделе' },
  month: { title: 'Этот месяц', vs: 'к прошлому месяцу' },
  year: { title: 'Этот год', vs: 'к прошлому году' },
}

function KpiTiles({ kpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Object.entries(KPI_LABELS).map(([key, label]) => {
        const p = kpis?.periods[key]
        return (
          <Card key={key} padded={false} className="p-4">
            <p className="text-xs font-medium text-muted">{label.title}</p>
            <p className="mt-2 truncate text-xl font-semibold tracking-tight text-fg">
              {p ? formatMoney(p.revenue) : '—'}
              <span className="ml-1 text-xs font-medium text-subtle">сум</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              {p && (
                <span title="Сравнение с тем же отрезком прошлого периода">
                  <Delta current={p.revenue} previous={p.previous.revenue} suffix={label.vs} />
                </span>
              )}
              <span className="text-[11px] text-subtle">{p ? plural(p.salesCount, SALES) : ''}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function MetricTile({ label, value, previous, good, hint, unit = 'сум', format = formatMoney }) {
  return (
    <Card padded={false} className="p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1.5 truncate text-lg font-semibold tracking-tight text-fg">
        {format(value)}
        {unit && <span className="ml-1 text-xs font-medium text-subtle">{unit}</span>}
      </p>
      <div className="mt-1 flex min-h-4 flex-wrap items-center justify-between gap-x-2">
        {previous !== undefined && <Delta current={value} previous={previous} good={good} />}
        {hint && <span className="text-[11px] text-subtle">{hint}</span>}
      </div>
    </Card>
  )
}

function ChartCard({ title, subtitle, legend, children, className }) {
  return (
    <Card padded={false} className={cn('min-w-0', className)}>
      <Card.Header>
        <div className="min-w-0">
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Subtitle className="mt-0.5">{subtitle}</Card.Subtitle>}
        </div>
        {legend}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          disabled={option.disabled}
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
            value === option.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ jadvallar

function PeriodTable({ series, granularity }) {
  const withExpenses = granularity === 'month' || granularity === 'year'
  const rows = [...series].reverse()
  return (
    <Table wrapperClassName="max-h-[28rem] overflow-y-auto">
      <thead className="sticky top-0">
        <tr>
          <th>Период</th>
          <th className="text-right">Выручка</th>
          <th className="text-right">Рост</th>
          <th className="text-right">Продаж</th>
          <th className="text-right">Поступления</th>
          <th className="text-right">Валовая прибыль</th>
          {withExpenses && <th className="text-right">Расходы</th>}
          {withExpenses && <th className="text-right">Чистая прибыль</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const prev = rows[index + 1]
          return (
            <tr key={row.bucket}>
              <td className="whitespace-nowrap text-muted">{bucketLabel(row.bucket, granularity)}</td>
              <td className="text-right font-semibold tabular-nums text-fg">{formatMoney(row.revenue)}</td>
              <td className="text-right">{prev ? <Delta current={row.revenue} previous={prev.revenue} /> : '—'}</td>
              <td className="text-right tabular-nums">{row.salesCount}</td>
              <td className="text-right tabular-nums">{formatMoney(row.cashIn)}</td>
              <td className="text-right tabular-nums">{formatMoney(row.grossProfit)}</td>
              {withExpenses && <td className="text-right tabular-nums">{formatMoney(row.expenses)}</td>}
              {withExpenses && (
                <td className={cn('text-right font-medium tabular-nums', row.netProfit < 0 ? 'text-danger-soft-fg' : 'text-fg')}>
                  {row.netProfit < 0 ? '−' : ''}
                  {formatMoney(Math.abs(row.netProfit))}
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

function SimpleTable({ columns, rows, empty = 'Нет данных' }) {
  if (!rows.length) return <p className="py-6 text-center text-xs text-subtle">{empty}</p>
  return (
    // Tor ekranda jadval kartani kengaytirmaydi — o'zi gorizontal suriladi.
    <Table wrapperClassName="rounded-none border-0 bg-transparent shadow-none">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.align === 'right' ? 'text-right' : undefined}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id ?? index}>
            {columns.map((col) => (
              <td
                key={col.key}
                className={cn(col.align === 'right' && 'text-right tabular-nums', col.strong && 'font-semibold text-fg', col.className)}
              >
                {col.render ? col.render(row, index) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// ------------------------------------------------------------------ tarix

const HISTORY_TYPES = [
  { key: '', label: 'Все' },
  { key: 'sale', label: 'Продажи' },
  { key: 'return', label: 'Возвраты' },
  { key: 'purchase', label: 'Приходы' },
  { key: 'expense', label: 'Расходы' },
]

const EVENT = {
  sale: { label: 'Продажа', Icon: ShoppingBag, sign: '+' },
  return: { label: 'Возврат', Icon: Undo2, sign: '−' },
  purchase: { label: 'Приход', Icon: ArrowDownLeft, sign: '−' },
  expense: { label: 'Расход', Icon: ReceiptText, sign: '−' },
}

function HistoryCard({ from, to }) {
  const [type, setType] = useState('')
  const [pageState, setPageState] = useState({ page: 1, scope: '' })

  // Davr yoki tur o'zgarsa — birinchi sahifa (effektsiz: sahifa raqami shu "doira"ga bog'langan).
  const scope = `${from}|${to}|${type}`
  const page = pageState.scope === scope ? pageState.page : 1
  const setPage = (next) => setPageState({ page: next, scope })

  const query = { page, limit: 12, type, from, to }
  const { data: result, error, loading } = useRequest(() => getHistory(query), JSON.stringify(query))

  return (
    <Card padded={false}>
      <Card.Header>
        <div>
          <Card.Title>История операций</Card.Title>
          <Card.Subtitle className="mt-0.5">
            {formatDate(from)} — {formatDate(to)}
            {result ? ` · ${plural(result.meta.total, RECORDS)}` : ''}
          </Card.Subtitle>
        </div>
        <Segmented options={HISTORY_TYPES} value={type} onChange={setType} label="Тип операции" />
      </Card.Header>
      {error && <Alert variant="danger" className="m-4 w-auto">{error.message}</Alert>}
      {!result && loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : result?.data.length ? (
        <ul className={cn('m-0 list-none divide-y divide-line p-0 transition-opacity', loading && 'opacity-60')}>
          {result.data.map((row) => {
            const event = EVENT[row.type]
            return (
              <li key={`${row.type}-${row.id}`} className="flex items-center gap-3 px-4 py-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                  <event.Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-fg">
                    {event.label} #{row.id}
                    {row.counterparty && <span className="font-normal text-muted"> · {row.counterparty}</span>}
                  </p>
                  <p className="truncate text-[11px] text-subtle">
                    {new Date(row.date).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                    {row.who && ` · ${row.who}`}
                    {row.note && ` · ${row.note}`}
                  </p>
                </div>
                <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg">
                  {event.sign}
                  {formatMoney(row.amount)}
                  <span className="ml-1 text-[11px] font-normal text-subtle">сум</span>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState icon={History} title="Операций за период нет" className="m-4 border-0" />
      )}
      {result?.meta.totalPages > 1 && (
        <div className="flex justify-center border-t border-line py-3">
          <CustomPaginationScreen active={page} pageCount={result.meta.totalPages} setActive={setPage} />
        </div>
      )}
    </Card>
  )
}

// ------------------------------------------------------------------ sahifa

function DashboardScreen() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const colors = useChartColors()
  const role = localStorage.getItem('role')
  const signedIn = Boolean(localStorage.getItem('userid'))

  const [reload, setReload] = useState(0)
  const [dismissedError, setDismissedError] = useState(null)

  useEffect(() => {
    if (!signedIn) navigate('/login')
  }, [signedIn, navigate])

  const kpiRequest = useRequest(getKpis, signedIn ? `kpis-${reload}` : null)
  const kpis = kpiRequest.data

  // Davr URL da saqlanadi: sahifani yangilash yoki havolani yuborish bir xil ko'rinishni ochadi.
  const preset = params.get('p') ?? (params.get('from') ? 'custom' : '30d')
  const today = kpis?.today
  const presetDef = PRESETS.find((item) => item.key === preset)
  const [from, to] = presetDef
    ? today ? presetDef.range(today) : [null, null]
    : [params.get('from'), params.get('to')]
  const validRange = isValidDate(from) && isValidDate(to) && from <= to
  const requested = params.get('g')
  const granularity =
    validRange && requested && granularityAllowed(requested, from, to) ? requested : validRange ? autoGranularity(from, to) : 'day'

  const update = useCallback(
    (next) => {
      const merged = Object.fromEntries(params.entries())
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') delete merged[key]
        else merged[key] = value
      })
      setParams(merged, { replace: true })
    },
    [params, setParams],
  )

  const dashboardRequest = useRequest(
    () => getDashboard(from, to, granularity),
    signedIn && validRange ? `${from}|${to}|${granularity}|${reload}` : null,
  )
  const data = dashboardRequest.data
  const loading = dashboardRequest.loading || kpiRequest.loading
  const failure = dashboardRequest.error ?? kpiRequest.error
  const error = failure && failure !== dismissedError ? failure.message : ''

  const trendSeries = useMemo(
    () => [
      { key: 'revenue', label: 'Выручка', color: colors.series[0] },
      { key: 'grossProfit', label: 'Валовая прибыль', color: colors.series[2] },
      { key: 'cashIn', label: 'Поступления', color: colors.series[1] },
    ],
    [colors],
  )
  const profitSeries = useMemo(
    () => [
      { key: 'grossProfit', label: 'Валовая прибыль', color: colors.series[0] },
      { key: 'expenses', label: 'Расходы', color: colors.series[1] },
    ],
    [colors],
  )
  const countSeries = useMemo(() => [{ key: 'salesCount', label: 'Продаж', color: colors.series[0] }], [colors])

  if (signedIn && role === 'User') {
    return (
      <div className="min-h-svh">
        <NavbarScreen />
        <Container className="py-10">
          <EmptyState
            icon={BarChart3}
            title="Недостаточно прав"
            description="Дашборд доступен только администратору."
            action={
              <Button as={Link} to="/home" variant="outline-primary">
                <ArrowLeft />
                Вернуться в систему
              </Button>
            }
          />
        </Container>
      </div>
    )
  }

  const s = data?.summary
  const p = data?.previous
  const monthly = granularity === 'month' || granularity === 'year'

  return (
    <div className="min-h-svh">
      <NavbarScreen />
      <Container size="full" className="flex flex-col gap-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
              <BarChart3 className="size-4" />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-fg">Дашборд</h1>
              <p className="mt-0.5 text-xs text-subtle">
                Выручка, прибыль, расходы и динамика продаж
                {kpis && ` · время ${kpis.timezone}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button as={Link} to="/home" variant="outline-secondary" size="sm">
              <ArrowLeft />
              В систему
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setReload((n) => n + 1)} loading={loading}>
              <RefreshCw />
              Обновить
            </Button>
          </div>
        </div>

        <KpiTiles kpis={kpis} />

        {/* O'z yil tanlovi bor, pastdagi davr filtriga bog'liq emas. Kunni bosish — pastdagi hammasi shu kunga o'tadi. */}
        {kpis && (
          <ChartCard title="Календарь продаж" subtitle="Активность по дням за год — нажмите на день, чтобы открыть его статистику">
            <YearCalendar
              initialYear={Number(kpis.today.slice(0, 4))}
              onSelectDay={(date) => {
                update({ p: 'custom', from: date, to: date, g: null })
                document.getElementById('dashboard-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
          </ChartCard>
        )}

        {/* Bitta filtr qatori — undan pastdagi hamma narsa shu davr bo'yicha. */}
        <div
          id="dashboard-filters"
          className="flex scroll-mt-20 flex-wrap items-center gap-2 rounded-card border border-line bg-surface p-2 shadow-soft"
        >
          <Segmented
            label="Период"
            value={presetDef ? preset : 'custom'}
            options={PRESETS.map((item) => ({ key: item.key, label: item.label }))}
            onChange={(key) => update({ p: key, from: null, to: null, g: null })}
          />
          <div className="flex items-center gap-1.5">
            <Form.Control
              type="date"
              size="sm"
              aria-label="С даты"
              className="w-36"
              value={from ?? ''}
              max={today}
              onChange={(e) => e.target.value && update({ p: 'custom', from: e.target.value, to, g: null })}
            />
            <span className="text-xs text-subtle">—</span>
            <Form.Control
              type="date"
              size="sm"
              aria-label="По дату"
              className="w-36"
              value={to ?? ''}
              max={today}
              onChange={(e) => e.target.value && update({ p: 'custom', from, to: e.target.value, g: null })}
            />
          </div>
          <div className="ml-auto">
            <Segmented
              label="Шаг"
              value={granularity}
              options={GRANULARITIES.map((g) => ({
                key: g.key,
                label: g.label,
                disabled: !validRange || !granularityAllowed(g.key, from, to),
              }))}
              onChange={(key) => update({ g: key })}
            />
          </div>
        </div>

        {!validRange && today && <Alert variant="warning">Выберите корректный период: дата начала не позже даты окончания.</Alert>}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setDismissedError(failure)}>
            {error}
          </Alert>
        )}

        {!data ? (
          <div className="flex justify-center py-16">
            {failure ? (
              <Button variant="outline-primary" onClick={() => setReload((n) => n + 1)}>
                <RefreshCw />
                Повторить
              </Button>
            ) : (
              <Spinner size="lg" />
            )}
          </div>
        ) : (
          <div className={cn('flex flex-col gap-5 transition-opacity', loading && 'opacity-60')}>
            {/* Asosiy raqam */}
            <Card padded={false} className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted">
                    Выручка за период · {formatDate(data.range.from)} — {formatDate(data.range.to)} ({data.range.days} дн.)
                  </p>
                  <p className="mt-1 text-5xl font-semibold tracking-tight text-fg">
                    {formatMoney(s.revenue)}
                    <span className="ml-2 text-lg font-medium text-subtle">сум</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Delta current={s.revenue} previous={p.revenue} suffix="к предыдущему периоду" />
                    <span className="text-[11px] text-subtle">
                      {formatDate(data.previousRange.from)} — {formatDate(data.previousRange.to)}: {formatMoney(p.revenue)} сум
                    </span>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
                  {[
                    ['Продажи', s.gross],
                    ['Скидки', s.discount],
                    ['Возвраты', s.returns],
                    ['Себестоимость ≈', s.cogs],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-subtle">{label}</dt>
                      <dd className="font-semibold tabular-nums text-fg">{formatMoney(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              <MetricTile label="Поступления в кассу" value={s.cashIn} previous={p.cashIn} hint="оплаты по продажам" />
              <MetricTile label="Валовая прибыль ≈" value={s.grossProfit} previous={p.grossProfit} hint="по текущей закупочной цене" />
              <MetricTile label="Расходы" value={s.expenses} previous={p.expenses} good="down" hint={`${plural(s.expensesCount, RECORDS)}, по месяцам`} />
              <MetricTile label="Чистая прибыль ≈" value={s.netProfit} previous={p.netProfit} hint="валовая − расходы" />
              <MetricTile label="Средний чек" value={s.averageCheck} previous={p.averageCheck} />
              <MetricTile label="Продаж" value={s.salesCount} previous={p.salesCount} unit="" hint={`клиентов: ${s.customers}`} />
              <MetricTile label="Продано единиц" value={s.itemsSold} previous={p.itemsSold} unit="" format={(v) => v.toLocaleString('ru-RU')} />
              <MetricTile label="Возвраты" value={s.returns} previous={p.returns} good="down" hint={`${s.returnsCount} шт.`} />
              <MetricTile label="Закупки" value={s.purchases} previous={p.purchases} good={null} hint={plural(s.purchasesCount, ['приход', 'прихода', 'приходов'])} />
              <MetricTile label="Долг клиентов" value={data.debt.amount} hint={`${plural(data.debt.sales, SALES)} в долг · сейчас`} />
            </div>

            <ChartCard
              title="Динамика выручки"
              subtitle={`Шаг: ${GRANULARITIES.find((g) => g.key === granularity).label.toLowerCase()}`}
              legend={<ChartLegend items={trendSeries} />}
            >
              <TrendChart data={data.series} granularity={granularity} series={trendSeries} />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title="Количество продаж" subtitle="Чеков за каждый период">
                <ColumnChart data={data.series} granularity={granularity} series={countSeries} unit="" />
              </ChartCard>
              <ChartCard
                title="Прибыль и расходы"
                subtitle="Расходы учитываются по месяцу, за который они внесены"
                legend={monthly && <ChartLegend items={profitSeries} shape="rect" />}
              >
                {monthly ? (
                  <ColumnChart data={data.series} granularity={granularity} series={profitSeries} />
                ) : (
                  <EmptyState
                    icon={ReceiptText}
                    title="Расходы ведутся по месяцам"
                    description="Чтобы сравнить прибыль с расходами, выберите шаг «Месяц»."
                    action={
                      granularityAllowed('month', data.range.from, data.range.to) && (
                        <Button variant="outline-primary" size="sm" onClick={() => update({ g: 'month' })}>
                          Показать по месяцам
                        </Button>
                      )
                    }
                    className="h-60 border-0"
                  />
                )}
              </ChartCard>
            </div>

            <ChartCard title="По периодам" subtitle="Таблица к графикам выше, рост — к предыдущей строке">
              <PeriodTable series={data.series} granularity={granularity} />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title="Структура выручки" subtitle="Доля категорий товаров">
                <DonutChart
                  centerLabel="Выручка"
                  total={s.salesNet}
                  rows={data.categories.map((row) => ({ key: String(row.id ?? row.name), label: row.name, value: row.revenue }))}
                  emptyText="Продаж за период нет"
                />
              </ChartCard>
              <ChartCard title="Способы оплаты" subtitle="Поступления по продажам">
                <DonutChart
                  centerLabel="Поступления"
                  total={s.cashIn}
                  order={PAYMENT_ORDER}
                  rows={data.paymentMethods.map((row) => ({ key: row.method, label: row.method, value: row.amount }))}
                  emptyText="Оплат за период нет"
                />
              </ChartCard>
              <ChartCard title="Структура расходов" subtitle="Расходы учитываются по месяцу">
                <DonutChart
                  centerLabel="Расходы"
                  total={s.expenses}
                  rows={data.expensesByCategory.map((row) => ({ key: row.category, label: row.category, value: row.amount }))}
                  emptyText="Расходов за период нет"
                />
              </ChartCard>
              <ChartCard title="Доля кассиров" subtitle="Выручка по сотрудникам">
                <DonutChart
                  centerLabel="Выручка"
                  total={s.salesNet}
                  rows={data.cashiers.map((row) => ({ key: String(row.id), label: row.name ?? '—', value: row.revenue }))}
                  emptyText="Продаж за период нет"
                />
              </ChartCard>
            </div>

            <ChartCard title="Топ товаров" subtitle="По выручке с учётом скидки на чек">
              <SimpleTable
                rows={data.topProducts}
                columns={[
                  { key: 'n', label: '#', render: (_, i) => <span className="text-subtle">{i + 1}</span> },
                  { key: 'name', label: 'Товар', className: 'max-w-72 truncate font-medium text-fg' },
                  { key: 'quantity', label: 'Кол-во', align: 'right', render: (r) => `${r.quantity.toLocaleString('ru-RU')} ${r.unit}` },
                  { key: 'revenue', label: 'Выручка', align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  {
                    key: 'share',
                    label: 'Доля',
                    align: 'right',
                    render: (r) => <span className="text-muted">{formatShare(r.revenue, s.salesNet)}</span>,
                  },
                  { key: 'profit', label: 'Прибыль ≈', align: 'right', render: (r) => formatMoney(r.profit) },
                ]}
              />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-3">
              <ChartCard title="Топ клиентов">
                <SimpleTable
                  rows={data.topCustomers}
                  columns={[
                    { key: 'name', label: 'Клиент', className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'salesCount', label: 'Продаж', align: 'right' },
                    { key: 'revenue', label: 'Выручка', align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  ]}
                  empty="Продаж с контрагентом нет"
                />
              </ChartCard>
              <ChartCard title="Должники" subtitle="Текущий долг, за всё время">
                <SimpleTable
                  rows={data.debtors}
                  columns={[
                    { key: 'name', label: 'Клиент', className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'phone', label: 'Телефон', className: 'whitespace-nowrap text-muted' },
                    { key: 'debt', label: 'Долг', align: 'right', strong: true, render: (r) => formatMoney(r.debt) },
                  ]}
                  empty="Долгов нет"
                />
              </ChartCard>
              <ChartCard title="Кассиры">
                <SimpleTable
                  rows={data.cashiers}
                  columns={[
                    { key: 'name', label: 'Сотрудник', className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'salesCount', label: 'Продаж', align: 'right' },
                    { key: 'revenue', label: 'Выручка', align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  ]}
                />
              </ChartCard>
            </div>

            <HistoryCard from={data.range.from} to={data.range.to} />

            <p className="text-center text-[11px] text-subtle">
              Прибыль ≈ — оценка: себестоимость считается по текущей закупочной цене товара.
              Сравнение — с предыдущим периодом такой же длины. Компактные числа: {formatCompact(1_250_000)} = 1 250 000.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}

export default DashboardScreen
