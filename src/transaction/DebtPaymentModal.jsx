import { useEffect, useState } from 'react'
import { Check, Minus, PiggyBank, Plus, Wallet } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Button, Form, Modal, Spinner } from '../ui'
import { parseQty, roundQty } from '../lib/quantity'
import { addNewPayment, getSaleDetail, paySaleItems } from '../sale/SaleApi'
import { acceptPayment, payFromBalance } from '../customers/CustomerApi'
import { BALANCE_CASH_METHODS, parseAmount } from '../customers/balance'
import { unpaidQty } from './amounts'
import { t, td } from '../i18n'

const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('uz')} So'm`

/** Kichik tanlov (ikki-uch variant). */
function Toggle({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition [&_svg]:size-3.5',
            value === option.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Savdo qarzini to'lash. Ikki usul:
 *  - «Суммой» — umumiy qarzdan istalgan summa;
 *  - «За товары» — aniq tovar va miqdor uchun ("310 metrdan 10 metri"): summa savdodagi narx bo'yicha
 *    (chegirma mutanosib) o'zi hisoblanadi, tovar qatorida qancha to'langani va qancha qolgani ko'rinib turadi.
 * Pul bilan to'lansa — usuli (naqd, karta …) tanlanadi. Mijoz qarzdan ko'p bersa (qarz 500 000, berdi 1 000 000) —
 * qaytim mijoz balansiga yoziladi yoki qo'lga berilgan deb belgilanadi.
 * Kontragent balansida pul bo'lsa — «Оплатить с баланса» bilan balansdan to'lanadi.
 *
 * `saleId` — savdo (tafsilot shu yerda yangidan yuklanadi); `initialSource` — 'balance' bo'lsa balansdan to'lash
 * tanlangan holda ochiladi; `onDone(message)` — to'lov yozildi.
 */
function DebtPaymentModal({ saleId, initialSource = 'money', onHide, onDone }) {
  const [sale, setSale] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [mode, setMode] = useState('amount')
  const [source, setSource] = useState(initialSource)
  const [method, setMethod] = useState(BALANCE_CASH_METHODS[0].value)
  // Mijoz qarzdan ko'p bersa: qaytim balansga ('balance') yoki qo'lga berildi ('cash').
  const [changeTo, setChangeTo] = useState('balance')
  const [amount, setAmount] = useState('')
  const [quantities, setQuantities] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getSaleDetail(saleId)
      .then((data) => {
        if (cancelled) return
        setSale(data)
        const paid = data.payments.reduce((sum, p) => sum + p.amount, 0)
        const left = Math.max(0, data.total - data.discount - paid)
        // Balansdan ochilganda — ko'pi bilan balans.
        const balance = Number(data.customer?.balance) || 0
        setAmount(String(initialSource === 'balance' ? Math.min(left, balance) : left))
      })
      .catch((err) => !cancelled && setLoadError(err.message))
    return () => {
      cancelled = true
    }
  }, [saleId, initialSource])

  if (!sale) {
    return (
      <Modal show onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Оплата долга')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadError ? (
            <Alert variant="danger">{loadError}</Alert>
          ) : (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
        </Modal.Body>
      </Modal>
    )
  }

  const net = sale.total - sale.discount
  const debt = Math.max(0, net - sale.payments.reduce((sum, p) => sum + p.amount, 0))
  const balance = Number(sale.customer?.balance) || 0
  const canUseBalance = balance > 0 && Boolean(sale.customer)
  const fromBalance = canUseBalance && source === 'balance'
  // Qaytim: pul bilan summa rejimida mijoz qarzdan ko'p bersa (faqat kontragent bor savdoda — balansga yozish uchun).
  const typed = parseAmount(amount)
  const change = mode === 'amount' && !fromBalance && Number.isFinite(typed) && typed > debt ? typed - debt : 0
  // Chegirma (va usta xizmati ulushi) qatorlarga mutanosib — backend dagi hisob bilan bir xil.
  const share = sale.total > 0 ? net / sale.total : 0
  const lines = sale.items.filter((item) => unpaidQty(item) > 0)

  const lineQty = (item) => {
    const value = parseQty(quantities[item.id] ?? '')
    return value && value <= unpaidQty(item) ? value : 0
  }
  const invalidLine = lines.find((item) => {
    const raw = quantities[item.id]
    if (raw === undefined || raw === '') return false
    const value = parseQty(raw)
    return !value || value > unpaidQty(item)
  })
  const itemsGross = lines.reduce((sum, item) => sum + lineQty(item) * item.price, 0)
  const itemsAmount = Math.min(Math.round(itemsGross * share), debt)

  const setQty = (item, value) => {
    setQuantities((prev) => ({ ...prev, [item.id]: value }))
    setError('')
  }
  const step = (item, delta) =>
    setQty(item, String(roundQty(Math.min(unpaidQty(item), Math.max(0, (parseQty(quantities[item.id]) ?? 0) + delta)))))

  const switchSource = (key) => {
    setSource(key)
    setError('')
    if (mode === 'amount') setAmount(String(key === 'balance' ? Math.min(debt, balance) : debt))
  }

  const submit = async () => {
    setError('')
    let payAmount
    if (mode === 'amount') {
      payAmount = parseAmount(amount)
      if (!Number.isFinite(payAmount) || payAmount <= 0) return setError(t('Введите сумму больше нуля'))
      // Ortiqcha pul (qaytim) faqat pul bilan va kontragent bor savdoda: u balansga yoziladi yoki qo'lga beriladi.
      if (payAmount > debt && (fromBalance || !sale.customer)) return setError(t('Сумма больше остатка долга'))
    } else {
      if (invalidLine) {
        return setError(t('«{name}»: не оплачено только {quantity}', { name: invalidLine.product?.name ?? '', quantity: unpaidQty(invalidLine) }))
      }
      payAmount = itemsAmount
      if (payAmount <= 0) return setError(t('Укажите, за какие товары и сколько платит клиент'))
    }
    if (fromBalance && payAmount > balance) {
      return setError(t("На балансе только {amount} So'm", { amount: balance.toLocaleString('uz') }))
    }

    setSaving(true)
    try {
      if (mode === 'items') {
        const items = lines.filter((item) => lineQty(item) > 0).map((item) => ({ sale_item_id: item.id, quantity: lineQty(item) }))
        await paySaleItems(sale.id, items, { fromBalance, method })
        const what = lines
          .filter((item) => lineQty(item) > 0)
          .map((item) => `${item.product?.name ?? ''} ${lineQty(item)} ${td(item.product?.unit ?? '')}`.trim())
          .join(', ')
        onDone(t("Оплата за товары принята: {amount} So'm ({items})", { amount: payAmount.toLocaleString('uz'), items: what }))
      } else if (fromBalance) {
        await payFromBalance(sale.customer.id, { saleId: sale.id, amount: payAmount })
        onDone(t("Долг погашен с баланса: {amount} So'm", { amount: payAmount.toLocaleString('uz') }))
      } else if (sale.customer) {
        // Pul bilan: qarz yopiladi, ortgani (qaytim) — balansga yoki qo'lga.
        const result = await acceptPayment(sale.customer.id, {
          amount: payAmount,
          method,
          saleId: sale.id,
          keepChange: changeTo === 'balance',
        })
        const parts = [t("Оплата принята: {amount} So'm", { amount: result.paid.toLocaleString('uz') })]
        if (result.deposited > 0) {
          parts.push(t("сдача {amount} So'm зачислена на баланс (баланс: {balance})", {
            amount: result.deposited.toLocaleString('uz'),
            balance: result.balance.toLocaleString('uz'),
          }))
        }
        if (result.change > 0) parts.push(t("сдача {amount} So'm выдана клиенту", { amount: result.change.toLocaleString('uz') }))
        onDone(parts.join(' · '))
      } else {
        const res = await addNewPayment(sale.id, method, payAmount)
        if (!res) throw new Error(t('Не удалось подключиться к серверу'))
        if (!res.ok) {
          const result = await res.json().catch(() => null)
          throw new Error((Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'))
        }
        onDone(t("Оплата принята: {amount} So'm", { amount: payAmount.toLocaleString('uz') }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Оплата долга')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3">
        {/* Mijoz balansida pul bo'lsa — ko'zga tashlanadigan joyda: qarzni shundan yopish mumkin. */}
        {canUseBalance && (
          <div
            className={cn(
              'flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2',
              fromBalance ? 'border-success/50 bg-success-soft text-success-soft-fg' : 'border-success/30 bg-success-soft/60 text-success-soft-fg',
            )}
          >
            <span className="inline-flex items-center gap-1.5 text-[13px]">
              <PiggyBank className="size-4" />
              {t('На балансе клиента:')} <b className="tabular-nums">{money(balance)}</b>
            </span>
            <Form.Check
              type="switch"
              id="debtFromBalance"
              label={t('Оплатить с баланса')}
              checked={fromBalance}
              onChange={(e) => switchSource(e.target.checked ? 'balance' : 'money')}
            />
          </div>
        )}

        <Toggle
          label={t('Как оплатить долг')}
          value={mode}
          onChange={(key) => {
            setMode(key)
            setError('')
          }}
          options={[
            { key: 'amount', label: t('Суммой') },
            { key: 'items', label: t('За товары') },
          ]}
        />

        {!fromBalance && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">{t('Как оплачено')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {BALANCE_CASH_METHODS.map((option) => {
                const selected = method === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border px-1 py-1.5 text-[11px] leading-tight transition',
                      selected
                        ? 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                        : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    <option.Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{td(option.value)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {mode === 'amount' ? (
          <Form.Group controlId="debtPaymentAmount">
            <Form.Label>{t('Сумма')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              autoFocus
              className="tabular-nums"
              placeholder={t('Введите сумму')}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d\s.,]/g, ''))
                setError('')
              }}
            />
            <Form.Text>
              {t('Сумма спишется с общего долга продажи, без привязки к товарам.')}
              {sale.customer && !fromBalance && ` ${t('Если клиент дал больше — сдачу можно оставить на его балансе.')}`}
            </Form.Text>
          </Form.Group>
        ) : lines.length === 0 ? (
          <p className="m-0 rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-[12.5px] text-subtle">
            {t('Все товары уже оплачены или возвращены. Остаток долга можно погасить суммой.')}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-[11.5px] text-subtle">
              {t('Укажите, за сколько клиент платит сейчас. Сумма считается по цене продажи.')}
            </p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {lines.map((item) => {
                const unpaid = unpaidQty(item)
                const unit = td(item.product?.unit ?? '')
                const qty = lineQty(item)
                const raw = quantities[item.id] ?? ''
                const bad = raw !== '' && !qty
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="m-0 truncate text-[13px] font-medium text-fg">{item.product?.name ?? t('Товар удалён')}</p>
                      <p className="m-0 text-[11px] tabular-nums text-subtle">
                        {t('Не оплачено: {quantity} {unit} × {price}', {
                          quantity: unpaid,
                          unit,
                          price: Number(item.price).toLocaleString('uz'),
                        })}
                        {item.paid > 0 && ` · ${t('оплачено {quantity}', { quantity: item.paid })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn('inline-flex items-center rounded-lg border bg-surface-2', bad ? 'border-danger' : 'border-line')}>
                        <button
                          type="button"
                          onClick={() => step(item, -1)}
                          aria-label={t('Уменьшить')}
                          className="inline-flex size-8 items-center justify-center rounded-l-lg text-muted transition hover:bg-surface-3 hover:text-fg"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <Form.Control
                          inputMode="decimal"
                          aria-label={t('Количество')}
                          placeholder="0"
                          value={raw}
                          onChange={(e) => setQty(item, e.target.value.replace(/[^\d.,]/g, ''))}
                          className="h-8 w-16 rounded-none border-0 bg-transparent text-center tabular-nums focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => step(item, 1)}
                          aria-label={t('Увеличить')}
                          className="inline-flex size-8 items-center justify-center rounded-r-lg text-muted transition hover:bg-surface-3 hover:text-fg"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <Button variant="outline-secondary" size="xs" onClick={() => setQty(item, String(unpaid))}>
                        {t('Все')}
                      </Button>
                      <span className="w-24 text-right text-[12.5px] font-semibold tabular-nums text-fg">
                        {qty > 0 ? Math.round(qty * item.price * share).toLocaleString('uz') : '—'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <dl className="m-0 flex flex-col gap-1 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-subtle">{t('Остаток долга')}</dt>
            <dd className="m-0 tabular-nums text-danger-soft-fg">{money(debt)}</dd>
          </div>
          {mode === 'items' && (
            <div className="flex justify-between gap-3 font-semibold text-fg">
              <dt>{t('К оплате за товары')}</dt>
              <dd className="m-0 tabular-nums">{money(itemsAmount)}</dd>
            </div>
          )}
          {change > 0 && sale.customer && (
            <div className="flex justify-between gap-3 border-t border-line pt-1 font-semibold text-success-soft-fg">
              <dt>{t('Сдача')}</dt>
              <dd className="m-0 tabular-nums">{money(change)}</dd>
            </div>
          )}
          {sale.discount > 0 && mode === 'items' && (
            <p className="m-0 text-[11px] text-subtle">{t('С учётом скидки продажи')}</p>
          )}
        </dl>

        {/* Mijoz qarzdan ko'p berdi: qaytimni balansda qoldirish yoki qo'lga berish. */}
        {change > 0 && sale.customer && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-success/30 bg-success-soft/60 px-3 py-2">
            <p className="m-0 text-[12.5px] text-fg">
              {t('Клиент дал больше долга. Что сделать со сдачей {amount}?', { amount: money(change) })}
            </p>
            <Toggle
              label={t('Сдача')}
              value={changeTo}
              onChange={setChangeTo}
              options={[
                { key: 'balance', label: t('Оставить на балансе'), icon: <PiggyBank /> },
                { key: 'cash', label: t('Выдать сдачу'), icon: <Wallet /> },
              ]}
            />
          </div>
        )}
        {change > 0 && !sale.customer && (
          <p className="m-0 text-[12px] text-danger-soft-fg">
            {t('В продаже нет контрагента — сдачу нельзя оставить на балансе. Введите сумму не больше долга.')}
          </p>
        )}

        {error && <p className="m-0 text-[12px] text-danger-soft-fg">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button variant="warning" loading={saving} onClick={submit}>
          {!saving && <Check />}
          {fromBalance ? t('Оплатить с баланса') : t('Принять оплату')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DebtPaymentModal
