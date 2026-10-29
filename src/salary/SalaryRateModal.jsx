import { useState } from 'react'
import { formatMoney, parseAmount } from '../lib/format'
import { Alert, Button, Form, Modal } from '../ui'
import { removeSalary, setSalary } from './SalaryApi'
import { personName } from './salaryView'
import { t } from '../i18n'

/** Xodimning oklad (oylik stavka)ini belgilash, o'zgartirish yoki olib tashlash. */
function SalaryRateModal({ employee, onHide, onSaved }) {
  const [amount, setAmount] = useState(employee.salary ? formatMoney(employee.salary) : '')
  const [invalid, setInvalid] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const run = async (action) => {
    setSaving(true)
    setServerError('')
    try {
      await action()
      onSaved()
    } catch (e) {
      setServerError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const save = () => {
    const value = parseAmount(amount)
    setInvalid(!value)
    if (value) run(() => setSalary(employee.id, value))
  }

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{employee.salary ? t('Изменить оклад') : t('Назначить оклад')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-fg">{personName(employee)}</p>
        <Form.Group controlId="salaryAmount">
          <Form.Label>{t('Оклад в месяц, сум')}</Form.Label>
          <Form.Control
            autoFocus
            inputMode="numeric"
            value={amount}
            isInvalid={invalid}
            onChange={(e) => {
              const value = parseAmount(e.target.value)
              setAmount(value ? formatMoney(value) : '')
            }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="0"
          />
          {invalid ? (
            <Form.Text className="text-danger">{t('Введите сумму больше нуля')}</Form.Text>
          ) : (
            <Form.Text>{t('Новый оклад применяется к месяцам без выплат. В месяце, где выплаты уже есть, оклад меняется в окне выплаты.')}</Form.Text>
          )}
        </Form.Group>

        {confirmRemove && (
          <Alert variant="warning">
            {t('Снять оклад? Сотрудник пропадёт из ведомости месяцев, где у него нет выплат. История выплат сохранится.')}
          </Alert>
        )}
        {serverError && <Alert variant="danger">{serverError}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        {employee.salary && (
          <Button
            variant="outline-danger"
            className="mr-auto"
            disabled={saving}
            onClick={() => (confirmRemove ? run(() => removeSalary(employee.id)) : setConfirmRemove(true))}
          >
            {confirmRemove ? t('Да, снять') : t('Снять оклад')}
          </Button>
        )}
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Отмена')}
        </Button>
        <Button loading={saving} onClick={save}>
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SalaryRateModal
