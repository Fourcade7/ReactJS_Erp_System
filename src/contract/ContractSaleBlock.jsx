import { useState } from 'react'
import { Landmark, Save, ShoppingBag, Wrench } from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, Button, Form } from '../ui'
import { t, td } from '../i18n'
import { formatDateTime, fullName } from '../task/taskView'
import { formatAmount, formatNumber } from './contractView'

/**
 * Shartnoma bog'langan savdo: tovarlar, summalar, to'lovlar va qolgan qarz.
 * Buxgalter (shartnomani olgan) yoki admin bank o'tkazmasini shu yerdan kiritadi — qarz kamayadi.
 */
function SaleBlock({ sale, canWork, busy, onPay }) {
  const [amount, setAmount] = useState(String(sale.debt))
  const [note, setNote] = useState('')

  const value = Number(amount)
  const valid = Number.isInteger(value) && value >= 1 && value <= sale.debt

  return (
    <section className="rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg">
          <ShoppingBag className="size-4 text-primary" />
          {t('Продажа №{id}', { id: sale.id })}
        </p>
        <span className="text-[11px] text-subtle">
          {formatDateTime(sale.date)}
          {sale.cashier && ` · ${fullName(sale.cashier)}`}
        </span>
      </header>

      <ul className="m-0 list-none divide-y divide-line p-0">
        {sale.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] text-fg">{item.name}</p>
              <p className="text-[11px] tabular-nums text-subtle">
                {formatNumber(item.quantity)} {item.unit ? td(item.unit) : ''} × {formatNumber(item.price)}
              </p>
            </div>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-fg">{formatNumber(item.sum)}</span>
          </li>
        ))}
        {/* Usta xizmatidan kompaniya ulushi: savdo summasi ichida. */}
        {(sale.services ?? []).map((service) => (
          <li key={`service-${service.id}`} className="flex items-start justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-[13px] text-fg">
                <Wrench className="size-3.5 shrink-0 text-primary" />
                {t('Услуга мастера')}
              </p>
              {service.master && <p className="text-[11px] text-subtle">{fullName(service.master)}</p>}
            </div>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-fg">{formatNumber(service.amount)}</span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-1 border-t border-line bg-surface-2/60 px-3 py-2.5 text-[13px]">
        <div className="flex justify-between text-muted">
          <dt>{sale.services?.length ? t('Сумма') : t('Сумма товаров')}</dt>
          <dd className="tabular-nums">{formatAmount(sale.total)}</dd>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-muted">
            <dt>{t('Скидка')}</dt>
            <dd className="tabular-nums">−{formatAmount(sale.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between font-medium text-fg">
          <dt>{t('К оплате')}</dt>
          <dd className="tabular-nums">{formatAmount(sale.payable)}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>{t('Оплачено')}</dt>
          <dd className="tabular-nums">{formatAmount(sale.paid)}</dd>
        </div>
        <div className="flex items-center justify-between font-semibold">
          <dt className="text-fg">{t('Остаток долга')}</dt>
          <dd className={cn('tabular-nums', sale.debt > 0 ? 'text-danger-soft-fg' : 'text-success-soft-fg')}>
            {sale.debt > 0 ? formatAmount(sale.debt) : <Badge bg="success">{t('Оплачено полностью')}</Badge>}
          </dd>
        </div>
      </dl>

      {sale.payments.some((payment) => payment.amount > 0) && (
        <ul className="m-0 list-none divide-y divide-line border-t border-line p-0">
          {sale.payments
            .filter((payment) => payment.amount > 0)
            .map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]">
                <span className="text-muted">
                  {td(payment.method.trim())} · {formatDateTime(payment.date)}
                </span>
                <span className="font-medium tabular-nums text-fg">{formatNumber(payment.amount)}</span>
              </li>
            ))}
        </ul>
      )}

      {canWork && sale.debt > 0 && (
        <div className="flex flex-wrap items-end gap-2 border-t border-line p-3">
          <Form.Group controlId="contractPayAmount" className="w-40">
            <Form.Label>{t('Сумма перевода')}</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={sale.debt}
              value={amount}
              isInvalid={amount !== '' && !valid}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="contractPayNote" className="min-w-40 flex-1">
            <Form.Label>{t('Комментарий (например, № платёжки)')}</Form.Label>
            <Form.Control value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
          </Form.Group>
          <Button
            disabled={busy || !valid}
            onClick={async () => {
              if (await onPay(value, note.trim())) setNote('')
            }}
          >
            <Landmark />
            {t('Принять оплату')}
          </Button>
        </div>
      )}
    </section>
  )
}

const FIELDS = [
  { key: 'orgName', label: t('Организация'), wide: true },
  { key: 'inn', label: 'ИНН', numeric: true },
  { key: 'mfo', label: 'МФО', numeric: true },
  { key: 'bankName', label: t('Банк'), wide: true },
  { key: 'account', label: t('Расчётный счёт'), numeric: true, wide: true },
  { key: 'address', label: t('Адрес'), wide: true },
  { key: 'director', label: t('Руководитель'), wide: true },
]

const emptyValues = (requisites) =>
  Object.fromEntries(FIELDS.map((field) => [field.key, requisites?.[field.key] ?? '']))

/**
 * Kontragent bank rekvizitlari. Kontragent kartasida saqlanadi: keyingi shartnomalarda qayta kiritilmaydi.
 * Tahrirlash — shartnomani olgan buxgalter yoki admin; qolganlar faqat ko'radi.
 */
function RequisitesBlock({ requisites, organization = false, canWork, busy, onSave }) {
  const title = organization ? t('Организация') : t('Реквизиты контрагента')
  const [values, setValues] = useState(() => emptyValues(requisites))
  const initial = emptyValues(requisites)
  const dirty = FIELDS.some((field) => values[field.key].trim() !== initial[field.key])

  if (!canWork) {
    const filled = FIELDS.filter((field) => initial[field.key])
    return (
      <section>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{title}</p>
        {filled.length === 0 ? (
          <p className="text-[13px] text-subtle">{t('Реквизиты ещё не внесены')}</p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {filled.map((field) => (
              <div key={field.key} className={cn('min-w-0', field.wide && 'col-span-2')}>
                <dt className="text-[11px] text-subtle">{field.label}</dt>
                <dd className="text-[13px] text-fg">{initial[field.key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((field) => (
          <Form.Group key={field.key} controlId={`req-${field.key}`} className={field.wide ? 'col-span-2' : undefined}>
            <Form.Label>{field.label}</Form.Label>
            <Form.Control
              value={values[field.key]}
              inputMode={field.numeric ? 'numeric' : undefined}
              onChange={(e) => setValues((current) => ({ ...current, [field.key]: e.target.value }))}
            />
          </Form.Group>
        ))}
      </div>
      <p className="text-[11px] text-subtle">{t('Сохраняются в карточке контрагента — при следующих договорах вводить заново не нужно.')}</p>
      <div>
        <Button
          size="sm"
          disabled={busy || !dirty}
          onClick={() => onSave(Object.fromEntries(FIELDS.map((field) => [field.key, values[field.key].trim()])))}
        >
          <Save />
          {t('Сохранить реквизиты')}
        </Button>
      </div>
    </section>
  )
}

export { SaleBlock, RequisitesBlock }
