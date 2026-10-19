import { useState } from 'react'
import { ChevronDown, Plus, Wrench } from 'lucide-react'
import { cn } from '../lib/cn'
import { Collapse, Form } from '../ui'
import { t } from '../i18n'
import { isMaster, readFee, useMembers } from './masterFee'

/**
 * Usta xizmati: tovarlar ro'yxatining o'zida usta tanlanadi va ikkala summa alohida yoziladi (biri ikkinchisidan
 * ayirilmaydi): «Мастеру» — ustaning puli, savdo summasi va foydaga kirmaydi (alohida hisoblanadi); «Компании» —
 * savdo summasiga qo'shiladi (tovarlar bilan birga to'lanadi). Masalan, ustaga 500 000 va kompaniyaga 20 000.
 * Summalar majburiy emas: yozilmasa usta 0 / 0 bilan qo'shiladi.
 * Kam ishlatiladi — shuning uchun yig'ilgan turadi: kichik "Услуга мастера" yozuvi bosilsa ochiladi.
 * `onAdd({ master: { id, username, surname }, amount, companyAmount })` — `amount` ustaning ulushi.
 */
function MasterFeeRow({ onAdd }) {
  const [open, setOpen] = useState(false)
  const masters = useMembers().filter(isMaster)
  const [masterId, setMasterId] = useState('')
  const [amount, setAmount] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')

  const fee = readFee(amount, company)

  const add = () => {
    const master = masters.find((item) => String(item.id) === masterId)
    if (!master) return setError(t('Выберите мастера'))
    if (!fee.valid) return setError(t('Введите сумму'))

    onAdd({
      master: { id: master.id, username: master.username, surname: master.surname },
      amount: fee.amount,
      companyAmount: fee.companyAmount,
    })
    setAmount('')
    setCompany('')
    setError('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') add()
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'inline-flex w-fit items-center gap-1 rounded px-0.5 text-[11px] transition',
          open ? 'text-fg' : 'text-subtle hover:text-fg',
        )}
      >
        <Wrench className="size-3" />
        {t('Услуга мастера')}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>

      <Collapse in={open}>
        <div className="mt-1.5 flex flex-col gap-1.5 rounded-card border border-dashed border-line bg-surface-2/50 p-2">
          <p className="m-0 text-[11px] text-subtle">
            {t('В сумму продажи входит только доля компании. Суммы можно не указывать — будет 0.')}
          </p>
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
          <div className="flex gap-1.5">
            <div className="min-w-0 flex-1">
              <Form.Control
                inputMode="numeric"
                aria-label={t('Сумма услуги мастера')}
                title={t('Сколько получает мастер — не входит в сумму продажи')}
                placeholder={t('Сумма услуги мастера')}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^\d\s]/g, ''))
                  setError('')
                }}
                onKeyDown={onKeyDown}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Form.Control
                inputMode="numeric"
                aria-label={t('Доля компании')}
                title={t('Доля компании — входит в сумму продажи')}
                placeholder={t('Доля компании')}
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value.replace(/[^\d\s]/g, ''))
                  setError('')
                }}
                onKeyDown={onKeyDown}
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
          {fee.valid && fee.amount > 0 && fee.companyAmount > 0 && !error && (
            <p className="m-0 text-[11.5px] tabular-nums text-subtle">
              {t('Итого услуга: {total} (услуга мастера {master} + доля компании {company})', {
                total: fee.total.toLocaleString('uz'),
                master: fee.amount.toLocaleString('uz'),
                company: fee.companyAmount.toLocaleString('uz'),
              })}
            </p>
          )}
          {error && <p className="m-0 text-[11.5px] text-danger-soft-fg">{error}</p>}
        </div>
      </Collapse>
    </div>
  )
}

export default MasterFeeRow
