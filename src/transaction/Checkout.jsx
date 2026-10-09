import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Banknote,
  ChevronDown,
  CreditCard,
  Printer,
  Receipt,
  Search,
  SlidersHorizontal,
  UserRound,
  Wallet,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Collapse, Form } from '../ui'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import logobgtransparent from '../assets/logobgtransparent.png'
import { priceChange, stockOf, unitPrice } from './pricing'
import { t, td } from '../i18n'

const PAYMENTS = [
  { value: 'Наличные', Icon: Banknote },
  { value: 'Банковская карта', Icon: CreditCard },
  { value: 'В долг', Icon: Wallet, danger: true },
  { value: 'Click', Icon: CreditCard },
  { value: 'Payme', Icon: CreditCard },
  { value: 'Uzum', Icon: CreditCard },
]

/** Kontragentni qidirib tanlash (combobox). */
function CustomerPicker({ fetchCustomers, setCustomerId, initialLabel = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialLabel)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [customerList, setCustomerList] = useState([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    async function loadCustomers() {
      try {
        const page = await fetchCustomers(debouncedSearch)
        setCustomerList(page.data)
      } catch (error) {
        console.log(error)
      }
    }
    loadCustomers()
  }, [debouncedSearch, fetchCustomers])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={boxRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
      <Form.Control
        className="pl-8 pr-8"
        value={searchTerm}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setCustomerId(null)
          setOpen(true)
        }}
        placeholder={t('Имя контрагента или телефон')}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />

      {open && customerList?.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 m-0 mt-1 max-h-56 list-none overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-pop animate-pop-in">
          {customerList.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm(`${item.username} ${item.surname}`)
                  setCustomerId(item.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-surface-2"
              >
                <UserRound className="size-3.5 shrink-0 text-subtle" />
                <span className="min-w-0 flex-1 truncate text-fg">
                  {item.username} {item.surname}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-subtle">{item.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const signed = (value) => `${value < 0 ? '−' : '+'}${Math.abs(value).toLocaleString('uz')}`

/** Chop etiladigan chek. Tema qanday boʻlishidan qatʼi nazar oq fonda. */
function CheckScreen({ orderList, discountAmount, finalCost, printType, priceField }) {
  // Savatda qoʻlda oʻzgartirilgan narxlar boʻyicha jami farq (odatiy narxga nisbatan).
  const changeTotal = Math.round(
    orderList.reduce((sum, item) => sum + priceChange(item, priceField) * item.quantity, 0),
  )

  return (
    <div className="bg-white p-3 font-mono text-[12px] text-black">
      <div className="mb-2 text-center">
        <p className="font-bold">{printType}</p>
        <p className="text-[11px]">{new Date().toLocaleString('uz')}</p>
      </div>
      <hr className="my-1 border-dashed border-black/40" />

      <div className="flex flex-col">
        {orderList.map((item, index) => {
          const price = unitPrice(item, priceField)
          const change = priceChange(item, priceField)
          return (
            <div key={index} className="border-b border-dashed border-black/30 py-1">
              <div className="flex justify-between gap-2">
                <span className="font-semibold">{item.name}</span>
                <span className="font-bold">
                  {item.quantity} {td(item.unit)}
                </span>
              </div>
              <div className="flex justify-between gap-2 font-bold">
                <span>{price.toLocaleString('uz')} So&apos;m</span>
                <span>{Math.round(item.quantity * price).toLocaleString('uz')} So&apos;m</span>
              </div>
              {change !== 0 && (
                <div className="flex justify-between gap-2 text-[11px]">
                  <span>{t('было {price}', { price: Number(item[priceField]).toLocaleString('uz') })}</span>
                  <span>{signed(Math.round(change * item.quantity))}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-2">
        {changeTotal !== 0 && (
          <div className="flex justify-between">
            <span>{t('Изменение цены:')}</span>
            <span>{signed(changeTotal)} So&apos;m</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{t('Скидка:')}</span>
          <span>{discountAmount.toLocaleString('uz')} So&apos;m</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{t('Итого:')}</span>
          <span>{finalCost.toLocaleString('uz')} So&apos;m</span>
        </div>
      </div>

      <hr className="my-2 border-dashed border-black/40" />
      <div className="mt-3 flex justify-center">
        <img src={logobgtransparent} width={50} height={50} alt="" />
      </div>
      <p className="text-center text-[10px]">
        by <b>ID GROUP</b> team
      </p>
    </div>
  )
}

const TONES = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  info: 'bg-info text-white hover:brightness-110',
  warning: 'bg-warning text-[oklch(0.25_0.06_72)] hover:brightness-105',
}

/**
 * Hisob-kitob paneli: chegirma, kontragent, toʻlov usuli va yakuniy summa.
 * `submit(orderList, paid, paymentType, discount, customerId, userId)` —
 * boʻlimning API funksiyasi (addNewSale / addNewPurchase / addNewReturn).
 */
function Checkout({
  orderList,
  submit,
  fetchCustomers,
  priceField = 'buyPrice',
  title = t('Оформление'),
  tone = 'primary',
  printable = false,
  maxDiscountPercent = null,
  limitByStock = false,
  initialCustomer = null,
  onSubmitted,
}) {
  const componentRef = useRef(null)

  const [userId] = useState(localStorage.getItem('userid') || 1)
  const [open, setOpen] = useState(false)
  const [customerId, setCustomerId] = useState(initialCustomer?.id ?? null)
  const [printType, setPrintType] = useState(null)

  const [paymentType, setPaymentType] = useState('Наличные')
  const [discountType, setDiscountType] = useState('sum')
  const [discountSum, setDiscountSum] = useState(0)

  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Miqdor o'nli bo'lishi mumkin, summalar esa bazada butun son.
  const totalCost = Math.round(
    orderList.reduce((sum, item) => sum + unitPrice(item, priceField) * item.quantity, 0),
  )

  // Backend ham xuddi shu chegarani (pastga yaxlitlangan) tekshiradi.
  const maxDiscount =
    maxDiscountPercent == null ? totalCost : Math.floor((totalCost * maxDiscountPercent) / 100)

  // Qiymat kiritilayotganda chegaradan oshirilmaydi; savat keyin kichraysa ham
  // amaldagi chegirma `maxDiscount` bilan cheklanadi.
  const changeDiscount = (raw) => {
    if (raw === '') return setDiscountSum(0)
    const value = Math.max(0, Number(raw))
    if (!Number.isFinite(value)) return
    const cap = discountType === 'percent' ? (maxDiscountPercent ?? 100) : maxDiscount
    setDiscountSum(Math.min(value, cap))
  }

  const overStockItems = limitByStock ? orderList.filter((item) => item.quantity > stockOf(item)) : []

  // Summalar bazada butun son, shuning uchun foizli chegirma yaxlitlanadi.
  const discountAmount = Math.min(
    maxDiscount,
    Math.max(
      0,
      Math.round(
        discountType === 'sum'
          ? Number(discountSum || 0)
          : (totalCost * Number(discountSum || 0)) / 100,
      ),
    ),
  )
  const finalCost = totalCost - discountAmount

  const isDebt = paymentType === 'В долг'

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: async () => window.location.reload(),
  })
  const handlePrintDraft = useReactToPrint({ contentRef: componentRef })

  useEffect(() => {
    if (printType === 'Черновик') {
      handlePrintDraft()
      setPrintType(null)
    }
    if (printType === 'Чек') {
      handlePrint()
      setPrintType(null)
    }
  }, [printType, handlePrint, handlePrintDraft])

  const handleSubmit = async () => {
    if (overStockItems.length > 0) return

    if (isDebt && !customerId) {
      setShowSuccess(false)
      setAlertMessage(t('Для оформления в долг выберите контрагента'))
      setShowDanger(true)
      return
    }

    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await submit(
        orderList,
        isDebt ? 0 : finalCost,
        paymentType,
        discountAmount,
        customerId,
        userId,
      )
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(
          Array.isArray(result.message) ? result.message.join(', ') : result.message,
        )
        psetShow(false)
        return
      }

      // Savdo yozildi; unga bog'liq keyingi amal (masalan, ustaning zakazini yakunlash)
      // muvaffaqiyatsiz bo'lsa ham savdo bekor bo'lmaydi — foydalanuvchiga aytiladi.
      let followUpFailed = false
      if (onSubmitted) {
        try {
          await onSubmitted(result)
        } catch (error) {
          console.log(error.message)
          followUpFailed = true
        }
      }

      setShowSuccess(true)
      setAlertMessage(
        followUpFailed
          ? t('Продажа оформлена, но заказ мастера не отмечен завершённым — откройте его и отметьте вручную')
          : t('Успешно...'),
      )
      psetShow(false)
      setTimeout(() => {
        setShowSuccess(false)
        if (printable) setPrintType('Чек')
        else window.location.reload()
      }, followUpFailed ? 8000 : 3000)
    } catch {
      setShowDanger(true)
      setAlertMessage(t('Не удалось подключиться к серверу'))
      psetShow(false)
    }
  }

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[13px] font-semibold text-fg">{title}</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition',
            open ? 'bg-primary-soft text-primary-soft-fg' : 'text-subtle hover:text-fg',
          )}
        >
          <SlidersHorizontal className="size-3" />
          {t('Доп. функции')}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 shadow-soft">
        <Collapse in={open} className={open ? undefined : '-mb-3'}>
          <div className="flex flex-col gap-3 border-b border-line pb-3">
            {printable && (
              <button
                type="button"
                onClick={() => setPrintType('Черновик')}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line text-xs text-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <Printer className="size-3.5" />
                {t('Печать черновика')}
              </button>
            )}

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">{t('Скидка')}</p>
              <div className="flex gap-2">
                <Form.Control
                  type="number"
                  placeholder="0"
                  min={0}
                  max={discountType === 'percent' ? (maxDiscountPercent ?? 100) : maxDiscount}
                  value={discountSum === 0 ? '' : discountSum}
                  onChange={(e) => changeDiscount(e.target.value)}
                />
                <div className="inline-flex shrink-0 rounded-lg border border-line bg-surface-2 p-0.5">
                  {[
                    { key: 'sum', label: t('Сум') },
                    { key: 'percent', label: '%' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        // Sum ↔ % almashganda eski son yangi birlikda boshqa maʼno beradi.
                        if (opt.key !== discountType) setDiscountSum(0)
                        setDiscountType(opt.key)
                      }}
                      className={cn(
                        'min-w-9 rounded-md px-2 text-xs font-medium transition',
                        discountType === opt.key
                          ? 'bg-surface text-fg shadow-soft'
                          : 'text-subtle hover:text-fg',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {discountType === 'percent' && discountAmount > 0 && (
                <p className="mt-1 text-[11px] tabular-nums text-subtle">
                  = {discountAmount.toLocaleString('uz')} So&apos;m
                </p>
              )}
              {maxDiscountPercent != null && (
                <p className="mt-1 text-[11px] tabular-nums text-subtle">
                  {t("Макс. скидка: {maxDiscountPercent}% ({amount} So'm)", { maxDiscountPercent, amount: maxDiscount.toLocaleString('uz') })}
                </p>
              )}
            </div>
          </div>
        </Collapse>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">{t('Контрагент')}</p>
          <CustomerPicker
            fetchCustomers={fetchCustomers}
            setCustomerId={setCustomerId}
            initialLabel={
              initialCustomer ? `${initialCustomer.username} ${initialCustomer.surname}`.trim() : ''
            }
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">{t('Способ оплаты')}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENTS.map(({ value, Icon, danger }) => {
              const selected = paymentType === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentType(value)}
                  aria-pressed={selected}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10.5px] leading-tight transition',
                    selected
                      ? danger
                        ? 'border-danger/50 bg-danger-soft text-danger-soft-fg'
                        : 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                      : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  <Icon className="size-4" />
                  <span className="line-clamp-1 text-center">{td(value)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <dl className="flex flex-col gap-1 border-t border-line pt-3 text-xs">
          <div className="flex justify-between text-muted">
            <dt>{t('Сумма товаров')}</dt>
            <dd className="tabular-nums">{totalCost.toLocaleString('uz')}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>{t('Скидка')}</dt>
            <dd className="tabular-nums">−{Number(discountAmount || 0).toLocaleString('uz')}</dd>
          </div>
        </dl>

        {overStockItems.length > 0 && (
          <p className="rounded-lg border border-danger/30 bg-danger-soft px-2.5 py-2 text-[11.5px] leading-snug text-danger-soft-fg">
            {t('Недостаточно товара на складе:')} {overStockItems.map((item) => item.name).join(', ')}{t('. Уменьшите количество до остатка.')}
          </p>
        )}
        {showDanger && <AlertDismissibleDanger alertMsg={alertMessage} />}
        {showSuccess && <AlertDismissibleSuccess alertMsg={alertMessage} />}
        <Collapse in={pshow} className={pshow ? undefined : '-mb-3'}>
          <div>
            <ProgressDismissible />
          </div>
        </Collapse>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            pshow ||
            orderList.length === 0 ||
            overStockItems.length > 0 ||
            (finalCost <= 0 && !isDebt)
          }
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-xl px-4 py-3 shadow-soft transition active:translate-y-px',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isDebt ? 'bg-danger text-white hover:bg-danger-hover' : (TONES[tone] ?? TONES.primary),
          )}
        >
          <span className="text-[11px] font-medium uppercase tracking-wider opacity-80">
            {isDebt ? t('Оформить в долг') : t('Итого к оплате')}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {finalCost.toLocaleString('uz')} UZS
          </span>
        </button>
      </div>

      {printable && orderList.length > 0 && (
        <details className="group rounded-card border border-line bg-surface shadow-soft">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-xs text-muted transition hover:text-fg">
            <Receipt className="size-3.5" />
            {t('Предпросмотр чека')}
            <ChevronDown className="ml-auto size-3.5 transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-line p-2">
            <div ref={componentRef}>
              <CheckScreen
                orderList={orderList}
                discountAmount={discountAmount}
                finalCost={finalCost}
                printType={printType}
                priceField={priceField}
              />
            </div>
          </div>
        </details>
      )}

      {/* Chek yopiq panel ichida boʻlsa ham chop etish uchun DOM da boʻlishi kerak. */}
      {printable && orderList.length === 0 && (
        <div ref={componentRef} className="hidden" />
      )}
    </section>
  )
}

export default Checkout
