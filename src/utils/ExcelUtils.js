import * as XLSX from 'xlsx'
import { t } from '../i18n'

function normalize(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
}

/** Ustun nomi orqali kerakli maydonni taxmin qiladi (aniq mos, keyin qisman mos). */
function guessColumn(field, headers) {
  const candidates = [field.label, ...(field.aliases || [])].map(normalize)
  const exact = headers.findIndex((h) => candidates.includes(normalize(h)))
  if (exact !== -1) return exact
  return headers.findIndex((h) => candidates.some((c) => normalize(h).includes(c)))
}

/**
 * Sarlavha qatorini taxmin qiladi. 1C/МойСклад eksportlarida faylning
 * boshida sarlavha emas, hisobot nomi va filtrlar turadi ("ДЕБИТОРЫ
 * КРЕДИТОРЫ", "Валюта: SUM"), shuning uchun birinchi qatorni koʻr-koʻrona
 * olib boʻlmaydi. Sarlavha qatori odatda eng koʻp toʻldirilgan va matnli
 * boʻladi — shunga qarab baholanadi. Teng holatda birinchisi tanlanadi,
 * chunki sarlavha maʼlumotdan oldin keladi.
 */
function detectHeaderRow(rows) {
  const limit = Math.min(rows.length, 10)
  let bestIndex = 0
  let bestScore = -1

  for (let i = 0; i < limit; i++) {
    const cells = (rows[i] ?? []).map((cell) => `${cell}`.trim()).filter(Boolean)
    if (cells.length === 0) continue

    const textCells = cells.filter((cell) => Number.isNaN(Number(cell.replace(',', '.'))))
    const score = cells.length + textCells.length

    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestIndex
}

/** Excel/CSV faylni birinchi varaq boʻyicha qator massivlariga oʻqiydi. */
function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(t('Не удалось прочитать файл')))
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' })
        resolve(rows)
      } catch {
        reject(new Error(t('Файл повреждён или имеет неверный формат')))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

/** Joriy roʻyxatni Excel fayl sifatida yuklab beradi. */
async function exportToExcel({ fetchRows, columns, fileName }) {
  const rows = await fetchRows()
  const mapped = rows.map((row) =>
    columns.reduce((acc, col) => {
      acc[col.label] = col.value ? col.value(row) : (row[col.key] ?? '')
      return acc
    }, {}),
  )
  const sheet = XLSX.utils.json_to_sheet(mapped)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, t('Данные'))
  XLSX.writeFile(workbook, fileName)
}

export { readWorkbook, guessColumn, detectHeaderRow, exportToExcel }
