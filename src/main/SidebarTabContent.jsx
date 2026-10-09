import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownLeft,
  Banknote,
  BarChart3,
  Boxes,
  HardHat,
  LayoutDashboard,
  Package,
  PlugZap,
  ReceiptText,
  ShoppingBag,
  Tags,
  Undo2,
  UserRound,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { cn } from '../lib/cn'
import UserScreen from '../users/UserContent'
import HomeScreen from '../home/HomeContent'
import CustomerScreen from '../customers/CustomerContent'
import WareHouseScreen from '../warehouse/WarehouseContent'
import CategoryScreen from '../category/CategoryContent'
import ProductScreen from '../product/ProductContent'
import StockScreen from '../stock/StockContent'
import PurchaseScreen from '../purchase/PurchaseContent'
import { SaleScreen } from '../sale/SaleContent'
import ReturnScreen from '../return/ReturnContent'
import PaymentScreen from '../payment/PaymentContent'
import { IntegrationScreen } from '../integration/IntegrationContent'
import { MasterOrderScreen } from '../masterorder/MasterOrderContent'
import { getNewMasterOrderCount } from '../masterorder/MasterOrderApi'
import { ExpenseScreen } from '../expense/ExpenseContent'

/**
 * Menyu tuzilmasi. `key` qiymatlari eski `eventKey` lar bilan bir xil saqlangan,
 * shu bois localStorage dagi `activeTab` oldingidek ishlaydi.
 * `adminOnly` — "User" rolida bloklanadigan boʻlimlar.
 */
const NAV_GROUPS = [
  {
    label: 'Обзор',
    items: [
      { key: 'first', label: 'Главная страница', Icon: LayoutDashboard, adminOnly: true },
      // Alohida sahifa (/dashboard) — tab emas, o'tish.
      { key: 'dashboard', label: 'Дашборд', Icon: BarChart3, adminOnly: true, href: '/dashboard' },
    ],
  },
  {
    label: 'Справочники',
    items: [
      { key: 'second', label: 'Сотрудники', Icon: UserRound, adminOnly: true },
      { key: 'thrid', label: 'Клиенты', Icon: Users, adminOnly: true },
      { key: 'fourth', label: 'Склад', Icon: Warehouse, adminOnly: true },
      { key: 'fifth', label: 'Категория', Icon: Tags },
      { key: 'seventh', label: 'Продукты', Icon: Package },
      { key: 'eighth', label: 'Остатки', Icon: Boxes, adminOnly: true },
    ],
  },
  {
    label: 'Операции',
    items: [
      { key: 'nineth', label: 'Приход', Icon: ArrowDownLeft, adminOnly: true },
      { key: 'teenth', label: 'Продажа', Icon: ShoppingBag },
      { key: 'masters', label: 'Заказы мастеров', Icon: HardHat, badgeKey: 'newMasterOrders' },
      { key: 'elevn', label: 'Возврат', Icon: Undo2 },
      { key: 'twelw', label: 'Платеж', Icon: Banknote, adminOnly: true },
      { key: 'expenses', label: 'Расходы', Icon: ReceiptText, adminOnly: true },
    ],
  },
  {
    label: 'Система',
    items: [{ key: 'integration', label: 'Интеграция', Icon: PlugZap, adminOnly: true }],
  },
]

const SCREENS = {
  first: HomeScreen,
  second: UserScreen,
  thrid: CustomerScreen,
  fourth: WareHouseScreen,
  fifth: CategoryScreen,
  seventh: ProductScreen,
  eighth: StockScreen,
  nineth: PurchaseScreen,
  teenth: SaleScreen,
  masters: MasterOrderScreen,
  elevn: ReturnScreen,
  twelw: PaymentScreen,
  expenses: ExpenseScreen,
  integration: IntegrationScreen,
}

function readInitialTab() {
  const role = localStorage.getItem('role')
  const saved = localStorage.getItem('activeTab')

  if (role === 'User') return saved && saved !== 'first' ? saved : 'teenth'
  return saved || 'first'
}

function NavButton({ item, active, disabled, onSelect, badge = 0 }) {
  const { Icon, label } = item
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.key)}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-35',
        active
          ? 'bg-primary-soft text-primary-soft-fg'
          : 'text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-subtle')} />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold tabular-nums leading-5 text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

/**
 * Chap menyu va unga bogʻlangan ekran. Katta ekranda yopishqoq ustun,
 * kichik ekranda esa chapdan chiquvchi panel (drawer) koʻrinishida ishlaydi.
 */
function LeftTab({ mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(readInitialTab)
  const isUser = localStorage.getItem('role') === 'User'
  const [newMasterOrders, setNewMasterOrders] = useState(0)

  // Socketsiz: yangi zakazlar sonini vaqti-vaqti bilan so'raymiz.
  useEffect(() => {
    let stale = false
    const refresh = () =>
      getNewMasterOrderCount()
        .then((count) => {
          if (!stale) setNewMasterOrders(count)
        })
        .catch(() => {})
    refresh()
    const timer = setInterval(refresh, 30000)
    return () => {
      stale = true
      clearInterval(timer)
    }
  }, [])

  const select = (key) => {
    const href = NAV_GROUPS.flatMap((group) => group.items).find((item) => item.key === key)?.href
    if (href) {
      navigate(href)
      return
    }
    setActiveTab(key)
    localStorage.setItem('activeTab', key)
    onCloseMobile?.()
  }

  // Drawer ochiq turganda orqa fonni skroll qilmaslik.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const ActiveScreen = useMemo(() => SCREENS[activeTab] ?? HomeScreen, [activeTab])

  const nav = (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeTab === item.key}
              disabled={item.adminOnly && isUser}
              onSelect={select}
              badge={item.badgeKey === 'newMasterOrders' ? newMasterOrders : 0}
            />
          ))}
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobil qoplama */}
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[1040] bg-overlay backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Mobil panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[1050] w-64 overflow-y-auto border-r border-line bg-surface p-4 shadow-pop',
          'transition-transform duration-250 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Навигация
          </p>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Закрыть меню"
            className="inline-flex size-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
        {nav}
      </aside>

      <div className="flex w-full gap-6">
        {/* Doimiy ustun — faqat katta ekranlarda */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-5 pr-1 lg:block">
          {nav}
        </aside>

        <main key={activeTab} className="min-w-0 flex-1 animate-fade-in py-5">
          <ActiveScreen goTo={select} />
        </main>
      </div>
    </>
  )
}

export default LeftTab
