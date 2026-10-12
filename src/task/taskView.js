import { locale, t } from '../i18n'

/** Joriy foydalanuvchi (autentifikatsiya qo'shilguncha localStorage dan). */
export const currentUserId = () => Number(localStorage.getItem('userid')) || 0
export const isAdmin = () => (localStorage.getItem('role') || '').toLowerCase() === 'admin'

/** Vazifaga kontragent (mijoz) biriktira oladiganlar: buxgalter va admin (server ham tekshiradi). */
export const canAttachCustomer = () =>
  ['admin', 'accountant'].includes((localStorage.getItem('role') || '').trim().toLowerCase())

export const PRIORITIES = [
  { key: 'low', label: t('Низкий'), tone: 'neutral' },
  { key: 'normal', label: t('Обычный'), tone: 'info' },
  { key: 'high', label: t('Высокий'), tone: 'danger' },
]
export const priorityOf = (key) => PRIORITIES.find((item) => item.key === key) ?? PRIORITIES[1]

/** Etap rangi (backend `color`) -> doska ustuni sarlavhasi va nuqta sinflari. */
export const STAGE_STYLES = {
  neutral: { dot: 'bg-subtle', bar: 'border-t-line-strong' },
  info: { dot: 'bg-info', bar: 'border-t-info' },
  primary: { dot: 'bg-primary', bar: 'border-t-primary' },
  success: { dot: 'bg-success', bar: 'border-t-success' },
  warning: { dot: 'bg-warning', bar: 'border-t-warning' },
  danger: { dot: 'bg-danger', bar: 'border-t-danger' },
}
export const stageStyle = (color) => STAGE_STYLES[color] ?? STAGE_STYLES.neutral

export const STAGE_COLORS = [
  { key: 'neutral', label: t('Серый') },
  { key: 'info', label: t('Голубой') },
  { key: 'primary', label: t('Синий') },
  { key: 'success', label: t('Зелёный') },
  { key: 'warning', label: t('Жёлтый') },
  { key: 'danger', label: t('Красный') },
]

export const EVENT_LABELS = {
  created: t('Задача создана'),
  moved: t('Перенесена'),
  submitted: t('Отправлена на проверку'),
  approved: t('Утверждена'),
  rejected: t('Возвращена на доработку'),
  reopened: t('Открыта заново'),
  updated: t('Изменена'),
  comment: t('Комментарий'),
  file_added: t('Файл добавлен'),
  file_removed: t('Файл удалён'),
}

/** Backend "Изменено: название; срок; ответственный: A → B" ni ruscha yozadi — ekranda tilga qarab. */
export function eventNote(event) {
  // "По договору" savdosidan avtomatik ochilgan vazifa (tizim yozadi).
  if (event.note === 'Автоматически: продажа по договору') return t('Автоматически: продажа по договору')
  if (event.type !== 'updated' || !event.note) return event.note
  const words = {
    название: t('название'),
    описание: t('описание'),
    приоритет: t('приоритет'),
    срок: t('срок'),
    участники: t('участники'),
    ответственный: t('ответственный'),
    договор: t('договор'),
    контрагент: t('контрагент'),
  }
  return event.note
    .replace(/^Изменено:\s*/, `${t('Изменено')}: `)
    .replace(/(название|описание|приоритет|срок|участники|ответственный|договор|контрагент)/g, (word) => words[word] ?? word)
}

export const fullName = (user) => (user ? `${user.username ?? ''} ${user.surname ?? ''}`.trim() : '')

export const initials = (user) =>
  user ? `${(user.username ?? '').charAt(0)}${(user.surname ?? '').charAt(0)}`.toUpperCase() || '?' : '?'

const dateTime = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const shortDateTime = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export const formatDateTime = (value) => (value ? dateTime.format(new Date(value)) : '')
export const formatShortDateTime = (value) => (value ? shortDateTime.format(new Date(value)) : '')

/** ISO -> <input type="datetime-local"> qiymati (mahalliy vaqt). */
export function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** <input type="datetime-local"> -> ISO (yoki null). */
export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)

/** Muddatgacha 24 soatdan kam qolgan va hali o'tmagan. */
export function dueSoon(task, now = Date.now()) {
  if (!task.dueDate || task.state !== 'open') return false
  const left = new Date(task.dueDate).getTime() - now
  return left > 0 && left < 24 * 3_600_000
}

const ROLE_LABELS = {
  admin: t('Администратор'),
  user: t('Сотрудник'),
  accountant: t('Бухгалтер'),
}

/** "Accountant" -> "Бухгалтер" / "Buxgalter"; noma'lum rol o'zgarishsiz. */
export const roleLabel = (role) => ROLE_LABELS[(role || '').toLowerCase()] ?? role ?? ''
