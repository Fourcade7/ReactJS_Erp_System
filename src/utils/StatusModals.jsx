import { CheckCircle2, XCircle } from 'lucide-react'
import { Modal, ProgressBar, Spinner } from '../ui'

/**
 * Soʻrov bajarilayotganda koʻrsatiladigan modal.
 * Barcha boʻlimlarda bir xil koʻrinishda boʻlishi uchun shu yerda saqlanadi.
 */
function LoadingModal({ show, onHide, title = 'Загрузка...', text = 'Пожалуйста, подождите' }) {
  return (
    <Modal show={show} onHide={onHide} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <Spinner size="lg" />
        <p className="text-[13px] text-muted">{text}</p>
        <ProgressBar animated className="w-full" />
      </div>
    </Modal>
  )
}

/** Amal natijasi: muvaffaqiyat yoki xato xabari. */
function ResultModal({ show, onHide, success, message }) {
  return (
    <Modal show={show} onHide={onHide} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title>{success ? 'Готово' : 'Ошибка'}</Modal.Title>
      </Modal.Header>
      <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-2 text-center">
        <span
          className={
            success
              ? 'inline-flex size-11 items-center justify-center rounded-full bg-success-soft text-success-soft-fg'
              : 'inline-flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger-soft-fg'
          }
        >
          {success ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
        </span>
        <p className="text-[13px] text-fg">{message}</p>
      </div>
    </Modal>
  )
}

export { LoadingModal, ResultModal }
