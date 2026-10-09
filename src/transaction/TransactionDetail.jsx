import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CreditCard,
  Mail,
  Package,
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
import { t, td } from '../i18n'

const PAYMENT_ICONS = {
  Наличные: Banknote,
  'Банковская карта': CreditCard,
  'В долг': Wallet,
  'Зачёт возврата': Undo2,
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
 */
function TransactionDetail({
  selectedSale,
  setActiveTab,
  addNewPayment,
  label,
  icon: Icon,
  fetchDetail,
  returnFromSale,
}) {
  const [showDebtEdit, setShowDebtEdit] = useState(false)
  const [debtAmount, setDebtAmount] = useState('')
  const [debtError, setDebtError] = useState('')
  const [debtSaving, setDebtSaving] = useState(false)

  const [detail, setDetail] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [returnItem, setReturnItem] = useState(null)
  const [returnDone, setReturnDone] = useState('')

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
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>{t('Список продуктов')}</Card.Title>
              <span className="text-[11px] text-subtle">{t('{length} поз.', { length: sale.items.length })}</span>
            </Card.Header>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {sale.items.map((item, index) => {
                const returned = item.returned ?? 0
                const returnable = roundQty(item.quantity - returned)

                return (
                  <li key={item.id ?? index} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-subtle">
                      <Package className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-fg">
                        {item.product?.name ?? t('Товар удалён')}
                      </p>
                      <p className="flex flex-wrap items-center gap-1 text-[11px] text-subtle">
                        <Warehouse className="size-3" />
                        {item.warehouse?.name}
                        {item.checkPrice && (
                          <Badge bg="warning" className="ml-1 py-0 text-[10px]">
                            {t('Оптом')}
                          </Badge>
                        )}
                        {returned > 0 && (
                          <Badge bg="warning" className="ml-1 py-0 text-[10px] tabular-nums">
                            <Undo2 />
                            {t('Возвращено: {returned} шт. {v}', { returned, v: returnable > 0 && t(' · осталось {returnable}', { returnable }) })}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-[13px] tabular-nums">
                      <span className="text-subtle">{item.quantity} × </span>
                      <span className="font-semibold text-fg">
                        {item.price.toLocaleString('uz')}
                      </span>
                    </span>
                    {canReturn && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={returnable <= 0 || !item.product}
                        onClick={() => setReturnItem(item)}
                        title={returnable > 0 ? t('Вернуть товар') : t('Товар возвращён полностью')}
                      >
                        <Undo2 />
                        {t('Возврат')}
                      </Button>
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
                const debt = item.method === 'В долг'
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
