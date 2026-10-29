import { t } from '../i18n'

/** Oy bo'yicha holat: nomi va Badge ohangi. */
export const SALARY_STATUS = {
  not_paid: { label: t('Не выплачено'), tone: 'danger' },
  partial: { label: t('Частично'), tone: 'warning' },
  paid: { label: t('Выплачено'), tone: 'success' },
}

export const PAYMENT_TYPES = [
  { key: 'advance', label: t('Аванс') },
  { key: 'salary', label: t('Зарплата') },
]

export const PAYMENT_METHODS = [
  { key: 'cash', label: t('Наличные') },
  { key: 'card', label: t('Банковская карта') },
  { key: 'transfer', label: t('Перечисление') },
]

const labelOf = (list, key) => list.find((item) => item.key === key)?.label ?? key

export const typeLabel = (key) => labelOf(PAYMENT_TYPES, key)
export const methodLabel = (key) => labelOf(PAYMENT_METHODS, key)

export const personName = (person) =>
  person ? `${person.username ?? ''} ${person.surname ?? ''}`.trim() || '—' : t('Удалённый сотрудник')

/** "2026-10-01" -> "2026-10". */
export const periodMonth = (period) => period.slice(0, 7)
