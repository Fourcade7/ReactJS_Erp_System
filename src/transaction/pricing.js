/** Mahsulotning barcha omborlardagi umumiy qoldigʻi. */
export const stockOf = (product) =>
  product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0

/** Savat qatorining birlik narxi: ulgurji belgilangan boʻlsa — `bulkPrice`. */
export const unitPrice = (item, priceField) =>
  item.checkPrice ? item.bulkPrice : item[priceField]
