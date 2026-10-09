import { lang, locale, t } from '../i18n'

/** Pul: 1096250 -> "1 096 250". */
export const formatMoney = (value) => Math.round(Number(value) || 0).toLocaleString(locale)

/** O'qlar va ixcham kartalar uchun: 1 250 000 -> "1,3 млн" / "1,3 mln". */
export function formatCompact(value) {
  const n = Number(value) || 0
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('млрд')}`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('млн')}`
  if (abs >= 1_000) return `${(n / 1_000).toLocaleString(locale, { maximumFractionDigits: 0 })} ${t('тыс')}`
  return n.toLocaleString(locale)
}

/**
 * Ko'plik: plural(1, ['продажа', 'продажи', 'продаж']) -> "1 продажа",
 * 3 -> "3 продажи", 5 / 11 / 12 -> "… продаж", 21 -> "21 продажа".
 * Oʻzbek tilida ko'plik shakli yo'q ("5 sotuv"), shuning uchun lug'atdan oxirgi
 * (`many`) shaklning tarjimasi olinadi.
 */
export function plural(n, [one, few, many]) {
  const count = Number(n).toLocaleString(locale)
  if (lang === 'uz') return `${count} ${t(many)}`
  const abs = Math.abs(n) % 100
  const last = abs % 10
  const word = abs > 10 && abs < 20 ? many : last === 1 ? one : last >= 2 && last <= 4 ? few : many
  return `${count} ${word}`
}

export const SALES = ['продажа', 'продажи', 'продаж']
export const RECORDS = ['запись', 'записи', 'записей']

/** "2026-10" -> "Октябрь 2026" / "Oktabr 2026". */
export function formatMonth(month) {
  if (!month) return ''
  const [y, m] = month.split('-').map(Number)
  const label = new Date(Date.UTC(y, m - 1, 1))
    .toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .replace(' г.', '')
    .replace(',', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Joriy oy "YYYY-MM" (brauzer vaqti bo'yicha). */
export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Faqat raqamlar: "1 250 000 сум" -> 1250000; bo'sh bo'lsa null. */
export function parseAmount(text) {
  const digits = `${text ?? ''}`.replace(/\D/g, '')
  return digits ? Number(digits) : null
}
