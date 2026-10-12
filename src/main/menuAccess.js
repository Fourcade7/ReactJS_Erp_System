import { useEffect, useSyncExternalStore } from 'react'
import { API_BASE } from '../config/api'
import { t } from '../i18n'

const CACHE_KEY = 'menuAccess'
const REFRESH_MS = 60_000

function readCache() {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY))
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

/**
 * Menyu sozlamasi (serverdan): `{ overrides: { user: { contracts: true } }, loaded }`.
 * Oxirgi qiymat brauzerda saqlanadi, shu bois sahifa ochilganda menyu "sakramaydi".
 * Sozlama hamma foydalanuvchi uchun umumiy, shuning uchun modul darajasida bitta nusxa.
 */
let snapshot = { overrides: readCache(), loaded: false }
const listeners = new Set()

function setOverrides(overrides) {
  snapshot = { overrides, loaded: true }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(overrides))
  } catch {
    // saqlash imkoni yo'q — sozlama shu seans uchun xotirada qoladi
  }
  listeners.forEach((listener) => listener())
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

/** Serverdan so'nggi sozlamani oladi; tarmoq xatosida avvalgi (keshdagi) qiymat qoladi. */
async function loadMenuAccess() {
  try {
    const data = await request(`${API_BASE}/app-setting/menu-access`)
    setOverrides(data?.overrides ?? {})
  } catch {
    if (!snapshot.loaded) {
      snapshot = { ...snapshot, loaded: true }
      listeners.forEach((listener) => listener())
    }
  }
}

/** Faqat administrator: sozlamani to'liq almashtiradi va hamma ekranlarga darrov yetkazadi. */
async function saveMenuAccess(overrides) {
  const userId = Number(localStorage.getItem('userid')) || undefined
  const data = await request(`${API_BASE}/app-setting/menu-access`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, overrides }),
  })
  setOverrides(data?.overrides ?? {})
  return data?.overrides ?? {}
}

/**
 * Menyu sozlamasi + yuklash. `poll` — ekran ochiq turganda daqiqada bir yangilab turadi
 * (administrator o'zgartirsa xodimlarda sahifani yangilamasdan ham o'zgaradi).
 */
function useMenuAccess({ poll = false } = {}) {
  const value = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    loadMenuAccess()
    if (!poll) return undefined
    const timer = window.setInterval(() => {
      if (!document.hidden) loadMenuAccess()
    }, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [poll])

  return value
}

export { useMenuAccess, saveMenuAccess, loadMenuAccess }
