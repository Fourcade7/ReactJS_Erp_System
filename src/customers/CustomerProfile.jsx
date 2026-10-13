import { Fragment, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  FileText,
  ListChecks,
  Pencil,
  Phone,
  RefreshCw,
  ShoppingBag,
  Undo2,
  UserRound,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Badge, Button, Card, EmptyState, Spinner, Table, Tab, Tabs } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { useRequest } from '../lib/useRequest'
import { formatMoney } from '../lib/format'
import { getContracts } from '../contract/ContractApi'
import { formatAmount, formatContractDate, statusOf } from '../contract/contractView'
import { getTasks } from '../task/TaskApi'
import { formatShortDateTime, fullName } from '../task/taskView'
import { locale, t, td } from '../i18n'
import { getCustomerOperations, getCustomerProfile } from './CustomerApi'
import { isOrganization } from './customerForm'

const OPERATION_LIMIT = 10
const DAY = 86_400_000

const OP_TYPES = {
  sale: { label: t('Продажа'), Icon: ShoppingBag, tone: 'primary', sign: '+' },
  return: { label: t('Возврат'), Icon: Undo2, tone: 'warning', sign: '−' },
  purchase: { label: t('Приход'), Icon: ArrowDownLeft, tone: 'info', sign: '−' },
}

/** Necha kun o'tgan (butun). Sof funksiya sifatida alohida: renderda Date.now() chaqirilmaydi. */
const daysSince = (value, now = Date.now()) => Math.max(0, Math.floor((now - new Date(value).getTime()) / DAY))

const dateTime = (value) => (value ? new Date(value).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—')

function Money({ value, className }) {
  return (
    <span className={cn('tabular-nums', className)}>
      {formatMoney(value)} <span className="text-[0.8em] font-normal text-subtle">{t('сум')}</span>
    </span>
  )
}

/** Ko'rsatkich kartasi. `tone`: 'primary' | 'danger' | 'success' — asosiy raqam rangi. */
function Kpi({ label, children, hint, tone, className }) {
  return (
    <Card padded={false} className={cn('flex flex-col gap-1 p-4', className)}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          'truncate text-xl font-semibold tracking-tight',
          tone === 'danger' ? 'text-danger-soft-fg' : tone === 'primary' ? 'text-primary' : 'text-fg',
        )}
      >
        {children}
      </p>
      {hint && <p className="truncate text-[11px] text-subtle">{hint}</p>}
    </Card>
  )
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 py-2 text-[13px]">
      {Icon ? <Icon className="mt-0.5 size-3.5 shrink-0 text-subtle" /> : <span className="size-3.5 shrink-0" />}
      <span className="w-28 shrink-0 text-subtle">{label}</span>
      <span className="min-w-0 flex-1 break-words text-fg">{children || '—'}</span>
    </div>
  )
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition',
            value === option.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
          )}
        >
          {option.label}
          {option.count !== undefined && <span className="ml-1 text-subtle">{option.count}</span>}
        </button>
      ))}
    </div>
  )
}

const shortMonth = (month) => {
  const [year, number] = month.split('-').map(Number)
  return new Date(Date.UTC(year, number - 1, 1)).toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' }).replace('.', '')
}

/** Oxirgi 12 oy: har oyda savdo (asosiy rang) va qaytarish (qizil) ustunlari. */
function MonthsChart({ months }) {
  const max = Math.max(1, ...months.flatMap((item) => [item.sales, item.returns]))
  const empty = months.every((item) => item.sales === 0 && item.returns === 0)
  if (empty) return <p className="py-8 text-center text-xs text-subtle">{t('За последний год операций не было')}</p>

  const bar = (value, className) => (
    <div
      className={cn('w-full max-w-3 rounded-t', className)}
      style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? 2 : 0 }}
    />
  )

  return (
    <div>
      <div className="flex h-36 items-end gap-1.5">
        {months.map((item) => (
          <div
            key={item.month}
            className="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5"
            title={`${shortMonth(item.month)} ${item.month.slice(0, 4)}\n${t('Продажи')}: ${formatMoney(item.sales)}\n${t('Возвраты')}: ${formatMoney(item.returns)}`}
          >
            {bar(item.sales, 'bg-primary')}
            {bar(item.returns, 'bg-danger/70')}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {months.map((item) => (
          <span key={item.month} className="min-w-0 flex-1 truncate text-center text-[10px] text-subtle">
            {shortMonth(item.month)}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary" />
          {t('Продажи')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-danger/70" />
          {t('Возвраты')}
        </span>
      </div>
    </div>
  )
}

/** Satrlar va to'lovlar: operatsiya qatori bosilganda ochiladi. */
function OperationDetails({ op }) {
  const kind = OP_TYPES[op.type]
  return (
    <div className="grid gap-5 py-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">{t('Товары')}</p>
        {op.items.length === 0 ? (
          <p className="text-xs text-subtle">—</p>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-4 gap-y-1.5 text-[12px]">
            <span className="text-subtle">{t('Товар')}</span>
            <span className="text-right text-subtle">{t('Кол-во')}</span>
            <span className="text-right text-subtle">{t('Цена')}</span>
            <span className="text-right text-subtle">{t('Сумма')}</span>
            {op.items.map((item, index) => (
              <Fragment key={index}>
                <span className="truncate text-fg">{item.name ?? '—'}</span>
                <span className="text-right tabular-nums text-muted">
                  {item.quantity.toLocaleString(locale)} {item.unit ? td(item.unit) : ''}
                </span>
                <span className="text-right tabular-nums text-muted">{formatMoney(item.price)}</span>
                <span className="text-right font-medium tabular-nums text-fg">{formatMoney(item.amount)}</span>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">{t('Платежи')}</p>
          {op.payments.length === 0 ? (
            <p className="text-xs text-subtle">{t('Платежей нет')}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[12px]">
              {op.payments.map((payment, index) => (
                <li key={index} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-fg">{td(payment.method)}</span>
                  <span className="shrink-0 tabular-nums text-fg">{formatMoney(payment.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <dl className="m-0 flex flex-col gap-1 border-t border-line pt-2 text-[12px]">
          <div className="flex justify-between gap-3">
            <dt className="text-subtle">{t('Сумма')}</dt>
            <dd className="m-0 tabular-nums text-fg">{formatMoney(op.total)}</dd>
          </div>
          {op.discount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Скидка')}</dt>
              <dd className="m-0 tabular-nums text-fg">−{formatMoney(op.discount)}</dd>
            </div>
          )}
          {op.saleId && (
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Из продажи')}</dt>
              <dd className="m-0 tabular-nums text-fg">#{op.saleId}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 font-medium">
            <dt className="text-muted">{kind.label}</dt>
            <dd className="m-0 tabular-nums text-fg">{formatMoney(op.net)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

/** Barcha operatsiyalar: tur bo'yicha filtr, sahifalash, qatorni bosib tafsilotni ochish. */
function Operations({ customerId, summary, version }) {
  const [type, setType] = useState('')
  const [pageState, setPageState] = useState({ page: 1, scope: '' })
  const [open, setOpen] = useState(() => new Set())

  // Tur o'zgarsa — birinchi sahifa (effektsiz: sahifa raqami shu "doira"ga bog'langan).
  const scope = `${customerId}|${type}`
  const page = pageState.scope === scope ? pageState.page : 1
  const setPage = (next) => {
    setOpen(new Set())
    setPageState({ page: next, scope })
  }

  const { data, error, loading } = useRequest(
    () => getCustomerOperations(customerId, { page, limit: OPERATION_LIMIT, type }),
    `ops-${customerId}-${type}-${page}-${version}`,
  )

  const toggle = (key) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const filters = [
    { key: '', label: t('Все'), count: summary.operationsCount },
    { key: 'sale', label: t('Продажи'), count: summary.salesCount },
    { key: 'return', label: t('Возвраты'), count: summary.returnsCount },
    ...(summary.purchasesCount > 0 ? [{ key: 'purchase', label: t('Приходы'), count: summary.purchasesCount }] : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      <Segmented options={filters} value={type} onChange={(key) => setType(key)} label={t('Тип операции')} />
      {error && <Alert variant="danger">{error.message}</Alert>}

      {!data && loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : data?.data.length ? (
        <div className={cn('transition-opacity', loading && 'opacity-60')}>
          <Table wrapperClassName="rounded-lg">
            <thead>
              <tr>
                <th className="w-8" />
                <th>{t('Дата')}</th>
                <th>{t('Операция')}</th>
                <th className="text-right">{t('Сумма')}</th>
                <th className="text-right">{t('Оплачено')}</th>
                <th className="text-right">{t('Долг')}</th>
                <th>{t('Сотрудник')}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((op) => {
                const key = `${op.type}-${op.id}`
                const kind = OP_TYPES[op.type]
                const expanded = open.has(key)
                return (
                  <Fragment key={key}>
                    <tr className="cursor-pointer" onClick={() => toggle(key)} aria-expanded={expanded}>
                      <td className="text-subtle">
                        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </td>
                      <td className="whitespace-nowrap text-muted">{dateTime(op.date)}</td>
                      <td>
                        <Badge bg={kind.tone}>
                          <kind.Icon />
                          {kind.label} #{op.id}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap text-right font-semibold tabular-nums text-fg">
                        {kind.sign}
                        {formatMoney(op.net)}
                      </td>
                      <td className="whitespace-nowrap text-right tabular-nums text-muted">{formatMoney(op.paid)}</td>
                      <td className="whitespace-nowrap text-right tabular-nums">
                        {op.debt > 0 ? (
                          <span className="font-medium text-danger-soft-fg">{formatMoney(op.debt)}</span>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                      <td className="max-w-40 truncate text-muted">{fullName(op.user) || '—'}</td>
                    </tr>
                    {expanded && (
                      <tr className="bg-surface-2/50 hover:bg-surface-2/50">
                        <td />
                        <td colSpan={6}>
                          <OperationDetails op={op} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={ShoppingBag} title={t('Операций нет')} className="border-0" />
      )}

      {data?.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <CustomPaginationScreen active={page} pageCount={data.meta.totalPages} setActive={setPage} />
        </div>
      )}
    </div>
  )
}

function ContractRows({ request }) {
  if (request.error) return <Alert variant="danger">{request.error.message}</Alert>
  if (!request.data && request.loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }
  const rows = request.data?.data ?? []
  if (rows.length === 0) return <EmptyState icon={FileText} title={t('Договоров нет')} className="border-0" />
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-lg border border-line p-0">
      {rows.map((contract) => {
        const status = statusOf(contract.status)
        return (
          <li key={contract.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-[13px]">
            <span className="font-medium text-fg">{contract.number}</span>
            <span className="min-w-0 flex-1 truncate text-muted">{contract.subject}</span>
            <Badge bg={status.tone}>{status.label}</Badge>
            <span className="tabular-nums text-fg">{formatAmount(contract.amount, contract.currency)}</span>
            <span className="text-[11px] text-subtle">{formatContractDate(contract.contractDate)}</span>
          </li>
        )
      })}
    </ul>
  )
}

function TaskRows({ request }) {
  if (request.error) return <Alert variant="danger">{request.error.message}</Alert>
  if (!request.data && request.loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }
  const rows = request.data?.data ?? []
  if (rows.length === 0) return <EmptyState icon={ListChecks} title={t('Задач нет')} className="border-0" />
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-lg border border-line p-0">
      {rows.map((task) => (
        <li key={task.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-[13px]">
          <span className="min-w-0 flex-1 truncate font-medium text-fg">{task.title}</span>
          {task.stage && <Badge bg={task.state === 'done' ? 'success' : task.state === 'review' ? 'warning' : 'neutral'}>{td(task.stage.name)}</Badge>}
          {task.responsible && <span className="text-[12px] text-muted">{fullName(task.responsible)}</span>}
          {task.dueDate && (
            <span className={cn('text-[11px]', task.overdue ? 'font-medium text-danger-soft-fg' : 'text-subtle')}>
              {formatShortDateTime(task.dueDate)}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Kontragent kartochkasi: ma'lumotlari, savdo/qaytarish bo'yicha jamlanma va qarz, to'lov usullari,
 * ko'p olinadigan tovarlar, 12 oylik dinamika, barcha operatsiyalar, shartnomalar va vazifalar.
 *
 *  - `onBack` — ro'yxatga qaytish; `onEdit(customer)` — tahrirlash oynasini ochish;
 *  - `version` — o'zgartirilganda ma'lumot qayta yuklanadi.
 */
function CustomerProfile({ customerId, onBack, onEdit, version = 0 }) {
  const [reload, setReload] = useState(0)
  const [related, setRelated] = useState('operations')
  const key = `${customerId}-${version}-${reload}`

  const profile = useRequest(() => getCustomerProfile(customerId), `profile-${key}`)
  const contracts = useRequest(() => getContracts({ customer_id: customerId, limit: 20 }), `contracts-${key}`)
  const tasks = useRequest(() => getTasks({ customer_id: customerId, limit: 20 }), `tasks-${key}`)

  if (!profile.data) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            <ArrowLeft />
            {t('Назад к списку')}
          </Button>
        </div>
        {profile.error ? (
          <Alert variant="danger">{profile.error.message}</Alert>
        ) : (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    )
  }

  const { customer, summary, paymentMethods, topProducts, months } = profile.data
  const name = `${customer.username} ${customer.surname}`.trim()
  const organization = isOrganization(customer)
  // Tashkilotda nomi sarlavhada va "Организация" qatorida allaqachon bor — rekvizitlarda takrorlanmaydi.
  const requisites = Object.entries(customer.requisites ?? {}).filter(
    ([field, value]) => value && !(organization && field === 'orgName'),
  )
  const idleDays = summary.lastOperationAt ? daysSince(summary.lastOperationAt) : null
  const paidShare = summary.salesNet > 0 ? Math.round((summary.paid / summary.salesNet) * 100) : null
  const methodsTotal = paymentMethods.reduce((sum, item) => sum + item.amount, 0)
  const productsMax = Math.max(1, ...topProducts.map((item) => item.amount))

  const REQUISITE_LABELS = {
    orgName: t('Организация'),
    inn: t('ИНН'),
    bankName: t('Банк'),
    mfo: t('МФО'),
    account: t('Расчётный счёт'),
    address: t('Адрес'),
    director: t('Руководитель'),
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline-secondary" size="sm" onClick={onBack}>
          <ArrowLeft />
          {t('Назад к списку')}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <Button variant="outline-secondary" size="sm" onClick={() => onEdit(customer)}>
              <Pencil />
              {t('Изменить')}
            </Button>
          )}
          <Button variant="outline-secondary" size="sm" onClick={() => setReload((n) => n + 1)} loading={profile.loading}>
            <RefreshCw />
            {t('Обновить')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-base font-semibold text-primary-soft-fg">
          {organization ? (
            <Building2 className="size-5" />
          ) : (
            `${customer.username.charAt(0)}${customer.surname.charAt(0)}`.toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-fg">
            <span className="truncate">{name}</span>
            {organization && (
              <Badge bg="info" className="shrink-0">
                {t('Организация')}
              </Badge>
            )}
          </h3>
          <p className="text-[12px] text-subtle">
            {customer.phone ? `${customer.phone} · ` : ''}ID {customer.id}
          </p>
        </div>
        <Badge bg={summary.debt > 0 ? 'danger' : 'success'} dot>
          {summary.debt > 0 ? t('Долг: {amount} сум', { amount: formatMoney(summary.debt) }) : t('Долгов нет')}
        </Badge>
      </div>

      {/* Jamlanma */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label={t('Чистый оборот')} tone="primary" hint={t('продажи − возвраты')}>
          <Money value={summary.turnover} />
        </Kpi>
        <Kpi label={t('Продажи')} hint={t('{count} шт. · скидки {discount}', { count: summary.salesCount, discount: formatMoney(summary.salesDiscount) })}>
          <Money value={summary.salesNet} />
        </Kpi>
        <Kpi label={t('Возвраты')} hint={t('{count} шт.', { count: summary.returnsCount })}>
          <Money value={summary.returnsNet} />
        </Kpi>
        <Kpi
          label={t('Долг')}
          tone={summary.debt > 0 ? 'danger' : undefined}
          hint={summary.debt > 0 ? t('продаж в долг: {count}', { count: summary.debtSales }) : t('все продажи оплачены')}
        >
          <Money value={summary.debt} />
        </Kpi>
        <Kpi
          label={t('Оплачено')}
          hint={paidShare === null ? undefined : t('{percent}% от продаж', { percent: paidShare })}
        >
          <Money value={summary.paid} />
        </Kpi>
        <Kpi label={t('Средний чек')}>
          <Money value={summary.averageCheck} />
        </Kpi>
        <Kpi
          label={t('Последняя операция')}
          hint={
            idleDays === null ? undefined : idleDays === 0 ? t('сегодня') : t('{count} дн. назад', { count: idleDays })
          }
        >
          <span className="text-base">{summary.lastOperationAt ? dateTime(summary.lastOperationAt) : '—'}</span>
        </Kpi>
        <Kpi
          label={t('Всего операций')}
          hint={summary.firstSaleAt ? t('первая покупка: {date}', { date: dateTime(summary.firstSaleAt) }) : undefined}
        >
          {summary.operationsCount.toLocaleString(locale)}
        </Kpi>
      </div>

      {summary.purchasesCount > 0 && (
        <Alert variant="info">
          {t('Приходы у этого контрагента: {count} шт. на {net} сум, оплачено {paid} сум', {
            count: summary.purchasesCount,
            net: formatMoney(summary.purchasesNet),
            paid: formatMoney(summary.purchasesPaid),
          })}
          {summary.purchasesOwed > 0 && ` · ${t('мы должны ему {owed} сум', { owed: formatMoney(summary.purchasesOwed) })}`}
        </Alert>
      )}

      {/* Kontaktlar va dinamika */}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card padded={false}>
          <Card.Header>
            <Card.Title>{t('Контакты')}</Card.Title>
          </Card.Header>
          <div className="divide-y divide-line px-4">
            <InfoRow icon={organization ? Building2 : UserRound} label={organization ? t('Организация') : t('Имя')}>
              {name}
            </InfoRow>
            <InfoRow icon={Phone} label={t('Телефон')}>
              {customer.phone}
            </InfoRow>
            <InfoRow icon={CalendarClock} label={t('Дата регистрации')}>
              {dateTime(customer.createdAt)}
            </InfoRow>
            {requisites.map(([field, value]) => (
              <InfoRow key={field} label={REQUISITE_LABELS[field] ?? field}>
                {value}
              </InfoRow>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <Card.Header>
            <div>
              <Card.Title>{t('Динамика за 12 месяцев')}</Card.Title>
              <Card.Subtitle className="mt-0.5">{t('Продажи и возвраты по месяцам')}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body>
            <MonthsChart months={months} />
          </Card.Body>
        </Card>
      </div>

      {/* To'lov usullari va tovarlar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padded={false}>
          <Card.Header>
            <div>
              <Card.Title>{t('Способы оплаты')}</Card.Title>
              <Card.Subtitle className="mt-0.5">{t('Деньги, полученные по продажам')}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="flex flex-col gap-3">
            {paymentMethods.length === 0 ? (
              <p className="py-4 text-center text-xs text-subtle">{t('Оплат пока нет')}</p>
            ) : (
              paymentMethods.map((item) => (
                <div key={item.method}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="truncate text-fg">{td(item.method)}</span>
                    <span className="shrink-0 tabular-nums text-fg">
                      {formatMoney(item.amount)}
                      <span className="ml-1.5 text-[11px] text-subtle">
                        {methodsTotal > 0 ? `${Math.round((item.amount / methodsTotal) * 100)}%` : ''}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${methodsTotal ? (item.amount / methodsTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        <Card padded={false}>
          <Card.Header>
            <div>
              <Card.Title>{t('Что покупает чаще всего')}</Card.Title>
              <Card.Subtitle className="mt-0.5">{t('По сумме, за вычетом возвратов')}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="flex flex-col gap-3">
            {topProducts.length === 0 ? (
              <p className="py-4 text-center text-xs text-subtle">{t('Покупок пока нет')}</p>
            ) : (
              topProducts.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="truncate text-fg">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-fg">
                      {formatMoney(item.amount)}
                      <span className="ml-1.5 text-[11px] text-subtle">
                        {item.quantity.toLocaleString(locale)} {item.unit ? td(item.unit) : ''}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${(item.amount / productsMax) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Operatsiyalar, shartnomalar, vazifalar */}
      <Card padded={false}>
        <Tabs activeKey={related} onSelect={setRelated} variant="underline" className="px-4 pt-1">
          <Tab
            eventKey="operations"
            title={
              <>
                <ShoppingBag />
                {t('Операции')} <span className="text-subtle">{summary.operationsCount}</span>
              </>
            }
          >
            <div className="py-4">
              <Operations customerId={customerId} summary={summary} version={`${version}-${reload}`} />
            </div>
          </Tab>
          <Tab
            eventKey="contracts"
            title={
              <>
                <FileText />
                {t('Договоры')} <span className="text-subtle">{contracts.data?.meta?.total ?? ''}</span>
              </>
            }
          >
            <div className="py-4">
              <ContractRows request={contracts} />
            </div>
          </Tab>
          <Tab
            eventKey="tasks"
            title={
              <>
                <ListChecks />
                {t('Задачи')} <span className="text-subtle">{tasks.data?.meta?.total ?? ''}</span>
              </>
            }
          >
            <div className="py-4">
              <TaskRows request={tasks} />
            </div>
          </Tab>
        </Tabs>
      </Card>
    </div>
  )
}

export default CustomerProfile
export { CustomerProfile }
