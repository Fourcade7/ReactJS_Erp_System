import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  Check,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  Pencil,
  Phone,
  Undo2,
  UserRound,
  Wallet,
  Warehouse,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, Button, Card, Form, Modal } from '../ui'
import { ResultModal } from '../utils/StatusModals'
import { roundQty } from '../lib/quantity'
import SaleReturnModal from './SaleReturnModal'
import SaleCustomerModal from './SaleCustomerModal'
import CopyImageModal from './CopyImageModal'
import { ClipboardUnavailableError, copySaleImage } from './cartImage'
import { t, td } from '../i18n'

const PAYMENT_ICONS = {
  Наличные: Banknote,
  'Банковская карта': CreditCard,
  'В долг': Wallet,
  'Зачёт возврата': Undo2,
  'По договору': FileText,
  Перечисление: Landmark,
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-2.5 py-2 text-[13px]">
      <Icon className="size-3.5 shrink-0 text-subtle" />
      <span className="w-28 shrink-0 text-subtle">{label}</span>
      <span className="min-w-0 flex-1 truncate text-fg">{children}</span>
    </div>
  )
}

/**
 * Operatsiya tafsilotlari: masʼul xodim, kontragent, mahsulotlar va toʻlovlar.
 * Qarz qolgan boʻlsa — `addNewPayment(id, method, amount)` orqali uni yopish mumkin.
 *
 * Savdo uchun (`fetchDetail` + `returnFromSale` berilganda) har bir tovarni shu
 * yerning oʻzidan qaytarish mumkin; buning uchun yangilangan maʼlumot
 * (qatorlardan qancha qaytarilgani) `fetchDetail` orqali yuklanadi.
 *
 * `changeCustomer(saleId, customerId, userId)` berilsa, savdo qilingandan keyin kontragentni
 * almashtirish mumkin (kassir adashgan bo'lsa).
 */
function TransactionDetail({
  selectedSale,
  setActiveTab,
  addNewPayment,
  label,
  icon: Icon,
  fetchDetail,
  returnFromSale,
  changeCustomer,
}) {
  const [showDebtEdit, setShowDebtEdit] = useState(false)
  const [debtAmount, setDebtAmount] = useState('')
  const [debtError, setDebtError] = useState('')
  const [debtSaving, setDebtSaving] = useState(false)

  const [detail, setDetail] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [returnItem, setReturnItem] = useState(null)
  const [returnDone, setReturnDone] = useState('')
  // 'idle' | 'done' | 'error' — natija tugma yonida 2 soniya ko'rinadi.
  const [copyState, setCopyState] = useState('idle')
  // Sayt xavfsiz emas (http): brauzer rasmni clipboard ga yozishga ruxsat bermaydi — tayyor rasm oynada
  // ko'rsatiladi, foydalanuvchi o'ng tugma bilan nusxalaydi.
  const [fallbackImage, setFallbackImage] = useState('')
  const [customerEdit, setCustomerEdit] = useState(false)
  const [customerDone, setCustomerDone] = useState('')

  useEffect(() => {
    if (copyState === 'idle') return undefined
    const timer = setTimeout(() => setCopyState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [copyState])

  useEffect(() => {
    if (!fetchDetail || !selectedSale) return
    let cancelled = false
    fetchDetail(selectedSale.id)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((error) => console.log(error.message))
    return () => {
      cancelled = true
    }
  }, [fetchDetail, selectedSale, reloadKey])

  if (!selectedSale) return null

  // Yangilangan maʼlumot kelguncha roʻyxatdagi nusxa koʻrsatiladi.
  const sale = detail ?? selectedSale
  const canReturn = Boolean(returnFromSale && detail)

  const totalPayed = sale.payments.reduce((sum, item) => sum + item.amount, 0)
  const remaining = sale.total - (totalPayed + sale.discount)
  const settled = remaining <= 0
  const returnedTotal = sale.returnedTotal ?? 0

  // Ro'yxatni rasm qilib nusxalash: mijozga messenjer orqali tashlab yuborish uchun.
  const copyAsImage = async () => {
    try {
      await copySaleImage(sale, label)
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
  const anyBulk = sale.items.some((item) => item.checkPrice)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline-secondary" size="sm" onClick={() => setActiveTab('home')}>
          <ArrowLeft />
          {t('Назад')}
        </Button>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          {Icon && <Icon className="size-4 text-primary" />}
          {label} #{sale.id}
        </h3>
        <Badge bg={settled ? 'success' : 'danger'} dot className="ml-auto">
          {settled ? t('Оплачено') : t('Есть долг')}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>{t('Ответственный')}</Card.Title>
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label={t('Имя')}>
                {sale.user?.username} {sale.user?.surname}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                {sale.user?.email}
              </InfoRow>
              <InfoRow icon={Phone} label={t('Телефон')}>
                {sale.user?.phone}
              </InfoRow>
              <InfoRow icon={CalendarClock} label={t('Дата и время')}>
                {new Date(sale.date).toLocaleString('uz')}
              </InfoRow>
            </div>
          </Card>

          <Card padded={false}>
            <Card.Header>
              <Card.Title>{t('Контрагент')}</Card.Title>
              {changeCustomer && (
                <Button
                  variant="outline-secondary"
                  size="xs"
                  onClick={() => setCustomerEdit(true)}
                  title={t('Изменить контрагента')}
                >
                  <Pencil />
                  {t('Изменить')}
                </Button>
              )}
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label={t('Имя')}>
                {sale.customer
                  ? `${sale.customer.username} ${sale.customer.surname}`
                  : t('Не указан')}
              </InfoRow>
              <InfoRow icon={Phone} label={t('Телефон')}>
                {sale.customer?.phone ?? '—'}
              </InfoRow>
              {/* "По договору" savdo: ochilgan shartnoma raqami (tafsilot yuklangach). */}
              {sale.contract && (
                <InfoRow icon={FileText} label={t('Договор')}>
                  {sale.contract.number}
                </InfoRow>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>{t('Список продуктов')}</Card.Title>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-subtle">{t('{length} поз.', { length: sale.items.length })}</span>
                <Button
                  variant="outline-secondary"
                  size="xs"
                  onClick={copyAsImage}
                  title={t('Скопировать список как изображение, чтобы отправить клиенту')}
                  className={cn(
                    copyState === 'done' && 'border-success/40 text-success-soft-fg',
                    copyState === 'error' && 'border-danger/40 text-danger-soft-fg',
                  )}
                >
                  {copyState === 'done' ? <Check /> : <Copy />}
                  {copyState === 'done' ? t('Скопировано') : copyState === 'error' ? t('Ошибка') : t('Копировать')}
                </Button>
              </div>
            </Card.Header>
            {/* Savatdagi kabi ixcham: har bir tovar — bitta qator; tor joyda nom alohida qatorga tushadi. */}
            <ul className="@container m-0 flex list-none flex-col gap-1 p-2">
              {sale.items.map((item, index) => {
                const returned = item.returned ?? 0
                const returnable = roundQty(item.quantity - returned)
                const unit = item.product?.unit ? td(item.product.unit) : ''
                const name = item.product?.name ?? t('Товар удалён')

                return (
                  <li
                    key={item.id ?? index}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 @lg:flex-nowrap"
                  >
                    {/* Nom qirqiladi; ombor va "qaytarilgan" belgisi esa o'z joyida turadi. */}
                    <div className="flex min-w-0 basis-full items-center gap-2 @lg:basis-0 @lg:flex-1">
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-surface-2 px-1 text-[10px] font-semibold tabular-nums text-subtle">
                        {index + 1}
                      </span>
                      <span title={name} className="min-w-0 truncate text-[13px] font-medium text-fg">
                        {name}
                      </span>
                      {item.warehouse?.name && (
                        <span
                          title={item.warehouse.name}
                          className="inline-flex max-w-28 shrink-0 items-center gap-1 text-[11px] text-subtle"
                        >
                          <Warehouse className="size-3 shrink-0" />
                          <span className="truncate">{item.warehouse.name}</span>
                        </span>
                      )}
                      {returned > 0 && (
                        <span
                          title={t('Возвращено: {returned} шт. {v}', {
                            returned,
                            v: returnable > 0 ? t(' · осталось {returnable}', { returnable }) : '',
                          })}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-warning-soft-fg"
                        >
                          <Undo2 className="size-3" />
                          {returned}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 px-2 text-[12px] font-semibold tabular-nums text-fg @lg:min-w-[4.5rem]">
                      {item.quantity}
                      {unit && <span className="ml-1 font-normal text-subtle">{unit}</span>}
                    </span>

                    {/* Ustun joyi faqat ro'yxatda ulgurji tovar bo'lsagina band: narx va summa surilmaydi. */}
                    {anyBulk && (
                      <span className="shrink-0 empty:hidden @lg:w-11 @lg:empty:block">
                        {item.checkPrice && (
                          <span
                            title={t('Оптом')}
                            className="rounded-md border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-soft-fg"
                          >
                            {t('Опт')}
                          </span>
                        )}
                      </span>
                    )}

                    <span className="shrink-0 text-right text-[12px] tabular-nums text-muted @lg:min-w-[4.5rem]">
                      {item.price.toLocaleString('uz')}
                    </span>

                    <span className="ml-auto shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg @lg:ml-0 @lg:min-w-[5.5rem]">
                      {Math.round(item.quantity * item.price).toLocaleString('uz')}
                    </span>

                    {canReturn && (
                      <button
                        type="button"
                        disabled={returnable <= 0 || !item.product}
                        onClick={() => setReturnItem(item)}
                        title={returnable > 0 ? t('Вернуть товар') : t('Товар возвращён полностью')}
                        aria-label={t('Вернуть товар')}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-line text-muted transition hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Undo2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card padded={false}>
            <Card.Header>
              <Card.Title>{t('Оплата')}</Card.Title>
            </Card.Header>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {sale.payments.map((item, index) => {
                const method = item.method.trim()
                const PayIcon = PAYMENT_ICONS[method] ?? CreditCard
                const debt = item.method === 'В долг' || method === 'По договору'
                const offset = method === 'Зачёт возврата'
                return (
                  <li key={item.id ?? index} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={cn(
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-md',
                        debt
                          ? 'bg-danger-soft text-danger-soft-fg'
                          : offset
                            ? 'bg-warning-soft text-warning-soft-fg'
                            : 'bg-success-soft text-success-soft-fg',
                      )}
                    >
                      <PayIcon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-fg">{td(method)}</p>
                      <p className="text-[11px] text-subtle">
                        {new Date(item.date).toLocaleString('uz')}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums text-fg">
                      {item.amount.toLocaleString('uz')} So&apos;m
                    </span>
                  </li>
                )
              })}
            </ul>

            <dl className="flex flex-col gap-1.5 border-t border-line bg-surface-2/60 px-4 py-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-subtle">{t('Скидка')}</dt>
                <dd className="tabular-nums text-fg">
                  {sale.discount.toLocaleString('uz')} So&apos;m
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-subtle">{t('Оплачено')}</dt>
                <dd className="tabular-nums text-fg">{totalPayed.toLocaleString('uz')} So&apos;m</dd>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <dt className="text-fg">{t('Общая стоимость')}</dt>
                <dd className={cn('tabular-nums', settled ? 'text-fg' : 'text-danger-soft-fg')}>
                  {sale.total.toLocaleString('uz')} So&apos;m
                </dd>
              </div>
              {returnedTotal > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-warning-soft-fg">{t('Возвращено')}</dt>
                    <dd className="tabular-nums text-warning-soft-fg">
                      −{returnedTotal.toLocaleString('uz')} So&apos;m
                    </dd>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <dt className="text-fg">{t('Итого после возврата')}</dt>
                    <dd className="tabular-nums text-fg">
                      {(sale.total - sale.discount - returnedTotal).toLocaleString('uz')} So&apos;m
                    </dd>
                  </div>
                </>
              )}
              {!settled && (
                <div className="flex justify-between text-xs">
                  <dt className="text-danger-soft-fg">{t('Остаток долга')}</dt>
                  <dd className="tabular-nums text-danger-soft-fg">
                    {remaining.toLocaleString('uz')} So&apos;m
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {!settled && addNewPayment && (
            <Button
              variant="danger"
              block
              onClick={() => {
                setShowDebtEdit(true)
                setDebtError('')
                setDebtAmount(remaining)
              }}
            >
              <Wallet />
              {t('Оплата долга')}
            </Button>
          )}
        </div>
      </div>

      <Modal show={showDebtEdit} onHide={() => setShowDebtEdit(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Оплата долга')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="debtAmount">
            <Form.Label>{t('Сумма')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              placeholder={t('Введите сумму')}
              value={debtAmount}
              onChange={(e) => setDebtAmount(e.target.value)}
            />
            <Form.Text>{t("Остаток долга: {amount} So'm", { amount: remaining.toLocaleString('uz') })}</Form.Text>
            {debtError && <p className="mt-1.5 text-[12px] text-danger-soft-fg">{debtError}</p>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDebtEdit(false)}>
            {t('Отмена')}
          </Button>
          <Button
            variant="warning"
            loading={debtSaving}
            onClick={async () => {
              const amount = Math.round(Number(`${debtAmount}`.replace(/\s/g, '').replace(',', '.')))
              if (!Number.isFinite(amount) || amount <= 0) {
                setDebtError(t('Введите сумму больше нуля'))
                return
              }
              if (amount > remaining) {
                setDebtError(t('Сумма больше остатка долга'))
                return
              }

              setDebtSaving(true)
              setDebtError('')
              try {
                const res = await addNewPayment(sale.id, 'В долг', amount)
                const result = await res.json()
                if (!res.ok) {
                  setDebtError(
                    Array.isArray(result.message) ? result.message.join(', ') : result.message,
                  )
                  return
                }
                setShowDebtEdit(false)
                setActiveTab('home')
              } catch {
                setDebtError(t('Не удалось подключиться к серверу'))
              } finally {
                setDebtSaving(false)
              }
            }}
          >
            {t('Сохранить')}
          </Button>
        </Modal.Footer>
      </Modal>

      {returnItem && (
        <SaleReturnModal
          sale={sale}
          item={returnItem}
          returnFromSale={returnFromSale}
          onHide={() => setReturnItem(null)}
          onDone={(result) => {
            setReturnItem(null)
            setReloadKey((k) => k + 1)
            setReturnDone(
              result.offset > 0
                ? t("Возврат оформлен: {amount} So'm (с долга списано {offset})", { amount: result.value.toLocaleString('uz'), offset: result.offset.toLocaleString('uz') })
                : t("Возврат оформлен: {amount} So'm", { amount: result.value.toLocaleString('uz') }),
            )
          }}
        />
      )}

      {customerEdit && (
        <SaleCustomerModal
          sale={sale}
          changeCustomer={changeCustomer}
          onHide={() => setCustomerEdit(false)}
          onDone={(updated, meta) => {
            setCustomerEdit(false)
            setDetail(updated)
            const number = updated.contract?.number
            setCustomerDone(
              meta?.byContract && number
                ? meta.customerChanged
                  ? t('Контрагент изменён. Открыт договор {number} — бухгалтер возьмёт его в работу.', { number })
                  : t('Продажа оформлена по договору {number} — бухгалтер возьмёт его в работу.', { number })
                : t('Контрагент изменён'),
            )
          }}
        />
      )}

      <CopyImageModal image={fallbackImage} onHide={() => setFallbackImage('')} />

      <ResultModal show={Boolean(customerDone)} onHide={() => setCustomerDone('')} success message={customerDone} />

      <ResultModal
        show={Boolean(returnDone)}
        onHide={() => setReturnDone('')}
        success
        message={returnDone}
      />
    </div>
  )
}

export default TransactionDetail
