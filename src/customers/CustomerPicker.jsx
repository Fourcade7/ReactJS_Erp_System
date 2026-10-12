import { useEffect, useState } from 'react'
import { Plus, UserPlus, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Button, Form, Spinner } from '../ui'
import { useRequest } from '../lib/useRequest'
import { t } from '../i18n'
import { addCustomer, getAllCustomersPaginationSearch } from './CustomerApi'

const MIN_QUERY = 2
const LIMIT = 6

const customerName = (customer) =>
  customer ? `${customer.username ?? ''} ${customer.surname ?? ''}`.trim() : ''

/** Qidiruv matnidan yangi kontragent maydonlarini taxmin qiladi: raqamlar — telefon, so'zlar — ism va familiya. */
function guessFields(query) {
  const text = query.trim()
  if (/^[+\d\s()-]{5,}$/.test(text)) return { username: '', surname: '', phone: text }
  const [first = '', ...rest] = text.split(/\s+/)
  return { username: first, surname: rest.join(' '), phone: '' }
}

/**
 * Mijoz jadvalida yangi kontragent ochish: qidiruvda topilmasa shu yerning o'zida.
 * `compact` — tor ustunda (kassa paneli) maydonlar ustma-ust joylashadi.
 */
function NewCustomerForm({ initial, onCreated, onCancel, compact = false }) {
  const [username, setUsername] = useState(initial.username)
  const [surname, setSurname] = useState(initial.surname)
  const [phone, setPhone] = useState(initial.phone)
  const [invalid, setInvalid] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const found = {}
    if (!username.trim()) found.username = true
    if (!surname.trim()) found.surname = true
    if (!phone.trim()) found.phone = true
    setInvalid(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    setError('')
    try {
      // Kontragent doim "Клиенты" jadvaliga (Customer) yoziladi — qayerdan ochilishidan qat'i nazar.
      const response = await addCustomer(username.trim(), surname.trim(), phone.trim())
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(
          response.status === 409
            ? t('Контрагент с таким телефоном уже есть — найдите его через поиск')
            : (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) || t('Ошибка сервера'),
        )
        return
      }
      onCreated(data)
    } catch {
      setError(t('Не удалось подключиться к серверу'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-3">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg">
        <UserPlus className="size-4 text-primary" />
        {t('Новый контрагент')}
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      {/*
        Breakpoint ko'rinish oynasiga qaraydi, ammo forma tor ustunda (masalan, kassadagi 290px panel) turishi mumkin —
        shu bois tor joyda `compact` bilan bitta ustun, kengida esa `minmax(0, 1fr)` (maydonlar chetga chiqmaydi).
      */}
      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')}>
        <Form.Group controlId="newCustomerName">
          <Form.Label>{t('Имя')}</Form.Label>
          <Form.Control
            value={username}
            isInvalid={Boolean(invalid.username)}
            placeholder={t('Введите имя')}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="newCustomerSurname">
          <Form.Label>{t('Фамилия')}</Form.Label>
          <Form.Control
            value={surname}
            isInvalid={Boolean(invalid.surname)}
            placeholder={t('Введите фамилию')}
            onChange={(e) => setSurname(e.target.value)}
          />
        </Form.Group>
      </div>
      <Form.Group controlId="newCustomerPhone">
        <Form.Label>{t('Телефон')}</Form.Label>
        <Form.Control
          type="tel"
          value={phone}
          isInvalid={Boolean(invalid.phone)}
          placeholder={t('Введите номер телефона')}
          onChange={(e) => setPhone(e.target.value)}
        />
        {Object.keys(invalid).length > 0 && (
          <Form.Text className="text-danger">{t('Заполните имя, фамилию и телефон')}</Form.Text>
        )}
      </Form.Group>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline-secondary" size="sm" onClick={onCancel} disabled={busy}>
          {t('Отмена')}
        </Button>
        <Button size="sm" onClick={submit} disabled={busy}>
          {busy && <Spinner size="sm" />}
          {t('Создать и выбрать')}
        </Button>
      </div>
    </div>
  )
}

/**
 * Kontragent (mijoz) tanlash. Ro'yxat ochilmaydi: faqat qidiruv bo'yicha (kamida 2 belgi) eng ko'pi bilan
 * {LIMIT} ta natija chiqadi. Topilmasa — yangisini shu yerning o'zida ochish mumkin; yangi kontragent
 * "Клиенты" jadvaliga yoziladi.
 *
 *  - `value` — tanlangan kontragent ({ id, username, surname, phone }) yoki null;
 *  - `onChange(customer | null)`;
 *  - `readOnly` — faqat ko'rsatish (tanlash/olib tashlash yo'q).
 */
function CustomerPicker({ value, onChange, readOnly = false, disabled = false }) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [search])

  const searching = debounced.length >= MIN_QUERY
  const { data, loading } = useRequest(
    () => getAllCustomersPaginationSearch(1, LIMIT, debounced),
    open && searching ? `customers-${debounced}` : null,
  )
  const customers = searching ? (data?.data ?? []) : []
  const total = data?.meta?.total ?? 0

  if (value) {
    return (
      <div className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-fg">
        <span className="min-w-0 truncate">
          {customerName(value)}
          {value.phone && <span className="text-subtle"> · {value.phone}</span>}
        </span>
        {!readOnly && (
          <button
            type="button"
            disabled={disabled}
            aria-label={t('Убрать контрагента')}
            onClick={() => onChange(null)}
            className="shrink-0 text-subtle transition hover:text-danger disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    )
  }

  if (readOnly) return <span className="text-subtle">—</span>

  if (creating) {
    return (
      <NewCustomerForm
        initial={creating}
        onCancel={() => setCreating(null)}
        onCreated={(customer) => {
          setCreating(null)
          setSearch('')
          onChange(customer)
        }}
      />
    )
  }

  return (
    <div className="relative">
      <Form.Control
        value={search}
        disabled={disabled}
        placeholder={t('Имя, фамилия или телефон контрагента…')}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-72 w-full list-none overflow-auto rounded-lg border border-line bg-surface p-1 shadow-pop">
          {!searching ? (
            <li className="px-3 py-2 text-xs text-subtle">{t('Начните вводить имя, фамилию или телефон')}</li>
          ) : loading && !data ? (
            <li className="flex justify-center py-3">
              <Spinner size="sm" />
            </li>
          ) : customers.length === 0 ? (
            <li className="px-3 py-2 text-xs text-subtle">{t('Контрагенты не найдены')}</li>
          ) : (
            customers.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  // mousedown: fokus yo'qolib ro'yxat yopilishidan oldin tanlov bajariladi.
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onChange(customer)
                    setSearch('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-fg hover:bg-surface-2"
                >
                  <span className="truncate">{customerName(customer)}</span>
                  <span className="shrink-0 text-[11px] text-subtle">{customer.phone}</span>
                </button>
              </li>
            ))
          )}
          {searching && total > customers.length && customers.length > 0 && (
            <li className="px-3 py-1.5 text-[11px] text-subtle">
              {t('Показаны первые {count} — уточните поиск', { count: customers.length })}
            </li>
          )}
          <li className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                setCreating(guessFields(search))
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium text-primary hover:bg-surface-2"
            >
              <Plus className="size-4" />
              {t('Создать нового контрагента')}
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

export default CustomerPicker
export { CustomerPicker, NewCustomerForm }
