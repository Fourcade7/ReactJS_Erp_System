import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { formatMoney, formatMonth } from '../lib/format'
import { saveActiveTab } from '../main/menuItems'
import { SALARY_STATUS } from '../salary/salaryView'
import { Badge, Button, Card, ProgressBar } from '../ui'
import { t } from '../i18n'

/** "2026-09".."2026-10" -> "Сентябрь — Октябрь 2026"; bitta oy -> "Октябрь 2026". */
function monthsLabel({ from, to }) {
  if (from === to) return formatMonth(from)
  const start = from.slice(0, 4) === to.slice(0, 4) ? formatMonth(from).replace(/\s*\d{4}$/, '') : formatMonth(from)
  return `${start} — ${formatMonth(to)}`
}

/** "Зарплата" bo'limining vedomostiga o'tish (bo'lim shu rolga ochiq bo'lsa). */
function OpenSheet() {
  return (
    <Button as={Link} to="/home" variant="ghost" size="xs" className="-my-1 -mr-1.5 shrink-0" onClick={() => saveActiveTab('salary')}>
      {t('Ведомость')}
      <ArrowRight />
    </Button>
  )
}

/**
 * Davr oylari bo'yicha maosh: qancha to'lash qolgan, qanchasi berilgan.
 * Vedomostga havola yonidagi kartada — sarlavha bir qatorda qolsin (raqamlar qo'shni karta bilan tekis).
 */
function PayrollCard({ payroll, canOpen }) {
  const percent = payroll.norm ? Math.min(100, Math.round((payroll.paid / payroll.norm) * 100)) : 0
  return (
    <Card padded={false} className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted">
          {t('Зарплата к выплате · {months}', { months: monthsLabel(payroll.months) })}
        </p>
        {canOpen && !payroll.employees && <OpenSheet />}
      </div>

      {payroll.employees ? (
        <>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-fg">
            {formatMoney(payroll.remaining)}
            <span className="ml-2 text-base font-medium text-subtle">{t('сум')}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar size="sm" variant="success" now={payroll.paid} max={payroll.norm || 1} className="flex-1" />
            <span className="shrink-0 text-[11px] tabular-nums text-subtle">
              {t('выплачено {percent}%', { percent })}
              {payroll.overpaid > 0 && ` · ${t('переплата {amount} сум', { amount: formatMoney(payroll.overpaid) })}`}
            </span>
          </div>
          <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-3 text-xs">
            {[
              [t('Начислено'), formatMoney(payroll.norm)],
              [t('Выплачено'), formatMoney(payroll.paid)],
              [t('Из них аванс'), formatMoney(payroll.advance)],
              [t('Сотрудников'), payroll.employees],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-subtle">{label}</dt>
                <dd className="font-semibold tabular-nums text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-1 py-3">
          <p className="text-[13px] font-medium text-fg">{t('Оклады не назначены')}</p>
          <p className="text-xs text-subtle">
            {t('Назначьте оклады в разделе «Зарплата» — здесь появится, сколько нужно выплатить и сколько осталось.')}
          </p>
        </div>
      )}
    </Card>
  )
}

/** Holatlar soni va kimga eng ko'p to'lash qolgan. */
function OwedCard({ payroll, canOpen }) {
  return (
    <Card padded={false} className="flex flex-col p-5 lg:col-span-2 xl:col-span-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted">{t('Кому сколько осталось')}</p>
        {canOpen && <OpenSheet />}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(SALARY_STATUS).map(([key, status]) => (
          <Badge key={key} bg={status.tone} dot>
            {status.label} <span className="tabular-nums">{payroll.counts[key]}</span>
          </Badge>
        ))}
      </div>
      {payroll.owed.length ? (
        <ul className="m-0 mt-3 grid list-none gap-x-6 gap-y-2.5 p-0 lg:grid-cols-2 xl:grid-cols-1">
          {payroll.owed.map((row) => (
            <li key={row.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-fg">{row.name ?? '—'}</span>
                <span className="shrink-0 font-semibold tabular-nums text-fg">{formatMoney(row.remaining)}</span>
              </div>
              <ProgressBar size="sm" variant="warning" now={row.paid} max={row.norm || 1} className="mt-1" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-success-soft-fg">
          <CircleCheck className="size-4" />
          {t('Всем выплачено полностью')}
        </p>
      )}
    </Card>
  )
}

/** Dashboard dagi maosh kartalari: oklad belgilanmagan bo'lsa — bitta izohli karta. */
function PayrollCards({ payroll, canOpen }) {
  return (
    <>
      <PayrollCard payroll={payroll} canOpen={canOpen} />
      {payroll.employees > 0 && <OwedCard payroll={payroll} canOpen={canOpen} />}
    </>
  )
}

export default PayrollCards
