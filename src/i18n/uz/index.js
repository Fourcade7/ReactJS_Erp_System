/**
 * Oʻzbekcha lugʻat: kalit — rus matni, qiymat — tarjima (oʻzbek lotin yozuvi).
 * Mavzu boʻyicha fayllarga boʻlingan; tekshirish: `npm run i18n:check`.
 * Kalitdagi `{nom}` oʻrinlari tarjimada ham aynan shunday boʻlishi shart.
 */
import auth from './auth.js'
import catalog from './catalog.js'
import dashboard from './dashboard.js'
import expense from './expense.js'
import integration from './integration.js'
import masterorder from './masterorder.js'
import nav from './nav.js'
import products from './products.js'
import system from './system.js'
import trade from './trade.js'

export default {
  ...auth,
  ...catalog,
  ...dashboard,
  ...expense,
  ...integration,
  ...masterorder,
  ...nav,
  ...products,
  ...system,
  ...trade,
}
