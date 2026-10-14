import { useEffect, useState } from 'react'
import { Plus, Wrench } from 'lucide-react'
import { Form } from '../ui'
import { getTaskMembers } from '../task/TaskApi'
import { t } from '../i18n'

const isMaster = (user) => `${user?.role ?? ''}`.trim().toLowerCase() === 'master'

/**
 * Usta xizmati: tovarlar ro'yxatining o'zida usta tanlanadi va uning haqi yoziladi.
 * Bu pul do'konniki emas (ustaga beriladi), shuning uchun savdo summasi va foydaga kirmaydi — alohida hisoblanadi.
 * `onAdd({ master: { id, username, surname }, amount, note })`.
 */
function MasterFeeRow({ onAdd }) {
  const [masters, setMasters] = useState([])
  const [masterId, setMasterId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getTaskMembers()
      .then((members) => {
        if (!cancelled) setMasters((members ?? []).filter(isMaster))
      })
      .catch((e) => console.log(e.message))
    return () => {
      cancelled = true
    }
  }, [])

  const add = () => {
    const master = masters.find((item) => String(item.id) === masterId)
    const value = Math.round(Number(`${amount}`.replace(/\s/g, '').replace(',', '.')))
    if (!master) return setError(t('Выберите мастера'))
    if (!Number.isFinite(value) || value <= 0) return setError(t('Введите сумму больше нуля'))

    onAdd({ master: { id: master.id, username: master.username, surname: master.surname }, amount: value })
    setAmount('')
    setError('')
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-dashed border-line bg-surface-2/50 p-2">
      <p className="m-0 flex items-center gap-1.5 text-[12px] font-medium text-fg">
        <Wrench className="size-3.5 text-primary" />
        {t('Услуга мастера')}
        <span className="font-normal text-subtle">{t('(в сумму продажи не входит)')}</span>
      </p>
      <div className="flex gap-1.5">
        <div className="min-w-0 flex-1">
          <Form.Select
            aria-label={t('Мастер')}
            value={masterId}
            onChange={(e) => {
              setMasterId(e.target.value)
              setError('')
            }}
          >
            <option value="">{masters.length ? t('Выберите мастера') : t('Мастеров нет')}</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {`${master.username ?? ''} ${master.surname ?? ''}`.trim()}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="w-28 shrink-0">
          <Form.Control
            inputMode="numeric"
            aria-label={t('Сумма')}
            placeholder={t('Сумма')}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d\s]/g, ''))
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
          />
        </div>
        <button
          type="button"
          onClick={add}
          title={t('Добавить услугу мастера')}
          aria-label={t('Добавить услугу мастера')}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg transition hover:bg-primary-hover"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {error && <p className="m-0 text-[11.5px] text-danger-soft-fg">{error}</p>}
    </div>
  )
}

export default MasterFeeRow
