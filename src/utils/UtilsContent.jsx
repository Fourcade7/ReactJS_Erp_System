import { useEffect, useState } from 'react'
import { Alert, Collapse, ProgressBar, Spinner } from '../ui'
import { t } from '../i18n'

/** Ochilish animatsiyasi bilan chiqadigan, yopish mumkin boʻlgan ogohlantirish. */
function DismissibleAlert({ variant, alertMsg }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Collapse in={show}>
      <div className="pb-3">
        <Alert variant={variant} dismissible onClose={() => setShow(false)}>
          {alertMsg}
        </Alert>
      </div>
    </Collapse>
  )
}

function AlertDismissibleDanger(props) {
  return <DismissibleAlert variant="danger" alertMsg={props.alertMsg} />
}

function AlertDismissibleSuccess(props) {
  return <DismissibleAlert variant="success" alertMsg={props.alertMsg} />
}

/** Soʻrov bajarilayotganini bildiruvchi indikator. */
function ProgressDismissible({ label = t('Пожалуйста, подождите') }) {
  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <Spinner size="md" />
      <p className="text-xs text-subtle">{label}</p>
      <ProgressBar animated className="w-full" />
    </div>
  )
}

export { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible }
