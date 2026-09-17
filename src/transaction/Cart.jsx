import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { EmptyState } from '../ui'
import { stockOf, unitPrice } from './pricing'

/**
 * Savat. Har bir qatorda miqdorni oʻzgartirish, ulgurji narxga oʻtish
 * va oʻchirish mumkin.
 */
function Cart({ orderList, setOrderList, priceField = 'buyPrice', limitByStock = false }) {
  const update = (id, fn) =>
    setOrderList((prev) => prev.map((item) => (item.id === id ? fn(item) : item)))

  const increase = (id) =>
    update(id, (item) =>
      limitByStock && item.quantity >= stockOf(item)
        ? item
        : { ...item, quantity: item.quantity + 1 },
    )

  const decrease = (id) =>
    setOrderList((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )

  const remove = (id) => setOrderList((prev) => prev.filter((item) => item.id !== id))

  const count = orderList.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[13px] font-semibold text-fg">Корзина</h3>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-primary-soft px-2 text-[11px] font-medium tabular-nums text-primary-soft-fg">
              {count} шт.
            </span>
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
        <ul className="m-0 flex max-h-[68vh] list-none flex-col gap-1.5 overflow-y-auto p-0">
          {orderList.map((product) => {
            const price = unitPrice(product, priceField)
            const atLimit = limitByStock && product.quantity >= stockOf(product)

            return (
              <li
                key={product.id}
                className="animate-fade-in rounded-card border border-line bg-surface p-2.5 shadow-soft"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-fg">
                      {product.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-subtle">
                      {product.barCode}
                      {product.code ? ` · ${product.code}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label="Удалить из корзины"
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-subtle transition hover:bg-danger-soft hover:text-danger-soft-fg"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center rounded-lg border border-line bg-surface-2">
                    <button
                      type="button"
                      onClick={() => decrease(product.id)}
                      aria-label="Уменьшить"
                      className="inline-flex size-7 items-center justify-center rounded-l-lg text-muted transition hover:bg-surface-3 hover:text-fg"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 px-1 text-center text-[13px] font-semibold tabular-nums text-fg">
                      {product.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increase(product.id)}
                      disabled={atLimit}
                      aria-label="Увеличить"
                      className="inline-flex size-7 items-center justify-center rounded-r-lg text-muted transition hover:bg-surface-3 hover:text-fg disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => update(product.id, (item) => ({ ...item, checkPrice: !item.checkPrice }))}
                    title="Применить оптовую цену"
                    className={cn(
                      'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition',
                      product.checkPrice
                        ? 'border-warning/40 bg-warning-soft text-warning-soft-fg'
                        : 'border-line text-subtle hover:text-fg',
                    )}
                  >
                    Опт
                  </button>

                  <div className="ml-auto text-right leading-tight">
                    <p className="text-[11px] tabular-nums text-subtle">
                      {Number(price || 0).toLocaleString('uz')} × {product.quantity}
                    </p>
                    <p className="text-[13px] font-semibold tabular-nums text-fg">
                      {(product.quantity * price).toLocaleString('uz')}{' '}
                      <span className="text-[11px] font-normal text-subtle">So&apos;m</span>
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default Cart
