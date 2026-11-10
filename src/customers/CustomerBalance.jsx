import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Check, HandCoins, Plus, ShoppingBag, Undo2, Wallet } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Badge, Button, EmptyState, Form, Modal, Spinner, Table } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { useRequest } from '../lib/useRequest'
import { formatMoney } from '../lib/format'
import { fullName } from '../task/taskView'
import { locale, t, td } from '../i18n'
import { depositBalance, getCustomerBalance, payFromBalance, withdrawBalance } from './CustomerApi'
import { BALANCE_CASH_METHODS, parseAmount } from './balance'

const PAGE_SIZE = 10

/** Balans yozuvi turlari: yorliq, belgi va rang. */
const ENTRY_TYPES = {
  deposit: { label: t('Пополнение'), Icon: ArrowDownToLine, tone: 'success' },
  return: { label: t('Возврат на баланс'), Icon: Undo2, tone: 'warning' },
  sale: { label: t('Оплата с баланса'), Icon: ShoppingBag, tone: 'primary' },
  withdraw: { label: t('Выдано клиенту'), Icon: ArrowUpFromLine, tone: 'danger' },
}

const dateTime = (value) => (value ? new Date(value).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—')

function Money({ value, className }) {
  return (
    <span className={cn('tabular-nums', className)}>
      {formatMoney(value)} <span className="text-[0.8em] font-normal text-subtle">{t('сум')}</span>
    </span>
  )
}

/** To'lov usulini tanlash (kassadagi kabi tugmalar). */
function MethodPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {BALANCE_CASH_METHODS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10.5px] leading-tight transition',
              selected
                ? 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            <option.Icon className="size-4" />
            <span className="line-clamp-1 text-center">{td(option.value)}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Balansni to'ldirish (`deposit`: mijoz pul olib keldi — savdosiz ham) yoki balansdagi pulni mijozga
 * qaytarish (`withdraw`, balansdan ortiq emas). Har biri balans tarixiga xodim va izoh bilan yoziladi.
 */
function MoneyModal({ mode, customerId, balance, onHide, onDone }) {
  const deposit = mode === 'deposit'
  const [amount, setAmount] = useState(deposit ? '' : String(balance))
  const [method, setMethod] = useState(BALANCE_CASH_METHODS[0].value)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) return setError(t('Введите сумму больше нуля'))
    if (!deposit && value > balance) return setError(t('На балансе только {amount} сум', { amount: formatMoney(balance) }))

    setSaving(true)
    setError('')
    try {
      const action = deposit ? depositBalance : withdrawBalance
      await action(customerId, { amount: value, method, note: note.trim() })
      onDone(
        deposit
          ? t('Баланс пополнен на {amount} сум', { amount: formatMoney(value) })
          : t('Клиенту выдано {amount} сум с баланса', { amount: formatMoney(value) }),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{deposit ? t('Пополнить баланс') : t('Выдать деньги с баланса')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          id="balanceMoneyForm"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex flex-col gap-4"
        >
          <p className="m-0 text-[12px] leading-snug text-subtle">
            {deposit
              ? t('Клиент оставляет деньги без покупки. Сумма ляжет на баланс: потом ею можно погасить долг или оплатить покупку.')
              : t('Деньги с баланса возвращаются клиенту на руки.')}
          </p>
          <Form.Group controlId="balanceAmount">
            <Form.Label>{t('Сумма')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              autoFocus
              placeholder={t('Введите сумму')}
              className="tabular-nums"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^\d\s.,]/g, ''))
                setError('')
              }}
            />
            <Form.Text>{t('Сейчас на балансе: {amount} сум', { amount: formatMoney(balance) })}</Form.Text>
          </Form.Group>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">{deposit ? t('Как внесены деньги') : t('Как выданы деньги')}</p>
            <MethodPicker value={method} onChange={setMethod} />
          </div>
          <Form.Group controlId="balanceNote">
            <Form.Label>{t('Комментарий')}</Form.Label>
            <Form.Control
              placeholder={t('Необязательно')}
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Form.Group>
          {error && <p className="m-0 text-[12px] text-danger-soft-fg">{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button type="submit" form="balanceMoneyForm" variant={deposit ? 'success' : 'warning'} loading={saving}>
          {!saving && <Check />}
          {deposit ? t('Пополнить') : t('Выдать')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

/** Qarzni balansdan yopish — eng eski qarzdan boshlab. Summa: standart — balans yoki qarz (qaysi kichik bo'lsa). */
function PayDebtsModal({ customerId, balance, debt, onHide, onDone }) {
  const max = Math.min(balance, debt)
  const [amount, setAmount] = useState(String(max))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) return setError(t('Введите сумму больше нуля'))
    if (value > max) return setError(t('Не больше {amount} сум', { amount: formatMoney(max) }))

    setSaving(true)
    setError('')
    try {
      const result = await payFromBalance(customerId, { amount: value })
      onDone(
        t('С баланса погашено {amount} сум ({count} прод.)', {
          amount: formatMoney(result.paid),
          count: result.sales.length,
        }),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onHide} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Погасить долг с баланса')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          id="balancePayForm"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex flex-col gap-3"
        >
          <dl className="m-0 flex flex-col gap-1 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Баланс')}</dt>
              <dd className="m-0">
                <Money value={balance} className="text-fg" />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-subtle">{t('Долг')}</dt>
              <dd className="m-0">
                <Money value={debt} className="text-danger-soft-fg" />
              </dd>
            </div>
          </dl>
          <Form.Group controlId="balancePayAmount">
            <Form.Label>{t('Сумма')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              autoFocus
              className="tabular-nums"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/[^\d\s.,]/g, ''))
                setError('')
              }}
            />
            <Form.Text>{t('Долги гасятся начиная с самой старой продажи')}</Form.Text>
          </Form.Group>
          {error && <p className="m-0 text-[12px] text-danger-soft-fg">{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button type="submit" form="balancePayForm" variant="primary" loading={saving}>
          {!saving && <HandCoins />}
          {t('Погасить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

/**
 * Mijoz balansi: holati (balans va qarz), amallar (to'ldirish, pulni qaytarish, qarzni balansdan yopish)
 * va harakatlar tarixi. Balansga pul tushganda qarz o'zi yopilmaydi — kassir "Погасить долг" ni bosadi.
 *
 *  - `version` — o'zgarganda qayta yuklanadi; `onChanged` — balans yoki qarz o'zgardi (kartochka yangilanadi);
 *  - `onOpenSale(id)` — tarixdagi savdoni "Продажа" bo'limida ochish.
 */
function CustomerBalance({ customerId, version, onChanged, onOpenSale }) {
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // 'deposit' | 'withdraw' | 'pay'
  const [notice, setNotice] = useState('')

  const request = useRequest(
    () => getCustomerBalance(customerId, { page, limit: PAGE_SIZE }),
    `balance-${customerId}-${page}-${version}`,
  )
  const data = request.data

  if (!data) {
    return request.error ? (
      <Alert variant="danger">{request.error.message}</Alert>
    ) : (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  const done = (message) => {
    setModal(null)
    setNotice(message)
    setPage(1)
    onChanged?.()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-line bg-surface-2/60 px-4 py-3">
        <div>
          <p className="m-0 text-[11px] font-medium uppercase tracking-wider text-subtle">{t('Баланс клиента')}</p>
          <p className={cn('m-0 text-xl font-semibold tracking-tight', data.balance > 0 ? 'text-success-soft-fg' : 'text-fg')}>
            <Money value={data.balance} />
          </p>
        </div>
        {data.debt > 0 && (
          <div>
            <p className="m-0 text-[11px] font-medium uppercase tracking-wider text-subtle">{t('Долг')}</p>
            <p className="m-0 text-xl font-semibold tracking-tight text-danger-soft-fg">
              <Money value={data.debt} />
            </p>
          </div>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="success" size="sm" onClick={() => setModal('deposit')}>
            <Plus />
            {t('Пополнить')}
          </Button>
          {data.balance > 0 && data.debt > 0 && (
            <Button variant="primary" size="sm" onClick={() => setModal('pay')}>
              <HandCoins />
              {t('Погасить долг с баланса')}
            </Button>
          )}
          <Button variant="outline-secondary" size="sm" disabled={data.balance <= 0} onClick={() => setModal('withdraw')}>
            <ArrowUpFromLine />
            {t('Выдать')}
          </Button>
        </div>
      </div>

      {notice && (
        <p className="m-0 flex items-center gap-1.5 text-[12px] font-medium text-success-soft-fg">
          <Check className="size-3.5" />
          {notice}
        </p>
      )}
      {request.error && <Alert variant="danger">{request.error.message}</Alert>}

      {data.data.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t('Движений по балансу нет')}
          description={t('Пополните баланс, если клиент оставил деньги, или оформите возврат «На баланс».')}
          className="border-0"
        />
      ) : (
        <div className={cn('transition-opacity', request.loading && 'opacity-60')}>
          <Table wrapperClassName="rounded-lg">
            <thead>
              <tr>
                <th>{t('Дата')}</th>
                <th>{t('Операция')}</th>
                <th className="text-right">{t('Сумма')}</th>
                <th>{t('Способ')}</th>
                <th>{t('Сотрудник')}</th>
                <th>{t('Комментарий')}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((entry) => {
                const kind = ENTRY_TYPES[entry.type] ?? ENTRY_TYPES.deposit
                return (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap text-muted">{dateTime(entry.date)}</td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge bg={kind.tone}>
                          <kind.Icon />
                          {kind.label}
                        </Badge>
                        {entry.saleId &&
                          (onOpenSale ? (
                            <button
                              type="button"
                              onClick={() => onOpenSale(entry.saleId)}
                              className="text-[12px] text-primary hover:underline"
                            >
                              {t('Продажа')} #{entry.saleId}
                            </button>
                          ) : (
                            <span className="text-[12px] text-muted">
                              {t('Продажа')} #{entry.saleId}
                            </span>
                          ))}
                        {entry.returnId && (
                          <span className="text-[12px] text-muted">
                            {t('Возврат')} #{entry.returnId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={cn(
                        'whitespace-nowrap text-right font-semibold tabular-nums',
                        entry.amount > 0 ? 'text-success-soft-fg' : 'text-fg',
                      )}
                    >
                      {entry.amount > 0 ? '+' : '−'}
                      {formatMoney(Math.abs(entry.amount))}
                    </td>
                    <td className="whitespace-nowrap text-muted">{entry.method ? td(entry.method) : '—'}</td>
                    <td className="max-w-40 truncate text-muted">{fullName(entry.user) || '—'}</td>
                    <td className="max-w-56 truncate text-muted" title={entry.note ?? undefined}>
                      {entry.note || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      {data.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <CustomPaginationScreen active={page} pageCount={data.meta.totalPages} setActive={setPage} />
        </div>
      )}

      {(modal === 'deposit' || modal === 'withdraw') && (
        <MoneyModal
          mode={modal}
          customerId={customerId}
          balance={data.balance}
          onHide={() => setModal(null)}
          onDone={done}
        />
      )}
      {modal === 'pay' && (
        <PayDebtsModal
          customerId={customerId}
          balance={data.balance}
          debt={data.debt}
          onHide={() => setModal(null)}
          onDone={done}
        />
      )}
    </div>
  )
}

export default CustomerBalance
