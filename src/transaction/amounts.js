/**
 * Operatsiya (savdo, kirim, qaytarish) summalari — ro'yxatlarda "0 So'm" o'rniga to'liq ma'lumot ko'rsatish uchun:
 *  - `net` — asosiy summa (jami − chegirma);
 *  - `paid` — to'langan (to'lovlar yig'indisi; «Зачёт возврата» ham to'lov hisoblanadi);
 *  - `remaining` — qarz (hech qachon manfiy emas).
 * Hisob statistika va tafsilot sahifasi bilan bir xil.
 */
export function amountsOf(record) {
  const paid = (record.payments ?? []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const net = Number(record.total || 0) - Number(record.discount || 0)
  const remaining = Math.max(0, net - paid)
  return { net, paid, remaining, inDebt: remaining > 0 }
}

/**
 * Savdo qatorining to'lanmagan miqdori: sotilgan − qaytarilgan − alohida shu tovar uchun to'langan
 * ("310 metrdan 10 metri uchun to'landi" → 300). Qatorda `returned` / `paid` bo'lmasa — 0 deb olinadi.
 */
export const unpaidQty = (item) =>
  Math.max(0, Math.round((Number(item.quantity) - Number(item.returned ?? 0) - Number(item.paid ?? 0)) * 1000) / 1000)
