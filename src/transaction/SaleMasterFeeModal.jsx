import { useState } from 'react'
import { cn } from '../lib/cn'
import { Alert, Button, Form, Modal } from '../ui'
import { t, td } from '../i18n'
import { amountsOf } from './amounts'
import { isMaster, personName, readFee, useMembers } from './masterFee'

/** Kompaniya ulushi qanday to'landi. "В долг" — to'lov yozilmaydi, ulush savdo qarziga qo'shiladi. */
const METHODS = ['Наличные', 'Банковская карта', 'Click', 'Payme', 'Uzum', 'В долг']

/**
 * Savdo qilingandan keyin usta xizmatini qo'shish (usta kech kelgan bo'lsa). Hisob kassadagidek: ikkala summa alohida
 * yoziladi (ayirilmaydi) — «Мастеру» ustaning puli (savdo summasiga kirmaydi), «Компании» savdo summasiga qo'shiladi.
 *
 *  - `addMasterFee(saleId, { masterId, amount, companyAmount, method }, userId)` — `Response` qaytaradi;
 *  - `onDone(updatedSale)` — saqlangach (backend yangilangan tafsilotni qaytaradi).
 */
function SaleMasterFeeModal({ sale, addMasterFee, onHide, onDone }) {
  const masters = useMembers().filter(isMaster)
  const [masterId, setMasterId] = useState('')
  const [amount, setAmount] = useState('')
  const [company, setCompany] = useState('')
  const [method, setMethod] = useState(METHODS[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fee = readFee(amount, company)
  const { companyAmount } = fee
  const canSave = Boolean(masterId) && fee.valid && !saving

  const { net } = amountsOf(sale)
  const debt = method === 'В долг'

  const submit = async () => {
    if (!masterId) return setError(t('Выберите мастера'))
    if (!fee.valid) return setError(t('Введите сумму больше нуля'))

    setSaving(true)
    setError('')
    try {
      const res = await addMasterFee(
        sale.id,
        {
          masterId: Number(masterId),
          amount: fee.amount,
          companyAmount,
          method: companyAmount > 0 ? method : undefined,
        },
        Number(localStorage.getItem('userid')) || undefined,
      )
      const result = await res.json().catch(() => null)
      if (!res.ok) {
        setError((Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'))
        return
      }
      onDone(result)
    } catch {
      setError(t('Не удалось подключиться к серверу'))
    } finally {
      setSaving(false)
    }
  }

  const changeAmount = (setter) => (e) => {
    setter(e.target.value.replace(/[^\d\s]/g, ''))
    setError('')
  }

  return (
    <Modal show onHide={saving ? undefined : onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Добавить услугу мастера')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <Form.Group controlId="saleFeeMaster">
          <Form.Label>{t('Мастер')}</Form.Label>
          <Form.Select
            value={masterId}
            disabled={saving}
            onChange={(e) => {
              setMasterId(e.target.value)
              setError('')
            }}
          >
            <option value="">{masters.length ? t('Выберите мастера') : t('Мастеров нет')}</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {personName(master)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="grid grid-cols-2 gap-3">
          <Form.Group controlId="saleFeeMasterAmount">
            <Form.Label>{t('Сумма услуги мастера')}</Form.Label>
            <Form.Control
              inputMode="numeric"
              placeholder="500 000"
              value={amount}
              disabled={saving}
              onChange={changeAmount(setAmount)}
            />
          </Form.Group>
          <Form.Group controlId="saleFeeCompany">
            <Form.Label>{t('Доля компании')}</Form.Label>
            <Form.Control
              inputMode="numeric"
              placeholder="20 000"
              value={company}
              disabled={saving}
              onChange={changeAmount(setCompany)}
            />
          </Form.Group>
        </div>

        {fee.valid && fee.amount > 0 && companyAmount > 0 && (
          <p className="-mt-2 text-[12px] tabular-nums text-muted">
            {t('Итого услуга: {total} (услуга мастера {master} + доля компании {company})', {
              total: fee.total.toLocaleString('uz'),
              master: fee.amount.toLocaleString('uz'),
              company: companyAmount.toLocaleString('uz'),
            })}
          </p>
        )}

        {fee.valid && companyAmount > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-2 p-3">
            <p className="text-[12px] font-medium text-fg">{t('Как оплачена доля компании')}</p>
            <div className="flex flex-wrap gap-1.5">
              {METHODS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={saving}
                  aria-pressed={method === value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-[12px] transition',
                    method === value
                      ? value === 'В долг'
                        ? 'border-danger/50 bg-danger-soft text-danger-soft-fg'
                        : 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                      : 'border-line bg-surface text-muted hover:text-fg',
                  )}
                >
                  {td(value)}
                </button>
              ))}
            </div>
            <p className="text-[12px] leading-snug text-muted">
              {t('Сумма продажи: {from} → {to}.', {
                from: net.toLocaleString('uz'),
                to: (net + companyAmount).toLocaleString('uz'),
              })}{' '}
              {debt
                ? t('Долг по продаже увеличится на {amount}.', { amount: companyAmount.toLocaleString('uz') })
                : t('Оплата {amount} будет записана сегодняшним числом.', { amount: companyAmount.toLocaleString('uz') })}
              {sale.contract && ` ${t('Сумма договора {number} тоже изменится.', { number: sale.contract.number })}`}
            </p>
          </div>
        )}

        <Alert variant="info">{t('Доля мастера не входит в сумму продажи — она считается отдельно, как и при оформлении продажи.')}</Alert>

        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button loading={saving} disabled={!canSave} onClick={submit}>
          {t('Добавить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SaleMasterFeeModal
