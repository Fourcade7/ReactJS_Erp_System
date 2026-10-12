import { useEffect, useSyncExternalStore } from 'react'
import { API_BASE } from '../config/api'
import { t } from '../i18n'

/*
 * Tizimning asosiy rangi (accent). Administrator "Настройки → Внешний вид" da tanlaydi,
 * server `app_setting.appearance` da saqlaydi va u hamma foydalanuvchida o'zgaradi.
 *
 * Har bir variant — OKLCH tonlari (`h`) va to'yinganligi (`c`). Shundan primary, uning
 * "soft" va hover tonlari, fokus halqasi hamda neytral ranglar (fon, chegara, matn)
 * tonlanishi chiqariladi. Muvaffaqiyat/xavf/ogohlantirish ranglari holat belgisi bo'lgani
 * uchun o'zgarmaydi. Standart (indigo) — `index.css` dagi qiymatlar, hech narsa qo'shilmaydi.
 *
 * Kalitlar backend'dagi `src/app_setting/appearance.ts` bilan bir xil bo'lishi shart.
 */
const ACCENTS = [
  { key: 'indigo', name: t('Индиго'), h: 273, c: 0.21 },
  { key: 'blue', name: t('Синий'), h: 250, c: 0.19 },
  { key: 'cyan', name: t('Голубой'), h: 220, c: 0.12 },
  { key: 'teal', name: t('Бирюзовый'), h: 185, c: 0.1 },
  { key: 'green', name: t('Зелёный'), h: 150, c: 0.15 },
  { key: 'amber', name: t('Янтарный'), h: 70, c: 0.12 },
  { key: 'orange', name: t('Оранжевый'), h: 45, c: 0.17 },
  { key: 'red', name: t('Красный'), h: 25, c: 0.2 },
  { key: 'pink', name: t('Розовый'), h: 350, c: 0.2 },
  { key: 'violet', name: t('Фиолетовый'), h: 305, c: 0.21 },
]

const DEFAULT_ACCENT = ACCENTS[0].key

const KEY = 'accent'
const CSS_KEY = 'accentCss' // index.html shu bilan ranglarni React yuklanmasdan oldin qo'yadi
const STYLE_ID = 'app-accent'
const REFRESH_MS = 60_000

const find = (key) => ACCENTS.find((accent) => accent.key === key)
const num = (value) => Number(value.toFixed(4))
const color = (l, c, h, alpha) => `oklch(${l} ${num(c)} ${h}${alpha === undefined ? '' : ` / ${alpha}`})`

/** OKLCH → sRGB [0..255] (Recharts/kalendar kabi CSS o'zgaruvchisini o'qiy olmaydigan joylar uchun). */
function oklchToRgb(l, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
  return linear.map((value) => {
    const x = Math.min(1, Math.max(0, value))
    const gamma = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
    return Math.round(gamma * 255)
  })
}

/** Soyalar `hsl()` komponentida yoziladi, shuning uchun rangning HSL tonini topamiz. */
function hslHue([r, g, b]) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const delta = max - Math.min(rn, gn, bn)
  if (delta === 0) return 0
  const raw = max === rn ? ((gn - bn) / delta) % 6 : max === gn ? (bn - rn) / delta + 2 : (rn - gn) / delta + 4
  return Math.round(((raw * 60) % 360 + 360) % 360)
}

function lightTokens({ h, c }) {
  return {
    '--app-bg': color(0.985, 0.002, h),
    '--app-bg-accent': color(0.967, 0.006, h),
    '--surface-2': color(0.975, 0.003, h),
    '--surface-3': color(0.955, 0.005, h),
    '--border': color(0.917, 0.005, h),
    '--border-strong': color(0.86, 0.007, h),
    '--fg': color(0.21, 0.014, h),
    '--fg-muted': color(0.52, 0.012, h),
    '--fg-subtle': color(0.645, 0.012, h),
    '--primary': color(0.55, c, h),
    '--primary-hover': color(0.49, c, h),
    '--primary-soft': color(0.955, c * 0.12, h),
    '--primary-soft-fg': color(0.45, c * 0.9, h),
    '--app-glow': color(0.955, 0.03, (h + 40) % 360),
    '--ring': color(0.55, c, h, 0.35),
    '--overlay': color(0.21, 0.014, h, 0.45),
    '--shadow-color': `${hslHue(oklchToRgb(0.55, c, h))} 20% 40%`,
  }
}

function darkTokens({ h, c }) {
  return {
    '--app-bg': color(0.165, 0.008, h),
    '--app-bg-accent': color(0.185, 0.01, h),
    '--surface': color(0.205, 0.011, h),
    '--surface-2': color(0.235, 0.012, h),
    '--surface-3': color(0.27, 0.013, h),
    '--border': color(0.29, 0.013, h),
    '--border-strong': color(0.36, 0.015, h),
    '--fg': color(0.965, 0.003, h),
    '--fg-muted': color(0.72, 0.014, h),
    '--fg-subtle': color(0.6, 0.014, h),
    '--primary': color(0.65, c * 0.9, h),
    '--primary-hover': color(0.71, c * 0.86, h),
    '--primary-fg': color(0.15, 0.02, h),
    '--primary-soft': color(0.65, c * 0.9, h, 0.16),
    '--primary-soft-fg': color(0.8, c * 0.57, h),
    '--app-glow': color(0.7, 0.14, (h + 40) % 360, 0.16),
    '--ring': color(0.65, c * 0.9, h, 0.45),
    '--overlay': color(0.12, 0.01, h, 0.65),
    '--shadow-color': `${hslHue(oklchToRgb(0.65, c * 0.9, h))} 40% 2%`,
  }
}

const block = (selector, tokens) =>
  `${selector}{${Object.entries(tokens).map(([name, value]) => `${name}:${value}`).join(';')}}`

/**
 * Tokenlarni almashtiradigan CSS. Selektorlar `index.css` dagi `:root`/`.dark` dan kuchliroq
 * (ikki sinf), shuning uchun stil elementi qayerda turishidan qat'i nazar ular ustun bo'ladi.
 */
function buildCss(key) {
  const accent = find(key)
  if (!accent || accent.key === DEFAULT_ACCENT) return ''
  return block(':root:root', lightTokens(accent)) + block(':root.dark', darkTokens(accent))
}

/** Grafik/kalendar uchun aniq rang qiymatlari (CSS o'zgaruvchisi o'qilmaydigan joylar). */
function accentRgb(key, mode) {
  const accent = find(key) ?? ACCENTS[0]
  const dark = mode === 'dark'
  return oklchToRgb(dark ? 0.65 : 0.55, dark ? accent.c * 0.9 : accent.c, accent.h).join(' ')
}

/** Asosiy rangning tanlangan rejimdagi qiymati (--primary bilan bir xil). */
function primaryColor(key, mode) {
  const accent = find(key) ?? ACCENTS[0]
  return mode === 'dark' ? color(0.65, accent.c * 0.9, accent.h) : color(0.55, accent.c, accent.h)
}

function chartAccent(key, mode) {
  const accent = find(key) ?? ACCENTS[0]
  return mode === 'dark'
    ? color(0.7, Math.round(accent.c * 0.81 * 100) / 100, accent.h)
    : color(0.55, accent.c, accent.h)
}

// ------------------------------------------------------------------ holat

function readCached() {
  try {
    const key = localStorage.getItem(KEY)
    return find(key) ? key : DEFAULT_ACCENT
  } catch {
    return DEFAULT_ACCENT
  }
}

let saved = readCached()
let preview = null
let loaded = false
let snapshot = makeSnapshot()
const listeners = new Set()

function makeSnapshot() {
  return { accent: preview ?? saved, saved, previewing: preview !== null, loaded }
}

function paint() {
  if (typeof document === 'undefined') return
  const css = buildCss(preview ?? saved)
  let element = document.getElementById(STYLE_ID)
  if (!css) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('style')
    element.id = STYLE_ID
    document.head.appendChild(element)
  }
  if (element.textContent !== css) element.textContent = css
}

function emit() {
  snapshot = makeSnapshot()
  paint()
  listeners.forEach((listener) => listener())
}

function setSaved(key) {
  saved = key
  loaded = true
  try {
    localStorage.setItem(KEY, key)
    localStorage.setItem(CSS_KEY, buildCss(key))
  } catch {
    // saqlash imkoni yo'q — rang shu seans uchun qoladi
  }
  emit()
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => snapshot

async function request(url, options) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    throw new Error(message || t('Ошибка сервера'))
  }
  return data
}

/** Boshlang'ich holatni qo'llaydi (React'dan oldin chaqiriladi). */
function initAppearance() {
  paint()
}

/** Serverdan joriy rangni oladi; tarmoq xatosida keshdagi qiymat qoladi. */
async function loadAppearance() {
  try {
    const data = await request(`${API_BASE}/app-setting/appearance`)
    if (find(data?.accent)) setSaved(data.accent)
  } catch {
    if (!loaded) {
      loaded = true
      emit()
    }
  }
}

/** Faqat administrator: rangni hamma foydalanuvchi uchun saqlaydi. */
async function saveAppearance(key) {
  const userId = Number(localStorage.getItem('userid')) || undefined
  const data = await request(`${API_BASE}/app-setting/appearance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, accent: key }),
  })
  preview = null
  setSaved(find(data?.accent) ? data.accent : key)
}

/** Saqlamasdan ko'rib chiqish: faqat shu brauzerda, sahifadan chiqilsa qaytadi. */
function previewAccent(key) {
  preview = find(key) && key !== saved ? key : null
  emit()
}

function clearPreview() {
  if (preview === null) return
  preview = null
  emit()
}

/** Joriy rang. Qo'shimcha so'rov yubormaydi. */
function useAppearance() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** Ilova ochiq turganda rangni serverdan yangilab turadi (kirish sahifasida ham). */
function useAppearanceSync() {
  useEffect(() => {
    loadAppearance()
    const refresh = () => {
      if (!document.hidden) loadAppearance()
    }
    const timer = window.setInterval(refresh, REFRESH_MS)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
}

export {
  ACCENTS,
  DEFAULT_ACCENT,
  accentRgb,
  chartAccent,
  clearPreview,
  initAppearance,
  loadAppearance,
  previewAccent,
  primaryColor,
  saveAppearance,
  useAppearance,
  useAppearanceSync,
}
