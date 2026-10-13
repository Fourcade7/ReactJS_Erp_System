import { API_BASE } from '../config/api'
import { t } from '../i18n'

const BASE = `${API_BASE}/contract`

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

/** Harakatni kim bajarayotgani (autentifikatsiya qo'shilguncha body orqali yuboriladi). */
const me = () => Number(localStorage.getItem('userid')) || undefined

// Ko'rish so'rovlarida ham kim so'rayotgani yuboriladi: admin bo'lmaganlarga server faqat o'z shartnomalarini beradi.
const getContracts = (query) => request(`${BASE}/allpagsearch?${params({ ...query, user_id: me() })}`)
const getContract = (id) => request(`${BASE}/getby/${id}?user_id=${me() ?? ''}`)
const addContract = (contract) => request(`${BASE}/add`, json('POST', { ...contract, user_id: me() }))
const updateContract = (id, patch) => request(`${BASE}/update/${id}`, json('PATCH', { ...patch, user_id: me() }))
const setContractStatus = (id, status, note) =>
    request(`${BASE}/status/${id}`, json('PATCH', { status, user_id: me(), note: note || undefined }))
const submitContract = (id, note) => request(`${BASE}/submit/${id}`, json('POST', { user_id: me(), note: note || undefined }))
const approveContract = (id, note) => request(`${BASE}/approve/${id}`, json('POST', { user_id: me(), note: note || undefined }))
const rejectContract = (id, note) => request(`${BASE}/reject/${id}`, json('POST', { user_id: me(), note }))
const commentContract = (id, note) => request(`${BASE}/comment/${id}`, json('POST', { user_id: me(), note }))
// Savdodan ochilgan shartnoma: buxgalter "oladi", rekvizit kiritadi va bank o'tkazmasini yozadi.
const takeContract = (id) => request(`${BASE}/take/${id}`, json('POST', { user_id: me() }))
// Kontragentsiz (savdodan ochilgan) shartnomaga kontragent — odam yoki tashkilot — biriktirish.
const setContractCustomer = (id, customerId) =>
    request(`${BASE}/customer/${id}`, json('PATCH', { user_id: me(), customer_id: customerId }))
const saveRequisites = (id, requisites) =>
    request(`${BASE}/requisites/${id}`, json('PATCH', { ...requisites, user_id: me() }))
const addContractPayment = (id, amount, note) =>
    request(`${BASE}/payment/${id}`, json('POST', { user_id: me(), amount, note: note || undefined }))
const deleteContract = (id) => request(`${BASE}/delete/${id}?user_id=${me() ?? ''}`, { method: 'DELETE' })

export {
    getContracts,
    getContract,
    addContract,
    updateContract,
    setContractStatus,
    submitContract,
    approveContract,
    rejectContract,
    commentContract,
    takeContract,
    saveRequisites,
    setContractCustomer,
    addContractPayment,
    deleteContract,
}
