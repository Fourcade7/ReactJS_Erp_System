import { API_BASE } from '../config/api'
import { t } from '../i18n'

const BASE = `${API_BASE}/salary`
const PAYMENT_BASE = `${API_BASE}/salary-payment`

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

/**
 * Oy vedomosti: `{ month, summary, rows, employees }`.
 * `rows` — `{ employee, salary, norm, paid, advance, remaining, overpaid, status, payments }`;
 * `employees` — barcha xodimlar va joriy okladi (`salary`, yo'q bo'lsa `null`).
 */
const getSalarySheet = (month) => request(`${BASE}/sheet?${params({ month })}`)

/** Oklad belgilash yoki o'zgartirish. */
const setSalary = (employeeId, amount) => request(`${BASE}/set`, json('POST', { employee_id: employeeId, amount }))

const removeSalary = (employeeId) => request(`${BASE}/delete/${employeeId}`, { method: 'DELETE' })

const getSalaryPayments = ({ page, limit, month, employee, type, search }) =>
    request(`${PAYMENT_BASE}/allpagsearch?${params({ page, limit, month, employee, type, search })}`)

const addSalaryPayment = (payment) =>
    request(`${PAYMENT_BASE}/add`, json('POST', { ...payment, user_id: Number(localStorage.getItem('userid')) || undefined }))

const updateSalaryPayment = (id, payment) => request(`${PAYMENT_BASE}/update/${id}`, json('PATCH', payment))

const deleteSalaryPayment = (id) => request(`${PAYMENT_BASE}/delete/${id}`, { method: 'DELETE' })

export {
    getSalarySheet,
    setSalary,
    removeSalary,
    getSalaryPayments,
    addSalaryPayment,
    updateSalaryPayment,
    deleteSalaryPayment,
}
