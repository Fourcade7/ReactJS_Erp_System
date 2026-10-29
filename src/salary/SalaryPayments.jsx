import { useEffect, useState } from 'react'
import { HandCoins, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { formatDayTime, formatMoney, formatMonth, plural, RECORDS } from '../lib/format'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, EmptyState, Form, SearchField, Spinner, Table } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { getSalaryPayments } from './SalaryApi'
import Segmented from './Segmented'
import { PAYMENT_TYPES, methodLabel, periodMonth, personName, typeLabel } from './salaryView'
import { t } from '../i18n'

const TYPE_FILTERS = [{ key: '', label: t('Все') }, ...PAYMENT_TYPES]

/** Barcha oylik to'lovlari jurnali: oy, xodim va tur bo'yicha filtr, jami — filtrga mos hamma yozuvlar bo'yicha. */
function SalaryPayments({ month, onMonthChange, employees, reload, onEdit, onDelete }) {
  const [allMonths, setAllMonths] = useState(false)
  const [employee, setEmployee] = useState('')
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const query = { page, limit: 15, month: allMonths ? '' : month, employee, type, search: debouncedSearch }
  const { data: result, error, loading } = useRequest(() => getSalaryPayments(query), `${JSON.stringify(query)}|${reload}`)
  const summary = result?.summary

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Form.Control
            type="month"
            aria-label={t('Месяц')}
            className="w-44"
            value={month}
            disabled={allMonths}
            onChange={(e) => {
              onMonthChange(e.target.value)
              setPage(1)
            }}
          />
          <Form.Check
            type="switch"
            label={t('Все месяцы')}
            checked={allMonths}
            onChange={(e) => {
              setAllMonths(e.target.checked)
              setPage(1)
            }}
          />
        </div>
        <div className="w-52">
          <Form.Select
            aria-label={t('Сотрудник')}
            value={employee}
            onChange={(e) => {
              setEmployee(e.target.value)
              setPage(1)
            }}
          >
            <option value="">{t('Все сотрудники')}</option>
            {employees.map((item) => (
              <option key={item.id} value={item.id}>
                {personName(item)}
              </option>
            ))}
          </Form.Select>
        </div>
        <Segmented
          options={TYPE_FILTERS}
          value={type}
          onChange={(key) => {
            setType(key)
            setPage(1)
          }}
          label={t('Тип выплаты')}
        />
        <SearchField
          className="min-w-48 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={t('Поиск по сотруднику или комментарию...')}
        />
      </div>

      {error && <Alert variant="danger">{error.message}</Alert>}

      {summary && (
        <p className="text-xs text-subtle">
          {t('Итого')}:{' '}
          <span className="font-semibold tabular-nums text-fg">{formatMoney(summary.amount)} {t('сум')}</span>
          {' · '}
          {plural(summary.count, RECORDS)}
          {summary.advance > 0 && ` · ${t('из них аванс {amount} сум', { amount: formatMoney(summary.advance) })}`}
        </p>
      )}

      <div className={cn('flex flex-col gap-3 transition-opacity', loading && result && 'opacity-60')}>
        {loading && !result ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : result?.data.length ? (
          <Table>
            <thead>
              <tr>
                <th>{t('Сотрудник')}</th>
                <th>{t('За месяц')}</th>
                <th>{t('Тип')}</th>
                <th>{t('Способ')}</th>
                <th className="text-right">{t('Сумма')}</th>
                <th>{t('Комментарий')}</th>
                <th>{t('Дата')}</th>
                <th aria-label={t('Действия')} />
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id}>
                  <td className={cn('whitespace-nowrap font-medium', row.employee ? 'text-fg' : 'text-subtle')}>
                    {personName(row.employee)}
                  </td>
                  <td className="whitespace-nowrap text-muted">{formatMonth(periodMonth(row.period))}</td>
                  <td>
                    <Badge bg={row.type === 'advance' ? 'info' : 'primary'}>{typeLabel(row.type)}</Badge>
                  </td>
                  <td className="whitespace-nowrap text-muted">{methodLabel(row.method)}</td>
                  <td className="whitespace-nowrap text-right font-semibold tabular-nums text-fg">{formatMoney(row.amount)}</td>
                  <td className="max-w-56 truncate text-muted" title={row.comment ?? ''}>
                    {row.comment || '—'}
                  </td>
                  {/* Qachon va kim kiritgan. */}
                  <td className="whitespace-nowrap">
                    <span className="block tabular-nums text-muted">{formatDayTime(row.createdAt)}</span>
                    {row.user && <span className="block text-[11px] text-subtle">{personName(row.user)}</span>}
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" icon title={t('Изменить')} aria-label={t('Изменить')} onClick={() => onEdit(row)}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="sm" icon title={t('Удалить')} aria-label={t('Удалить')} onClick={() => onDelete(row)}>
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={HandCoins}
            title={allMonths ? t('Выплат пока нет') : t('Выплат за {month} нет', { month: formatMonth(month).toLowerCase() })}
            description={t('Нажмите «Выплатить», чтобы записать аванс или зарплату.')}
          />
        )}

        <div className="flex justify-center">
          <CustomPaginationScreen active={page} pageCount={result?.meta.totalPages ?? 0} setActive={setPage} />
        </div>
      </div>
    </div>
  )
}

export default SalaryPayments
