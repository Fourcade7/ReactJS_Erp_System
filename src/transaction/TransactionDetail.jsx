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
  Plus,
  Trash2,
  Undo2,
  UserRound,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, Button, Card, Form, Modal } from '../ui'
import { ResultModal } from '../utils/StatusModals'
import { roundQty } from '../lib/quantity'
import SaleReturnModal from './SaleReturnModal'
import SaleCustomerModal from './SaleCustomerModal'
import SaleMasterFeeModal from './SaleMasterFeeModal'
import { isAdminRole } from '../users/roles'
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
 *
 * `addMasterFee` berilsa — savdodan keyin usta xizmatini qo'shish (usta kech kelgan bo'lsa), `removeMasterFee` —
 * adashib qo'shilganini o'chirish (faqat admin; backend ham tekshiradi).
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
  addMasterFee,
  removeMasterFee,
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
  const [feeAdding, setFeeAdding] = useState(false)
  // O'chirish tasdig'i kutilayotgan usta xizmati.
  const [feeRemoving, setFeeRemoving] = useState(null)
  const [feeRemoveError, setFeeRemoveError] = useState('')
  const [feeRemoveBusy, setFeeRemoveBusy] = useState(false)
  const [feeDone, setFeeDone] = useState('')

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
  // Usta xizmatidan kompaniya ulushi: `sale.total` ichida, mahsulotlar ro'yxatida alohida qator bo'lib chiqadi.
  const masterFees = sale.masterFees ?? []
  const companyServices = masterFees.filter((fee) => fee.companyAmount > 0)
  const companyServiceTotal = companyServices.reduce((sum, fee) => sum + fee.companyAmount, 0)
  const masterFeeTotal = masterFees.reduce((sum, fee) => sum + fee.amount, 0)
  // Xizmat qo'shish/o'chirish — tafsilot yuklangach (unda shartnoma va to'lovlar aniq).
  const canAddFee = Boolean(addMasterFee && detail)
  const canRemoveFee = Boolean(removeMasterFee && detail && isAdminRole())

  const confirmRemoveFee = async () => {
    setFeeRemoveBusy(true)
    setFeeRemoveError('')
    try {
      const res = await removeMasterFee(feeRemoving.id, localStorage.getItem('userid'))
      const result = await res.json().catch(() => null)
      if (!res.ok) {
        setFeeRemoveError(
          (Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'),
        )
        return
      }
      setDetail(result)
      setFeeRemoving(null)
      setFeeDone(t('Услуга мастера удалена'))
    } catch {
      setFeeRemoveError(t('Не удалось подключиться к серверу'))
    } finally {
      setFeeRemoveBusy(false)
    }
  }

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

          {/* Usta xizmati: ustaning ulushi ustaga beriladi (savdo summasi va foydaga kirmaydi),
              kompaniya ulushi savdo summasi ichida. */}
          {(masterFees.length > 0 || canAddFee) && (
            <Card padded={false}>
              <Card.Header>
                <div className="min-w-0">
                  <Card.Title>{t('Услуги мастеров')}</Card.Title>
                  {masterFees.length > 0 && (
                    <p className="text-[11px] text-subtle">
                      {companyServiceTotal > 0
                        ? t('в сумму продажи входит только доля компании')
                        : t('не входят в сумму продажи')}
                    </p>
                  )}
                </div>
                {canAddFee && (
                  <Button
                    variant="outline-secondary"
                    size="xs"
                    onClick={() => setFeeAdding(true)}
                    title={t('Добавить услугу мастера к этой продаже')}
                  >
                    <Plus />
                    {t('Добавить')}
                  </Button>
                )}
              </Card.Header>
              {masterFees.length === 0 ? (
                <p className="px-4 py-3 text-[12px] text-subtle">
                  {t('Мастер пришёл позже? Добавьте его услугу — сумма посчитается как при оформлении продажи.')}
                </p>
              ) : (
                <ul className="m-0 list-none divide-y divide-line px-4">
                  {masterFees.map((fee) => {
                    // Savdodan keyin qo'shilgan bo'lsa — qachon va ulush qanday to'langani ko'rinadi.
                    const addedLater =
                      fee.createdAt && new Date(fee.createdAt).getTime() - new Date(sale.date).getTime() > 5 * 60_000
                    return (
                      <li key={fee.id} className="flex flex-col gap-1 py-2 text-[13px]">
                        <div className="flex items-center gap-2.5">
                          <Wrench className="size-3.5 shrink-0 text-subtle" />
                          <span className="min-w-0 flex-1 truncate text-fg">
                            {fee.master ? `${fee.master.username ?? ''} ${fee.master.surname ?? ''}`.trim() : '—'}
                            {fee.note && <span className="ml-1.5 text-[11px] text-subtle">{fee.note}</span>}
                            {addedLater && (
                              <span className="ml-1.5 text-[11px] text-subtle">
                                {t('добавлено {date}', { date: new Date(fee.createdAt).toLocaleString('uz') })}
                                {fee.companyAmount > 0 &&
                                  ` · ${fee.paymentMethod ? td(fee.paymentMethod) : t('в долг')}`}
                              </span>
                            )}
                          </span>
                          <span
                            className="shrink-0 tabular-nums text-fg"
                            title={t('Мастеру — отдельно, не входит в сумму продажи')}
                          >
                            {fee.companyAmount > 0 && <span className="mr-1 text-[11px] text-subtle">{t('услуга мастера')}</span>}
                            <span className="font-semibold">{fee.amount.toLocaleString('uz')} So&apos;m</span>
                          </span>
                          {canRemoveFee && (
                            <button
                              type="button"
                              onClick={() => {
                                setFeeRemoveError('')
                                setFeeRemoving(fee)
                              }}
                              title={t('Удалить услугу мастера')}
                              aria-label={t('Удалить услугу мастера')}
                              className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-subtle transition hover:bg-danger-soft hover:text-danger-soft-fg"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Kompaniya ulushi — ustaning ostida alohida qator: u savdo summasi ichida. */}
                        {fee.companyAmount > 0 && (
                          <div className="flex items-center gap-2.5 pl-6 text-[12px]">
                            <span className="min-w-0 flex-1 truncate text-muted">
                              {t('Доля компании — в сумме продажи')}
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums text-primary">
                              +{fee.companyAmount.toLocaleString('uz')} So&apos;m
                            </span>
                            {canRemoveFee && <span aria-hidden="true" className="size-6 shrink-0" />}
                          </div>
                        )}
                      </li>
                    )
                  })}
                  <li className="flex items-center justify-between py-2 text-[13px]">
                    <span className="text-muted">{t('Итого мастерам:')}</span>
                    <span className="font-semibold tabular-nums text-fg">
                      {masterFeeTotal.toLocaleString('uz')} So&apos;m
                    </span>
                  </li>
                  {companyServiceTotal > 0 && (
                    <li className="flex items-center justify-between py-2 text-[13px]">
                      <span className="text-muted">{t('Доля компании (в сумме продажи):')}</span>
                      <span className="font-semibold tabular-nums text-fg">
                        {companyServiceTotal.toLocaleString('uz')} So&apos;m
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </Card>
          )}
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
              {/* Usta xizmatidan kompaniya ulushi: savdo summasida, qaytarilmaydi. */}
              {companyServices.map((fee) => (
                <li
                  key={`service-${fee.id}`}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface-2/50 px-2.5 py-1.5"
                >
                  <Wrench className="size-3.5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
                    {t('Услуга мастера')}
                    {fee.master && (
                      <span className="ml-1.5 font-normal text-subtle">
                        {`${fee.master.username ?? ''} ${fee.master.surname ?? ''}`.trim()}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg @lg:min-w-[5.5rem]">
                    {fee.companyAmount.toLocaleString('uz')}
                  </span>
                  {/* Qaytarish tugmasi ustuni bilan tekislash uchun. */}
                  {canReturn && <span className="size-6 shrink-0" />}
                </li>
              ))}
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
              {/* Usta xizmatidan kompaniya ulushi bo'lsa: umumiy summa nimadan iboratligi alohida ko'rinadi. */}
              {companyServiceTotal > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-subtle">{t('Сумма товаров')}</dt>
                    <dd className="tabular-nums text-fg">
                      {(sale.total - companyServiceTotal).toLocaleString('uz')} So&apos;m
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-subtle">
                      <Wrench className="size-3.5" />
                      {t('Услуга мастера (доля компании)')}
                    </dt>
                    <dd className="tabular-nums text-fg">+{companyServiceTotal.toLocaleString('uz')} So&apos;m</dd>
                  </div>
                </>
              )}
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

      {feeAdding && (
        <SaleMasterFeeModal
          sale={sale}
          addMasterFee={addMasterFee}
          onHide={() => setFeeAdding(false)}
          onDone={(updated) => {
            setFeeAdding(false)
            setDetail(updated)
            setFeeDone(t('Услуга мастера добавлена'))
          }}
        />
      )}

      <Modal show={Boolean(feeRemoving)} onHide={feeRemoveBusy ? undefined : () => setFeeRemoving(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Удалить услугу мастера?')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-2 text-[13px]">
          <p>
            {feeRemoving?.master
              ? `${feeRemoving.master.username ?? ''} ${feeRemoving.master.surname ?? ''}`.trim()
              : '—'}
            {' · '}
            {t('услуга мастера')} {(feeRemoving?.amount ?? 0).toLocaleString('uz')}
          </p>
          {feeRemoving?.companyAmount > 0 && (
            <p className="text-muted">
              {t('Сумма продажи уменьшится на {amount}. Если доля оплачивалась отдельно — эта оплата тоже удалится.', {
                amount: feeRemoving.companyAmount.toLocaleString('uz'),
              })}
            </p>
          )}
          {feeRemoveError && <p className="text-[12px] text-danger-soft-fg">{feeRemoveError}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setFeeRemoving(null)} disabled={feeRemoveBusy}>
            {t('Отмена')}
          </Button>
          <Button variant="danger" loading={feeRemoveBusy} onClick={confirmRemoveFee}>
            {t('Да, удалить')}
          </Button>
        </Modal.Footer>
      </Modal>

      <CopyImageModal image={fallbackImage} onHide={() => setFallbackImage('')} />

      <ResultModal show={Boolean(customerDone)} onHide={() => setCustomerDone('')} success message={customerDone} />

      <ResultModal show={Boolean(feeDone)} onHide={() => setFeeDone('')} success message={feeDone} />

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
