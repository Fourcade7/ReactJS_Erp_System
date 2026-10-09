/**
 * "Заказы мастеров" bo'limidan "Продажа" bo'limiga zakazni uzatish: savat,
 * kontragent va yakunlanadigan zakaz id si. Bir martalik — Продажа ochilganda o'qiladi va tozalanadi.
 */
let pending = null

export const setMasterOrderHandoff = (payload) => {
  pending = payload
}

export const peekMasterOrderHandoff = () => pending

export const clearMasterOrderHandoff = () => {
  pending = null
}
