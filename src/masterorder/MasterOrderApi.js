import { API_BASE } from '../config/api'
import { addCustomer } from '../customers/CustomerApi'

const BASE = `${API_BASE}/master-order`

/** Xato javobdagi xabarni (ValidationPipe massiv qaytaradi) oddiy matnga aylantiradi. */
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

const getMasterOrders = (page, limit, search, status) =>
    request(
        `${BASE}/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? '')}` +
            (status ? `&status=${status}` : ''),
    )

const getMasterOrder = (id) => request(`${BASE}/getby/${id}`)

const getNewMasterOrderCount = async () => (await request(`${BASE}/count-new`)).count

const setMasterOrderStatus = (id, status) => request(`${BASE}/status/${id}`, json('PATCH', { status }))

const completeMasterOrder = (id, saleId) => request(`${BASE}/complete/${id}`, json('POST', { sale_id: saleId }))

const digits = (value) => `${value ?? ''}`.replace(/\D/g, '')

/**
 * Usta yozgan telefon bo'yicha kontragentni qidiradi (formatlardan qat'i nazar:
 * "+998 90 123-45-67" va "998901234567" bir xil). Topilmasa — `null`.
 */
async function findCustomerByPhone(phone) {
    const wanted = digits(phone)
    if (!wanted) return null

    // Server qidiruvi saqlangan matn bo'yicha — yozilgan ko'rinishda ham, faqat raqamlarda ham sinaymiz.
    for (const term of new Set([phone.trim(), wanted])) {
        const page = await request(
            `${API_BASE}/customer/allpagsearch?page=1&limit=10&search=${encodeURIComponent(term)}`,
        )
        const found = page.data.find((customer) => digits(customer.phone) === wanted)
        if (found) return found
    }
    return null
}

/** Kontragent yaratadi (mavjud `addCustomer` orqali) va yaratilgan yozuvni qaytaradi. */
async function createCustomerFromOrder(username, surname, phone) {
    const response = await addCustomer(username, surname, phone)
    if (!response) throw new Error('Не удалось подключиться к серверу')

    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || 'Не удалось создать контрагента')
    }
    return data
}

export {
    getMasterOrders,
    getMasterOrder,
    getNewMasterOrderCount,
    setMasterOrderStatus,
    completeMasterOrder,
    findCustomerByPhone,
    createCustomerFromOrder,
}
