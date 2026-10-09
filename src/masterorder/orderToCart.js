/**
 * Zakaz qatorlarini "Продажа" savatining qatorlariga aylantiradi.
 * Ustaning ko'rgan (zakazdagi) narxi saqlanadi: hozirgi narxdan farq qilsa —
 * savatda `customPrice` sifatida, ya'ni "o'zgartirilgan narx" bo'lib ko'rinadi.
 */
export function orderToCart(order) {
  return order.items.map((item) => {
    const bulk = item.priceType === 'bulk'
    const currentPrice = bulk ? item.product.bulkPrice : item.product.buyPrice
    return {
      ...item.product,
      quantity: item.quantity,
      checkPrice: bulk,
      ...(item.price !== currentPrice ? { customPrice: item.price } : {}),
    }
  })
}
