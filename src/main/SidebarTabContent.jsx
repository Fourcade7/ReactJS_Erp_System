import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { EmptyState } from '../ui'
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
import { TaskScreen } from '../task/TaskContent'
import { ContractScreen } from '../contract/ContractContent'
import DashboardScreen from '../dashboard/DashboardScreen'
import { useMenuAccess } from './menuAccess'
import { NAV_ITEMS, roleKey, saveActiveTab, useActiveTab, visibleGroups } from './menuItems'
import { t } from '../i18n'

const SCREENS = {
  first: HomeScreen,
  dashboard: DashboardScreen,
  second: UserScreen,
  thrid: CustomerScreen,
  fourth: WareHouseScreen,
  fifth: CategoryScreen,
  seventh: ProductScreen,
  eighth: StockScreen,
  nineth: PurchaseScreen,
  teenth: SaleScreen,
  tasks: TaskScreen,
  contracts: ContractScreen,
  masters: MasterOrderScreen,
  elevn: ReturnScreen,
  twelw: PaymentScreen,
  expenses: ExpenseScreen,
  integration: IntegrationScreen,
}

/**
 * Rolga ruxsat etilgan bo'limlar orasidan ochiladigani: saqlangan, bo'lmasa odatdagi
 * (asosiysi — "Задачи"), bo'lmasa birinchisi.
 */
function pickTab(saved, allowed) {
  if (saved && allowed.includes(saved)) return saved
  return ['tasks', 'first', 'teenth'].find((key) => allowed.includes(key)) ?? allowed[0] ?? null
}

function NavButton({ item, active, onSelect, badge = 0 }) {
  const { Icon, label } = item
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.key)}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
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
 *
 * Qaysi bo'lim kimga ko'rinishini administrator "Настройки" da belgilaydi; ko'rinmaydigan
 * bo'lim menyudan butunlay olib tashlanadi (administrator hammasini ko'radi).
 */
function LeftTab({ mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = roleKey(localStorage.getItem('role'))
  const { overrides } = useMenuAccess({ poll: true })
  // Navbar dagi tezkor "Продажа" tugmasi ham shu qiymatni o'zgartiradi — sidebar darrov ergashadi.
  const savedTab = useActiveTab()
  const [newMasterOrders, setNewMasterOrders] = useState(0)

  const groups = useMemo(() => visibleGroups(role, overrides), [role, overrides])
  // O'z manzili bor bo'limlar (href) saqlanadigan "ochiq tab" bo'lmaydi — ular manzildan aniqlanadi.
  const tabKeys = useMemo(
    () => groups.flatMap((group) => group.items).filter((item) => !item.href).map((item) => item.key),
    [groups],
  )
  const routeTab = NAV_ITEMS.find((item) => item.href === pathname)?.key
  const activeTab = routeTab ?? pickTab(savedTab, tabKeys)

  // Socketsiz: yangi zakazlar sonini vaqti-vaqti bilan so'raymiz (bo'lim ko'rinmasa — so'ramaymiz).
  const mastersVisible = tabKeys.includes('masters')
  useEffect(() => {
    if (!mastersVisible) return undefined
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
  }, [mastersVisible])

  const select = (key) => {
    onCloseMobile?.()
    const href = NAV_ITEMS.find((item) => item.key === key)?.href
    if (href) {
      if (pathname !== href) navigate(href)
      return
    }
    saveActiveTab(key)
    // Masalan, /dashboard dan oddiy bo'limga — tablar /home da ochiladi.
    if (pathname !== '/home') navigate('/home')
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

  const ActiveScreen = activeTab ? (SCREENS[activeTab] ?? HomeScreen) : null

  const nav = (
    <nav className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeTab === item.key}
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
            {t('Навигация')}
          </p>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t('Закрыть меню')}
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

        <main key={activeTab ?? 'none'} className="min-w-0 flex-1 animate-fade-in py-5">
          {ActiveScreen ? (
            <ActiveScreen goTo={select} />
          ) : (
            <EmptyState
              icon={LockKeyhole}
              title={t('Нет доступных разделов')}
              description={t('Администратор ещё не открыл вам ни одного раздела. Обратитесь к нему.')}
            />
          )}
        </main>
      </div>
    </>
  )
}

export default LeftTab
