import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { plural, RECORDS } from '../lib/format'
import { Alert, Button, Form, Modal } from '../ui'
import { t, td } from '../i18n'
import { addExpenseCategory, deleteExpenseCategory, updateExpenseCategory } from './ExpenseApi'

/**
 * Xarajat turlarini sozlash. Qayta nomlansa, shu turdagi xarajatlar ham yangi nomga o'tadi;
 * xarajatlari bor tur o'chirilganda ular boshqa turga ko'chiriladi (xarajatlar o'chmaydi).
 * `onChanged({ from, to })` — ota ekran filtrda tanlangan turni yangilashi uchun.
 */
function ExpenseCategories({ categories, onChanged, onHide }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [removing, setRemoving] = useState(null)

  const run = async (action, change) => {
    setBusy(true)
    setError('')
    try {
      const result = await action()
      onChanged(change)
      return result ?? true
    } catch (e) {
      setError(e.message)
      return undefined
    } finally {
      setBusy(false)
    }
  }

  const remove = async (item) => {
    const target = categories.find((other) => String(other.id) === removing.moveTo)
    const done = await run(() => deleteExpenseCategory(item.id, target?.id), { from: item.name, to: target?.name })
    if (done) setRemoving(null)
  }

  return (
    <Modal show onHide={onHide} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{t('Виды расходов')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3 overflow-y-auto">
        <p className="text-xs text-subtle">
          {t('Новое название сохраняется, когда поле теряет фокус, и меняется во всех расходах этого вида.')}
        </p>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {categories.map((item) => (
            <li key={item.id} className="rounded-lg border border-line p-2">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Form.Control
                    size="sm"
                    key={`${item.id}-${item.name}`}
                    defaultValue={item.name}
                    maxLength={100}
                    aria-label={t('Название вида')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim()
                      if (value && value !== item.name) {
                        run(() => updateExpenseCategory(item.id, value), { from: item.name, to: value })
                      } else e.target.value = item.name
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-[11px] tabular-nums text-subtle">
                  {plural(item.count, RECORDS)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon
                  disabled={busy}
                  title={t('Удалить')}
                  aria-label={t('Удалить вид')}
                  onClick={() => setRemoving({ id: item.id, moveTo: '' })}
                >
                  <Trash2 />
                </Button>
              </div>

              {removing?.id === item.id && (
                <div className="mt-2 flex flex-col gap-2 rounded-md border border-danger/25 bg-danger-soft p-2.5 text-xs text-danger-soft-fg">
                  <p>
                    {item.count > 0
                      ? t('В виде «{name}» {count}. Чтобы удалить вид, перенесите их в другой:', {
                          name: td(item.name),
                          count: plural(item.count, RECORDS),
                        })
                      : t('Удалить вид «{name}»? Расходов в нём нет.', { name: td(item.name) })}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.count > 0 && (
                      <div className="min-w-48 flex-1">
                        <Form.Select
                          size="sm"
                          aria-label={t('Перенести в вид')}
                          value={removing.moveTo}
                          onChange={(e) => setRemoving({ ...removing, moveTo: e.target.value })}
                        >
                          <option value="">{t('Выберите вид…')}</option>
                          {categories
                            .filter((other) => other.id !== item.id)
                            .map((other) => (
                              <option key={other.id} value={other.id}>
                                {td(other.name)}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busy}
                      disabled={item.count > 0 && !removing.moveTo}
                      onClick={() => remove(item)}
                    >
                      <Trash2 />
                      {item.count > 0 ? t('Перенести и удалить') : t('Удалить')}
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setRemoving(null)}>
                      {t('Отмена')}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <form
          className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-line p-3"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!name.trim()) return
            if (await run(() => addExpenseCategory(name.trim()))) setName('')
          }}
        >
          <div className="min-w-48 flex-1">
            <Form.Label>{t('Новый вид')}</Form.Label>
            <Form.Control
              size="sm"
              value={name}
              maxLength={100}
              placeholder={t('Название расхода, например «Вывоз мусора»')}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button size="sm" type="submit" disabled={busy || !name.trim()}>
            <Plus />
            {t('Добавить вид')}
          </Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Закрыть окно')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ExpenseCategories
export { ExpenseCategories }
