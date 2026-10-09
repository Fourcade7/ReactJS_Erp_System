import { locale, t } from '../i18n'

/** Davr va qadam hisobi. Sanalar — "YYYY-MM-DD" satrlari, vaqt mintaqasiz (backend biznes mintaqasida o'qiydi). */

export const GRANULARITIES = [
  { key: 'day', label: t('День'), days: 1 },
  { key: 'week', label: t('Неделя'), days: 7 },
  { key: 'month', label: t('Месяц'), days: 28 },
  { key: 'year', label: t('Год'), days: 365 },
]

/** Backend bilan bir xil chegara (stats.service MAX_BUCKETS). */
const MAX_BUCKETS = 800

export const shiftDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export const daysBetween = (from, to) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1

const monthStart = (date) => `${date.slice(0, 7)}-01`

const addMonths = (date, n) => {
  const d = new Date(`${monthStart(date)}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + n)
  return d.toISOString().slice(0, 10)
}

export const isValidDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value

export function granularityAllowed(key, from, to) {
  const g = GRANULARITIES.find((item) => item.key === key)
  return Boolean(g) && daysBetween(from, to) / g.days <= MAX_BUCKETS
}

/** Davr uzunligiga qarab o'qiladigan qadam: oy ichida — kun, chorakgacha — hafta, bir necha yil — oy. */
export function autoGranularity(from, to) {
  const days = daysBetween(from, to)
  if (days <= 62) return 'day'
  if (days <= 200) return 'week'
  if (days <= 1100) return 'month'
  return 'year'
}

/** Tayyor davrlar `today` (backend aytgan biznes sanasi) dan hisoblanadi. */
export const PRESETS = [
  { key: '7d', label: t('7 дней'), range: (today) => [shiftDays(today, -6), today] },
  { key: '30d', label: t('30 дней'), range: (today) => [shiftDays(today, -29), today] },
  { key: 'month', label: t('Этот месяц'), range: (today) => [monthStart(today), today] },
  { key: 'prev-month', label: t('Прошлый месяц'), range: (today) => [addMonths(today, -1), shiftDays(monthStart(today), -1)] },
  { key: '90d', label: t('90 дней'), range: (today) => [shiftDays(today, -89), today] },
  { key: 'year', label: t('Этот год'), range: (today) => [`${today.slice(0, 4)}-01-01`, today] },
  { key: '12m', label: t('12 месяцев'), range: (today) => [addMonths(today, -11), today] },
]

const fmt = (date, options) => new Date(`${date}T00:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', ...options })

const MONTHS_SHORT = [t('янв'), t('фев'), t('мар'), t('апр'), t('май'), t('июн'), t('июл'), t('авг'), t('сен'), t('окт'), t('ноя'), t('дек')]

/** O'q belgisi (qisqa): "09.10", "окт 26", "2026". */
export function bucketTick(bucket, granularity) {
  if (granularity === 'year') return bucket.slice(0, 4)
  if (granularity === 'month') return `${MONTHS_SHORT[Number(bucket.slice(5, 7)) - 1]} ${bucket.slice(2, 4)}`
  return fmt(bucket, { day: '2-digit', month: '2-digit' })
}

/** Tooltip va jadval uchun to'liq nom. */
export function bucketLabel(bucket, granularity) {
  if (granularity === 'year') return t('{year} год', { year: bucket.slice(0, 4) })
  if (granularity === 'month') {
    const label = fmt(bucket, { month: 'long', year: 'numeric' }).replace(' г.', '').replace(',', '')
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  if (granularity === 'week') return t('Неделя с {date}', { date: fmt(bucket, { day: '2-digit', month: '2-digit', year: 'numeric' }) })
  return fmt(bucket, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatDate = (date) => fmt(date, { day: '2-digit', month: '2-digit', year: 'numeric' })

/** O'zgarish foizi; oldingi qiymat 0 bo'lsa — null (foiz ma'nosiz). */
export function percentChange(current, previous) {
  if (!previous) return null
  return ((current - previous) / Math.abs(previous)) * 100
}
