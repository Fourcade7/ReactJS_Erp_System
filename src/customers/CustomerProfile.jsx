import { Fragment, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  ListChecks,
  Pencil,
  Phone,
  RefreshCw,
  ShoppingBag,
  Undo2,
  UserRound,
  Wallet,
  Wrench,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Badge, Button, Card, EmptyState, Form, Spinner, Table, Tab, Tabs } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { useRequest } from '../lib/useRequest'
import { formatMoney } from '../lib/format'
import { roundQty } from '../lib/quantity'
import { getContracts } from '../contract/ContractApi'
import { formatAmount, formatContractDate, statusOf } from '../contract/contractView'
import { getTasks } from '../task/TaskApi'
import { formatShortDateTime, fullName } from '../task/taskView'
import CopyImageModal from '../transaction/CopyImageModal'
import { ClipboardUnavailableError, copyDebtsImage, copyOperationImage } from '../transaction/cartImage'
import { addNewPayment } from '../sale/SaleApi'
import { locale, t, td } from '../i18n'
import { getCustomerOperations, getCustomerProfile } from './CustomerApi'
import { isOrganization } from './customerForm'

// Operatsiyalar sahifasi: standart 10 ta; o'z qiymati 1…MAX_PAGE_SIZE (backend ham shu chegarani tekshiradi).
const PAGE_SIZES = [10, 50, 100]
const MAX_PAGE_SIZE = 500
const DAY = 86_400_000
// Qarzni to'lash savdo tafsilotidagi kabi yoziladi: shu usuldagi to'lov savdo qarzini kamaytiradi.
const DEBT_PAYMENT_METHOD = 'В долг'

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
          {option.count !== undefined && (
            <span
              className={cn(
                'ml-1',
                option.tone === 'danger' && option.count > 0 ? 'font-semibold text-danger-soft-fg' : 'text-subtle',
              )}
            >
              {option.count}
            </span>
          )}
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

/**
 * Savdodagi usta xizmatlari (qatorda, ochmasdan ko'rinadi): usta va xizmat summasi. To'liq xizmat = ustaga + kompaniyaga;
 * sichqoncha bilan ustiga borilsa — qanday bo'lingani.
 */
function MasterFeeChips({ fees }) {
  if (!fees?.length) return null
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {fees.map((fee, index) => (
        <span
          key={index}
          title={t('Услуга мастера: {master} · доля компании: {company}', {
            master: formatMoney(fee.amount),
            company: formatMoney(fee.companyAmount),
          })}
          className="inline-flex max-w-full items-center gap-1 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted"
        >
          <Wrench className="size-3 shrink-0 text-primary" />
          <span className="truncate">{fullName(fee.master) || '—'}</span>
          <span className="shrink-0 tabular-nums text-fg">{formatMoney(fee.amount + fee.companyAmount)}</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Savdo qarzini shu yerning o'zida to'lash: tugma bosilsa summa maydoni ochiladi (qolgan qarz bilan to'ldirilgan).
 * To'lov savdo tafsilotidagi "Оплата долга" bilan bir xil yoziladi; `onPaid(amount)` — muvaffaqiyatli bo'lsa.
 */
function DebtPayment({ op, onPaid }) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!editing) {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setAmount(String(op.debt))
          setError('')
          setEditing(true)
        }}
      >
        <Wallet />
        {t('Оплата долга')}
      </Button>
    )
  }

  const submit = async () => {
    const value = Math.round(Number(amount.replace(/\s/g, '').replace(',', '.')))
    if (!Number.isFinite(value) || value <= 0) return setError(t('Введите сумму больше нуля'))
    if (value > op.debt) return setError(t('Сумма больше остатка долга'))

    setSaving(true)
    setError('')
    try {
      const res = await addNewPayment(op.id, DEBT_PAYMENT_METHOD, value)
      if (!res) return setError(t('Не удалось подключиться к серверу'))
      if (!res.ok) {
        const result = await res.json().catch(() => null)
        return setError((Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'))
      }
      setEditing(false)
      onPaid?.(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex w-auto flex-wrap items-center gap-2">
      <Form.Control
        size="sm"
        inputMode="decimal"
        autoFocus
        aria-label={t('Сумма')}
        title={t('Остаток долга: {amount} сум', { amount: formatMoney(op.debt) })}
        className="w-32 tabular-nums"
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value.replace(/[^\d\s.,]/g, ''))
          setError('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setEditing(false)
        }}
      />
      <Button type="submit" variant="danger" size="sm" loading={saving}>
        {!saving && <Check />}
        {t('Оплатить')}
      </Button>
      <Button variant="outline-secondary" size="sm" onClick={() => setEditing(false)} disabled={saving}>
        {t('Отмена')}
      </Button>
      {error && <p className="m-0 w-full text-[12px] text-danger-soft-fg">{error}</p>}
    </Form>
  )
}

/**
 * Satrlar va to'lovlar: operatsiya qatori bosilganda ochiladi. Tovarlar ro'yxatini (va qarzni) savatdagi kabi
 * rasm qilib nusxalash mumkin — mijozga messenjer orqali yuborish uchun; `customerDebt` — mijozning umumiy qarzi.
 * Savdoda qarz qolgan bo'lsa — shu yerning o'zida to'lanadi (`onPaid`), `onOpenSale(id)` — "Продажа" bo'limida ochish.
 */
function OperationDetails({ op, customerDebt, onPaid, onOpenSale }) {
  const kind = OP_TYPES[op.type]
  const fees = op.masterFees ?? []
  // Kompaniya ulushi savdo summasida — tovarlar ro'yxatida alohida qator, summa mos kelishi uchun.
  const services = fees.filter((fee) => fee.companyAmount > 0)
  const hasLines = op.items.length > 0 || services.length > 0

  // 'idle' | 'done' | 'error' — natija tugma yonida 2 soniya ko'rinadi.
  const [copyState, setCopyState] = useState('idle')
  // Sayt xavfsiz emas (http): brauzer rasmni clipboard ga yozishga ruxsat bermaydi — tayyor rasm oynada ko'rsatiladi.
  const [fallbackImage, setFallbackImage] = useState('')

  useEffect(() => {
    if (copyState === 'idle') return undefined
    const timer = setTimeout(() => setCopyState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [copyState])

  const copyAsImage = async () => {
    try {
      await copyOperationImage(op, kind.label, customerDebt)
      setCopyState('done')
    } catch (error) {
      console.log(error.message)
      if (error instanceof ClipboardUnavailableError) {
        setFallbackImage(error.image)
        return
      }
      setCopyState('error')
    }
  }

  const count = roundQty(op.items.reduce((sum, item) => sum + item.quantity, 0))
  // "В долг" 0 — savdo qarzga qilinganini bildiruvchi belgi, pul emas: to'lovlar qatorida ko'rsatilmaydi.
  const payments = op.payments.filter((payment) => payment.amount !== 0)
  const canPay = op.type === 'sale' && op.debt > 0
  const canOpen = op.type === 'sale' && Boolean(onOpenSale)
  // To'lovdan keyin: ro'yxat qayta yuklanadi (qator ochiq qoladi), natija shu yerda ko'rinadi.
  const [paidNotice, setPaidNotice] = useState('')

  return (
    // Savatdagi kabi: bitta ixcham ro'yxat (har tovar — bitta qator), ostida chek kabi jamlanma.
    <div className="flex max-w-2xl flex-col gap-2 py-1">
      <div className="flex h-6 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="m-0 text-[13px] font-semibold text-fg">{t('Товары')}</h4>
          {count > 0 && (
            <span className="rounded-full bg-primary-soft px-2 text-[11px] font-medium tabular-nums text-primary-soft-fg">
              {t('{length} тов. · {count} шт.', { length: op.items.length, count })}
            </span>
          )}
        </div>
        {hasLines && (
          <button
            type="button"
            onClick={copyAsImage}
            title={t('Скопировать список как изображение, чтобы отправить клиенту')}
            className={cn(
              'inline-flex items-center gap-1 text-[11px] transition',
              copyState === 'done' && 'text-success-soft-fg',
              copyState === 'error' && 'text-danger-soft-fg',
              copyState === 'idle' && 'text-subtle hover:text-fg',
            )}
          >
            {copyState === 'done' ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copyState === 'done' ? t('Скопировано') : copyState === 'error' ? t('Ошибка') : t('Копировать')}
          </button>
        )}
      </div>

      {hasLines ? (
        <ul className="@container m-0 flex list-none flex-col gap-1 p-0">
          {op.items.map((item, index) => {
            const name = item.name ?? t('Товар удалён')
            return (
              <li
                key={index}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-soft @lg:flex-nowrap"
              >
                <p title={name} className="m-0 min-w-0 basis-full truncate text-[13px] font-medium text-fg @lg:basis-0 @lg:flex-1">
                  <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-surface-2 px-1 align-middle text-[10px] font-semibold tabular-nums text-subtle">
                    {index + 1}
                  </span>
                  {name}
                </p>
                <span className="inline-flex h-6 shrink-0 items-center rounded-md border border-line bg-surface-2 px-2 text-[12px] font-semibold tabular-nums text-fg">
                  {item.quantity.toLocaleString(locale)}
                  {item.unit && <span className="ml-1 font-normal text-subtle">{td(item.unit)}</span>}
                </span>
                <span className="shrink-0 text-right text-[12px] tabular-nums text-muted @lg:min-w-[4.5rem]">
                  × {formatMoney(item.price)}
                </span>
                <span className="ml-auto shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg @lg:ml-0 @lg:min-w-[5.5rem]">
                  {formatMoney(item.amount)}
                </span>
              </li>
            )
          })}
          {/* Usta xizmatidan kompaniya ulushi savdo summasida — ro'yxatda alohida qator, summa mos kelishi uchun. */}
          {services.map((fee, index) => (
            <li
              key={`service-${index}`}
              className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface-2/50 px-2.5 py-1.5"
            >
              <Wrench className="size-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
                {t('Услуга мастера (доля компании)')}
                {fee.master && <span className="ml-1.5 font-normal text-subtle">{fullName(fee.master)}</span>}
              </span>
              <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg @lg:min-w-[5.5rem]">
                {formatMoney(fee.companyAmount)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-xs text-subtle">—</p>
      )}

      {/* Ustaning ulushi savdo summasiga kirmaydi — ustaga alohida beriladi. */}
      {fees.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0 px-2.5 text-[12px] text-muted">
          {fees.map((fee, index) => (
            <li key={index} title={t('Мастеру — отдельно, не входит в сумму продажи')} className="flex items-center gap-2">
              <Wrench className="size-3 shrink-0 text-subtle" />
              <span className="min-w-0 flex-1 truncate">{fullName(fee.master) || '—'}</span>
              <span className="shrink-0">{t('услуга мастера')}</span>
              <span className="shrink-0 font-medium tabular-nums text-fg">{formatMoney(fee.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="m-0 flex flex-col gap-1 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px]">
        {op.discount > 0 && (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Сумма')}</dt>
              <dd className="m-0 tabular-nums text-fg">{formatMoney(op.total)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Скидка')}</dt>
              <dd className="m-0 tabular-nums text-fg">−{formatMoney(op.discount)}</dd>
            </div>
          </>
        )}
        {op.saleId && (
          <div className="flex justify-between gap-3">
            <dt className="text-subtle">{t('Из продажи')}</dt>
            <dd className="m-0 tabular-nums text-fg">#{op.saleId}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 font-semibold text-fg">
          <dt>{t('Итого')}</dt>
          <dd className="m-0">
            <Money value={op.net} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="min-w-0 text-subtle">
            {op.type === 'sale' ? t('Оплачено') : t('Платежи')}
            {payments.length > 0 && (
              <span className="ml-1.5 text-[11px]">
                ({payments.map((payment) => `${td(payment.method)} ${formatMoney(payment.amount)}`).join(' · ')})
              </span>
            )}
          </dt>
          <dd className="m-0 shrink-0 tabular-nums text-fg">{formatMoney(op.paid)}</dd>
        </div>
        {op.debt > 0 && (
          <div className="flex justify-between gap-3 border-t border-line pt-1 font-semibold text-danger-soft-fg">
            <dt>{t('Остаток долга')}</dt>
            <dd className="m-0">
              <Money value={op.debt} />
            </dd>
          </div>
        )}
      </dl>

      {paidNotice && (
        <p className="m-0 flex items-center gap-1.5 text-[12px] font-medium text-success-soft-fg">
          <Check className="size-3.5" />
          {paidNotice}
        </p>
      )}

      {(canPay || canOpen) && (
        <div className="flex flex-wrap items-start gap-2">
          {canPay && (
            <DebtPayment
              op={op}
              onPaid={(amount) => {
                setPaidNotice(t('Оплата принята: {amount} сум', { amount: formatMoney(amount) }))
                onPaid?.()
              }}
            />
          )}
          {canOpen && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onOpenSale(op.id)}
              title={t('Открыть продажу в разделе «Продажа»')}
            >
              <ArrowUpRight />
              {t('Открыть в «Продажа»')}
            </Button>
          )}
        </div>
      )}

      <CopyImageModal image={fallbackImage} onHide={() => setFallbackImage('')} />
    </div>
  )
}

/** Sahifadagi qatorlar soni: 10 / 50 / 100 yoki o'z qiymati (1…MAX_PAGE_SIZE, Enter yoki maydondan chiqqanda). */
function PageSize({ value, onChange }) {
  const [custom, setCustom] = useState(() => !PAGE_SIZES.includes(value))
  const [draft, setDraft] = useState(String(value))

  const apply = () => {
    const next = Math.round(Number(draft))
    if (!Number.isFinite(next) || next < 1) {
      setDraft(String(value))
      return
    }
    const clamped = Math.min(next, MAX_PAGE_SIZE)
    setDraft(String(clamped))
    if (clamped !== value) onChange(clamped)
  }

  const options = [
    ...PAGE_SIZES.map((size) => ({ key: String(size), label: size })),
    { key: 'custom', label: t('Своё') },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-subtle">{t('Показывать по')}</span>
      <Segmented
        label={t('Показывать по')}
        options={options}
        value={custom ? 'custom' : String(value)}
        onChange={(key) => {
          if (key === 'custom') {
            setCustom(true)
            setDraft(String(value))
            return
          }
          setCustom(false)
          setDraft(key)
          onChange(Number(key))
        }}
      />
      {custom && (
        <Form.Control
          type="number"
          size="sm"
          min={1}
          max={MAX_PAGE_SIZE}
          autoFocus
          aria-label={t('Своё количество строк')}
          title={t('От 1 до {max}', { max: MAX_PAGE_SIZE })}
          className="w-20 tabular-nums"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={apply}
          onKeyDown={(e) => {
            if (e.key === 'Enter') apply()
          }}
        />
      )}
    </div>
  )
}

function TotalItem({ label, count, children }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-subtle">
        {label}
        {count !== undefined && <span className="ml-1 text-[11px]">({count})</span>}
      </span>
      {children}
    </span>
  )
}

/**
 * Ro'yxat ostidagi jamlanma — filtrdagi barcha operatsiyalar bo'yicha (hamma sahifalar, faqat ko'rinayotgan emas):
 * savdolar summasi va to'langani, qaytarish va kirimlar; qarz bo'lsa — o'ngda qizil, bo'lmasa "Долгов нет".
 */
function ListTotals({ totals }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5 text-[13px]">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{t('Итого по списку')}</span>
      {totals.salesCount > 0 && (
        <>
          <TotalItem label={t('Продажи')} count={totals.salesCount}>
            <Money value={totals.sales} className="font-semibold text-fg" />
          </TotalItem>
          <TotalItem label={t('Оплачено')}>
            <Money value={totals.salesPaid} className="text-fg" />
          </TotalItem>
        </>
      )}
      {totals.returnsCount > 0 && (
        <TotalItem label={t('Возвраты')} count={totals.returnsCount}>
          <Money value={totals.returns} className="text-fg" />
        </TotalItem>
      )}
      {totals.purchasesCount > 0 && (
        <TotalItem label={t('Приходы')} count={totals.purchasesCount}>
          <Money value={totals.purchases} className="text-fg" />
        </TotalItem>
      )}
      {totals.salesCount > 0 &&
        (totals.debt > 0 ? (
          <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-danger-soft-fg">
            <Wallet className="size-4" />
            {t('Долг')}
            <span className="text-[11px] font-normal">({totals.debtCount})</span>
            <Money value={totals.debt} className="text-base" />
          </span>
        ) : (
          <Badge bg="success" dot className="ml-auto">
            {t('Долгов нет')}
          </Badge>
        ))}
    </div>
  )
}

/** Mijozning barcha qarzli savdolari (sahifalab, hammasi). */
async function loadDebtSales(customerId) {
  const sales = []
  for (let page = 1; ; page += 1) {
    const result = await getCustomerOperations(customerId, { page, limit: MAX_PAGE_SIZE, debt: true })
    sales.push(...result.data)
    if (page >= result.meta.totalPages) return sales
  }
}

/**
 * Barcha qarzli savdolarni bitta rasm qilib nusxalash (har savdo alohida bo'lim, oxirida umumiy qarz) —
 * mijozga bitta xabar bilan yuborish uchun. Faqat ko'rinayotgan sahifa emas, hamma qarzlar olinadi.
 */
function CopyDebtsButton({ customerId, customerName, count }) {
  // 'idle' | 'busy' | 'done' | 'error' — natija tugmada 2 soniya ko'rinadi.
  const [state, setState] = useState('idle')
  const [fallbackImage, setFallbackImage] = useState('')

  useEffect(() => {
    if (state !== 'done' && state !== 'error') return undefined
    const timer = setTimeout(() => setState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [state])

  const copy = async () => {
    setState('busy')
    try {
      await copyDebtsImage(() => loadDebtSales(customerId), customerName)
      setState('done')
    } catch (error) {
      console.log(error.message)
      if (error instanceof ClipboardUnavailableError) {
        setFallbackImage(error.image)
        setState('idle')
        return
      }
      setState('error')
    }
  }

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={copy}
        loading={state === 'busy'}
        title={t('Скопировать все неоплаченные продажи клиента одной картинкой — чтобы отправить клиенту')}
        className={cn(
          state === 'done' && 'border-success/40 text-success-soft-fg',
          state === 'error' && 'border-danger/40 text-danger-soft-fg',
        )}
      >
        {state !== 'busy' && (state === 'done' ? <Check /> : <Copy />)}
        {state === 'done' ? t('Скопировано') : state === 'error' ? t('Ошибка') : t('Все долги одной картинкой')}
        {state === 'idle' && <span className="font-semibold text-danger-soft-fg">{count}</span>}
      </Button>
      <CopyImageModal image={fallbackImage} onHide={() => setFallbackImage('')} />
    </>
  )
}

const TYPE_FILTERS = ['sale', 'return', 'purchase']

/**
 * Barcha operatsiyalar: filtr (tur yoki faqat qarzlar), sahifalash (10 / 50 / 100 / o'z qiymati), qatorni bosib
 * tafsilotni ochish. `onChanged` — qarz to'langanda (kartochka qayta yuklanadi); `onOpenSale(id)` — "Продажа" bo'limida ochish.
 */
function Operations({ customerId, customerName, summary, version, onChanged, onOpenSale }) {
  // '' — hammasi, sale | return | purchase — tur bo'yicha, debt — faqat qarzi qolgan savdolar.
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZES[0])
  const [pageState, setPageState] = useState({ page: 1, scope: '' })
  const [open, setOpen] = useState(() => new Set())

  // Filtr yoki sahifa hajmi o'zgarsa — birinchi sahifa (effektsiz: sahifa raqami shu "doira"ga bog'langan).
  const scope = `${customerId}|${filter}|${limit}`
  const page = pageState.scope === scope ? pageState.page : 1
  const setPage = (next) => {
    setOpen(new Set())
    setPageState({ page: next, scope })
  }

  const query = { page, limit, type: TYPE_FILTERS.includes(filter) ? filter : '', debt: filter === 'debt' }
  const { data, error, loading } = useRequest(
    () => getCustomerOperations(customerId, query),
    `ops-${customerId}-${filter}-${page}-${limit}-${version}`,
  )
  const shownFrom = data ? (data.meta.page - 1) * data.meta.limit + 1 : 0
  const shownTo = data ? shownFrom + data.data.length - 1 : 0

  const toggle = (key) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const filters = [
    { key: '', label: t('Все'), count: summary.operationsCount },
    // Qarzlar — boshqa operatsiyalar ko'payib ketsa ham, qarzi qolgan savdolarni bir bosishda ajratib olish uchun.
    { key: 'debt', label: t('Долги'), count: summary.debtSales, tone: 'danger' },
    { key: 'sale', label: t('Продажи'), count: summary.salesCount },
    { key: 'return', label: t('Возвраты'), count: summary.returnsCount },
    ...(summary.purchasesCount > 0 ? [{ key: 'purchase', label: t('Приходы'), count: summary.purchasesCount }] : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented options={filters} value={filter} onChange={setFilter} label={t('Тип операции')} />
        {summary.debtSales > 0 && (
          <CopyDebtsButton customerId={customerId} customerName={customerName} count={summary.debtSales} />
        )}
      </div>
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
                        {op.type === 'sale' && onOpenSale ? (
                          // Qator bosilsa ochiladi/yopiladi; yorliq bosilsa — "Продажа" bo'limida shu savdo ochiladi.
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onOpenSale(op.id)
                            }}
                            title={t('Открыть продажу в разделе «Продажа»')}
                            className="group/sale rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          >
                            <Badge bg={kind.tone} className="transition group-hover/sale:border-primary/60 group-hover/sale:underline">
                              <kind.Icon />
                              {kind.label} #{op.id}
                              <ArrowUpRight className="opacity-60 group-hover/sale:opacity-100" />
                            </Badge>
                          </button>
                        ) : (
                          <Badge bg={kind.tone}>
                            <kind.Icon />
                            {kind.label} #{op.id}
                          </Badge>
                        )}
                        <MasterFeeChips fees={op.masterFees} />
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
                          <OperationDetails
                            op={op}
                            customerDebt={summary.debt}
                            onPaid={onChanged}
                            onOpenSale={onOpenSale}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </Table>
        </div>
      ) : filter === 'debt' ? (
        <EmptyState icon={Wallet} title={t('Долгов нет — все продажи оплачены')} className="border-0" />
      ) : (
        <EmptyState icon={ShoppingBag} title={t('Операций нет')} className="border-0" />
      )}

      {data?.totals && data.meta.total > 0 && <ListTotals totals={data.totals} />}

      {data?.meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] tabular-nums text-subtle">
            {t('Показано {from}–{to} из {total}', { from: shownFrom, to: shownTo, total: data.meta.total })}
          </span>
          <CustomPaginationScreen active={page} pageCount={data.meta.totalPages} setActive={setPage} />
          <PageSize value={limit} onChange={setLimit} />
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
 * Kontragent kartochkasi: eng tepada — barcha operatsiyalar, shartnomalar va vazifalar; so'ng savdo/qaytarish
 * bo'yicha jamlanma va qarz, ma'lumotlari, 12 oylik dinamika, to'lov usullari va ko'p olinadigan tovarlar.
 *
 *  - `onBack` — ro'yxatga qaytish; `onEdit(customer)` — tahrirlash oynasini ochish;
 *  - `onOpenSale(saleId)` — savdoni "Продажа" bo'limida ochish (bo'lim ochiq bo'lmasa berilmaydi);
 *  - `version` — o'zgartirilganda ma'lumot qayta yuklanadi.
 */
function CustomerProfile({ customerId, onBack, onEdit, onOpenSale, version = 0 }) {
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

      {/* Operatsiyalar, shartnomalar, vazifalar — eng kerakli qism, shuning uchun kartochkaning eng tepasida. */}
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
              <Operations
                customerId={customerId}
                customerName={name}
                summary={summary}
                version={`${version}-${reload}`}
                onChanged={() => setReload((n) => n + 1)}
                onOpenSale={onOpenSale}
              />
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
    </div>
  )
}

export default CustomerProfile
export { CustomerProfile }
