const KEY_MODE = 'apiMode'
const KEY_HOST = 'apiHost'
const KEY_API_PORT = 'apiPort'
const KEY_LOCAL_PORT = 'localPort'
const SERVER_KEYS = [KEY_MODE, KEY_HOST, KEY_API_PORT, KEY_LOCAL_PORT]

const DEFAULT_PORT = '3000'

// Server almashganda eski serverning foydalanuvchi ma'lumoti yaroqsiz boʻladi.
const SESSION_KEYS = ['username', 'surname', 'userid', 'role']

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

function read(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function isValidIPv4(value) {
  const match = IPV4.exec(value.trim())
  return match !== null && match.slice(1).every((octet) => Number(octet) <= 255)
}

function isValidPort(value) {
  const port = value.trim()
  return /^\d{1,5}$/.test(port) && Number(port) >= 1 && Number(port) <= 65535
}

/**
 * Saqlangan sozlama. Rejimga qarab ishlatilmaydigan qiymatlar ham saqlanib
 * turadi: Local ga oʻtganda IPv4 yoʻqolmaydi, API ga qaytganda tayyor turadi.
 */
function getServerConfig() {
  // Eski versiyada faqat `apiHost` bor edi (ixtiyoriy ":port" bilan) — shuni ham tushunamiz.
  const [host, legacyPort] = read(KEY_HOST).split(':')
  return {
    mode: read(KEY_MODE) || (host ? 'api' : 'local'),
    host: host || '',
    apiPort: read(KEY_API_PORT) || legacyPort || DEFAULT_PORT,
    localPort: read(KEY_LOCAL_PORT) || DEFAULT_PORT,
  }
}

function buildBase({ mode, host, apiPort, localPort }) {
  return mode === 'api' && host
    ? `http://${host}:${apiPort}`
    : `http://localhost:${localPort}`
}

/**
 * Backend manzili. Modul yuklanganda bir marta hisoblanadi, shuning uchun
 * manzil oʻzgargach sahifa qayta yuklanadi (`saveServerConfig`).
 */
const API_BASE = buildBase(getServerConfig())

/**
 * Sozlamani saqlaydi. Haqiqiy manzil oʻzgargan boʻlsa — eski serverning
 * seansini tozalab, login sahifasiga qayta yuklaydi va `true` qaytaradi.
 */
function saveServerConfig(config) {
  try {
    localStorage.setItem(KEY_MODE, config.mode)
    localStorage.setItem(KEY_HOST, config.host)
    localStorage.setItem(KEY_API_PORT, config.apiPort)
    localStorage.setItem(KEY_LOCAL_PORT, config.localPort)
  } catch {
    return false
  }

  if (buildBase(config) === API_BASE) return false

  try {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    // localStorage mavjud emas.
  }
  window.location.assign('/login')
  return true
}

/** Chiqishda barcha mahalliy ma'lumotni tozalaydi, lekin server sozlamasini saqlab qoladi. */
function clearLocalData() {
  const kept = SERVER_KEYS.map((key) => [key, read(key)])
  try {
    localStorage.clear()
    kept.forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value)
    })
  } catch {
    // localStorage mavjud emas — tozalanadigan narsa yoʻq.
  }
}

export {
  API_BASE,
  getServerConfig,
  isValidIPv4,
  isValidPort,
  saveServerConfig,
  clearLocalData,
}
