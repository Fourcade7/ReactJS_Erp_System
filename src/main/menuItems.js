import { useSyncExternalStore } from 'react'
import {
  ArrowDownLeft,
  Banknote,
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
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
} from 'lucide-react'
import { t } from '../i18n'

/**
 * Menyu tuzilmasi. `key` qiymatlari eski `eventKey` lar bilan bir xil saqlangan,
 * shu bois saqlangan `activeTab` oldingidek ishlaydi.
 * Kimga qaysi bo'lim standart bo'yicha ko'rinishi `DEFAULT_ACCESS` da; administrator
 * "Настройки" da istalgan rolga o'zgartirishi mumkin.
 */
export const NAV_GROUPS = [
  {
    label: t('Обзор'),
    items: [
      // Asosiy bo'lim: menyuning eng tepasida, tizimga kirganda shu ochiladi.
      { key: 'tasks', label: t('Задачи'), Icon: ClipboardList },
      { key: 'first', label: t('Главная страница'), Icon: LayoutDashboard },
      // O'z manzili bor (/dashboard — filtrlar URL da saqlanadi), lekin sidebar bilan shu qobiqda ochiladi.
      { key: 'dashboard', label: t('Дашборд'), Icon: BarChart3, href: '/dashboard' },
    ],
  },
  {
    label: t('Справочники'),
    items: [
      { key: 'second', label: t('Сотрудники'), Icon: UserRound },
      { key: 'thrid', label: t('Клиенты'), Icon: Users },
      { key: 'fourth', label: t('Склад'), Icon: Warehouse },
      { key: 'fifth', label: t('Категория'), Icon: Tags },
      { key: 'seventh', label: t('Продукты'), Icon: Package },
      { key: 'eighth', label: t('Остатки'), Icon: Boxes },
    ],
  },
  {
    label: t('Операции'),
    items: [
      { key: 'nineth', label: t('Приход'), Icon: ArrowDownLeft },
      { key: 'teenth', label: t('Продажа'), Icon: ShoppingBag },
      { key: 'contracts', label: t('Договоры'), Icon: FileText },
      { key: 'masters', label: t('Заказы мастеров'), Icon: HardHat, badgeKey: 'newMasterOrders' },
      { key: 'elevn', label: t('Возврат'), Icon: Undo2 },
      { key: 'twelw', label: t('Платеж'), Icon: Banknote },
      { key: 'expenses', label: t('Расходы'), Icon: ReceiptText },
    ],
  },
  {
    label: t('Система'),
    items: [{ key: 'integration', label: t('Интеграция'), Icon: PlugZap }],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

/**
 * Ochiq bo'lim faqat joriy sessiyada eslanadi (sessionStorage): sahifani yangilash uni saqlaydi,
 * lekin har yangi kirishda (login, ilovani qayta ochish) asosiy bo'lim — "Задачи" — ochiladi.
 * Sidebar ham, navbar dagi tezkor tugma ham shu bitta qiymatni o'qiydi va o'zgartiradi (`useActiveTab`).
 */
const ACTIVE_TAB_KEY = 'activeTab'
/** Savdo bo'limi — navbar dagi tezkor "Продажа" tugmasi shu yerga qaytaradi. */
export const SALES_TAB = 'teenth'

// sessionStorage bo'lmasa (bloklangan) — qiymat shu yerda, sahifa ochiq turguncha.
let memoryTab = null
const listeners = new Set()

export function readActiveTab() {
  try {
    return sessionStorage.getItem(ACTIVE_TAB_KEY)
  } catch {
    return memoryTab
  }
}

function writeActiveTab(key) {
  memoryTab = key
  try {
    if (key === null) sessionStorage.removeItem(ACTIVE_TAB_KEY)
    else sessionStorage.setItem(ACTIVE_TAB_KEY, key)
  } catch {
    // sessionStorage mavjud emas — bo'lim faqat xotirada turadi.
  }
  listeners.forEach((listener) => listener())
}

export function saveActiveTab(key) {
  writeActiveTab(key)
}

export function resetActiveTab() {
  writeActiveTab(null)
  try {
    // Eski versiyalar bo'limni localStorage da doimiy saqlagan — endi kerak emas.
    localStorage.removeItem(ACTIVE_TAB_KEY)
  } catch {
    // Saqlash joyi mavjud emas — tozalanadigan narsa yo'q.
  }
}

const subscribeActiveTab = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Saqlangan ochiq bo'lim (yo'q bo'lsa `null`); `saveActiveTab` chaqirilsa hamma joyda yangilanadi. */
export function useActiveTab() {
  return useSyncExternalStore(subscribeActiveTab, readActiveTab)
}

/**
 * Menyusi sozlanadigan rollar (administrator doim hamma bo'limni ko'radi).
 * Kalitlar backend `MENU_ROLES` bilan bir xil bo'lishi shart.
 */
export const ACCESS_ROLES = [
  { key: 'user', name: 'User', hint: t('продавец / кассир') },
  { key: 'accountant', name: 'Accountant', hint: t('бухгалтер') },
  { key: 'master', name: 'Master', hint: t('мастер') },
]

/** Rol matni -> `admin` yoki `ACCESS_ROLES` kaliti. Noma'lum rol cheklangan `user` kabi ishlaydi. */
export function roleKey(role) {
  const key = (role || '').trim().toLowerCase()
  if (key === 'admin') return 'admin'
  return ACCESS_ROLES.some((item) => item.key === key) ? key : 'user'
}

/**
 * Sozlama berilmagan bo'lim kimga ko'rinadi (standart). Admin — hammasi; ro'yxatda yo'q bo'lim
 * (masalan, keyin qo'shilgan yangisi) admin bo'lmaganlarga yopiq turadi.
 *  - User (kassir): Продажа, Возврат, Задачи;
 *  - Accountant (buxgalter): Задачи va Договоры (faqat o'ziga tegishlilari — server cheklaydi);
 *  - Master (usta): faqat Задачи.
 */
export const DEFAULT_ACCESS = {
  user: ['teenth', 'elevn', 'tasks'],
  accountant: ['tasks', 'contracts'],
  master: ['tasks'],
}

export function defaultVisible(role, item) {
  if (role === 'admin') return true
  return DEFAULT_ACCESS[role]?.includes(item.key) ?? false
}

/**
 * Bo'lim shu rolga ko'rinadimi: administrator belgilagan qiymat (`overrides[rol][kalit]`),
 * bo'lmasa — standart. Administrator uchun doim `true` (o'zini qulflab qo'ymasligi uchun).
 */
export function isVisible(role, item, overrides) {
  if (role === 'admin') return true
  const custom = overrides?.[role]?.[item.key]
  return typeof custom === 'boolean' ? custom : defaultVisible(role, item)
}

/** Rol uchun ko'rinadigan guruhlar (bo'sh guruhlar tashlanadi). */
export function visibleGroups(role, overrides) {
  return NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => isVisible(role, item, overrides)) }))
    .filter((group) => group.items.length > 0)
}
