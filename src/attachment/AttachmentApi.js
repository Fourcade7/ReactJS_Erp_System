import { API_BASE } from '../config/api'
import { locale, t } from '../i18n'

export const MAX_FILE_SIZE = 20 * 1024 * 1024

/** 1536 -> "2 КБ", 3 145 728 -> "3,0 МБ". */
export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} ${t('Б')}`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ${t('КБ')}`
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', locale === 'ru-RU' ? ',' : '.')} ${t('МБ')}`
}

/** Brauzerdagi fayl tanlash oynasi uchun; server baribir turini o'zi tekshiradi. */
export const ACCEPT =
    'image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'

const me = () => Number(localStorage.getItem('userid')) || undefined

/** Fayl manzili (rasm — `<img src>`, PDF — yangi oynada ochiladi). */
export const fileUrl = (file, download = false) => `${API_BASE}${file.url}${download ? '?download=1' : ''}`

/** Yuklashdan oldin tekshiruv: xato matni yoki bo'sh satr. */
export function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) return t('Файл «{name}» больше 20 МБ', { name: file.name })
    if (file.size === 0) return t('Файл «{name}» пустой', { name: file.name })
    return ''
}

async function parse(response) {
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
        throw new Error(message || t('Ошибка сервера'))
    }
    return data
}

/** `target`: `{ taskId }` yoki `{ contractId }`. */
export async function uploadAttachment(file, target) {
    const form = new FormData()
    form.append('user_id', String(me() ?? ''))
    if (target.taskId) form.append('task_id', String(target.taskId))
    if (target.contractId) form.append('contract_id', String(target.contractId))
    form.append('file', file)
    return parse(await fetch(`${API_BASE}/attachment/add`, { method: 'POST', body: form }))
}

export const deleteAttachment = async (id) =>
    parse(await fetch(`${API_BASE}/attachment/delete/${id}?user_id=${me() ?? ''}`, { method: 'DELETE' }))

/** Bir nechta faylni ketma-ket yuklaydi; xatolarni to'plab qaytaradi (bittasi o'tmasa qolganlari yuklanadi). */
export async function uploadMany(files, target) {
    const errors = []
    for (const file of files) {
        const problem = validateFile(file)
        if (problem) {
            errors.push(problem)
            continue
        }
        try {
            await uploadAttachment(file, target)
        } catch (e) {
            errors.push(`${file.name}: ${e.message}`)
        }
    }
    return errors
}
