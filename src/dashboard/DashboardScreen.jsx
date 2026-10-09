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
import { locale, t, td } from '../i18n'

// ------------------------------------------------------------------ kichik qismlar

/**
 * O'zgarish belgisi: yo'nalish strelka + ishora bilan, rang — yaxshi/yomon ekaniga qarab
 * (`good`: 'up' | 'down' | null). Rang yolg'iz ma'no tashimaydi.
 */
function Delta({ current, previous, good = 'up', suffix }) {
  const change = percentChange(current, previous)
  if (change === null) {
    return <span className="text-[11px] text-subtle">{t('нет данных для сравнения{v}', { v: suffix ? ` ${suffix}` : '' })}</span>
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
      {Math.abs(change).toLocaleString(locale, { maximumFractionDigits: 1 })}%
      {suffix && <span className="ml-1 font-normal text-subtle">{suffix}</span>}
    </span>
  )
}

const KPI_LABELS = {
  day: { title: t('Сегодня'), vs: t('к вчера') },
  week: { title: t('Эта неделя'), vs: t('к прошлой неделе') },
  month: { title: t('Этот месяц'), vs: t('к прошлому месяцу') },
  year: { title: t('Этот год'), vs: t('к прошлому году') },
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
              <span className="ml-1 text-xs font-medium text-subtle">{t('сум')}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              {p && (
                <span title={t('Сравнение с тем же отрезком прошлого периода')}>
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

function MetricTile({ label, value, previous, good, hint, unit = t('сум'), format = formatMoney }) {
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
          <th>{t('Период')}</th>
          <th className="text-right">{t('Выручка')}</th>
          <th className="text-right">{t('Рост')}</th>
          <th className="text-right">{t('Продаж')}</th>
          <th className="text-right">{t('Поступления')}</th>
          <th className="text-right">{t('Валовая прибыль')}</th>
          {withExpenses && <th className="text-right">{t('Расходы')}</th>}
          {withExpenses && <th className="text-right">{t('Чистая прибыль')}</th>}
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

function SimpleTable({ columns, rows, empty = t('Нет данных') }) {
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
  { key: '', label: t('Все') },
  { key: 'sale', label: t('Продажи') },
  { key: 'return', label: t('Возвраты') },
  { key: 'purchase', label: t('Приходы') },
  { key: 'expense', label: t('Расходы') },
]

const EVENT = {
  sale: { label: t('Продажа'), Icon: ShoppingBag, sign: '+' },
  return: { label: t('Возврат'), Icon: Undo2, sign: '−' },
  purchase: { label: t('Приход'), Icon: ArrowDownLeft, sign: '−' },
  expense: { label: t('Расход'), Icon: ReceiptText, sign: '−' },
}

/** Backend izohni ruscha yozadi ("Из продажи #5", "за 10.2026") — ekranda tilga qarab tarjima qilinadi. */
function historyNote(note) {
  return note
    .replace(/^Из продажи #(\d+)/, (_, id) => t('Из продажи #{id}', { id }))
    .replace(/^за (\d{2}\.\d{4})/, (_, month) => t('за {month}', { month }))
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
          <Card.Title>{t('История операций')}</Card.Title>
          <Card.Subtitle className="mt-0.5">
            {formatDate(from)} — {formatDate(to)}
            {result ? ` · ${plural(result.meta.total, RECORDS)}` : ''}
          </Card.Subtitle>
        </div>
        <Segmented options={HISTORY_TYPES} value={type} onChange={setType} label={t('Тип операции')} />
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
                    {new Date(row.date).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                    {row.who && ` · ${row.who}`}
                    {row.note && ` · ${historyNote(row.note)}`}
                  </p>
                </div>
                <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg">
                  {event.sign}
                  {formatMoney(row.amount)}
                  <span className="ml-1 text-[11px] font-normal text-subtle">{t('сум')}</span>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState icon={History} title={t('Операций за период нет')} className="m-4 border-0" />
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
      { key: 'revenue', label: t('Выручка'), color: colors.series[0] },
      { key: 'grossProfit', label: t('Валовая прибыль'), color: colors.series[2] },
      { key: 'cashIn', label: t('Поступления'), color: colors.series[1] },
    ],
    [colors],
  )
  const profitSeries = useMemo(
    () => [
      { key: 'grossProfit', label: t('Валовая прибыль'), color: colors.series[0] },
      { key: 'expenses', label: t('Расходы'), color: colors.series[1] },
    ],
    [colors],
  )
  const countSeries = useMemo(() => [{ key: 'salesCount', label: t('Продаж'), color: colors.series[0] }], [colors])

  if (signedIn && role === 'User') {
    return (
      <div className="min-h-svh">
        <NavbarScreen />
        <Container className="py-10">
          <EmptyState
            icon={BarChart3}
            title={t('Недостаточно прав')}
            description={t('Дашборд доступен только администратору.')}
            action={
              <Button as={Link} to="/home" variant="outline-primary">
                <ArrowLeft />
                {t('Вернуться в систему')}
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
              <h1 className="text-base font-semibold tracking-tight text-fg">{t('Дашборд')}</h1>
              <p className="mt-0.5 text-xs text-subtle">
                {t('Выручка, прибыль, расходы и динамика продаж {v}', { v: kpis && t(' · время {timezone}', { timezone: kpis.timezone }) })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button as={Link} to="/home" variant="outline-secondary" size="sm">
              <ArrowLeft />
              {t('В систему')}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setReload((n) => n + 1)} loading={loading}>
              <RefreshCw />
              {t('Обновить')}
            </Button>
          </div>
        </div>

        <KpiTiles kpis={kpis} />

        {/* O'z yil tanlovi bor, pastdagi davr filtriga bog'liq emas. Kunni bosish — pastdagi hammasi shu kunga o'tadi. */}
        {kpis && (
          <ChartCard title={t('Календарь продаж')} subtitle={t('Активность по дням за год — нажмите на день, чтобы открыть его статистику')}>
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
            label={t('Период')}
            value={presetDef ? preset : 'custom'}
            options={PRESETS.map((item) => ({ key: item.key, label: item.label }))}
            onChange={(key) => update({ p: key, from: null, to: null, g: null })}
          />
          <div className="flex items-center gap-1.5">
            <Form.Control
              type="date"
              size="sm"
              aria-label={t('С даты')}
              className="w-36"
              value={from ?? ''}
              max={today}
              onChange={(e) => e.target.value && update({ p: 'custom', from: e.target.value, to, g: null })}
            />
            <span className="text-xs text-subtle">—</span>
            <Form.Control
              type="date"
              size="sm"
              aria-label={t('По дату')}
              className="w-36"
              value={to ?? ''}
              max={today}
              onChange={(e) => e.target.value && update({ p: 'custom', from, to: e.target.value, g: null })}
            />
          </div>
          <div className="ml-auto">
            <Segmented
              label={t('Шаг')}
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

        {!validRange && today && <Alert variant="warning">{t('Выберите корректный период: дата начала не позже даты окончания.')}</Alert>}
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
                {t('Повторить')}
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
                    {t('Выручка за период · {from} — {to} ({days} дн.)', { from: formatDate(data.range.from), to: formatDate(data.range.to), days: data.range.days })}
                  </p>
                  <p className="mt-1 text-5xl font-semibold tracking-tight text-fg">
                    {formatMoney(s.revenue)}
                    <span className="ml-2 text-lg font-medium text-subtle">{t('сум')}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Delta current={s.revenue} previous={p.revenue} suffix={t('к предыдущему периоду')} />
                    <span className="text-[11px] text-subtle">
                      {t('{from} — {to}: {amount} сум', { from: formatDate(data.previousRange.from), to: formatDate(data.previousRange.to), amount: formatMoney(p.revenue) })}
                    </span>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
                  {[
                    [t('Продажи'), s.gross],
                    [t('Скидки'), s.discount],
                    [t('Возвраты'), s.returns],
                    [t('Себестоимость ≈'), s.cogs],
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
              <MetricTile label={t('Поступления в кассу')} value={s.cashIn} previous={p.cashIn} hint={t('оплаты по продажам')} />
              <MetricTile label={t('Валовая прибыль ≈')} value={s.grossProfit} previous={p.grossProfit} hint={t('по текущей закупочной цене')} />
              <MetricTile label={t('Расходы')} value={s.expenses} previous={p.expenses} good="down" hint={t('{count}, по месяцам', { count: plural(s.expensesCount, RECORDS) })} />
              <MetricTile label={t('Чистая прибыль ≈')} value={s.netProfit} previous={p.netProfit} hint={t('валовая − расходы')} />
              <MetricTile label={t('Средний чек')} value={s.averageCheck} previous={p.averageCheck} />
              <MetricTile label={t('Продаж')} value={s.salesCount} previous={p.salesCount} unit="" hint={t('клиентов: {customers}', { customers: s.customers })} />
              <MetricTile label={t('Продано единиц')} value={s.itemsSold} previous={p.itemsSold} unit="" format={(v) => v.toLocaleString(locale)} />
              <MetricTile label={t('Возвраты')} value={s.returns} previous={p.returns} good="down" hint={t('{returnsCount} шт.', { returnsCount: s.returnsCount })} />
              <MetricTile label={t('Закупки')} value={s.purchases} previous={p.purchases} good={null} hint={plural(s.purchasesCount, ['приход', 'прихода', 'приходов'])} />
              <MetricTile label={t('Долг клиентов')} value={data.debt.amount} hint={t('{count} в долг · сейчас', { count: plural(data.debt.sales, SALES) })} />
            </div>

            <ChartCard
              title={t('Динамика выручки')}
              subtitle={t('Шаг: {step}', { step: GRANULARITIES.find((g) => g.key === granularity).label.toLowerCase() })}
              legend={<ChartLegend items={trendSeries} />}
            >
              <TrendChart data={data.series} granularity={granularity} series={trendSeries} />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title={t('Количество продаж')} subtitle={t('Чеков за каждый период')}>
                <ColumnChart data={data.series} granularity={granularity} series={countSeries} unit="" />
              </ChartCard>
              <ChartCard
                title={t('Прибыль и расходы')}
                subtitle={t('Расходы учитываются по месяцу, за который они внесены')}
                legend={monthly && <ChartLegend items={profitSeries} shape="rect" />}
              >
                {monthly ? (
                  <ColumnChart data={data.series} granularity={granularity} series={profitSeries} />
                ) : (
                  <EmptyState
                    icon={ReceiptText}
                    title={t('Расходы ведутся по месяцам')}
                    description={t('Чтобы сравнить прибыль с расходами, выберите шаг «Месяц».')}
                    action={
                      granularityAllowed('month', data.range.from, data.range.to) && (
                        <Button variant="outline-primary" size="sm" onClick={() => update({ g: 'month' })}>
                          {t('Показать по месяцам')}
                        </Button>
                      )
                    }
                    className="h-60 border-0"
                  />
                )}
              </ChartCard>
            </div>

            <ChartCard title={t('По периодам')} subtitle={t('Таблица к графикам выше, рост — к предыдущей строке')}>
              <PeriodTable series={data.series} granularity={granularity} />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title={t('Структура выручки')} subtitle={t('Доля категорий товаров')}>
                <DonutChart
                  centerLabel={t('Выручка')}
                  total={s.salesNet}
                  rows={data.categories.map((row) => ({ key: String(row.id ?? row.name), label: row.name, value: row.revenue }))}
                  emptyText={t('Продаж за период нет')}
                />
              </ChartCard>
              <ChartCard title={t('Способы оплаты')} subtitle={t('Поступления по продажам')}>
                <DonutChart
                  centerLabel={t('Поступления')}
                  total={s.cashIn}
                  order={PAYMENT_ORDER}
                  rows={data.paymentMethods.map((row) => ({ key: row.method, label: td(row.method), value: row.amount }))}
                  emptyText={t('Оплат за период нет')}
                />
              </ChartCard>
              <ChartCard title={t('Структура расходов')} subtitle={t('Расходы учитываются по месяцу')}>
                <DonutChart
                  centerLabel={t('Расходы')}
                  total={s.expenses}
                  rows={data.expensesByCategory.map((row) => ({ key: row.category, label: row.category, value: row.amount }))}
                  emptyText={t('Расходов за период нет')}
                />
              </ChartCard>
              <ChartCard title={t('Доля кассиров')} subtitle={t('Выручка по сотрудникам')}>
                <DonutChart
                  centerLabel={t('Выручка')}
                  total={s.salesNet}
                  rows={data.cashiers.map((row) => ({ key: String(row.id), label: row.name ?? '—', value: row.revenue }))}
                  emptyText={t('Продаж за период нет')}
                />
              </ChartCard>
            </div>

            <ChartCard title={t('Топ товаров')} subtitle={t('По выручке с учётом скидки на чек')}>
              <SimpleTable
                rows={data.topProducts}
                columns={[
                  { key: 'n', label: '#', render: (_, i) => <span className="text-subtle">{i + 1}</span> },
                  { key: 'name', label: t('Товар'), className: 'max-w-72 truncate font-medium text-fg' },
                  { key: 'quantity', label: t('Кол-во'), align: 'right', render: (r) => `${r.quantity.toLocaleString(locale)} ${td(r.unit)}` },
                  { key: 'revenue', label: t('Выручка'), align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  {
                    key: 'share',
                    label: t('Доля'),
                    align: 'right',
                    render: (r) => <span className="text-muted">{formatShare(r.revenue, s.salesNet)}</span>,
                  },
                  { key: 'profit', label: t('Прибыль ≈'), align: 'right', render: (r) => formatMoney(r.profit) },
                ]}
              />
            </ChartCard>

            <div className="grid gap-5 xl:grid-cols-3">
              <ChartCard title={t('Топ клиентов')}>
                <SimpleTable
                  rows={data.topCustomers}
                  columns={[
                    { key: 'name', label: t('Клиент'), className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'salesCount', label: t('Продаж'), align: 'right' },
                    { key: 'revenue', label: t('Выручка'), align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  ]}
                  empty={t('Продаж с контрагентом нет')}
                />
              </ChartCard>
              <ChartCard title={t('Должники')} subtitle={t('Текущий долг, за всё время')}>
                <SimpleTable
                  rows={data.debtors}
                  columns={[
                    { key: 'name', label: t('Клиент'), className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'phone', label: t('Телефон'), className: 'whitespace-nowrap text-muted' },
                    { key: 'debt', label: t('Долг'), align: 'right', strong: true, render: (r) => formatMoney(r.debt) },
                  ]}
                  empty={t('Долгов нет')}
                />
              </ChartCard>
              <ChartCard title={t('Кассиры')}>
                <SimpleTable
                  rows={data.cashiers}
                  columns={[
                    { key: 'name', label: t('Сотрудник'), className: 'max-w-40 truncate font-medium text-fg' },
                    { key: 'salesCount', label: t('Продаж'), align: 'right' },
                    { key: 'revenue', label: t('Выручка'), align: 'right', strong: true, render: (r) => formatMoney(r.revenue) },
                  ]}
                />
              </ChartCard>
            </div>

            <HistoryCard from={data.range.from} to={data.range.to} />

            <p className="text-center text-[11px] text-subtle">
              {t('Прибыль ≈ — оценка: себестоимость считается по текущей закупочной цене товара. Сравнение — с предыдущим периодом такой же длины. Компактные числа: {formatCompact} = 1 250 000.', { formatCompact: formatCompact(1_250_000) })}
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}

export default DashboardScreen
