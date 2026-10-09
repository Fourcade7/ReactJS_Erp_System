import { API_BASE } from '../config/api'
import { t } from '../i18n'
const BASE = `${API_BASE}/telegram`

async function request(url, options) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)

    if (!response.ok) {
        // ValidationPipe `message` ni massiv qilib qaytaradi.
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || t('Ошибка сервера'))
    }
    return data
}

const json = (method, body) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
})

// Botlar — holati (status/error), ulanish havolasi va ulangan chatlari bilan.
const getBots = () => request(`${BASE}/bots`)

const addBot = (botName, botToken) => request(`${BASE}/add`, json('POST', { botName, botToken }))

const deleteBot = (id) => request(`${BASE}/delete/${id}`, json('DELETE'))

const deleteChat = (id) => request(`${BASE}/chat/${id}`, json('DELETE'))

const relinkBot = (id) => request(`${BASE}/relink/${id}`, json('POST'))

const testBot = (id) => request(`${BASE}/test/${id}`, json('POST'))

export { getBots, addBot, deleteBot, deleteChat, relinkBot, testBot }
