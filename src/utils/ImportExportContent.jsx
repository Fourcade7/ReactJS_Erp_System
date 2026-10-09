import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  Settings,
  Upload,
  Warehouse,
  XCircle,
} from 'lucide-react'
import { Button, Dropdown, Form, Modal, ProgressBar, Spinner, Table } from '../ui'
import { detectHeaderRow, guessColumn, readWorkbook } from './ExcelUtils'
import { t } from '../i18n'

const SOURCE_SYSTEMS = [
  {
    key: '1c',
    label: t('1С'),
    icon: Building2,
    hint: t('Выгрузите список из 1С в Excel (.xlsx) или CSV и загрузите файл ниже.'),
  },
  {
    key: 'moysklad',
    label: t('МойСклад'),
    icon: Warehouse,
    hint: t('Экспортируйте данные из МойСклад в Excel и загрузите файл ниже.'),
  },
  {
    key: 'bitrix24',
    label: 'Bitrix24',
    icon: Layers,
    hint: t('Экспортируйте данные из Bitrix24 в Excel/CSV и загрузите файл ниже.'),
  },
  {
    key: 'excel',
    label: t('Excel / CSV файл'),
    icon: FileSpreadsheet,
    hint: t('Выберите готовый файл Excel (.xlsx, .xls) или CSV.'),
  },
]

// Bir soʻrovda yuboriladigan qatorlar soni. Nest da body limiti 100kb
// (standart), shuning uchun paket kichik saqlanadi — bu ayni paytda
// progress barning tekis siljishini ham ta'minlaydi.
const CHUNK_SIZE = 200

// Faylning oʻzini koʻrsatish uchun nechta qator chiqariladi.
const FILE_PREVIEW_ROWS = 8

const cellText = (value) => `${value ?? ''}`.trim()

/**
 * Universal import ustasi: manba tanlash → fayl yuklash → ustunlarni
 * moslashtirish → import. `fields` va `onImportChunk` orqali mijoz/mahsulot
 * roʻyxatlari bir xil komponentdan foydalanadi.
 *
 * Faqat `show` true boʻlganda ota komponent tomonidan mount qilinishi kerak —
 * shunda har safar ochilganda holat avtomatik yangidan boshlanadi.
 */
function ImportModal({ onHide, entityTitle, fields, options, onImportChunk, onFinished }) {
  const [step, setStep] = useState('source')
  const [source, setSource] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [sheetRows, setSheetRows] = useState([])
  const [headerRowIndex, setHeaderRowIndex] = useState(0)
  const [mapping, setMapping] = useState({})
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [results, setResults] = useState({ okCount: 0, failed: [] })
  const cancelRef = useRef(false)

  // Ustunlar soni sarlavha qatoriga qarab emas, faylning eng keng qatoriga
  // qarab olinadi: 1C eksportida sarlavha qatori maʼlumotdan qisqa boʻlishi mumkin.
  const columnCount = sheetRows.reduce((max, row) => Math.max(max, row.length), 0)

  const headers = Array.from({ length: columnCount }, (_, i) => {
    const label = cellText(sheetRows[headerRowIndex]?.[i])
    return label || t('Столбец {v}', { v: i + 1 })
  })

  const dataRows = sheetRows
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => cellText(cell) !== ''))

  const handleClose = () => {
    cancelRef.current = true
    onHide?.()
  }

  const selectSource = (item) => {
    setSource(item)
    setError('')
    setStep('upload')
  }

  // Sarlavha qatori almashsa, ustunlar nomi ham oʻzgaradi — moslik qaytadan taxmin qilinadi.
  const chooseHeaderRow = (rows, index) => {
    const labels = Array.from({ length: rows.reduce((max, r) => Math.max(max, r.length), 0) }, (_, i) =>
      cellText(rows[index]?.[i]) || t('Столбец {v}', { v: i + 1 }),
    )

    const guessed = {}
    fields.forEach((field) => {
      const columnIndex = guessColumn(field, labels)
      guessed[field.key] = columnIndex === -1 ? '' : String(columnIndex)
    })

    setHeaderRowIndex(index)
    setMapping(guessed)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setFileName(file.name)

    try {
      const rows = await readWorkbook(file)

      if (rows.length < 2) {
        setError(t('В файле не найдено данных. Нужна строка с названиями столбцов и хотя бы одна строка данных.'))
        return
      }

      setSheetRows(rows)
      chooseHeaderRow(rows, detectHeaderRow(rows))
      setStep('mapping')
    } catch (err) {
      setError(err.message || t('Не удалось прочитать файл'))
    }
  }

  const canImport =
    dataRows.length > 0 && fields.every((f) => !f.required || mapping[f.key] !== '')

  const buildRowObject = (row) => {
    const obj = {}
    fields.forEach((field) => {
      const idx = mapping[field.key]
      obj[field.key] = idx === '' || idx == null ? '' : cellText(row[Number(idx)])
    })
    return obj
  }

  /** Tanlangan ustundagi dastlabki toʻldirilgan qiymatlar — moslik toʻgʻriligini koʻrish uchun. */
  const columnSamples = (columnIndex) => {
    const samples = []
    for (const row of dataRows) {
      const value = cellText(row[columnIndex])
      if (value) samples.push(value)
      if (samples.length === 3) break
    }
    return samples
  }

  // Maʼlumot sarlavha qatoridan keyin boshlanadi, Excel qatorlari esa 1 dan sanaladi.
  const excelRow = (index) => headerRowIndex + index + 2

  const runImport = async () => {
    setStep('importing')
    setProgress({ done: 0, total: dataRows.length })
    const failed = []
    let okCount = 0

    for (let start = 0; start < dataRows.length; start += CHUNK_SIZE) {
      if (cancelRef.current) return

      const chunk = dataRows.slice(start, start + CHUNK_SIZE).map(buildRowObject)

      try {
        const result = await onImportChunk(chunk)
        okCount += result?.created ?? 0
        for (const rowError of result?.errors ?? []) {
          failed.push({
            index: excelRow(start + rowError.index),
            message: rowError.message || t('Ошибка импорта'),
          })
        }
      } catch (err) {
        // Butun paket yiqilsa (tarmoq/validatsiya), undagi har bir qator xato deb belgilanadi.
        chunk.forEach((_, i) =>
          failed.push({ index: excelRow(start + i), message: err.message || t('Ошибка импорта') }),
        )
      }

      setProgress({ done: Math.min(start + CHUNK_SIZE, dataRows.length), total: dataRows.length })
    }

    setResults({ okCount, failed })
    setStep('result')
    if (okCount > 0) onFinished?.()
  }

  return (
    <Modal show onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton={step !== 'importing'}>
        <Modal.Title>{t('Импорт: {entityTitle}', { entityTitle })}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 'source' && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {SOURCE_SYSTEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectSource(item)}
                className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition hover:border-primary/45 hover:bg-primary-soft"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-fg">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-subtle">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 'upload' && source && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setStep('source')}
              className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-subtle hover:text-fg"
            >
              <ArrowLeft className="size-3.5" /> {t('Назад к выбору источника')}
            </button>

            <p className="text-[13px] text-muted">{source.hint}</p>

            <Form.Group controlId="importFile">
              <Form.Label>{t('Файл ({label})', { label: source.label })}</Form.Label>
              <Form.Control type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
            </Form.Group>

            {fileName && !error && (
              <p className="text-[11px] text-subtle">{t('Выбран файл: {fileName}', { fileName })}</p>
            )}
            {error && (
              <p className="flex items-center gap-1.5 text-[12px] text-danger-soft-fg">
                <AlertTriangle className="size-3.5" /> {error}
              </p>
            )}
          </div>
        )}

        {step === 'mapping' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-muted">
              {t('Укажите, какому столбцу из файла соответствует каждое поле. Найдено строк: {length}.', { length: dataRows.length })}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <Form.Group key={field.key} controlId={`map-${field.key}`}>
                  <Form.Label>
                    {field.label} {field.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Select
                    value={mapping[field.key] ?? ''}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  >
                    <option value="">{t('— не импортировать —')}</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </Form.Select>
                  {mapping[field.key] !== '' && mapping[field.key] != null ? (
                    <Form.Text className="truncate">
                      {t('Пример: {v}', { v: columnSamples(Number(mapping[field.key])).join(', ') || t('— пусто —') })}
                    </Form.Text>
                  ) : (
                    field.hint && <Form.Text>{field.hint}</Form.Text>
                  )}
                </Form.Group>
              ))}
            </div>

            {options && <div className="rounded-xl border border-line bg-surface-2/60 p-3">{options}</div>}

            <div>
              <p className="mb-1.5 text-[11px] font-medium text-subtle">
                {t('Предпросмотр (первые {min} строк)', { min: Math.min(5, dataRows.length) })}
              </p>
              <Table>
                <thead>
                  <tr>
                    {fields.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.slice(0, 5).map((row, ri) => {
                    const obj = buildRowObject(row)
                    return (
                      <tr key={ri}>
                        {fields.map((field) => (
                          <td key={field.key} className="truncate">
                            {obj[field.key] || <span className="text-subtle">—</span>}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner size="lg" />
            <p className="text-[13px] text-muted">
              {t('Импортировано {done} из {total}', { done: progress.done, total: progress.total })}
            </p>
            <ProgressBar now={progress.done} max={progress.total || 1} className="w-full" />
          </div>
        )}

        {step === 'result' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-fg">
                <CheckCircle2 className="size-4" />
              </span>
              <p className="text-[13px] text-fg">
                {t('Успешно импортировано:')} <strong>{results.okCount}</strong> {t('из {length}', { length: dataRows.length })}
              </p>
            </div>

            {results.failed.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-danger-soft-fg">
                  <XCircle className="size-3.5" /> {t('Не удалось импортировать: {length}', { length: results.failed.length })}
                </p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-line">
                  <Table hover={false}>
                    <thead>
                      <tr>
                        <th>{t('Строка')}</th>
                        <th>{t('Причина')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((f) => (
                        <tr key={f.index}>
                          <td>{f.index}</td>
                          <td>{f.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {step === 'mapping' && (
          <>
            <Button variant="outline-secondary" onClick={() => setStep('upload')}>
              {t('Назад')}
            </Button>
            <Button onClick={runImport} disabled={!canImport}>
              <Upload /> {t('Импортировать')}
            </Button>
          </>
        )}
        {(step === 'source' || step === 'upload') && (
          <Button variant="outline-secondary" onClick={handleClose}>
            {t('Отмена')}
          </Button>
        )}
        {step === 'result' && <Button onClick={handleClose}>{t('Готово')}</Button>}
      </Modal.Footer>
    </Modal>
  )
}

/** Roʻyxat sahifasining sozlamalar (shesternya) menyusi: import / eksport. */
function ImportExportMenu({ onImport, onExport, exporting }) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        icon
        caret={false}
        aria-label={t('Настройки')}
        title={t('Настройки')}
      >
        <Settings />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end">
        <Dropdown.Item onClick={onImport}>
          <Upload /> {t('Импорт')}
        </Dropdown.Item>
        <Dropdown.Item onClick={onExport} disabled={exporting}>
          <Download /> {exporting ? t('Экспорт...') : t('Экспорт в Excel')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export { ImportModal, ImportExportMenu }
