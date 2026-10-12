import { useEffect, useState } from 'react'
import { FileText, Paperclip, Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Card, EmptyState, Form, PageHeader, SearchField, Spinner, Table } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { t } from '../i18n'
import { getTaskMembers } from '../task/TaskApi'
import { formatDateTime, fullName } from '../task/taskView'
import { getContracts } from './ContractApi'
import { ContractDialog } from './ContractDialog'
import { ContractFormModal } from './ContractFormModal'
import { CONTRACT_STATUS, customerName, formatAmount, formatContractDate, statusOf } from './contractView'

const PAGE_SIZE = 15
const STATUS_ORDER = ['draft', 'signed', 'active', 'review', 'closed', 'cancelled']

/** Shartnomalar: ro'yxat, filtrlar (kim yopdi, holat, sana), yangi shartnoma va kartochka. */
function ContractScreen() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('')
  const [unassigned, setUnassigned] = useState(false)
  const [responsibleId, setResponsibleId] = useState('')
  const [closedById, setClosedById] = useState('')
  const [closedFrom, setClosedFrom] = useState('')
  const [closedTo, setClosedTo] = useState('')
  const [reload, setReload] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const membersRequest = useRequest(getTaskMembers, 'contract-screen-members')
  const members = membersRequest.data ?? []

  const key = [page, debounced, status, unassigned, responsibleId, closedById, closedFrom, closedTo, reload].join('|')
  const { data, error, loading } = useRequest(
    () =>
      getContracts({
        page,
        limit: PAGE_SIZE,
        search: debounced,
        status,
        unassigned: unassigned || undefined,
        responsible_id: responsibleId,
        closed_by_id: closedById,
        closed_from: closedFrom,
        closed_to: closedTo,
      }),
    key,
  )

  const refresh = () => setReload((value) => value + 1)
  const reset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const rows = data?.data ?? []
  const byStatus = data?.summary.byStatus ?? {}

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={FileText}
        title={t('Договоры')}
        description={t('Договоры с контрагентами: файлы, связанные задачи и кто закрыл')}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus />
            {t('Новый договор')}
          </Button>
        }
      />

      <div role="tablist" aria-label={t('Статус')} className="flex flex-wrap gap-1.5">
        {[{ key: '', label: t('Все'), count: data?.summary.all }, ...STATUS_ORDER.map((item) => ({ key: item, label: CONTRACT_STATUS[item].label, count: byStatus[item] }))].map(
          (item) => {
            const active = status === item.key
            return (
              <button
                key={item.key || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => reset(setStatus)(item.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition',
                  active
                    ? 'border-primary/40 bg-primary-soft text-primary-soft-fg'
                    : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                {item.label}
                {item.count !== undefined && <span className="text-[11px] tabular-nums opacity-70">{item.count}</span>}
              </button>
            )
          },
        )}

        {/* "Свободные": savdodan ochilgan, hali hech bir buxgalter olmagan shartnomalar. */}
        {(data?.summary.unassigned > 0 || unassigned) && (
          <button
            type="button"
            aria-pressed={unassigned}
            onClick={() => reset(setUnassigned)(!unassigned)}
            className={cn(
              'ml-auto inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition',
              unassigned
                ? 'border-warning/50 bg-warning-soft text-warning-soft-fg'
                : 'border-warning/40 text-warning-soft-fg hover:bg-warning-soft',
            )}
          >
            {t('Свободные')}
            <span className="text-[11px] tabular-nums opacity-70">{data?.summary.unassigned ?? 0}</span>
          </button>
        )}
      </div>

      <Card className="flex flex-wrap items-end gap-3">
        <SearchField
          className="min-w-56 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={t('Номер, предмет или контрагент...')}
        />
        <div className="w-52">
          <Form.Select
            aria-label={t('Ответственный')}
            value={responsibleId}
            onChange={(e) => reset(setResponsibleId)(e.target.value)}
          >
            <option value="">{t('Все ответственные')}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {fullName(member)}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="w-52">
          <Form.Select
            aria-label={t('Кто закрыл')}
            value={closedById}
            onChange={(e) => reset(setClosedById)(e.target.value)}
          >
            <option value="">{t('Закрыл: любой')}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {fullName(member)}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Form.Control
            type="date"
            aria-label={t('Закрыт с')}
            className="w-40"
            value={closedFrom}
            onChange={(e) => reset(setClosedFrom)(e.target.value)}
          />
          <span className="text-subtle">—</span>
          <Form.Control
            type="date"
            aria-label={t('Закрыт по')}
            className="w-40"
            value={closedTo}
            onChange={(e) => reset(setClosedTo)(e.target.value)}
          />
        </div>
      </Card>

      {notice && (
        <Alert variant="danger" dismissible onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}
      {error && <Alert variant="danger">{error.message}</Alert>}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('Договоров не найдено')}
          description={t('Измените фильтры или нажмите «Новый договор».')}
        />
      ) : (
        <Table className={cn(loading && 'opacity-60')}>
          <thead>
            <tr>
              <th>{t('Номер')}</th>
              <th>{t('Контрагент')}</th>
              <th className="text-right">{t('Сумма')}</th>
              <th>{t('Дата')}</th>
              <th>{t('Статус')}</th>
              <th>{t('Ответственный')}</th>
              <th>{t('Закрыл')}</th>
              <th className="text-right">{t('Файлы')}</th>
              <th className="text-right">{t('Задачи')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const state = statusOf(row.status)
              return (
                <tr key={row.id} className="cursor-pointer" onClick={() => setOpenId(row.id)}>
                  <td className="whitespace-nowrap font-medium text-fg">
                    {row.number}
                    {row.saleId && (
                      <Badge bg="info" className="ml-1.5 align-middle">
                        {t('Продажа №{id}', { id: row.saleId })}
                      </Badge>
                    )}
                    {row.subject && (
                      <span className="block max-w-56 truncate text-[11px] font-normal text-subtle">{row.subject}</span>
                    )}
                  </td>
                  <td className="max-w-44 truncate">{customerName(row.customer) || <span className="text-subtle">—</span>}</td>
                  <td className="whitespace-nowrap text-right tabular-nums">{formatAmount(row.amount, row.currency)}</td>
                  <td className="whitespace-nowrap text-muted">{formatContractDate(row.contractDate) || '—'}</td>
                  <td>
                    <Badge bg={state.tone}>{state.label}</Badge>
                  </td>
                  <td className="max-w-40 truncate text-muted">
                    {row.responsible ? (
                      fullName(row.responsible)
                    ) : row.unassigned ? (
                      <span className="text-warning-soft-fg">{t('Свободен')}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    {row.closedBy ? (
                      <>
                        <span className="block text-fg">{fullName(row.closedBy)}</span>
                        <span className="block text-[11px] text-subtle">{formatDateTime(row.closedAt)}</span>
                      </>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    {row.attachmentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Paperclip className="size-3.5" />
                        {row.attachmentsCount}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums text-muted">{row.tasksCount || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      <div className="flex justify-center">
        <CustomPaginationScreen active={page} pageCount={data?.meta.totalPages ?? 0} setActive={setPage} />
      </div>

      {creating && (
        <ContractFormModal
          members={members}
          onHide={() => setCreating(false)}
          onSaved={(saved, uploadErrors = []) => {
            setCreating(false)
            if (uploadErrors.length) {
              setNotice(`${t('Договор создан, но не все файлы загрузились')}: ${uploadErrors.join('; ')}`)
            }
            refresh()
            setOpenId(saved.id)
          }}
        />
      )}

      {openId !== null && <ContractDialog contractId={openId} onHide={() => setOpenId(null)} onChanged={refresh} />}
    </div>
  )
}

export { ContractScreen }
