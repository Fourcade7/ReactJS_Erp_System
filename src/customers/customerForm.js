import { t } from '../i18n'

/**
 * Kontragent formasi uchun sof yordamchilar (komponentlar `CustomerFields.jsx` da).
 * Odam: ism, familiya, telefon majburiy. Tashkilot: faqat nomi majburiy — qolgani (telefon ham) ixtiyoriy.
 */

export const isOrganization = (customer) => customer?.type === 'organization'

/** Tashkilotning ixtiyoriy rekvizitlari. Kalitlar kontragent kartasi (backend) bilan bir xil. */
export const ORG_DETAILS = [
  { key: 'inn', label: t('ИНН'), numeric: true },
  { key: 'mfo', label: t('МФО'), numeric: true },
  { key: 'bankName', label: t('Банк'), wide: true },
  { key: 'account', label: t('Расчётный счёт'), numeric: true, wide: true },
  { key: 'address', label: t('Адрес'), wide: true },
  { key: 'director', label: t('Руководитель'), wide: true },
]

export const emptyCustomer = (type = 'user') => ({
  type,
  username: '',
  surname: '',
  phone: '',
  orgName: '',
  inn: '',
  mfo: '',
  bankName: '',
  account: '',
  address: '',
  director: '',
})

/** Kontragent yozuvi (ro'yxatdan/kartochkadan) → forma qiymati. */
export function customerToForm(customer) {
  const base = emptyCustomer(isOrganization(customer) ? 'organization' : 'user')
  // Kartochka rekvizitlarni `requisites` ichida, ro'yxat esa tekis beradi.
  const source = { ...customer, ...(customer?.requisites ?? {}) }
  for (const key of Object.keys(base)) {
    if (key !== 'type' && source[key] != null) base[key] = String(source[key])
  }
  if (base.type === 'organization' && !base.orgName) base.orgName = base.username
  return base
}

/** Majburiy maydonlar tekshiruvi: `{ ok, invalid: { maydon: true } }`. */
export function validateCustomer(value) {
  const invalid = {}
  if (value.type === 'organization') {
    if (!value.orgName.trim()) invalid.orgName = true
  } else {
    if (!value.username.trim()) invalid.username = true
    if (!value.surname.trim()) invalid.surname = true
    if (!value.phone.trim()) invalid.phone = true
  }
  return { ok: Object.keys(invalid).length === 0, invalid }
}

/** Serverga yuboriladigan tana. Tashkilotda ism/familiya yuborilmaydi (server nomdan oladi). */
export function customerPayload(value) {
  if (value.type === 'organization') {
    return {
      type: 'organization',
      orgName: value.orgName.trim(),
      phone: value.phone.trim(),
      ...Object.fromEntries(ORG_DETAILS.map((field) => [field.key, value[field.key].trim()])),
    }
  }
  return {
    type: 'user',
    username: value.username.trim(),
    surname: value.surname.trim(),
    phone: value.phone.trim(),
  }
}
