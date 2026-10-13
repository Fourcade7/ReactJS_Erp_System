import { useState } from 'react'
import { Alert, Button, Form, Modal } from '../ui'
import { CustomerPicker } from '../customers/CustomerPicker'
import { t } from '../i18n'

const nameOf = (customer) =>
  customer ? `${customer.username ?? ''} ${customer.surname ?? ''}`.trim() : ''

/**
 * Savdo qilingandan keyin kontragentni almashtirish: kassir adashib boshqasini tanlagan bo'lishi mumkin.
 * Kontragent qidiruv bo'yicha tanlanadi yoki shu yerning o'zida yangisi (odam / tashkilot) ochiladi.
 * Savdo bilan birga qarz, qaytarishlar va shartnoma (bo'lsa) yangi kontragentga o'tadi.
 *
 *  - `changeCustomer(saleId, customerId, userId)` — `Response` qaytaradi;
 *  - `onDone(updatedSale)` — saqlangach (backend yangilangan tafsilotni qaytaradi).
 */
function SaleCustomerModal({ sale, changeCustomer, onHide, onDone }) {
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const current = sale.customer
  const same = Boolean(customer && current && customer.id === current.id)

  const submit = async () => {
    if (!customer || same) return
    setSaving(true)
    setError('')
    try {
      const res = await changeCustomer(sale.id, customer.id, Number(localStorage.getItem('userid')) || undefined)
      const result = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          (Array.isArray(result?.message) ? result.message.join(', ') : result?.message) || t('Ошибка сервера'),
        )
        return
      }
      onDone(result)
    } catch {
      setError(t('Не удалось подключиться к серверу'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={saving ? undefined : onHide} centered>
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
          <CustomerPicker value={customer} onChange={setCustomer} disabled={saving} />
          {same && <p className="mt-1.5 text-[12px] text-danger-soft-fg">{t('Этот контрагент уже указан в продаже')}</p>}
        </Form.Group>

        <Alert variant="info">
          {t('Долг, возвраты и договор (если он есть) этой продажи перейдут к новому контрагенту.')}
        </Alert>

        {error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
          {t('Отмена')}
        </Button>
        <Button loading={saving} disabled={!customer || same} onClick={submit}>
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SaleCustomerModal
