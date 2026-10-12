import { API_BASE } from '../config/api'
import { t } from '../i18n'

async function request(url, options) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || t('Ошибка сервера'))
    }
    return data
}

/** Xodimning o'z ma'lumoti (parol xeshisiz). Autentifikatsiya qo'shilguncha id bo'yicha. */
const getProfile = (id) => request(`${API_BASE}/user/profile/${id}`)

/** `username`, `surname`, `phone`, `email`; parol uchun `currentPassword` + `newPassword`. Rol o'zgarmaydi. */
const updateProfile = (id, patch) =>
    request(`${API_BASE}/user/profile/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    })

export { getProfile, updateProfile }
