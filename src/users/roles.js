import { t } from '../i18n'

/**
 * Xodim rollari — qo'shish va tahrirlash shakllarida bir xil ro'yxat.
 * Qiymatlar ilova bo'ylab shu ko'rinishda tekshiriladi (Admin — hammasi, qolganlarning menyusi
 * "Настройки" dagi jadval bo'yicha; Android ilovaga faqat `Master` kiradi),
 * shuning uchun yozilishi aynan shunday bo'lishi shart.
 */
export const ROLES = [
  { value: 'User', label: t('User — продавец / кассир') },
  { value: 'Admin', label: t('Admin — полный доступ') },
  { value: 'Accountant', label: t('Accountant — бухгалтер (только задачи)') },
  { value: 'Master', label: t('Master — мастер (мобильное приложение)') },
]

export const DEFAULT_ROLE = 'User'

/** Hozir tizimga kirgan foydalanuvchi roli (kichik harflarda, bo'sh joysiz). */
export const currentRole = () => (localStorage.getItem('role') || '').trim().toLowerCase()

/** Administrator. Qolgan hamma rol (User, Accountant, Master...) cheklangan hisoblanadi. */
export const isAdminRole = () => currentRole() === 'admin'

/**
 * Tanlov ro'yxati. Xodimda ro'yxatda yo'q (eski) rol bo'lsa, u ham qo'shiladi —
 * aks holda tahrirlashda tanlov bo'sh ko'rinib, rol bilmasdan o'zgarib ketardi.
 */
export function roleOptions(current) {
  if (!current || ROLES.some((role) => role.value === current)) return ROLES
  return [...ROLES, { value: current, label: t('{current} (текущая)', { current }) }]
}
