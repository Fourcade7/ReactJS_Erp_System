import { API_BASE } from '../config/api'
import { t } from '../i18n'

const BASE = `${API_BASE}/expense`
const CATEGORY_BASE = `${API_BASE}/expense-category`

async function request(url, options) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || t('Ошибка сервера'))
    }
    return data
}

const json = (method, body) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
})

const params = (values) =>
    new URLSearchParams(Object.entries(values).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()

/** `[{ id, name, count }]` — `count`: shu turdagi xarajatlar soni. */
const getExpenseCategories = () => request(`${CATEGORY_BASE}/getall`)

const addExpenseCategory = (name) => request(`${CATEGORY_BASE}/add`, json('POST', { name }))

/** Qayta nomlash: shu turdagi xarajatlar ham yangi nomga o'tadi. */
const updateExpenseCategory = (id, name) => request(`${CATEGORY_BASE}/update/${id}`, json('PATCH', { name }))

/** Turda xarajatlar bo'lsa `moveTo` (tur id) majburiy: ular shu turga o'tkaziladi. */
const deleteExpenseCategory = (id, moveTo) =>
    request(`${CATEGORY_BASE}/delete/${id}?${params({ move_to: moveTo })}`, { method: 'DELETE' })

const getExpenses = ({ page, limit, search, category, month }) =>
    request(`${BASE}/allpagsearch?${params({ page, limit, search, category, month })}`)

const addExpense = (expense) =>
    request(`${BASE}/add`, json('POST', { ...expense, user_id: Number(localStorage.getItem('userid')) || undefined }))

const updateExpense = (id, expense) => request(`${BASE}/update/${id}`, json('PATCH', expense))

const deleteExpense = (id) => request(`${BASE}/delete/${id}`, { method: 'DELETE' })

export {
    getExpenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
}
