import { useState } from 'react'
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CreditCard,
  Mail,
  Package,
  Phone,
  UserRound,
  Wallet,
  Warehouse,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, Button, Card, Form, Modal } from '../ui'

const PAYMENT_ICONS = {
  Наличные: Banknote,
  'Банковская карта': CreditCard,
  'В долг': Wallet,
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
 */
function TransactionDetail({ selectedSale, setActiveTab, addNewPayment, label, icon: Icon }) {
  const [showDebtEdit, setShowDebtEdit] = useState(false)
  const [debtAmount, setDebtAmount] = useState('')
  const [debtError, setDebtError] = useState('')
  const [debtSaving, setDebtSaving] = useState(false)

  if (!selectedSale) return null

  const totalPayed = selectedSale.payments.reduce((sum, item) => sum + item.amount, 0)
  const remaining = selectedSale.total - (totalPayed + selectedSale.discount)
  const settled = remaining <= 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline-secondary" size="sm" onClick={() => setActiveTab('home')}>
          <ArrowLeft />
          Назад
        </Button>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          {Icon && <Icon className="size-4 text-primary" />}
          {label} #{selectedSale.id}
        </h3>
        <Badge bg={settled ? 'success' : 'danger'} dot className="ml-auto">
          {settled ? 'Оплачено' : 'Есть долг'}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>Ответственный</Card.Title>
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label="Имя">
                {selectedSale.user?.username} {selectedSale.user?.surname}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                {selectedSale.user?.email}
              </InfoRow>
              <InfoRow icon={Phone} label="Телефон">
                {selectedSale.user?.phone}
              </InfoRow>
              <InfoRow icon={CalendarClock} label="Дата и время">
                {new Date(selectedSale.date).toLocaleString('uz')}
              </InfoRow>
            </div>
          </Card>

          <Card padded={false}>
            <Card.Header>
              <Card.Title>Контрагент</Card.Title>
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label="Имя">
                {selectedSale.customer
                  ? `${selectedSale.customer.username} ${selectedSale.customer.surname}`
                  : 'Не указан'}
              </InfoRow>
              <InfoRow icon={Phone} label="Телефон">
                {selectedSale.customer?.phone ?? '—'}
              </InfoRow>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>Список продуктов</Card.Title>
              <span className="text-[11px] text-subtle">{selectedSale.items.length} поз.</span>
            </Card.Header>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {selectedSale.items.map((item, index) => (
                <li key={item.id ?? index} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-subtle">
                    <Package className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {item.product?.name ?? 'Товар удалён'}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-subtle">
                      <Warehouse className="size-3" />
                      {item.warehouse?.name}
                      {item.checkPrice && (
                        <Badge bg="warning" className="ml-1 py-0 text-[10px]">
                          Оптом
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
                </li>
              ))}
            </ul>
          </Card>

          <Card padded={false}>
            <Card.Header>
              <Card.Title>Оплата</Card.Title>
            </Card.Header>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {selectedSale.payments.map((item, index) => {
                const method = item.method.trim()
                const PayIcon = PAYMENT_ICONS[method] ?? CreditCard
                const debt = item.method === 'В долг'
                return (
                  <li key={item.id ?? index} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={cn(
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-md',
                        debt ? 'bg-danger-soft text-danger-soft-fg' : 'bg-success-soft text-success-soft-fg',
                      )}
                    >
                      <PayIcon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-fg">{method}</p>
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
                <dt className="text-subtle">Скидка</dt>
                <dd className="tabular-nums text-fg">
                  {selectedSale.discount.toLocaleString('uz')} So&apos;m
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-subtle">Оплачено</dt>
                <dd className="tabular-nums text-fg">{totalPayed.toLocaleString('uz')} So&apos;m</dd>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <dt className="text-fg">Общая стоимость</dt>
                <dd className={cn('tabular-nums', settled ? 'text-fg' : 'text-danger-soft-fg')}>
                  {selectedSale.total.toLocaleString('uz')} So&apos;m
                </dd>
              </div>
              {!settled && (
                <div className="flex justify-between text-xs">
                  <dt className="text-danger-soft-fg">Остаток долга</dt>
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
              Оплата долга
            </Button>
          )}
        </div>
      </div>

      <Modal show={showDebtEdit} onHide={() => setShowDebtEdit(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Оплата долга</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="debtAmount">
            <Form.Label>Сумма</Form.Label>
            <Form.Control
              inputMode="decimal"
              placeholder="Введите сумму"
              value={debtAmount}
              onChange={(e) => setDebtAmount(e.target.value)}
            />
            <Form.Text>Остаток долга: {remaining.toLocaleString('uz')} So&apos;m</Form.Text>
            {debtError && <p className="mt-1.5 text-[12px] text-danger-soft-fg">{debtError}</p>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDebtEdit(false)}>
            Отмена
          </Button>
          <Button
            variant="warning"
            loading={debtSaving}
            onClick={async () => {
              const amount = Math.round(Number(`${debtAmount}`.replace(/\s/g, '').replace(',', '.')))
              if (!Number.isFinite(amount) || amount <= 0) {
                setDebtError('Введите сумму больше нуля')
                return
              }
              if (amount > remaining) {
                setDebtError('Сумма больше остатка долга')
                return
              }

              setDebtSaving(true)
              setDebtError('')
              try {
                const res = await addNewPayment(selectedSale.id, 'В долг', amount)
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
                setDebtError('Не удалось подключиться к серверу')
              } finally {
                setDebtSaving(false)
              }
            }}
          >
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TransactionDetail
