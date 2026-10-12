import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Download, ExternalLink, File, FileText, Paperclip, Trash2, Upload, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Button, Spinner } from '../ui'
import { locale, t } from '../i18n'
import { ACCEPT, deleteAttachment, fileUrl, formatSize, uploadMany, validateFile } from './AttachmentApi'

const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })

const uploaderName = (user) => (user ? `${user.username} ${user.surname}`.trim() : '')

/**
 * Rasmni sahifaning o'zida kattalashtirib ko'rsatadi (chapga/o'ngga — ← →). Escape faqat shu
 * oynani yopadi: oyna boshqa modal ustida ochilgani uchun hodisa "capture" bosqichida ushlanadi.
 */
function Lightbox({ images, index, onIndex, onClose }) {
  const image = images[index]
  const count = images.length

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowRight' && count > 1) {
        event.stopImmediatePropagation()
        onIndex((index + 1) % count)
      } else if (event.key === 'ArrowLeft' && count > 1) {
        event.stopImmediatePropagation()
        onIndex((index - 1 + count) % count)
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [count, index, onClose, onIndex])

  if (!image) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.name}
      className="fixed inset-0 z-[1100] flex flex-col bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center gap-3 px-4 py-3 text-white" onClick={(event) => event.stopPropagation()}>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{image.name}</p>
        {count > 1 && (
          <span className="text-xs tabular-nums text-white/70">
            {index + 1} / {count}
          </span>
        )}
        <a
          href={fileUrl(image, true)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={t('Скачать')}
          title={t('Скачать')}
        >
          <Download className="size-5" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={t('Закрыть')}
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        {count > 1 && (
          <button
            type="button"
            aria-label={t('Предыдущее')}
            onClick={(event) => {
              event.stopPropagation()
              onIndex((index - 1 + count) % count)
            }}
            className="absolute left-3 inline-flex size-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        <img
          src={fileUrl(image)}
          alt={image.name}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
        {count > 1 && (
          <button
            type="button"
            aria-label={t('Следующее')}
            onClick={(event) => {
              event.stopPropagation()
              onIndex((index + 1) % count)
            }}
            className="absolute right-3 inline-flex size-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}

/**
 * Biriktirilgan fayllar: rasmlar sahifaning o'zida (kichik rasm -> kattalashtirish), PDF yangi
 * oynada ochiladi, qolganlari yuklab olinadi. Vazifa va shartnomada bir xil ishlatiladi.
 * `target` — `{ taskId }` yoki `{ contractId }`.
 */
function Attachments({ files, target, onChanged }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState([])
  const [over, setOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const images = files.filter((file) => file.kind === 'image')
  const others = files.filter((file) => file.kind !== 'image')

  const upload = async (list) => {
    const picked = [...list]
    if (picked.length === 0) return
    setBusy(true)
    setErrors([])
    const problems = await uploadMany(picked, target)
    setBusy(false)
    setErrors(problems)
    onChanged()
  }

  const remove = async (file) => {
    setConfirmId(null)
    setBusy(true)
    try {
      await deleteAttachment(file.id)
      setErrors([])
    } catch (e) {
      setErrors([e.message])
    }
    setBusy(false)
    onChanged()
  }

  const confirmRow = (file) => (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <span className="text-danger-soft-fg">{t('Удалить?')}</span>
      <Button size="xs" variant="danger" disabled={busy} onClick={() => remove(file)}>
        {t('Да')}
      </Button>
      <Button size="xs" variant="outline-secondary" onClick={() => setConfirmId(null)}>
        {t('Нет')}
      </Button>
    </span>
  )

  return (
    <div
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('Files')) {
          event.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOver(false)
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.files.length) return
        event.preventDefault()
        setOver(false)
        upload(event.dataTransfer.files)
      }}
      className={cn(
        'rounded-lg border border-dashed p-3 transition-colors',
        over ? 'border-primary bg-primary-soft/40' : 'border-line',
      )}
    >
      <div className="flex items-center gap-2">
        <Paperclip className="size-4 text-subtle" />
        <p className="flex-1 text-[11px] font-medium uppercase tracking-wide text-subtle">
          {t('Файлы')} {files.length > 0 && <span className="tabular-nums">({files.length})</span>}
        </p>
        {busy && <Spinner size="sm" />}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            upload(event.target.files)
            event.target.value = ''
          }}
        />
        <Button size="sm" variant="outline-secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload />
          {t('Прикрепить')}
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert variant="danger" dismissible onClose={() => setErrors([])} className="mt-2">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </Alert>
      )}

      {files.length === 0 ? (
        <p className="mt-2 text-xs text-subtle">{t('Перетащите файлы сюда или нажмите «Прикрепить». Изображения, PDF, документы — до 20 МБ.')}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {images.length > 0 && (
            <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4">
              {images.map((file, index) => (
                <li key={file.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setPreview(index)}
                    title={file.name}
                    className="block aspect-square w-full overflow-hidden rounded-lg border border-line bg-surface-2"
                  >
                    <img src={fileUrl(file)} alt={file.name} loading="lazy" className="size-full object-cover transition group-hover:scale-105" />
                  </button>
                  {confirmId === file.id ? (
                    <div className="absolute inset-x-1 bottom-1 flex justify-center rounded-md bg-surface/95 p-1">{confirmRow(file)}</div>
                  ) : (
                    <button
                      type="button"
                      aria-label={t('Удалить файл')}
                      onClick={() => setConfirmId(file.id)}
                      className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition hover:bg-danger group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {others.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {others.map((file) => (
                <li key={file.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2">
                  <span
                    className={cn(
                      'inline-flex size-8 shrink-0 items-center justify-center rounded-md',
                      file.kind === 'pdf' ? 'bg-danger-soft text-danger-soft-fg' : 'bg-surface-2 text-muted',
                    )}
                  >
                    {file.kind === 'pdf' ? <FileText className="size-4" /> : <File className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg" title={file.name}>{file.name}</p>
                    <p className="truncate text-[11px] text-subtle">
                      {formatSize(file.size)} · {date.format(new Date(file.createdAt))}
                      {file.uploadedBy && ` · ${uploaderName(file.uploadedBy)}`}
                    </p>
                  </div>
                  {confirmId === file.id ? (
                    confirmRow(file)
                  ) : (
                    <div className="flex shrink-0 items-center">
                      {file.kind === 'pdf' && (
                        <a
                          href={fileUrl(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('Открыть')}
                          aria-label={t('Открыть')}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                      <a
                        href={fileUrl(file, true)}
                        title={t('Скачать')}
                        aria-label={t('Скачать')}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
                      >
                        <Download className="size-4" />
                      </a>
                      <button
                        type="button"
                        title={t('Удалить файл')}
                        aria-label={t('Удалить файл')}
                        onClick={() => setConfirmId(file.id)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-danger-soft hover:text-danger-soft-fg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview !== null && (
        <Lightbox images={images} index={preview} onIndex={setPreview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}

/**
 * Yangi vazifa/shartnoma formasida: saqlashdan oldin fayllarni tanlash.
 * Fayllar `files` (File[]) holatida turadi; saqlangach `uploadMany` bilan yuklanadi.
 */
function FilePicker({ files, onChange }) {
  const inputRef = useRef(null)
  const [problem, setProblem] = useState('')

  const add = (list) => {
    const accepted = []
    let message = ''
    for (const file of list) {
      const error = validateFile(file)
      if (error) message = error
      else accepted.push(file)
    }
    setProblem(message)
    if (accepted.length) onChange([...files, ...accepted])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            add([...event.target.files])
            event.target.value = ''
          }}
        />
        <Button size="sm" variant="outline-secondary" onClick={() => inputRef.current?.click()}>
          <Paperclip />
          {t('Прикрепить файлы')}
        </Button>
        <span className="text-[11px] text-subtle">{t('Изображения, PDF, документы — до 20 МБ')}</span>
      </div>
      {problem && <p className="text-xs text-danger-soft-fg">{problem}</p>}
      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-1 text-[12px] text-fg"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-subtle">{formatSize(file.size)}</span>
              <button
                type="button"
                aria-label={t('Убрать')}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="text-subtle hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Attachments
export { Attachments, FilePicker }
