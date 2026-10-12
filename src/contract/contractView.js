import { locale, t } from '../i18n'

/** Holat nomi va Badge ohangi. `review`/`closed` ga faqat submit/approve orqali o'tiladi. */
export const CONTRACT_STATUS = {
  draft: { label: t('Черновик'), tone: 'neutral' },
  signed: { label: t('Подписан'), tone: 'info' },
  active: { label: t('В исполнении'), tone: 'primary' },
  review: { label: t('На проверке'), tone: 'warning' },
  closed: { label: t('Закрыт'), tone: 'success' },
  cancelled: { label: t('Расторгнут'), tone: 'danger' },
}

export const statusOf = (key) => CONTRACT_STATUS[key] ?? { label: key, tone: 'neutral' }

/** Qo'lda tanlanadigan holatlar. */
export const MANUAL_STATUSES = ['draft', 'signed', 'active', 'cancelled']

export const CURRENCIES = ['UZS', 'USD']

const money = new Intl.NumberFormat(locale)

/** 1500000 + UZS -> "1 500 000 сум"; USD -> "5 000 USD". */
export function formatAmount(amount, currency = 'UZS') {
  const value = money.format(Number(amount) || 0)
  return currency === 'UZS' ? `${value} ${t('сум')}` : `${value} ${currency}`
}

/** Oddiy son (valyuta belgisisiz): 1500000 -> "1 500 000". */
export const formatNumber = (value) => money.format(Number(value) || 0)

export const customerName = (customer) =>
  customer ? `${customer.username ?? ''} ${customer.surname ?? ''}`.trim() : ''

const dateFormat = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })

/** "2026-10-15" -> mahalliy sana (vaqt mintaqasi siljishisiz). */
export function formatContractDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return dateFormat.format(new Date(year, month - 1, day))
}

/** Bugungi sana "YYYY-MM-DD" (brauzer vaqti). */
export function todayInput() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export const CONTRACT_EVENT_LABELS = {
  created: t('Договор создан'),
  status: t('Статус изменён'),
  submitted: t('Отправлен на проверку'),
  approved: t('Утверждён и закрыт'),
  rejected: t('Возвращён на доработку'),
  reopened: t('Открыт заново'),
  updated: t('Изменён'),
  payment: t('Оплата получена'),
  comment: t('Комментарий'),
  file_added: t('Файл добавлен'),
  file_removed: t('Файл удалён'),
}

/** Backend "Изменено: номер; сумма; ответственный: A → B" ni ruscha yozadi — ekranda tilga qarab. */
export function contractEventNote(event) {
  if (!event.note) return event.note

  // Savdodan avtomatik ochilgan: "Автоматически: продажа №12 по договору".
  const auto = event.note.match(/^Автоматически: продажа №(\d+) по договору$/)
  if (auto) return t('Автоматически: продажа №{id} по договору', { id: auto[1] })

  // "Оплата: 40 000 сум · izoh".
  if (event.type === 'payment') {
    return event.note.replace(/^Оплата:/, `${t('Оплата')}:`).replace(/ сум(?= |$)/, ` ${t('сум')}`)
  }

  if (event.type !== 'updated') return event.note
  const words = {
    номер: t('номер'),
    предмет: t('предмет'),
    контрагент: t('контрагент'),
    сумма: t('сумма'),
    валюта: t('валюта'),
    дата: t('дата'),
    ответственный: t('ответственный'),
    реквизиты: t('реквизиты'),
    организация: t('организация'),
    ИНН: 'ИНН',
    банк: t('банк'),
    МФО: 'МФО',
    'расчётный счёт': t('расчётный счёт'),
    адрес: t('адрес'),
    руководитель: t('руководитель'),
  }
  return event.note
    .replace(/^Изменено:\s*/, `${t('Изменено')}: `)
    .replace(
      /(номер|предмет|контрагент|сумма|валюта|дата|ответственный|реквизиты|организация|ИНН|банк|МФО|расчётный счёт|адрес|руководитель)/g,
      (word) => words[word] ?? word,
    )
}
