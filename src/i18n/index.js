/**
 * Interfeys tili (ruscha / oʻzbekcha).
 *
 * Kalit — rus matnining oʻzi: `t('Продажа')`. Tarjima topilmasa rus matni qaytadi,
 * shuning uchun yangi matn qoʻshilganda ekran buzilmaydi (faqat tarjimasiz qoladi).
 * Matn ichidagi oʻzgaruvchilar `{nom}` bilan yoziladi: `t('Заказ #{id}', { id })`.
 *
 * Til sahifa umri davomida oʻzgarmaydi: almashtirilganda sahifa qayta yuklanadi.
 * Shu sabab modul darajasidagi konstantalar (menyu, jadval sarlavhalari …) ham
 * toʻgʻri tilda hosil boʻladi va ekranlarni qayta chizish uchun maxsus kod kerak emas.
 */
import uz from './uz'

const STORAGE_KEY = 'lang'

export const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'uz', label: 'UZ', name: "O'zbekcha" },
]

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ru' || stored === 'uz') return stored
  } catch {
    /* localStorage bloklangan boʻlishi mumkin — standart til. */
  }
  return 'ru'
}

export const lang = readStoredLanguage()

/** Sana va raqamlarni formatlash uchun mahalliy sozlama. */
export const locale = lang === 'uz' ? 'uz-UZ' : 'ru-RU'

if (typeof document !== 'undefined') document.documentElement.lang = lang

const reported = new Set()

/** `{nom}` oʻrinlarini `params` qiymatlari bilan almashtiradi. */
function fill(text, params) {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}

export function t(text, params) {
  let out = text
  if (lang === 'uz') {
    if (Object.hasOwn(uz, text)) out = uz[text]
    else if (import.meta.env?.DEV && !reported.has(text)) {
      reported.add(text)
      console.warn(`[i18n] tarjima yoʻq: ${text}`)
    }
  }
  return fill(out, params)
}

/**
 * Bazadan kelgan qiymatni (toʻlov usuli, oʻlchov birligi, xarajat toifasi …) koʻrsatish
 * uchun tarjima qiladi. Bazaga ruscha qiymat yoziladi va solishtiriladi — tarjima faqat
 * ekranda. Lugʻatda yoʻq qiymat (masalan, foydalanuvchi yozgan nom) oʻzgarishsiz qaytadi.
 */
export function td(text) {
  return lang === 'uz' && typeof text === 'string' && Object.hasOwn(uz, text) ? uz[text] : text
}

/** Tilni saqlaydi va sahifani qayta yuklaydi (holat va URL saqlanadi). */
export function setLanguage(code) {
  if (code === lang) return
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    return
  }
  window.location.reload()
}
