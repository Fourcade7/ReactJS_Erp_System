import { t } from '../i18n'

/**
 * Xodim rollari — qo'shish va tahrirlash shakllarida bir xil ro'yxat.
 * Qiymatlar ilova bo'ylab shu ko'rinishda tekshiriladi (`role === 'User'` — cheklangan menyu,
 * Android ilovaga faqat `Master` kiradi), shuning uchun yozilishi aynan shunday bo'lishi shart.
 */
export const ROLES = [
  { value: 'User', label: t('User — продавец / кассир') },
  { value: 'Admin', label: t('Admin — полный доступ') },
  { value: 'Master', label: t('Master — мастер (мобильное приложение)') },
]

export const DEFAULT_ROLE = 'User'

/**
 * Tanlov ro'yxati. Xodimda ro'yxatda yo'q (eski) rol bo'lsa, u ham qo'shiladi —
 * aks holda tahrirlashda tanlov bo'sh ko'rinib, rol bilmasdan o'zgarib ketardi.
 */
export function roleOptions(current) {
  if (!current || ROLES.some((role) => role.value === current)) return ROLES
  return [...ROLES, { value: current, label: t('{current} (текущая)', { current }) }]
}
