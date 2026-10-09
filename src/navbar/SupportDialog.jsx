import { Fragment } from 'react'
import { X } from 'lucide-react'
import { Modal } from '../ui'
import { ZzzIcon } from '../ui/ZzzIcon'
import { t } from '../i18n'

const PHONE = '+998 90 722 43 07'
const BACKUP_PHONE = '+998 77 360 62 20'
const BACKUP_TELEGRAM = '@Dadaxon6220'

/** Telefon/Telegram — bir bosishda belgilanadi (nusxalash uchun). */
const Contact = ({ children }) => (
  <span className="select-all whitespace-nowrap font-semibold text-fg">{children}</span>
)

/** `t()` natijasidagi `{nom}` oʻrinlariga matn oʻrniga element qoʻyadi. */
function withValues(template, values) {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const name = part.match(/^\{(\w+)\}$/)?.[1]
    return name && name in values ? <Fragment key={index}>{values[name]}</Fragment> : part
  })
}

/** Yuqori paneldagi "Поддержка" bosilganda: markazda uxlayotgan belgi va aloqa matni. */
function SupportDialog({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered size="md" aria-label={t('Поддержка')}>
      <div className="relative flex flex-col items-center gap-4 px-6 py-9 text-center">
        <button
          type="button"
          aria-label={t('Закрыть')}
          onClick={onHide}
          className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" />
        </button>

        <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg">
          <ZzzIcon className="size-8" />
        </span>

        <p className="max-w-sm text-[14px] leading-relaxed text-muted">
          {withValues(
            t('Звоните на номер {phone}. Если я не отвечаю — значит, сплю: проснусь и сам перезвоню.'),
            { phone: <Contact>{PHONE}</Contact> },
          )}
        </p>

        <div className="h-px w-16 bg-line" />

        <p className="max-w-sm text-[14px] leading-relaxed text-muted">
          {withValues(t('Если очень срочно — обратитесь к Дадахону: {phone}, {telegram}'), {
            phone: <Contact>{BACKUP_PHONE}</Contact>,
            telegram: <Contact>{BACKUP_TELEGRAM}</Contact>,
          })}
        </p>
      </div>
    </Modal>
  )
}

export default SupportDialog
