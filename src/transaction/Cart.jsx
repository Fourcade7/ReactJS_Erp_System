import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Minus, Pencil, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { EmptyState } from '../ui'
import { copyCartImage } from './cartImage'
import { priceChange, stockOf, unitPrice } from './pricing'
import { parseQty, roundQty } from '../lib/quantity'

const signed = (value) => `${value < 0 ? '−' : '+'}${Math.abs(value).toLocaleString('uz')}`

/**
 * Savat qatoridagi miqdor — bosib yoziladi (metr, kg uchun o'nli ham: 12,5).
 * Enter yoki tashqariga bosish — saqlash, Esc — bekor qilish.
 */
function QuantityInput({ value, overStock, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [invalid, setInvalid] = useState(false)
  const cancelled = useRef(false)

  if (!editing) {
    return (
      <button
        type="button"
        title="Изменить количество (можно дробное, например 12,5)"
        onClick={() => {
          setDraft(String(value))
          setInvalid(false)
          setEditing(true)
        }}
        className={cn(
          'min-w-6 px-1 text-center text-[12px] font-semibold tabular-nums transition hover:bg-surface-3',
          overStock ? 'text-danger-soft-fg' : 'text-fg',
        )}
      >
        {value}
      </button>
    )
  }

  const save = () => {
    const next = parseQty(draft)
    if (next === null) return setInvalid(true)
    if (next !== value) onSave(next)
    setEditing(false)
  }

  return (
    <input
      autoFocus
      inputMode="decimal"
      title="Enter — сохранить, Esc — отмена. До 3 знаков после запятой"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value.replace(/[^\d.,]/g, ''))
        setInvalid(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save()
        if (e.key === 'Escape') {
          cancelled.current = true
          setEditing(false)
        }
      }}
      onBlur={() => {
        if (cancelled.current) {
          cancelled.current = false
          return
        }
        // Noto'g'ri qiymat bilan chiqilsa — eski miqdor qoladi.
        if (parseQty(draft) === null) return setEditing(false)
        save()
      }}
      className={cn(
        'h-6 w-16 bg-surface px-1 text-center text-[12px] tabular-nums text-fg outline-none',
        'border-y border-primary focus:ring-2 focus:ring-[var(--ring)]',
        invalid && 'border-danger',
      )}
    />
  )
}

/**
 * Savat qatoridagi birlik narx — bosib oʻzgartiriladi. Enter yoki tashqariga
 * bosish — saqlash, Esc — bekor qilish. Opt narxdan past narx qabul qilinmaydi.
 */
function PriceInput({ product, price, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const cancelled = useRef(false)

  const min = Number(product.bulkPrice || 0)

  const save = () => {
    const value = Math.round(Number(draft.replace(/[\s,]/g, '')))
    if (value === price) return setEditing(false)
    if (!Number.isFinite(value) || value <= 0) return setError('Введите цену')
    if (value < min) return setError(`Не ниже оптовой: ${min.toLocaleString('uz')}`)
    onSave(value)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        type="button"
        title="Изменить цену в этой продаже"
        onClick={() => {
          setDraft(String(price))
          setError('')
          setEditing(true)
        }}
        className="inline-flex items-center gap-1 rounded text-[12px] tabular-nums text-muted underline decoration-dashed underline-offset-2 transition hover:text-fg"
      >
        <Pencil className="size-2.5" />
        {Number(price || 0).toLocaleString('uz')}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <input
        autoFocus
        inputMode="numeric"
        title="Enter — сохранить, Esc — отмена"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value.replace(/[^\d\s]/g, ''))
          setError('')
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') {
            cancelled.current = true
            setEditing(false)
          }
        }}
        onBlur={() => {
          if (cancelled.current) {
            cancelled.current = false
            return
          }
          save()
        }}
        className="h-6 w-24 rounded-md border border-primary bg-surface px-1.5 text-right text-[12px] tabular-nums text-fg outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      {error && <span className="text-[10px] text-danger-soft-fg">{error}</span>}
    </div>
  )
}

/**
 * Savat. Har bir qatorda miqdorni oʻzgartirish, ulgurji narxga oʻtish
 * va oʻchirish mumkin. `limitByStock` da qoldiqdan ortiq miqdor bloklanmaydi,
 * faqat belgilanadi — savdo tugmasi esa Checkout da bloklanadi.
 * `editablePrice` da (savdo) narxni shu savdo uchun oʻzgartirish mumkin.
 */
function Cart({
  orderList,
  setOrderList,
  priceField = 'buyPrice',
  limitByStock = false,
  editablePrice = false,
}) {
  const update = (id, fn) =>
    setOrderList((prev) => prev.map((item) => (item.id === id ? fn(item) : item)))

  const increase = (id) =>
    update(id, (item) => ({ ...item, quantity: roundQty(item.quantity + 1) }))

  const decrease = (id) =>
    setOrderList((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: roundQty(item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0),
    )

  const remove = (id) => setOrderList((prev) => prev.filter((item) => item.id !== id))

  const count = roundQty(orderList.reduce((sum, item) => sum + item.quantity, 0))

  // 'idle' | 'done' | 'error' — natija tugma yonida 2 soniya koʻrinadi.
  const [copyState, setCopyState] = useState('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [copyState])

  const copyAsImage = async () => {
    try {
      await copyCartImage(orderList, priceField)
      setCopyState('done')
    } catch (error) {
      console.log(error.message)
      setCopyState('error')
    }
  }

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[13px] font-semibold text-fg">Корзина</h3>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-primary-soft px-2 text-[11px] font-medium tabular-nums text-primary-soft-fg">
              {orderList.length} тов. · {count} шт.
            </span>
          )}
          {orderList.length > 0 && (
            <button
              type="button"
              onClick={copyAsImage}
              title="Скопировать корзину как изображение"
              className={cn(
                'inline-flex items-center gap-1 text-[11px] transition',
                copyState === 'done' && 'text-success-soft-fg',
                copyState === 'error' && 'text-danger-soft-fg',
                copyState === 'idle' && 'text-subtle hover:text-fg',
              )}
            >
              {copyState === 'done' ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copyState === 'done' ? 'Скопировано' : copyState === 'error' ? 'Ошибка' : 'Копировать'}
            </button>
          )}
          {orderList.length > 0 && (
            <button
              type="button"
              onClick={() => setOrderList([])}
              className="text-[11px] text-subtle transition hover:text-danger-soft-fg"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {orderList.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Корзина пуста"
          description="Нажмите на товар в списке или отсканируйте штрихкод."
          className="py-14"
        />
      ) : (
        // Har bir tovar — bitta ixcham qator. Savat ustuni tor boʻlsa (@lg dan kichik)
        // nom alohida qatorga tushadi, boshqaruv tugmalari ikkinchi qatorda.
        <ul className="@container m-0 flex max-h-[68vh] list-none flex-col gap-1 overflow-y-auto p-0">
          {orderList.map((product, index) => {
            const price = unitPrice(product, priceField)
            const change = priceChange(product, priceField)
            const available = stockOf(product)
            const overStock = limitByStock && product.quantity > available
            const stockHint = overStock
              ? `На складе только ${available} ${product.unit} — лишних ${roundQty(product.quantity - available)}`
              : undefined

            return (
              <li
                key={product.id}
                className={cn(
                  'animate-fade-in flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border bg-surface px-2.5 py-1.5 shadow-soft @lg:flex-nowrap',
                  overStock ? 'border-danger/50' : 'border-line',
                )}
              >
                <p
                  title={[product.name, product.barCode].filter(Boolean).join(' · ')}
                  className="m-0 min-w-0 basis-full truncate text-[13px] font-medium text-fg @lg:basis-0 @lg:flex-1"
                >
                  <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-surface-2 px-1 align-middle text-[10px] font-semibold tabular-nums text-subtle">
                    {index + 1}
                  </span>
                  {product.name}
                </p>

                <div
                  title={stockHint}
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-md border bg-surface-2',
                    overStock ? 'border-danger/50' : 'border-line',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => decrease(product.id)}
                    aria-label="Уменьшить"
                    className="inline-flex size-6 items-center justify-center rounded-l-md text-muted transition hover:bg-surface-3 hover:text-fg"
                  >
                    <Minus className="size-3" />
                  </button>
                  <QuantityInput
                    value={product.quantity}
                    overStock={overStock}
                    onSave={(quantity) => update(product.id, (item) => ({ ...item, quantity }))}
                  />
                  <button
                    type="button"
                    onClick={() => increase(product.id)}
                    aria-label="Увеличить"
                    className="inline-flex size-6 items-center justify-center rounded-r-md text-muted transition hover:bg-surface-3 hover:text-fg"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    update(product.id, (item) => ({
                      ...item,
                      checkPrice: !item.checkPrice,
                      customPrice: undefined,
                    }))
                  }
                  title="Применить оптовую цену"
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition',
                    product.checkPrice
                      ? 'border-warning/40 bg-warning-soft text-warning-soft-fg'
                      : 'border-line text-subtle hover:text-fg',
                  )}
                >
                  Опт
                </button>

                <div className="flex shrink-0 items-center justify-end gap-1 @lg:min-w-[5.5rem]">
                  {editablePrice ? (
                    <PriceInput
                      product={product}
                      price={price}
                      onSave={(value) =>
                        update(product.id, (item) => ({
                          ...item,
                          checkPrice: false,
                          // Odatiy narxga qaytarilsa — oʻzgartirish bekor.
                          customPrice: value === item[priceField] ? undefined : value,
                        }))
                      }
                    />
                  ) : (
                    <span className="text-[12px] tabular-nums text-muted">
                      {Number(price || 0).toLocaleString('uz')}
                    </span>
                  )}
                  {change !== 0 && (
                    <>
                      <span
                        title={`Цена изменена: ${Number(product[priceField]).toLocaleString('uz')} → ${price.toLocaleString('uz')}`}
                        className="text-[11px] tabular-nums text-warning-soft-fg"
                      >
                        {signed(change)}
                      </span>
                      <button
                        type="button"
                        title="Вернуть обычную цену"
                        aria-label="Вернуть обычную цену"
                        onClick={() => update(product.id, (item) => ({ ...item, customPrice: undefined }))}
                        className="inline-flex size-4 items-center justify-center rounded text-subtle transition hover:bg-surface-2 hover:text-fg"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  )}
                </div>

                <span className="ml-auto shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg @lg:ml-0 @lg:min-w-[5.5rem]">
                  {Math.round(product.quantity * price).toLocaleString('uz')}
                </span>

                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label="Удалить из корзины"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-subtle transition hover:bg-danger-soft hover:text-danger-soft-fg"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default Cart
