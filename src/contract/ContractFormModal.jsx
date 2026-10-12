import { useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from '../ui'
import { formatMoney, parseAmount } from '../lib/format'
import { t } from '../i18n'
import { CustomerPicker } from '../customers/CustomerPicker'
import { uploadMany } from '../attachment/AttachmentApi'
import { FilePicker } from '../attachment/Attachments'
import { fullName, roleLabel } from '../task/taskView'
import { addContract, updateContract } from './ContractApi'
import { CURRENCIES, MANUAL_STATUSES, statusOf } from './contractView'

/**
 * Shartnoma ochish / tahrirlash. Yangi shartnomada fayllarni darrov tanlash mumkin:
 * shartnoma yaratilgach ular ketma-ket yuklanadi.
 */
function ContractFormModal({ contract, members, defaultResponsibleId, onHide, onSaved }) {
  const editing = Boolean(contract)
  // Savdodan ochilgan shartnoma: summa, valyuta va kontragent savdoga bog'liq (server ham o'zgartirtirmaydi).
  const fromSale = Boolean(contract?.sale)

  const [number, setNumber] = useState(contract?.number ?? '')
  const [subject, setSubject] = useState(contract?.subject ?? '')
  const [customer, setCustomer] = useState(contract?.customer ?? null)
  const [amount, setAmount] = useState(contract?.amount ? formatMoney(contract.amount) : '')
  const [currency, setCurrency] = useState(contract?.currency ?? 'UZS')
  const [contractDate, setContractDate] = useState(contract?.contractDate ?? '')
  const [responsibleId, setResponsibleId] = useState(contract?.responsible?.id ?? defaultResponsibleId ?? '')
  const [status, setStatus] = useState('draft')
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Buxgalterlar ro'yxat boshida.
  const sorted = [...members].sort(
    (a, b) => Number(b.role?.toLowerCase() === 'accountant') - Number(a.role?.toLowerCase() === 'accountant'),
  )

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const common = {
        subject: subject.trim() || undefined,
        amount: parseAmount(amount) ?? 0,
        currency,
      }
      if (editing) {
        const saved = await updateContract(contract.id, {
          ...common,
          subject: subject.trim(),
          number: number.trim() || undefined,
          customer_id: customer?.id ?? null,
          contractDate: contractDate || null,
          responsible_id: Number(responsibleId) || null,
        })
        onSaved(saved, [])
        return
      }

      const saved = await addContract({
        ...common,
        number: number.trim() || undefined,
        customer_id: customer?.id,
        contractDate: contractDate || undefined,
        responsible_id: Number(responsibleId) || undefined,
        status,
      })
      const uploadErrors = files.length ? await uploadMany(files, { contractId: saved.id }) : []
      onSaved(saved, uploadErrors)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={onHide} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? t('Изменить договор') : t('Новый договор')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Group controlId="contractNumber">
            <Form.Label>{t('Номер договора')}</Form.Label>
            <Form.Control
              value={number}
              maxLength={50}
              placeholder={editing ? '' : t('Присвоится автоматически')}
              onChange={(e) => setNumber(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="contractDate">
            <Form.Label>{t('Дата договора')}</Form.Label>
            <Form.Control type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} />
          </Form.Group>
        </div>

        <Form.Group controlId="contractSubject">
          <Form.Label>{t('Предмет договора')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={subject}
            placeholder={t('Например: поставка оборудования')}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Form.Group>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">{t('Контрагент')}</p>
          <CustomerPicker value={customer} onChange={setCustomer} readOnly={fromSale} />
        </div>

        {/* Savdodan ochilgan shartnomada summa, valyuta va kontragent savdodan olinadi. */}
        {fromSale && (
          <p className="-mt-2 text-[11px] leading-snug text-subtle">
            {t('Договор открыт из продажи: сумма, валюта и контрагент берутся из продажи и здесь не меняются.')}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <Form.Group controlId="contractAmount">
            <Form.Label>{t('Сумма')}</Form.Label>
            <Form.Control
              inputMode="numeric"
              value={amount}
              placeholder="0"
              disabled={fromSale}
              onChange={(e) => {
                const value = parseAmount(e.target.value)
                setAmount(value === null ? '' : formatMoney(value))
              }}
            />
          </Form.Group>
          <Form.Group controlId="contractCurrency">
            <Form.Label>{t('Валюта')}</Form.Label>
            <Form.Select value={currency} disabled={fromSale} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Group controlId="contractResponsible">
            <Form.Label>{t('Ответственный бухгалтер')}</Form.Label>
            <Form.Select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
              <option value="">{t('Не назначен')}</option>
              {sorted.map((member) => (
                <option key={member.id} value={member.id}>
                  {fullName(member)} · {roleLabel(member.role)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {!editing && (
            <Form.Group controlId="contractStatus">
              <Form.Label>{t('Статус')}</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {MANUAL_STATUSES.filter((item) => item !== 'cancelled').map((item) => (
                  <option key={item} value={item}>
                    {statusOf(item).label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </div>

        {!editing && <FilePicker files={files} onChange={setFiles} />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Отмена')}
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving && <Spinner size="sm" />}
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ContractFormModal
export { ContractFormModal }
