import { useState } from 'react'
import { formatMoney, parseAmount } from '../lib/format'
import { useRequest } from '../lib/useRequest'
import { Alert, Button, Form, Modal, Spinner } from '../ui'
import { addSalaryPayment, getSalarySheet, updateSalaryPayment } from './SalaryApi'
import Segmented from './Segmented'
import { PAYMENT_METHODS, PAYMENT_TYPES, personName, periodMonth } from './salaryView'
import { t } from '../i18n'

const MONTH = /^\d{4}-\d{2}$/

const moneyInput = (setter) => (e) => {
  const value = parseAmount(e.target.value)
  setter(value ? formatMoney(value) : '')
}

/**
 * Oylik to'lovi qo'shish / tahrirlash. Tahrirda xodim va oy o'zgarmaydi.
 * Oyning okladi shu oy vedomostidan olinadi: oyda to'lov bo'lsa — birinchi to'lovda muhrlangani,
 * bo'lmasa — xodimning joriy okladi. Qo'lda o'zgartirilsa — shu oydagi barcha to'lovlarda yangilanadi.
 */
function SalaryPaymentModal({ payment, initial, employees, onHide, onSaved }) {
  const editing = Boolean(payment)
  const [employeeId, setEmployeeId] = useState(String(payment?.employee?.id ?? initial?.employeeId ?? ''))
  const [month, setMonth] = useState(payment ? periodMonth(payment.period) : (initial?.month ?? ''))
  const [type, setType] = useState(payment?.type ?? 'salary')
  const [method, setMethod] = useState(payment?.method ?? 'cash')
  const [amount, setAmount] = useState(payment ? formatMoney(payment.amount) : '')
  // null — o'zgartirilmagan: vedomostdagi oklad ko'rsatiladi va server ham shuni oladi.
  const [normInput, setNormInput] = useState(null)
  const [comment, setComment] = useState(payment?.comment ?? '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const validMonth = MONTH.test(month)
  const sheetRequest = useRequest(() => getSalarySheet(month), validMonth ? month : null)
  // Oy almashganda eski oy javobi ko'rinib qolmasin.
  const sheet = sheetRequest.data?.month === month ? sheetRequest.data : null

  const id = Number(employeeId)
  const employee = employees.find((item) => item.id === id) ?? payment?.employee ?? null
  const row = sheet?.rows.find((item) => item.employee.id === id)
  const locked = Boolean(row?.payments.length)
  // Shu to'lovdan tashqari oyda berilgani (tahrirda to'lovning o'zi vedomostda bor).
  const paidOther = (row?.paid ?? 0) - (editing && row ? payment.amount : 0)

  const defaultNorm = row?.norm ?? (editing ? payment.norm : employee?.salary) ?? null
  const normText = normInput ?? (defaultNorm ? formatMoney(defaultNorm) : '')
  const norm = parseAmount(normText)
  const value = parseAmount(amount)
  const remaining = norm ? Math.max(norm - paidOther, 0) : null
  const overpay = value && remaining !== null && value > remaining ? value - remaining : 0
  const showInfo = Boolean(employee) && validMonth

  const save = async () => {
    // Tahrirda xodim o'chirilgan bo'lishi mumkin — to'lovni baribir tuzatsa bo'ladi.
    const found = { employee: !editing && !employee, month: !validMonth, amount: !value, norm: !norm }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setSaving(true)
    setServerError('')
    try {
      const body = { amount: value, type, method, comment: comment.trim(), norm: normInput !== null ? norm : undefined }
      onSaved(editing
        ? await updateSalaryPayment(payment.id, body)
        : await addSalaryPayment({ ...body, employee_id: id, month }))
    } catch (e) {
      setServerError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editing ? t('Изменить выплату') : t('Выплата зарплаты')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Form.Group controlId="salaryEmployee">
            <Form.Label>{t('Сотрудник')}</Form.Label>
            {editing ? (
              <Form.Control value={personName(payment.employee)} disabled />
            ) : (
              <Form.Select
                value={employeeId}
                isInvalid={errors.employee}
                onChange={(e) => {
                  setEmployeeId(e.target.value)
                  setNormInput(null)
                }}
              >
                <option value="">{t('Выберите сотрудника…')}</option>
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {personName(item)}
                    {item.salary ? ` — ${formatMoney(item.salary)}` : ''}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
          <Form.Group controlId="salaryMonth">
            <Form.Label>{t('За какой месяц')}</Form.Label>
            <Form.Control
              type="month"
              value={month}
              disabled={editing}
              isInvalid={errors.month}
              onChange={(e) => {
                setMonth(e.target.value)
                setNormInput(null)
              }}
            />
          </Form.Group>
        </div>

        {showInfo && (
          <div className="rounded-lg border border-line bg-surface-2/60 p-3">
            {!sheet && !sheetRequest.error ? (
              <div className="flex justify-center py-2">
                <Spinner size="sm" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Form.Group controlId="salaryNorm">
                    <Form.Label>{t('Оклад за месяц')}</Form.Label>
                    <Form.Control
                      size="sm"
                      inputMode="numeric"
                      value={normText}
                      isInvalid={errors.norm}
                      onChange={moneyInput(setNormInput)}
                      placeholder="0"
                    />
                  </Form.Group>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted">{t('Уже выплачено')}</p>
                    <p className="text-[13px] font-semibold tabular-nums text-fg">{formatMoney(paidOther)}</p>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted">{t('Остаток')}</p>
                    <p className="text-[13px] font-semibold tabular-nums text-fg">
                      {remaining === null ? '—' : formatMoney(remaining)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-subtle">
                  {errors.norm
                    ? t('Оклад не назначен — укажите оклад за этот месяц.')
                    : locked
                      ? t('Оклад этого месяца зафиксирован первой выплатой. Если его изменить, он изменится во всех выплатах месяца.')
                      : employee.salary
                        ? t('По текущему окладу сотрудника.')
                        : t('Оклад не назначен — укажите оклад за этот месяц.')}
                </p>
              </>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-6">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">{t('Тип выплаты')}</p>
            <Segmented options={PAYMENT_TYPES} value={type} onChange={setType} label={t('Тип выплаты')} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">{t('Способ выплаты')}</p>
            <Segmented options={PAYMENT_METHODS} value={method} onChange={setMethod} label={t('Способ выплаты')} />
          </div>
        </div>

        <Form.Group controlId="salaryPaymentAmount">
          <Form.Label>{t('Сумма, сум')}</Form.Label>
          <div className="flex gap-2">
            <Form.Control
              autoFocus={editing || Boolean(initial?.employeeId)}
              inputMode="numeric"
              value={amount}
              isInvalid={errors.amount}
              onChange={moneyInput(setAmount)}
              placeholder="0"
            />
            {remaining > 0 && value !== remaining && (
              <Button variant="outline-secondary" className="shrink-0" onClick={() => setAmount(formatMoney(remaining))}>
                {t('Весь остаток')}
              </Button>
            )}
          </div>
          {errors.amount && <Form.Text className="text-danger">{t('Введите сумму больше нуля')}</Form.Text>}
        </Form.Group>

        <Form.Group controlId="salaryPaymentComment">
          <Form.Label>{t('Комментарий')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('Например: аванс за первую половину месяца')}
          />
        </Form.Group>

        {overpay > 0 && (
          <Alert variant="warning">{t('Сумма больше остатка на {amount} сум — получится переплата.', { amount: formatMoney(overpay) })}</Alert>
        )}
        {sheetRequest.error && <Alert variant="danger">{sheetRequest.error.message}</Alert>}
        {serverError && <Alert variant="danger">{serverError}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Отмена')}
        </Button>
        <Button loading={saving} onClick={save}>
          {editing ? t('Сохранить') : t('Выплатить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SalaryPaymentModal
