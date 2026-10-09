import { API_BASE } from '../config/api'

const BASE = `${API_BASE}/expense`

async function request(url, options) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || 'Ошибка сервера')
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

const getExpenseCategories = () => request(`${BASE}/categories`)

const getExpenses = ({ page, limit, search, category, month }) =>
    request(`${BASE}/allpagsearch?${params({ page, limit, search, category, month })}`)

const addExpense = (expense) =>
    request(`${BASE}/add`, json('POST', { ...expense, user_id: Number(localStorage.getItem('userid')) || undefined }))

const updateExpense = (id, expense) => request(`${BASE}/update/${id}`, json('PATCH', expense))

const deleteExpense = (id) => request(`${BASE}/delete/${id}`, { method: 'DELETE' })

export { getExpenseCategories, getExpenses, addExpense, updateExpense, deleteExpense }
