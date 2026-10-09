import { useEffect, useState } from 'react'
import { CalendarDays, Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { currentMonth, formatMoney, formatMonth, parseAmount, plural, RECORDS } from '../lib/format'
import { Alert, Button, Card, EmptyState, Form, Modal, PageHeader, SearchField, Spinner, Table } from '../ui'
import BarList from '../charts/BarList'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { useRequest } from '../lib/useRequest'
import {
  addExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenses,
  updateExpense,
} from './ExpenseApi'

const OTHER = '__other__'
const EMPTY_CATEGORIES = { defaults: [], custom: [] }

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
        active
          ? 'border-primary/40 bg-primary-soft text-primary-soft-fg'
          : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}

/** Xarajat qo'shish/tahrirlash. Tur — tayyor ro'yxatdan yoki "Другое" bilan qo'lda. */
function ExpenseModal({ expense, categories, onHide, onSaved }) {
  const known = [...categories.defaults, ...categories.custom]
  const initialCategory = expense?.category ?? ''
  const startsKnown = !expense || known.includes(initialCategory)

  const [choice, setChoice] = useState(startsKnown ? initialCategory : OTHER)
  const [custom, setCustom] = useState(startsKnown ? '' : initialCategory)
  const [month, setMonth] = useState(expense ? expense.period.slice(0, 7) : currentMonth())
  const [amount, setAmount] = useState(expense ? formatMoney(expense.amount) : '')
  const [comment, setComment] = useState(expense?.comment ?? '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const category = choice === OTHER ? custom.trim() : choice

  const save = async () => {
    const value = parseAmount(amount)
    const found = {
      category: !category,
      month: !/^\d{4}-\d{2}$/.test(month),
      amount: !value,
    }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return

    setSaving(true)
    setServerError('')
    try {
      const body = { category, month, amount: value, comment: comment.trim() }
      onSaved(expense ? await updateExpense(expense.id, body) : await addExpense(body))
    } catch (e) {
      setServerError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{expense ? 'Изменить расход' : 'Новый расход'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Вид расхода</p>
          <div className="flex flex-wrap gap-1.5">
            {known.map((name) => (
              <Chip key={name} active={choice === name} onClick={() => { setChoice(name); setErrors({}) }}>
                {name}
              </Chip>
            ))}
            <Chip active={choice === OTHER} onClick={() => { setChoice(OTHER); setErrors({}) }}>
              Другое…
            </Chip>
          </div>
          {choice === OTHER && (
            <Form.Control
              autoFocus
              className="mt-2"
              maxLength={100}
              value={custom}
              isInvalid={errors.category}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Название расхода, например «Вывоз мусора»"
            />
          )}
          {errors.category && <Form.Text className="text-danger">Выберите или впишите вид расхода</Form.Text>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Form.Group controlId="expenseMonth">
            <Form.Label>За какой месяц</Form.Label>
            <Form.Control type="month" value={month} isInvalid={errors.month} onChange={(e) => setMonth(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="expenseAmount">
            <Form.Label>Сумма, сум</Form.Label>
            <Form.Control
              inputMode="numeric"
              value={amount}
              isInvalid={errors.amount}
              onChange={(e) => {
                const value = parseAmount(e.target.value)
                setAmount(value ? formatMoney(value) : '')
              }}
              placeholder="0"
            />
            {errors.amount && <Form.Text className="text-danger">Введите сумму больше нуля</Form.Text>}
          </Form.Group>
        </div>

        <Form.Group controlId="expenseComment">
          <Form.Label>Комментарий</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: счёт №123, оплачено наличными"
          />
        </Form.Group>

        {serverError && <Alert variant="danger">{serverError}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button loading={saving} onClick={save}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ExpenseScreen() {
  const [month, setMonth] = useState(currentMonth())
  const [allMonths, setAllMonths] = useState(false)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const categoriesRequest = useRequest(getExpenseCategories, `categories-${reload}`)
  const categories = categoriesRequest.data ?? EMPTY_CATEGORIES

  const query = { page, limit: 15, search: debouncedSearch, category, month: allMonths ? '' : month }
  const listRequest = useRequest(() => getExpenses(query), `${JSON.stringify(query)}|${reload}`)
  const result = listRequest.data
  const loading = listRequest.loading
  const error = actionError || (listRequest.error ? listRequest.error.message : '')

  const refresh = () => setReload((n) => n + 1)

  const confirmDelete = async () => {
    try {
      await deleteExpense(deleting.id)
      setDeleting(null)
      refresh()
    } catch (e) {
      setActionError(e.message)
      setDeleting(null)
    }
  }

  const summary = result?.summary
  const periodLabel = allMonths ? 'за всё время' : formatMonth(month).toLowerCase()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ReceiptText}
        title="Расходы"
        description="Газ, свет, вода, аренда, зарплата и другие расходы — по месяцам"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus />
            Добавить расход
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Form.Control
            type="month"
            aria-label="Месяц"
            className="w-44"
            value={month}
            disabled={allMonths}
            onChange={(e) => {
              setMonth(e.target.value)
              setPage(1)
            }}
          />
          <Form.Check
            type="switch"
            label="Все месяцы"
            checked={allMonths}
            onChange={(e) => {
              setAllMonths(e.target.checked)
              setPage(1)
            }}
          />
        </div>
        <div className="w-52">
          <Form.Select
            aria-label="Вид расхода"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Все виды</option>
            {[...categories.defaults, ...categories.custom].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Form.Select>
        </div>
        <SearchField
          className="min-w-56 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Поиск по виду или комментарию..."
        />
      </div>

      {error && (
        <Alert variant="danger" dismissible={Boolean(actionError)} onClose={() => setActionError('')}>
          {error}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card padded={false}>
          <Card.Header>
            <div>
              <Card.Title>Итого {periodLabel}</Card.Title>
              <Card.Subtitle className="mt-0.5">{summary ? plural(summary.count, RECORDS) : '—'}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="flex flex-col gap-4">
            <p className="text-2xl font-semibold tracking-tight text-fg">
              {formatMoney(summary?.amount ?? 0)}
              <span className="ml-1.5 text-sm font-medium text-subtle">сум</span>
            </p>
            <BarList
              items={(summary?.byCategory ?? []).map((row) => ({
                key: row.category,
                label: row.category,
                value: row.amount,
              }))}
              emptyText="Расходов нет"
            />
          </Card.Body>
        </Card>

        <div className={cn('flex flex-col gap-3 transition-opacity', loading && result && 'opacity-60')}>
          {loading && !result ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : result?.data.length ? (
            <Table>
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th>Вид</th>
                  <th className="text-right">Сумма</th>
                  <th>Комментарий</th>
                  <th>Кто</th>
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {result.data.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <CalendarDays className="size-3.5 text-subtle" />
                        {formatMonth(row.period.slice(0, 7))}
                      </span>
                    </td>
                    <td className="font-medium text-fg">{row.category}</td>
                    <td className="whitespace-nowrap text-right font-semibold tabular-nums text-fg">
                      {formatMoney(row.amount)}
                    </td>
                    <td className="max-w-64 truncate text-muted" title={row.comment ?? ''}>
                      {row.comment || '—'}
                    </td>
                    <td className="whitespace-nowrap text-subtle">
                      {row.user ? `${row.user.username} ${row.user.surname}`.trim() : '—'}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" icon title="Изменить" aria-label="Изменить" onClick={() => setEditing(row)}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="sm" icon title="Удалить" aria-label="Удалить" onClick={() => setDeleting(row)}>
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState icon={ReceiptText} title={`Расходов ${periodLabel} нет`} description="Нажмите «Добавить расход»." />
          )}

          <div className="flex justify-center">
            <CustomPaginationScreen active={page} pageCount={result?.meta.totalPages ?? 0} setActive={setPage} />
          </div>
        </div>
      </div>

      {editing && (
        <ExpenseModal
          expense={editing === 'new' ? null : editing}
          categories={categories}
          onHide={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}

      <Modal show={Boolean(deleting)} onHide={() => setDeleting(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Удалить расход?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleting && `${deleting.category} · ${formatMonth(deleting.period.slice(0, 7))} · ${formatMoney(deleting.amount)} сум`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleting(null)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export { ExpenseScreen }
