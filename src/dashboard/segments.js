/** Donut uchun eng ko'pi 5 ta rangli segment; qolganlari bitta kulrang "Другие" ga yig'iladi. */
export const MAX_COLORED = 5

/**
 * @param rows      [{ key, label, value }]
 * @param total     butun qiymat (masalan, davr tushumi) — "Другие" shundan qolgan qism,
 *                  shuning uchun backend ro'yxatni cheklasa ham ulushlar to'g'ri chiqadi
 * @param order     ixtiyoriy kanonik tartib (to'lov usullari): rangli segmentlar shu tartibda
 *                  joylashadi va ranglar shu tartibda beriladi — usul o'z rangini saqlaydi
 */
export function toSegments(rows, { total, order } = {}) {
  const positive = rows.filter((row) => row.value > 0).sort((a, b) => b.value - a.value)
  const colored = positive.slice(0, MAX_COLORED)
  const folded = positive.slice(MAX_COLORED)

  if (order) {
    const rank = (key) => {
      const i = order.indexOf(key)
      return i === -1 ? order.length : i
    }
    colored.sort((a, b) => rank(a.key) - rank(b.key) || b.value - a.value)
  }

  const sum = (list) => list.reduce((acc, row) => acc + row.value, 0)
  const rowsSum = sum(positive)
  // Ro'yxatga sig'magan qism (backend ro'yxatni cheklagan). Har qator 0.5 so'mgacha yaxlitlangani
  // uchun shu darajadagi farq — shovqin, alohida segment bo'lmaydi.
  let remainder = (total ?? 0) - rowsSum
  if (remainder <= Math.max(1, positive.length)) remainder = 0

  const members = remainder > 0 ? [...folded, { key: '__rest__', label: 'Прочие', value: remainder }] : folded
  const segments = colored.map((row, index) => ({ ...row, slot: index }))
  if (members.length === 1 && folded.length === 1) {
    // Bitta ortiqcha nom uchun "Другие" yaratmaymiz — o'z nomi bilan, kulrangda.
    segments.push({ ...folded[0], slot: null, members: [] })
  } else if (members.length) {
    segments.push({
      key: '__other__',
      label: folded.length ? 'Другие' : 'Прочее',
      value: sum(members),
      slot: null,
      members: folded.length ? members : [],
    })
  }
  return { segments, total: rowsSum + remainder }
}

export const share = (value, total) => (total > 0 ? (value / total) * 100 : 0)

export const formatShare = (value, total) => {
  const pct = share(value, total)
  if (pct > 0 && pct < 0.1) return '<0,1%'
  return `${pct.toLocaleString('ru-RU', { maximumFractionDigits: pct < 10 ? 1 : 0 })}%`
}
