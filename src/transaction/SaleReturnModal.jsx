import { useState } from 'react'
import { Banknote, CreditCard, Minus, PiggyBank, Plus, Undo2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button, Form, Modal } from '../ui'
import { parseQty, roundQty } from '../lib/quantity'
import { BALANCE_REFUND_METHOD } from '../customers/balance'
import { t, td } from '../i18n'

const CASH_REFUND_METHODS = [
  { value: 'Наличные', Icon: Banknote },
  { value: 'Банковская карта', Icon: CreditCard },
  { value: 'Click', Icon: CreditCard },
  { value: 'Payme', Icon: CreditCard },
  { value: 'Uzum', Icon: CreditCard },
]

/** Pul naqd berilmaydi — mijoz balansida qoladi (keyin qarzni yopish yoki yangi savdo uchun). */
const BALANCE_REFUND = { value: BALANCE_REFUND_METHOD, Icon: PiggyBank, balance: true }

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`

/**
 * Savdo qatoridan qaytarish oynasi. Summa backend dagi `createFromSale` bilan
 * bir xil hisoblanadi: savdodagi narx, chegirma mutanosib, qarz boʻlsa — avval
 * qarzdan ayiriladi, qolgani mijozga tanlangan usulda qaytariladi yoki
 * (savdoda kontragent boʻlsa) uning balansiga yoziladi — bu standart tanlov.
 */
function SaleReturnModal({ sale, item, returnFromSale, onHide, onDone }) {
  const returnable = roundQty(item.quantity - (item.returned ?? 0))
  const customer = sale.customer ?? null
  const refundMethods = customer ? [BALANCE_REFUND, ...CASH_REFUND_METHODS] : CASH_REFUND_METHODS

  const [quantity, setQuantity] = useState(String(Math.min(1, returnable)))
  const [method, setMethod] = useState(refundMethods[0].value)
  const toBalance = method === BALANCE_REFUND_METHOD
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Metr/kg kabi o'nli birliklar uchun miqdor o'nli ham bo'ladi (3 xonagacha).
  const qty = parseQty(quantity) ?? 0
  const validQty = qty > 0 && qty <= returnable

  const saleNet = sale.total - sale.discount
  const paid = sale.payments.reduce((sum, p) => sum + p.amount, 0)
  const debt = Math.max(0, saleNet - paid)
  const proportional =
    validQty && sale.total > 0 ? Math.round((qty * item.price * saleNet) / sale.total) : 0
  const value = Math.max(0, Math.min(proportional, saleNet - (sale.returnedTotal ?? 0)))
  const offset = Math.min(value, debt)
  const refund = value - offset

  const step = (delta) =>
    setQuantity((prev) =>
      String(
        roundQty(
          Math.min(returnable, Math.max(Math.min(1, returnable), (parseQty(prev) ?? 0) + delta)),
        ),
      ),
    )

  const submit = async () => {
    if (!validQty) {
      setError(t('Введите количество до {returnable} (не более 3 знаков после запятой)', { returnable }))
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await returnFromSale(
        sale.id,
        [{ sale_item_id: item.id, quantity: qty }],
        refund > 0 ? method : undefined,
        Number(localStorage.getItem('userid')) || undefined,
      )
      const result = await res.json()
      if (!res.ok) {
        setError(Array.isArray(result.message) ? result.message.join(', ') : result.message)
        return
      }
      onDone(result)
    } catch {
      setError(t('Не удалось подключиться к серверу'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Возврат товара')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-fg">{item.product?.name}</p>
          <p className="mt-0.5 text-[11px] tabular-nums text-subtle">
            {t('Продано: {quantity} шт. × {price} {v}', { quantity: item.quantity, price: Number(item.price).toLocaleString('uz'), v: item.returned > 0 && t(' · уже возвращено: {returned} шт.', { returned: item.returned }) })}
          </p>
        </div>

        <Form.Group controlId="saleReturnQuantity">
          <Form.Label>{t('Количество')}</Form.Label>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-line bg-surface-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('Уменьшить')}
                className="inline-flex size-9 items-center justify-center rounded-l-lg text-muted transition hover:bg-surface-3 hover:text-fg"
              >
                <Minus className="size-3.5" />
              </button>
              <Form.Control
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^\d.,]/g, ''))}
                className="h-9 w-16 rounded-none border-0 bg-transparent text-center tabular-nums focus:ring-0"
              />
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('Увеличить')}
                className="inline-flex size-9 items-center justify-center rounded-r-lg text-muted transition hover:bg-surface-3 hover:text-fg"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(String(returnable))}>
              {t('Все')}
            </Button>
          </div>
          <Form.Text>{t('Можно вернуть: {returnable} шт.', { returnable })}</Form.Text>
        </Form.Group>

        {refund > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">{t('Способ возврата денег')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {refundMethods.map((option) => {
                const selected = method === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10.5px] leading-tight transition',
                      selected
                        ? option.balance
                          ? 'border-success/50 bg-success-soft text-success-soft-fg'
                          : 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                        : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    <option.Icon className="size-4" />
                    <span className="line-clamp-1 text-center">{td(option.value)}</span>
                  </button>
                )
              })}
            </div>
            {toBalance && (
              <p className="mt-1.5 text-[11.5px] leading-snug text-subtle">
                {t('Деньги не выдаются — сумма ляжет на баланс клиента. Ею можно погасить долг или оплатить следующую покупку.')}
                {customer?.balance > 0 &&
                  ` ${t('Сейчас на балансе: {amount} сум', { amount: Number(customer.balance).toLocaleString('uz') })}`}
              </p>
            )}
          </div>
        )}

        <dl className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-[13px]">
          <div className="flex justify-between font-semibold text-fg">
            <dt>{t('Сумма возврата')}</dt>
            <dd className="tabular-nums">{money(value)}</dd>
          </div>
          {sale.discount > 0 && (
            <p className="text-[11px] text-subtle">{t('С учётом скидки продажи')}</p>
          )}
          {offset > 0 && (
            <div className="flex justify-between text-warning-soft-fg">
              <dt>{t('Списать с долга')}</dt>
              <dd className="tabular-nums">{money(offset)}</dd>
            </div>
          )}
          {(offset > 0 || toBalance) && refund > 0 && (
            <div className={cn('flex justify-between', toBalance ? 'text-success-soft-fg' : 'text-fg')}>
              <dt>{toBalance ? t('На баланс клиента') : t('Выдать клиенту')}</dt>
              <dd className="tabular-nums">{money(refund)}</dd>
            </div>
          )}
        </dl>

        {error && <p className="text-[12px] text-danger-soft-fg">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Отмена')}
        </Button>
        <Button variant="warning" loading={saving} disabled={!validQty} onClick={submit}>
          {!saving && <Undo2 />}
          {t('Оформить возврат')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SaleReturnModal
