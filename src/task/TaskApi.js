import { API_BASE } from '../config/api'
import { t } from '../i18n'

const TASK = `${API_BASE}/task`
const PIPELINE = `${API_BASE}/task-pipeline`
const STAGE = `${API_BASE}/task-stage`

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
    new URLSearchParams(Object.entries(values).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)).toString()

/** Harakatni kim bajarayotgani (autentifikatsiya qo'shilguncha body orqali yuboriladi). */
const me = () => Number(localStorage.getItem('userid')) || undefined

// ---- xodimlar va jarayonlar
const getTaskMembers = () => request(`${TASK}/members`)
const getTaskPipelines = () => request(`${PIPELINE}/getall`)

// ---- vazifalar
// Ko'rish so'rovlarida ham kim so'rayotgani yuboriladi: admin bo'lmaganlarga server faqat o'z vazifalarini beradi.
const getTaskBoard = (query) => request(`${TASK}/board?${params({ ...query, user_id: me() })}`)
const getTasks = (query) => request(`${TASK}/allpagsearch?${params({ ...query, user_id: me() })}`)
const getTask = (id) => request(`${TASK}/getby/${id}?user_id=${me() ?? ''}`)
const addTask = (task) => request(`${TASK}/add`, json('POST', { ...task, user_id: me() }))
const updateTask = (id, patch) => request(`${TASK}/update/${id}`, json('PATCH', { ...patch, user_id: me() }))
// Kontragent (mijoz) biriktirish: faqat buxgalter va admin. `customerId = null` — olib tashlaydi.
const setTaskCustomer = (id, customerId) =>
    request(`${TASK}/customer/${id}`, json('PATCH', { user_id: me(), customer_id: customerId ?? null }))
const moveTask = (id, stageId, note) =>
    request(`${TASK}/move/${id}`, json('PATCH', { stage_id: stageId, user_id: me(), note: note || undefined }))
const submitTask = (id, note) => request(`${TASK}/submit/${id}`, json('POST', { user_id: me(), note: note || undefined }))
const approveTask = (id, note) => request(`${TASK}/approve/${id}`, json('POST', { user_id: me(), note: note || undefined }))
const rejectTask = (id, note) => request(`${TASK}/reject/${id}`, json('POST', { user_id: me(), note }))
const commentTask = (id, note) => request(`${TASK}/comment/${id}`, json('POST', { user_id: me(), note }))
const deleteTask = (id) => request(`${TASK}/delete/${id}?user_id=${me() ?? ''}`, { method: 'DELETE' })

// ---- jarayon va etaplarni sozlash (admin)
const addPipeline = (name) => request(`${PIPELINE}/add`, json('POST', { name }))
const updatePipeline = (id, patch) => request(`${PIPELINE}/update/${id}`, json('PATCH', patch))
const deletePipeline = (id) => request(`${PIPELINE}/delete/${id}`, { method: 'DELETE' })
const addStage = (stage) => request(`${STAGE}/add`, json('POST', stage))
const updateStage = (id, patch) => request(`${STAGE}/update/${id}`, json('PATCH', patch))
const deleteStage = (id) => request(`${STAGE}/delete/${id}`, { method: 'DELETE' })
const reorderStages = (pipelineId, ids) => request(`${STAGE}/reorder`, json('PATCH', { pipeline_id: pipelineId, ids }))

export {
    getTaskMembers,
    getTaskPipelines,
    getTaskBoard,
    getTasks,
    getTask,
    addTask,
    updateTask,
    setTaskCustomer,
    moveTask,
    submitTask,
    approveTask,
    rejectTask,
    commentTask,
    deleteTask,
    addPipeline,
    updatePipeline,
    deletePipeline,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
}
