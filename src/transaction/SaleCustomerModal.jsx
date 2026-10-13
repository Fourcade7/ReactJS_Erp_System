import { useState } from 'react'
import { Alert, Button, Form, Modal } from '../ui'
import { CustomerPicker } from '../customers/CustomerPicker'
import { amountsOf } from './amounts'
import { t } from '../i18n'

const nameOf = (customer) =>
  customer ? `${customer.username ?? ''} ${customer.surname ?? ''}`.trim() : ''

/**
 * Savdo qilingandan keyin kontragentni almashtirish: kassir adashib boshqasini tanlagan bo'lishi mumkin.
 * Kontragent qidiruv bo'yicha tanlanadi yoki shu yerning o'zida yangisi (odam / tashkilot) ochiladi.
 * Savdo bilan birga qarz, qaytarishlar va shartnoma (bo'lsa) yangi kontragentga o'tadi.
 *
 * Qarzi qolgan va shartnomasi yo'q savdoni shu yerning o'zida "По договору" ga o'tkazish mumkin:
 * shartnoma va kuzatuv vazifasi avtomatik ochiladi (xuddi kassadagi "По договору" savdosidagidek).
 *
 *  - `changeCustomer(saleId, customerId, userId, byContract)` — `Response` qaytaradi;
 *  - `onDone(updatedSale, { customerChanged, byContract })` — saqlangach (backend yangilangan tafsilotni qaytaradi).
 */
function SaleCustomerModal({ sale, changeCustomer, onHide, onDone }) {
  const [customer, setCustomer] = useState(null)
  const [byContract, setByContract] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const current = sale.customer
  // `contract === null` — tafsilot yuklangan va shartnoma yo'q; `undefined` — hali yuklanmagan (ro'yxatdagi nusxa).
  const { remaining } = amountsOf(sale)
  const canContract = sale.contract === null && remaining > 0

  const same = Boolean(customer && current && customer.id === current.id)
  const withContract = byContract && canContract
  const customerId = customer && !same ? customer.id : undefined
  const canSave = Boolean(customerId) || withContract

  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const res = await changeCustomer(
        sale.id,
        customerId,
        Number(localStorage.getItem('userid')) || undefined,
        withContract,
      )
      const result = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          (Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'),
        )
        return
      }
      onDone(result, { customerChanged: Boolean(customerId), byContract: withContract })
    } catch {
      setError(t('Не удалось подключиться к серверу'))
    } finally {
      setSaving(false)
    }
  }

  return (
    // `lg`: yangi tashkilot formasi (rekvizitlar bilan) 3 ustunga yoyilib, ekran balandligiga sig'adi.
    <Modal show onHide={saving ? undefined : onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Изменить контрагента')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Сейчас')}</p>
          <p className="mt-0.5 text-[13px] font-medium text-fg">{current ? nameOf(current) : t('Не указан')}</p>
        </div>

        <Form.Group controlId="saleCustomerPicker">
          <Form.Label>{t('Новый контрагент')}</Form.Label>
          <CustomerPicker value={customer} onChange={setCustomer} disabled={saving} spread />
          {same && !withContract && (
            <p className="mt-1.5 text-[12px] text-danger-soft-fg">{t('Этот контрагент уже указан в продаже')}</p>
          )}
        </Form.Group>

        {canContract && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface-2 p-3">
            <Form.Check
              type="switch"
              id="saleByContract"
              label={t('Оформить по договору')}
              checked={byContract}
              disabled={saving}
              onChange={(event) => setByContract(event.target.checked)}
            />
            <p className="text-[12px] leading-snug text-muted">
              {t('Будет открыт договор по этой продаже и задача по нему. Бухгалтер возьмёт договор в работу, внесёт реквизиты и оплату по договору. Долг {amount} останется до поступления оплаты.', {
                amount: `${remaining.toLocaleString('uz')} So'm`,
              })}
            </p>
          </div>
        )}

        <Alert variant="info">
          {t('Долг, возвраты и договор (если он есть) этой продажи перейдут к новому контрагенту.')}
        </Alert>

        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button loading={saving} disabled={!canSave} onClick={submit}>
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SaleCustomerModal
