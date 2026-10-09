/** Miqdor metr/kg kabi o'nli birliklarda ham bo'ladi (bazada 3 xonagacha). */
export const roundQty = (value) => Math.round(Number(value) * 1000) / 1000

/**
 * Kiritilgan matnni miqdorga aylantiradi ("12,5" ham, "12.5" ham). Noto'g'ri,
 * nol yoki 3 xonadan ortiq bo'lsa — `null`.
 */
export function parseQty(text) {
  const normalized = `${text ?? ''}`.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return null
  const value = Number(normalized)
  return value > 0 ? value : null
}
