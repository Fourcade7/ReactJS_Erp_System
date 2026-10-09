import { API_BASE } from '../config/api'

const BASE = `${API_BASE}/stats`

async function request(url) {
    const response = await fetch(url)
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || 'Ошибка сервера')
    }
    return data
}

const params = (values) =>
    new URLSearchParams(Object.entries(values).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()

const getKpis = () => request(`${BASE}/kpis`)

const getDashboard = (from, to, granularity) => request(`${BASE}/dashboard?${params({ from, to, granularity })}`)

const getHistory = ({ page, limit, type, from, to }) => request(`${BASE}/history?${params({ page, limit, type, from, to })}`)

const getCalendar = (year) => request(`${BASE}/calendar?${params({ year })}`)

export { getKpis, getDashboard, getHistory, getCalendar }
