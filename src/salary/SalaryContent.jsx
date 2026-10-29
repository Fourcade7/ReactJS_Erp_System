import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight, ClipboardList, HandCoins, History, Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import { cn } from '../lib/cn'
import { currentMonth, formatDayTime, formatMoney, formatMonth, plural } from '../lib/format'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Card, Collapse, EmptyState, Form, Modal, PageHeader, ProgressBar, SearchField, Spinner, Tab, Table, Tabs } from '../ui'
import { deleteSalaryPayment, getSalarySheet } from './SalaryApi'
import SalaryPaymentModal from './SalaryPaymentModal'
import SalaryPayments from './SalaryPayments'
import SalaryRateModal from './SalaryRateModal'
import Segmented from './Segmented'
import { SALARY_STATUS, methodLabel, periodMonth, personName, typeLabel } from './salaryView'
import { t } from '../i18n'

const MONTH = /^\d{4}-\d{2}$/
const EMPLOYEES = ['сотрудник', 'сотрудника', 'сотрудников']
const PAYMENTS = ['выплата', 'выплаты', 'выплат']
const EMPTY = []

function StatTile({ label, value, hint, children }) {
  return (
    <Card className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-xl font-semibold tracking-tight tabular-nums text-fg">
        {formatMoney(value)}
        <span className="ml-1 text-xs font-medium text-subtle">{t('сум')}</span>
      </p>
      {children}
      {hint && <p className="text-[11px] text-subtle">{hint}</p>}
    </Card>
  )
}

/** Xodimning shu oydagi to'lovlari (vedomost qatori ochilganda). */
function MonthPayments({ row, onEdit, onDelete }) {
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {row.payments.map((payment) => {
        // Vedomostdagi to'lovda xodimning faqat id si bor — oynalar uchun to'liq nomi qo'shiladi.
        const full = { ...payment, employee: row.employee }
        return (
          <li key={payment.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-xs">
            <span className="w-32 shrink-0 tabular-nums text-muted">{formatDayTime(payment.createdAt)}</span>
            <Badge bg={payment.type === 'advance' ? 'info' : 'primary'}>{typeLabel(payment.type)}</Badge>
            <span className="text-muted">{methodLabel(payment.method)}</span>
            <span className="min-w-0 flex-1 truncate text-subtle" title={payment.comment ?? ''}>
              {[payment.comment, payment.user && personName(payment.user)].filter(Boolean).join(' · ')}
            </span>
            <span className="font-semibold tabular-nums text-fg">{formatMoney(payment.amount)}</span>
            <span className="flex">
              <Button variant="ghost" size="xs" icon title={t('Изменить')} aria-label={t('Изменить')} onClick={() => onEdit(full)}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="xs" icon title={t('Удалить')} aria-label={t('Удалить')} onClick={() => onDelete(full)}>
                <Trash2 />
              </Button>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Oy vedomosti: kimga qancha tegishli, qancha berildi, qancha qoldi. */
function SalarySheet({ month, onMonthChange, request, onPay, onRate, onEdit, onDelete }) {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  // null — standart: vedomost bo'sh bo'lsa ro'yxat ochiq turadi.
  const [unassignedOpen, setUnassignedOpen] = useState(null)

  const sheet = request.data
  const rows = sheet?.rows ?? EMPTY
  const summary = sheet?.summary
  const query = search.trim().toLowerCase()
  const matches = (employee) => !query || personName(employee).toLowerCase().includes(query)

  const visible = rows.filter((row) => (!status || row.status === status) && matches(row.employee))
  const inSheet = new Set(rows.map((row) => row.employee.id))
  const unassigned = (sheet?.employees ?? EMPTY).filter((item) => item.salary === null && !inSheet.has(item.id) && matches(item))
  const showUnassigned = unassignedOpen ?? rows.length === 0

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const statusFilters = [
    { key: '', label: t('Все'), count: rows.length },
    ...Object.entries(SALARY_STATUS).map(([key, item]) => ({ key, label: item.label, count: summary?.counts[key] ?? 0 })),
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Form.Control
          type="month"
          aria-label={t('Месяц')}
          className="w-44"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        />
        <Segmented options={statusFilters} value={status} onChange={setStatus} label={t('Статус')} />
        <SearchField
          className="min-w-48 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={t('Поиск по сотруднику...')}
        />
      </div>

      {request.error && <Alert variant="danger">{request.error.message}</Alert>}

      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label={t('Начислено')} value={summary.norm} hint={plural(summary.employees, EMPLOYEES)} />
          <StatTile
            label={t('Выплачено')}
            value={summary.paid}
            hint={summary.advance > 0 ? t('из них аванс {amount} сум', { amount: formatMoney(summary.advance) }) : null}
          >
            <ProgressBar size="sm" variant="success" now={summary.paid} max={summary.norm || 1} />
          </StatTile>
          <StatTile
            label={t('Осталось выплатить')}
            value={summary.remaining}
            hint={summary.overpaid > 0 ? t('переплата {amount} сум', { amount: formatMoney(summary.overpaid) }) : null}
          />
        </div>
      )}

      <div className={cn('flex flex-col gap-3 transition-opacity', request.loading && sheet && 'opacity-60')}>
        {request.loading && !sheet ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : visible.length ? (
          <Table>
            <thead>
              <tr>
                <th>{t('Сотрудник')}</th>
                <th className="text-right">{t('Оклад')}</th>
                <th className="text-right">{t('Выплачено')}</th>
                <th className="text-right">{t('Остаток')}</th>
                <th>{t('Статус')}</th>
                <th aria-label={t('Действия')} />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const id = row.employee.id
                const open = expanded.has(id) && row.payments.length > 0
                const state = SALARY_STATUS[row.status]
                return (
                  <Fragment key={id}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          disabled={!row.payments.length}
                          aria-expanded={open}
                          title={row.payments.length ? t('Выплаты за месяц') : undefined}
                          onClick={() => toggle(id)}
                          className="flex items-center gap-1.5 text-left disabled:cursor-default"
                        >
                          <ChevronRight
                            className={cn(
                              'size-3.5 shrink-0 text-subtle transition-transform',
                              open && 'rotate-90',
                              !row.payments.length && 'invisible',
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-fg">{personName(row.employee)}</span>
                            <span className="block text-[11px] text-subtle">
                              {row.employee.role}
                              {row.payments.length > 0 && ` · ${plural(row.payments.length, PAYMENTS)}`}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap text-right tabular-nums text-fg">
                        {formatMoney(row.norm)}
                        {row.salary !== row.norm && (
                          <span className="block text-[11px] text-subtle">
                            {row.salary === null ? t('оклад снят') : t('сейчас {amount}', { amount: formatMoney(row.salary) })}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-right">
                        <span className="font-semibold tabular-nums text-fg">{formatMoney(row.paid)}</span>
                        <ProgressBar
                          size="sm"
                          variant={row.status === 'paid' ? 'success' : 'warning'}
                          now={row.paid}
                          max={row.norm}
                          className="ml-auto mt-1 w-24"
                        />
                        {row.advance > 0 && (
                          <span className="block text-[11px] text-subtle">
                            {t('аванс {amount}', { amount: formatMoney(row.advance) })}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-right tabular-nums">
                        {row.overpaid > 0 ? (
                          <span className="text-warning-soft-fg" title={t('Переплата')}>
                            +{formatMoney(row.overpaid)}
                          </span>
                        ) : (
                          <span className={row.remaining > 0 ? 'font-semibold text-fg' : 'text-subtle'}>{formatMoney(row.remaining)}</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={state.tone} dot>
                          {state.label}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap text-right">
                        {row.remaining > 0 && (
                          <Button variant="outline-primary" size="xs" onClick={() => onPay(id)}>
                            <HandCoins />
                            {t('Выплатить')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon
                          title={t('Оклад')}
                          aria-label={t('Оклад')}
                          onClick={() => onRate({ ...row.employee, salary: row.salary })}
                        >
                          <Pencil />
                        </Button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-surface-2/40">
                        <td colSpan={6} className="!py-1.5 !pl-9">
                          <MonthPayments row={row} onEdit={onEdit} onDelete={onDelete} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={Wallet}
            title={rows.length ? t('Ничего не найдено') : t('В ведомости за {month} никого нет', { month: formatMonth(month).toLowerCase() })}
            description={rows.length ? null : t('Назначьте сотрудникам оклад — они появятся в ведомости.')}
          />
        )}
      </div>

      {unassigned.length > 0 && (
        <Card padded={false}>
          <button
            type="button"
            aria-expanded={showUnassigned}
            onClick={() => setUnassignedOpen(!showUnassigned)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-fg">{t('Без оклада')}</span>
            <span className="text-xs tabular-nums text-subtle">{unassigned.length}</span>
            <span className="ml-auto hidden text-xs text-subtle sm:inline">{t('Назначьте оклад — сотрудник появится в ведомости')}</span>
            <ChevronDown className={cn('size-4 shrink-0 text-subtle transition-transform', showUnassigned && 'rotate-180')} />
          </button>
          <Collapse in={showUnassigned}>
            <ul className="m-0 list-none divide-y divide-line border-t border-line p-0">
              {unassigned.map((employee) => (
                <li key={employee.id} className="flex items-center gap-3 px-4 py-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-fg">
                    {personName(employee)}
                    <span className="ml-2 text-[11px] text-subtle">{employee.role}</span>
                  </span>
                  <Button variant="outline-primary" size="xs" onClick={() => onRate(employee)}>
                    <Plus />
                    {t('Назначить оклад')}
                  </Button>
                </li>
              ))}
            </ul>
          </Collapse>
        </Card>
      )}
    </div>
  )
}

/**
 * "Зарплата": har bir xodimga oklad belgilanadi, oy bo'yicha avans va oylik to'lovlari yuritiladi.
 * To'lovlar dashboard dagi xarajatlar va sof foydaga ham kiradi.
 */
function SalaryScreen() {
  const [tab, setTab] = useState('sheet')
  const [month, setMonth] = useState(currentMonth())
  const [reload, setReload] = useState(0)
  const [paying, setPaying] = useState(null)
  const [rating, setRating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [actionError, setActionError] = useState('')

  const sheetRequest = useRequest(() => getSalarySheet(month), MONTH.test(month) ? `${month}|${reload}` : null)
  const employees = sheetRequest.data?.employees ?? EMPTY

  const refresh = () => setReload((n) => n + 1)

  const confirmDelete = async () => {
    try {
      await deleteSalaryPayment(deleting.id)
      refresh()
    } catch (e) {
      setActionError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  const edit = (payment) => setPaying({ payment })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Wallet}
        title={t('Зарплата')}
        description={t('Оклады сотрудников, авансы и выплаты зарплаты по месяцам')}
        actions={
          <Button onClick={() => setPaying({ initial: { month: MONTH.test(month) ? month : currentMonth() } })}>
            <HandCoins />
            {t('Выплатить')}
          </Button>
        }
      />

      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <Tabs activeKey={tab} onSelect={setTab}>
        <Tab
          eventKey="sheet"
          title={
            <>
              <ClipboardList />
              {t('Ведомость')}
            </>
          }
        >
          <SalarySheet
            month={month}
            onMonthChange={setMonth}
            request={sheetRequest}
            onPay={(employeeId) => setPaying({ initial: { month, employeeId } })}
            onRate={setRating}
            onEdit={edit}
            onDelete={setDeleting}
          />
        </Tab>
        <Tab
          eventKey="payments"
          title={
            <>
              <History />
              {t('Журнал выплат')}
            </>
          }
        >
          <SalaryPayments
            month={month}
            onMonthChange={setMonth}
            employees={employees}
            reload={reload}
            onEdit={edit}
            onDelete={setDeleting}
          />
        </Tab>
      </Tabs>

      {paying && (
        <SalaryPaymentModal
          payment={paying.payment}
          initial={paying.initial}
          employees={employees}
          onHide={() => setPaying(null)}
          onSaved={() => {
            setPaying(null)
            refresh()
          }}
        />
      )}

      {rating && (
        <SalaryRateModal
          employee={rating}
          onHide={() => setRating(null)}
          onSaved={() => {
            setRating(null)
            refresh()
          }}
        />
      )}

      <Modal show={Boolean(deleting)} onHide={() => setDeleting(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Удалить выплату?')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleting &&
            t('{name} · {type} за {month} · {amount} сум', {
              name: personName(deleting.employee),
              type: typeLabel(deleting.type).toLowerCase(),
              month: formatMonth(periodMonth(deleting.period)).toLowerCase(),
              amount: formatMoney(deleting.amount),
            })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleting(null)}>
            {t('Отмена')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('Удалить')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export { SalaryScreen }
