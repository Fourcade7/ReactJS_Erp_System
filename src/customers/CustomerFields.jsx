import { useState } from 'react'
import { Building2, ChevronDown, UserRound } from 'lucide-react'
import { cn } from '../lib/cn'
import { Form } from '../ui'
import { ORG_DETAILS } from './customerForm'
import { t } from '../i18n'

/**
 * Kontragent formasi: odam (ism, familiya, telefon) yoki tashkilot (nomi + ixtiyoriy rekvizitlar).
 * Klientlar bo'limi, kassadagi "Новый контрагент" va tahrirlash oynasi bir xil maydonlardan foydalanadi.
 * Tashkilotda faqat nomi majburiy — qolgani (telefon ham) keyinroq, masalan shartnomada, to'ldiriladi.
 */

/** Odam / tashkilot almashtirgichi. */
export function CustomerTypeSwitch({ value, onChange, className }) {
  const options = [
    { key: 'user', label: t('Человек'), Icon: UserRound },
    { key: 'organization', label: t('Организация'), Icon: Building2 },
  ]
  return (
    <div
      role="radiogroup"
      aria-label={t('Тип контрагента')}
      className={cn('inline-flex w-full rounded-lg border border-line bg-surface-2 p-0.5', className)}
    >
      {options.map((option) => {
        const { key, label, Icon } = option
        return (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => value !== key && onChange(key)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
            value === key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
        )
      })}
    </div>
  )
}

/**
 * Maydonlar. `compact` — tor ustun (kassa paneli): maydonlar ustma-ust, tashkilot rekvizitlari yig'iladi.
 * `idPrefix` — bir sahifada bir nechta forma bo'lsa elementlar id si to'qnashmasligi uchun.
 */
export function CustomerFields({ value, onChange, invalid = {}, compact = false, idPrefix = 'customer', lockType = false }) {
  const organization = value.type === 'organization'
  const [expanded, setExpanded] = useState(() => ORG_DETAILS.some((field) => value[field.key]))
  const showDetails = !compact || expanded

  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value })
  const grid = cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-2')
  const wide = (extra) => (compact ? undefined : cn('sm:col-span-2', extra))

  return (
    <div className="flex flex-col gap-3">
      {!lockType && <CustomerTypeSwitch value={value.type} onChange={(type) => onChange({ ...value, type })} />}

      {organization ? (
        <>
          <div className={grid}>
            <Form.Group controlId={`${idPrefix}-org`} className={wide()}>
              <Form.Label>{t('Название организации')} *</Form.Label>
              <Form.Control
                value={value.orgName}
                isInvalid={Boolean(invalid.orgName)}
                placeholder={t('Например: ООО «Ромашка»')}
                onChange={set('orgName')}
              />
            </Form.Group>
            <Form.Group controlId={`${idPrefix}-phone`} className={wide()}>
              <Form.Label>
                {t('Телефон')} <span className="font-normal text-subtle">({t('необязательно')})</span>
              </Form.Label>
              <Form.Control
                type="tel"
                value={value.phone}
                placeholder={t('Введите номер телефона')}
                onChange={set('phone')}
              />
            </Form.Group>
          </div>

          {compact && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="inline-flex items-start gap-1 self-start text-left text-[12px] font-medium text-primary hover:underline"
            >
              <ChevronDown className={cn('size-3.5 transition', expanded && 'rotate-180')} />
              {t('Реквизиты организации (необязательно)')}
            </button>
          )}

          {showDetails && (
            <div className={grid}>
              {ORG_DETAILS.map((field) => (
                <Form.Group key={field.key} controlId={`${idPrefix}-${field.key}`} className={field.wide ? wide() : undefined}>
                  <Form.Label>{field.label}</Form.Label>
                  <Form.Control
                    value={value[field.key]}
                    inputMode={field.numeric ? 'numeric' : undefined}
                    onChange={set(field.key)}
                  />
                </Form.Group>
              ))}
            </div>
          )}

          <p className="text-[11px] leading-snug text-subtle">
            {t('Обязательно только название. Остальное можно заполнить позже — например, в договоре.')}
          </p>
        </>
      ) : (
        <>
          <div className={grid}>
            <Form.Group controlId={`${idPrefix}-name`}>
              <Form.Label>{t('Имя')}</Form.Label>
              <Form.Control
                value={value.username}
                isInvalid={Boolean(invalid.username)}
                placeholder={t('Введите имя')}
                onChange={set('username')}
              />
            </Form.Group>
            <Form.Group controlId={`${idPrefix}-surname`}>
              <Form.Label>{t('Фамилия')}</Form.Label>
              <Form.Control
                value={value.surname}
                isInvalid={Boolean(invalid.surname)}
                placeholder={t('Введите фамилию')}
                onChange={set('surname')}
              />
            </Form.Group>
          </div>
          <Form.Group controlId={`${idPrefix}-phone`}>
            <Form.Label>{t('Телефон')}</Form.Label>
            <Form.Control
              type="tel"
              value={value.phone}
              isInvalid={Boolean(invalid.phone)}
              placeholder={t('Введите номер телефона')}
              onChange={set('phone')}
            />
          </Form.Group>
        </>
      )}

      {Object.keys(invalid).length > 0 && (
        <p className="text-[12px] text-danger-soft-fg">
          {organization ? t('Укажите название организации') : t('Заполните имя, фамилию и телефон')}
        </p>
      )}
    </div>
  )
}
