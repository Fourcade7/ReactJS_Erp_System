/**
 * Boshqa bo'limdan (masalan, mijoz kartochkasidan) "Продажа" bo'limida aniq bir savdoning tafsilotini ochish:
 * u yerda qarzni to'lash, qaytarish va h.k. mumkin. Bir martalik — Продажа ochilganda o'qiladi va tozalanadi.
 */
let pendingSaleId = null

export const setSaleHandoff = (saleId) => {
  pendingSaleId = saleId
}

export const peekSaleHandoff = () => pendingSaleId

export const clearSaleHandoff = () => {
  pendingSaleId = null
}
