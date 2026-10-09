/**
 * GitHub uslubidagi yillik to'r: ustunlar — haftalar (dushanbadan), qatorlar — Пн..Вс.
 * Birinchi ustun 1-yanvar tushgan haftaning dushanbasidan, oxirgisi 31-dekabr haftasining
 * yakshanbasigacha. Yilga tegishli bo'lmagan kataklar `inYear: false`.
 */
const DAY = 86_400_000

const iso = (ms) => new Date(ms).toISOString().slice(0, 10)
/** 1 = dushanba … 7 = yakshanba */
const isoWeekday = (ms) => ((new Date(ms).getUTCDay() + 6) % 7) + 1

export const MONTH_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function buildYearGrid(year) {
  const jan1 = Date.UTC(year, 0, 1)
  const dec31 = Date.UTC(year, 11, 31)
  const start = jan1 - (isoWeekday(jan1) - 1) * DAY
  const end = dec31 + (7 - isoWeekday(dec31)) * DAY
  const weekCount = Math.round((end - start) / DAY + 1) / 7

  const weeks = Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const ms = start + (w * 7 + d) * DAY
      return { date: iso(ms), inYear: new Date(ms).getUTCFullYear() === year }
    }),
  )

  // Oy nomi — oyning 1-kuni tushgan hafta ustunida.
  const months = MONTH_LABELS.map((label, m) => ({
    label,
    column: Math.floor((Date.UTC(year, m, 1) - start) / DAY / 7),
  }))

  return { weeks, months }
}

/**
 * Nolga teng bo'lmagan qiymatlarni kvartillar bo'yicha 1..4 darajaga bo'ladi (GitHub kabi):
 * bitta katta kun qolganlarini "o'chirib" qo'ymaydi. 0 — faollik yo'q.
 */
export function levelScale(values) {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b)
  if (!sorted.length) return () => 0
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
  const thresholds = [q(0.25), q(0.5), q(0.75)]
  const max = sorted[sorted.length - 1]
  return (value) => {
    if (!(value > 0)) return 0
    // Eng faol kun doim eng to'q — qiymatlar kam yoki bir xil bo'lsa ham.
    if (value >= max) return 4
    return 1 + thresholds.filter((t) => value > t).length
  }
}
