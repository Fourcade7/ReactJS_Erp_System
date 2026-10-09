// Oʻzbekcha lugʻat tekshiruvi: kodda ishlatilgan har bir t('…') kaliti uchun tarjima bormi?
//   npm run i18n:check          — tarjimasi yoʻq kalitlar va {nom} oʻrinlarining mosligi
//   npm run i18n:check -- --list — tarjimasi yoʻq kalitlarni fayl boʻyicha chiqaradi
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const { default: uz } = await import(pathToFileURL(path.join(srcDir, 'i18n', 'uz', 'index.js')).href)

const KEY = /(?<![\w.$])t\(\s*(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g
const unescape = (raw) =>
  raw.replace(/\\(.)/g, (_, c) => ({ n: '\n', t: '\t', r: '\r' })[c] ?? c)

const used = new Map() // kalit -> [fayl:qator]
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'i18n') walk(full)
    } else if (/\.(jsx?|mjs)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8')
      for (const match of text.matchAll(KEY)) {
        const key = unescape(match[2])
        if (!/[Ѐ-ӿ]/.test(key)) continue
        const line = text.slice(0, match.index).split('\n').length
        if (!used.has(key)) used.set(key, [])
        used.get(key).push(`${path.relative(srcDir, full).replace(/\\/g, '/')}:${line}`)
      }
    }
  }
}
walk(srcDir)

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

const missing = []
const broken = []
for (const [key, places] of used) {
  if (!Object.hasOwn(uz, key)) missing.push([key, places])
  else if (placeholders(key) !== placeholders(uz[key])) broken.push([key, uz[key]])
}

if (process.argv.includes('--list')) {
  for (const [key, places] of missing) console.log(`${places[0]}  ${key}`)
}
console.log(`kalitlar: ${used.size}, lugʻat: ${Object.keys(uz).length}`)
console.log(`tarjimasi yoʻq: ${missing.length}`)
for (const [key, uzText] of broken) console.log(`{nom} mos emas:\n  ru: ${key}\n  uz: ${uzText}`)
process.exit(missing.length || broken.length ? 1 : 0)
