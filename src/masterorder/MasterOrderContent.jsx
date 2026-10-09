import { createElement, useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  ExternalLink,
  HardHat,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  UserPlus,
  UserRound,
  Wrench,
} from 'lucide-react'
import { cn } from '../lib/cn'
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Form,
  Modal,
  PageHeader,
  SearchField,
  Spinner,
} from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { stockOf } from '../transaction/pricing'
import { setMasterOrderHandoff } from './handoff'
import { orderToCart } from './orderToCart'
import {
  createCustomerFromOrder,
  findCustomerByPhone,
  getMasterOrder,
  getMasterOrders,
  setMasterOrderStatus,
} from './MasterOrderApi'

const STATUS = {
  new: { label: 'Новый', tone: 'info' },
  preparing: { label: 'В работе', tone: 'warning' },
  ready: { label: 'Готов', tone: 'success' },
  completed: { label: 'Завершён', tone: 'neutral' },
  cancelled: { label: 'Отменён', tone: 'danger' },
}

const FILTERS = [
  { key: '', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'preparing', label: 'В работе' },
  { key: 'ready', label: 'Готовы' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'cancelled', label: 'Отменённые' },
]

const ACTIVE = ['new', 'preparing', 'ready']

/** Kassir holatni shu tugmalar bilan oldinga suradi. */
const NEXT_ACTIONS = {
  new: [
    { status: 'preparing', label: 'Взять в работу', variant: 'primary' },
    { status: 'ready', label: 'Сразу готов', variant: 'outline-success' },
  ],
  preparing: [{ status: 'ready', label: 'Готов к выдаче', variant: 'success' }],
  ready: [{ status: 'preparing', label: 'Вернуть в работу', variant: 'outline-secondary' }],
}

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`
const personName = (person) => `${person?.username ?? ''} ${person?.surname ?? ''}`.trim()

function StatusBadge({ status }) {
  const { label, tone } = STATUS[status] ?? { label: status, tone: 'neutral' }
  return (
    <Badge bg={tone} dot>
      {label}
    </Badge>
  )
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 py-2 text-[13px]">
      {createElement(icon, { className: 'mt-0.5 size-3.5 shrink-0 text-subtle' })}
      <span className="w-28 shrink-0 text-subtle">{label}</span>
      <span className="min-w-0 flex-1 break-words text-fg">{children}</span>
    </div>
  )
}

/** Zakazlar ro'yxati: holat bo'yicha filtr, qidiruv va har 20 soniyada avtomatik yangilanish. */
function MasterOrderList({ onOpen }) {
  const [status, setStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    let stale = false

    async function load(silent) {
      try {
        if (!silent) setLoading(true)
        const result = await getMasterOrders(page, 10, debouncedSearch, status)
        if (stale) return
        setOrders(result.data)
        setPageCount(result.meta.totalPages)
        setError('')
      } catch (e) {
        if (!stale) setError(e.message || 'Не удалось подключиться к серверу')
      } finally {
        if (!stale) setLoading(false)
      }
    }

    load(false)
    const timer = setInterval(() => load(true), 20000)
    return () => {
      stale = true
      clearInterval(timer)
    }
  }, [page, debouncedSearch, status])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => {
              setStatus(filter.key)
              setPage(1)
            }}
            aria-pressed={status === filter.key}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium transition',
              status === filter.key
                ? 'bg-primary-soft text-primary-soft-fg'
                : 'text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <SearchField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={() => setSearchTerm('')}
        placeholder="Мастер, клиент, телефон или номер заказа..."
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={HardHat} title="Заказов нет" />
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-card border border-line bg-surface p-0 shadow-soft">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onOpen(order.id)}
                className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                  <HardHat className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-fg">
                    Заказ #{order.id} · {order.customerName}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="size-3" />
                      {personName(order.master)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3" />
                      {order.customerPhone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      {new Date(order.createdAt).toLocaleString('uz')}
                    </span>
                  </p>
                </div>

                <StatusBadge status={order.status} />

                <span className="hidden shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg sm:block">
                  {order.itemsTotal.toLocaleString('uz')}
                  <span className="ml-1 text-[11px] font-normal text-subtle">
                    So&apos;m · {order.itemsCount} поз.
                  </span>
                </span>

                <ChevronRight className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-center pt-1">
        <CustomPaginationScreen active={page} pageCount={pageCount} setActive={setPage} />
      </div>
    </div>
  )
}

/** Usta yozgan ism/telefon bilan kontragent yaratish — qo'lda tuzatish mumkin. */
function CreateCustomerModal({ order, onHide, onCreated }) {
  const [first = '', ...rest] = order.customerName.trim().split(/\s+/)
  const [username, setUsername] = useState(first)
  const [surname, setSurname] = useState(rest.join(' '))
  const [phone, setPhone] = useState(order.customerPhone)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!username.trim() || !phone.trim()) {
      setError('Укажите имя и телефон')
      return
    }
    setSaving(true)
    setError('')
    try {
      onCreated(await createCustomerFromOrder(username.trim(), surname.trim(), phone.trim()))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Новый контрагент</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3">
        <p className="text-xs text-subtle">Данные взяты из заказа мастера — при необходимости исправьте.</p>
        <Form.Group controlId="masterOrderCustomerName">
          <Form.Label>Имя</Form.Label>
          <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="masterOrderCustomerSurname">
          <Form.Label>Фамилия</Form.Label>
          <Form.Control value={surname} onChange={(e) => setSurname(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="masterOrderCustomerPhone">
          <Form.Label>Телефон</Form.Label>
          <Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button loading={saving} onClick={submit}>
          Создать
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

/** Zakaz tafsiloti: mijoz, manzil, tovarlar va kassir amallari. */
function MasterOrderDetail({ orderId, onBack, goTo }) {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [customerChecked, setCustomerChecked] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMasterOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Не удалось подключиться к серверу')
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  const phone = order?.customerPhone
  const isActive = order ? ACTIVE.includes(order.status) : false

  // Faol zakaz uchun usta yozgan telefon bo'yicha kontragent bor-yo'qligini tekshiramiz.
  useEffect(() => {
    if (!phone || !isActive) return
    let cancelled = false
    findCustomerByPhone(phone)
      .then((found) => {
        if (cancelled) return
        setCustomer(found)
        setCustomerChecked(true)
      })
      .catch(() => {
        if (!cancelled) setCustomerChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [phone, isActive])

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="outline-secondary" size="sm" onClick={onBack} className="self-start">
          <ArrowLeft />
          Назад
        </Button>
        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
      </div>
    )
  }

  const items = order.items.map((item) => {
    const bulk = item.priceType === 'bulk'
    const available = stockOf(item.product)
    return {
      ...item,
      bulk,
      currentPrice: bulk ? item.product.bulkPrice : item.product.buyPrice,
      available,
      short: item.quantity > available,
    }
  })
  const shortItems = items.filter((item) => item.short)

  const changeStatus = async (status) => {
    setBusy(true)
    setError('')
    try {
      setOrder(await setMasterOrderStatus(order.id, status))
    } catch (e) {
      setError(e.message || 'Не удалось подключиться к серверу')
    } finally {
      setBusy(false)
    }
  }

  const toSale = () => {
    setMasterOrderHandoff({
      orderId: order.id,
      customer: customer
        ? { id: customer.id, username: customer.username, surname: customer.surname }
        : null,
      orderList: orderToCart(order),
    })
    goTo?.('teenth')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline-secondary" size="sm" onClick={onBack}>
          <ArrowLeft />
          Назад
        </Button>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <HardHat className="size-4 text-primary" />
          Заказ #{order.id}
        </h3>
        <span className="ml-auto">
          <StatusBadge status={order.status} />
        </span>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isActive && shortItems.length > 0 && (
        <Alert variant="warning">
          Не хватает на складе:{' '}
          {shortItems.map((item) => `${item.product.name} (есть ${item.available})`).join(', ')}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>Мастер</Card.Title>
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label="Имя">
                {personName(order.master)}
              </InfoRow>
              <InfoRow icon={Phone} label="Телефон">
                {order.master?.phone}
              </InfoRow>
              <InfoRow icon={CalendarClock} label="Создан">
                {new Date(order.createdAt).toLocaleString('uz')}
              </InfoRow>
            </div>
          </Card>

          <Card padded={false}>
            <Card.Header>
              <Card.Title>Клиент</Card.Title>
            </Card.Header>
            <div className="divide-y divide-line px-4">
              <InfoRow icon={UserRound} label="Имя">
                {order.customerName}
              </InfoRow>
              <InfoRow icon={Phone} label="Телефон">
                {order.customerPhone}
              </InfoRow>
              <InfoRow icon={MapPin} label="Адрес">
                {order.address || '—'}
              </InfoRow>
              {order.mapUrl && (
                <InfoRow icon={ExternalLink} label="Карта">
                  <a
                    href={order.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Открыть на карте
                  </a>
                </InfoRow>
              )}
              <InfoRow icon={Wrench} label="Услуга мастера">
                {money(order.serviceFee)}
                <span className="ml-1 text-[11px] text-subtle">(отдельно, в чек не входит)</span>
              </InfoRow>
            </div>
          </Card>

          {isActive && (
            <Card>
              <p className="mb-2 text-xs font-medium text-muted">Контрагент</p>
              {!customerChecked ? (
                <Spinner size="sm" />
              ) : customer ? (
                <p className="flex items-center gap-2 text-[13px] text-fg">
                  <UserRound className="size-3.5 text-success-soft-fg" />
                  {personName(customer)} · {customer.phone}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] text-muted">
                    Контрагента с таким телефоном ещё нет.
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="self-start"
                    onClick={() => setShowCreate(true)}
                  >
                    <UserPlus />
                    Создать контрагента
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card padded={false}>
            <Card.Header>
              <Card.Title>Товары</Card.Title>
              <span className="text-[11px] text-subtle">{items.length} поз.</span>
            </Card.Header>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-subtle">
                    <Package className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">{item.product.name}</p>
                    <p className="flex flex-wrap items-center gap-1 text-[11px] text-subtle">
                      {item.bulk && (
                        <Badge bg="warning" className="py-0 text-[10px]">
                          Оптом
                        </Badge>
                      )}
                      <span className={cn(item.short && isActive && 'text-danger-soft-fg')}>
                        на складе: {item.available} {item.product.unit}
                      </span>
                      {isActive && item.price !== item.currentPrice && (
                        <span className="text-warning-soft-fg">
                          · цена сейчас {item.currentPrice.toLocaleString('uz')}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-[13px] tabular-nums">
                    <span className="text-subtle">
                      {item.quantity} {item.product.unit} ×{' '}
                    </span>
                    <span className="font-semibold text-fg">{item.price.toLocaleString('uz')}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[13px]">
              <span className="text-muted">Сумма товаров</span>
              <span className="font-semibold tabular-nums text-fg">{money(order.itemsTotal)}</span>
            </div>
          </Card>

          {order.status === 'completed' && (
            <Alert variant="success">
              Заказ выдан{order.sale ? ` — продажа #${order.sale.id}` : ''}.
            </Alert>
          )}

          {isActive && (
            <div className="flex flex-wrap items-center gap-2">
              {(NEXT_ACTIONS[order.status] ?? []).map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  disabled={busy}
                  onClick={() => changeStatus(action.status)}
                >
                  {action.label}
                </Button>
              ))}
              <Button variant="primary" onClick={toSale} disabled={busy || !goTo}>
                <ShoppingBag />
                Оформить продажу
              </Button>
              <Button
                variant="outline-danger"
                className="ml-auto"
                disabled={busy}
                onClick={() => setConfirmCancel(true)}
              >
                Отменить заказ
              </Button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateCustomerModal
          order={order}
          onHide={() => setShowCreate(false)}
          onCreated={(created) => {
            setCustomer(created)
            setShowCreate(false)
          }}
        />
      )}

      <Modal show={confirmCancel} onHide={() => setConfirmCancel(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Отменить заказ?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Заказ #{order.id} будет отменён, мастер увидит этот статус.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmCancel(false)}>
            Назад
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmCancel(false)
              changeStatus('cancelled')
            }}
          >
            Отменить заказ
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

function MasterOrderScreen({ goTo }) {
  const [openId, setOpenId] = useState(null)

  const back = useCallback(() => setOpenId(null), [])

  return (
    <div>
      <PageHeader
        icon={HardHat}
        title="Заказы мастеров"
        description="Заявки от мастеров: подготовьте товар до их прихода и оформите продажу"
      />
      {openId === null ? (
        <MasterOrderList onOpen={setOpenId} />
      ) : (
        <MasterOrderDetail orderId={openId} onBack={back} goTo={goTo} />
      )}
    </div>
  )
}

export { MasterOrderScreen }
