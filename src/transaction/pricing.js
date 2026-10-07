/** Mahsulotning barcha omborlardagi umumiy qoldigʻi. */
export const stockOf = (product) =>
  product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0

/**
 * Savat qatorining birlik narxi: savatda qoʻlda oʻzgartirilgan boʻlsa —
 * `customPrice`, ulgurji belgilangan boʻlsa — `bulkPrice`. Mahsulotning
 * oʻz narxi oʻzgarmaydi.
 */
export const unitPrice = (item, priceField) =>
  item.customPrice != null ? item.customPrice : item.checkPrice ? item.bulkPrice : item[priceField]

/** Qoʻlda oʻzgartirilgan narxning odatiy narxdan farqi (manfiy — arzonroq); oʻzgartirilmagan boʻlsa 0. */
export const priceChange = (item, priceField) =>
  item.customPrice != null ? item.customPrice - item[priceField] : 0
