import { Banknote, CreditCard, Landmark } from 'lucide-react'

/**
 * Mijoz balansi bilan bog'liq to'lov usullari — backenddagi `payment-methods.ts` bilan bir xil yozilishi shart
 * (bazaga ruscha qiymat yoziladi, ekranda `td()` bilan tarjima qilinadi).
 */

/** Savdo (yoki savdo qarzi) mijoz balansidan to'landi. */
export const BALANCE_PAY_METHOD = 'С баланса'

/** Qaytarish summasi naqd berilmay, mijoz balansiga yozildi. */
export const BALANCE_REFUND_METHOD = 'На баланс'

/** Balansga pul kiritish / balansdan pul qaytarishda tanlanadigan usullar. */
export const BALANCE_CASH_METHODS = [
  { value: 'Наличные', Icon: Banknote },
  { value: 'Банковская карта', Icon: CreditCard },
  { value: 'Click', Icon: CreditCard },
  { value: 'Payme', Icon: CreditCard },
  { value: 'Uzum', Icon: CreditCard },
  { value: 'Перечисление', Icon: Landmark },
]

/** "1 250 000" / "1250000,5" → 1250000 (butun so'm). Noto'g'ri bo'lsa — NaN. */
export const parseAmount = (raw) => Math.round(Number(`${raw ?? ''}`.replace(/\s/g, '').replace(',', '.')))
