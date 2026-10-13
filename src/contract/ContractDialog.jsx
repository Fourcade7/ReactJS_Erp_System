import { useState } from 'react'
import { Building2, CalendarClock, CircleCheck, FilePlus, Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Form, Modal, Spinner } from '../ui'
import { t, td } from '../i18n'
import { Attachments } from '../attachment/Attachments'
import { getTaskMembers, getTaskPipelines } from '../task/TaskApi'
import { Avatar } from '../task/TaskCard'
import { CustomerPicker } from '../customers/CustomerPicker'
import { TaskFormModal } from '../task/TaskFormModal'
import { currentUserId, formatDateTime, fullName, isAdmin } from '../task/taskView'
import { currentRole } from '../users/roles'
import {
  addContractPayment,
  approveContract,
  commentContract,
  deleteContract,
  getContract,
  rejectContract,
  saveRequisites,
  setContractCustomer,
  setContractStatus,
  submitContract,
  takeContract,
} from './ContractApi'
import { ContractFormModal } from './ContractFormModal'
import { RequisitesBlock, SaleBlock } from './ContractSaleBlock'
import {
  CONTRACT_EVENT_LABELS,
  MANUAL_STATUSES,
  contractEventNote,
  customerName,
  formatAmount,
  formatContractDate,
  statusOf,
} from './contractView'

const EVENT_DOT = {
  created: 'bg-info',
  status: 'bg-subtle',
  submitted: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-danger',
  reopened: 'bg-warning',
  updated: 'bg-subtle',
  payment: 'bg-success',
  comment: 'bg-primary',
  file_added: 'bg-subtle',
  file_removed: 'bg-subtle',
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-fg">{children}</dd>
    </div>
  )
}

function Person({ user }) {
  if (!user) return <span className="text-subtle">—</span>
  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar user={user} />
      <span className="truncate">{fullName(user)}</span>
    </span>
  )
}

/**
 * Shartnoma kartochkasi: ma'lumot, fayllar, bog'langan vazifalar, tarix va harakatlar.
 *  - buxgalter "yopadi" -> "На проверке"; admin "Утвердить" bilan yopadi (kim yopgani yoziladi);
 *  - "Создать задачу" shu shartnoma ustida yangi vazifa ochadi.
 */
function ContractDialog({ contractId, onHide, onChanged }) {
  const admin = isAdmin()
  const me = currentUserId()
  const accountant = currentRole() === 'accountant'
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [target, setTarget] = useState('')

  const { data: contract, error: loadError } = useRequest(() => getContract(contractId), `${contractId}-${version}`)
  const membersRequest = useRequest(getTaskMembers, 'contract-members')
  const pipelinesRequest = useRequest(getTaskPipelines, 'contract-pipelines')
  const members = membersRequest.data ?? []
  const pipelines = pipelinesRequest.data ?? []

  const refresh = () => {
    setVersion((current) => current + 1)
    onChanged()
  }

  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      await action()
      refresh()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  if (editing && contract) {
    return (
      <ContractFormModal
        contract={contract}
        members={members}
        onHide={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          refresh()
        }}
      />
    )
  }

  if (creatingTask && contract) {
    const contractPipeline =
      pipelines.find((item) => item.forContracts) ?? pipelines.find((item) => item.name === 'По договору') ?? pipelines[0]
    return (
      <TaskFormModal
        pipelines={pipelines}
        members={members}
        defaultPipelineId={contractPipeline?.id}
        defaultContractId={contract.id}
        onHide={() => setCreatingTask(false)}
        onSaved={(_task, uploadErrors = []) => {
          setCreatingTask(false)
          if (uploadErrors.length) setError(`${t('Задача создана, но не все файлы загрузились')}: ${uploadErrors.join('; ')}`)
          refresh()
        }}
      />
    )
  }

  const status = contract ? statusOf(contract.status) : null
  // Rekvizit va to'lov kiritish: admin yoki shartnomani olgan (javobgar) buxgalter.
  const canWork = Boolean(contract) && (admin || contract.responsible?.id === me)
  const canSubmit = contract && ['draft', 'signed', 'active'].includes(contract.status)
  const statusOptions = MANUAL_STATUSES.filter((item) => item !== contract?.status)

  return (
    <Modal show onHide={onHide} centered size="xl" scrollable>
      <Modal.Header closeButton>
        {contract ? (
          <>
            <Modal.Title>
              {t('Договор')} {contract.number}
            </Modal.Title>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge bg={status.tone}>{status.label}</Badge>
              <Badge bg="neutral">{formatAmount(contract.amount, contract.currency)}</Badge>
            </div>
          </>
        ) : (
          <Modal.Title>{t('Договор')}</Modal.Title>
        )}
      </Modal.Header>

      <Modal.Body className="min-h-40 overflow-y-auto">
        {loadError && <Alert variant="danger">{loadError.message}</Alert>}
        {!contract && !loadError && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {contract && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {contract.unassigned && (
                <Alert variant="warning">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{t('Договор открыт из продажи и ещё никем не взят в работу.')}</span>
                    {accountant && (
                      <Button size="sm" disabled={busy} onClick={() => run(() => takeContract(contract.id))}>
                        {t('Взять в работу')}
                      </Button>
                    )}
                  </div>
                </Alert>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label={contract.customer?.type === 'organization' ? t('Организация') : t('Контрагент')}>
                  {contract.customer ? (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        {contract.customer.type === 'organization' && <Building2 className="size-3.5 text-subtle" />}
                        {customerName(contract.customer)}
                      </span>
                      {contract.customer.phone && (
                        <span className="block text-[12px] text-muted">{contract.customer.phone}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-subtle">{t('Не указан')}</span>
                  )}
                </Field>
                <Field label={t('Дата договора')}>
                  {contract.contractDate ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-3.5 text-subtle" />
                      {formatContractDate(contract.contractDate)}
                    </span>
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </Field>
                <Field label={t('Ответственный бухгалтер')}>
                  <Person user={contract.responsible} />
                </Field>
                <Field label={t('Создал')}>
                  <Person user={contract.creator} />
                </Field>
                {contract.submittedAt && contract.status === 'review' && (
                  <Field label={t('Отправлен на проверку')}>
                    {formatDateTime(contract.submittedAt)}
                    {contract.submittedBy && <span className="text-subtle"> · {fullName(contract.submittedBy)}</span>}
                  </Field>
                )}
                {contract.closedAt && (
                  <>
                    <Field label={t('Закрыл')}>
                      <Person user={contract.closedBy} />
                    </Field>
                    <Field label={t('Закрыт')}>
                      {formatDateTime(contract.closedAt)}
                      {contract.approvedBy && (
                        <span className="block text-[12px] text-muted">
                          {t('Утвердил')}: {fullName(contract.approvedBy)}
                        </span>
                      )}
                    </Field>
                  </>
                )}
              </dl>

              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Предмет договора')}</p>
                <p className="whitespace-pre-wrap text-[13px] text-fg">{contract.subject || '—'}</p>
              </div>

              {contract.sale && (
                <SaleBlock
                  key={`sale-${contract.sale.paid}`}
                  sale={contract.sale}
                  canWork={canWork}
                  busy={busy}
                  onPay={(amount, note) => run(() => addContractPayment(contract.id, amount, note))}
                />
              )}

              {/* Kontragentsiz (savdodan, "По договору") ochilgan shartnoma: buxgalter uni shu yerda tanlaydi yoki ochadi. */}
              {!contract.customer && (
                <section className="flex flex-col gap-2 rounded-lg border border-dashed border-line p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Контрагент')}</p>
                  {canWork ? (
                    <>
                      <p className="text-[12px] text-muted">
                        {t('Контрагент не указан. Найдите существующего или создайте нового — человека или организацию.')}
                      </p>
                      <CustomerPicker
                        value={null}
                        disabled={busy}
                        onChange={(customer) => customer && run(() => setContractCustomer(contract.id, customer.id))}
                      />
                    </>
                  ) : (
                    <p className="text-[12px] text-muted">
                      {t('Контрагент не указан. Возьмите договор в работу — тогда его можно будет выбрать или создать.')}
                    </p>
                  )}
                </section>
              )}

              {contract.customer && (
                <RequisitesBlock
                  key={JSON.stringify(contract.customer.requisites)}
                  requisites={contract.customer.requisites}
                  organization={contract.customer.type === 'organization'}
                  canWork={canWork}
                  busy={busy}
                  onSave={(values) => run(() => saveRequisites(contract.id, values))}
                />
              )}

              <Attachments files={contract.files} target={{ contractId: contract.id }} onChanged={refresh} />

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                    {t('Задачи по договору')}{' '}
                    {contract.tasks.length > 0 && <span className="tabular-nums">({contract.tasks.length})</span>}
                  </p>
                  {/* Vazifani faqat administrator ochadi. */}
                  {admin && (
                    <Button size="sm" variant="outline-secondary" onClick={() => setCreatingTask(true)}>
                      <FilePlus />
                      {t('Создать задачу')}
                    </Button>
                  )}
                </div>
                {contract.tasks.length === 0 ? (
                  <p className="text-xs text-subtle">{t('По этому договору задач пока нет')}</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {contract.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-2.5 py-2',
                          task.overdue ? 'border-danger/50 bg-danger-soft' : 'border-line bg-surface',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-fg">{task.title}</p>
                          <p
                            className={cn(
                              'truncate text-[11px]',
                              task.overdue ? 'font-semibold text-danger-soft-fg' : 'text-subtle',
                            )}
                          >
                            {task.responsible ? fullName(task.responsible) : t('Не назначена')}
                            {task.dueDate && ` · ${formatDateTime(task.dueDate)}`}
                            {task.overdue && ` · ${t('просрочено')}`}
                          </p>
                        </div>
                        {task.stage && <Badge bg={task.stage.color}>{td(task.stage.name)}</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              {/* Harakatlar */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {canSubmit && (
                    <Button variant="success" disabled={busy} onClick={() => run(() => submitContract(contract.id))}>
                      <Send />
                      {t('Закрыть (на проверку)')}
                    </Button>
                  )}
                  {contract.status === 'review' && admin && (
                    <>
                      <Button variant="success" disabled={busy} onClick={() => run(() => approveContract(contract.id))}>
                        <CircleCheck />
                        {t('Утвердить и закрыть')}
                      </Button>
                      <Button variant="outline-danger" disabled={busy} onClick={() => setRejecting((value) => !value)}>
                        <Undo2 />
                        {t('Вернуть')}
                      </Button>
                    </>
                  )}
                  {admin && canSubmit && (
                    <Button variant="outline-success" disabled={busy} onClick={() => run(() => approveContract(contract.id))}>
                      <CircleCheck />
                      {t('Закрыть сразу')}
                    </Button>
                  )}
                  {contract.status !== 'closed' && (
                    <Button variant="outline-secondary" disabled={busy} onClick={() => setEditing(true)}>
                      <Pencil />
                      {t('Изменить')}
                    </Button>
                  )}
                </div>

                {contract.status === 'review' && !admin && (
                  <Alert variant="info">{t('Договор на проверке у администратора')}</Alert>
                )}
                {contract.status === 'closed' && !admin && (
                  <Alert variant="success">{t('Договор закрыт и утверждён администратором')}</Alert>
                )}

                {rejecting && (
                  <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-2 p-3">
                    <Form.Label>{t('Причина возврата')}</Form.Label>
                    <Form.Control as="textarea" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={() => setRejecting(false)}>
                        {t('Отмена')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy || !reason.trim()}
                        onClick={async () => {
                          if (await run(() => rejectContract(contract.id, reason.trim()))) {
                            setRejecting(false)
                            setReason('')
                          }
                        }}
                      >
                        {t('Вернуть на доработку')}
                      </Button>
                    </div>
                  </div>
                )}

                {(contract.status !== 'closed' || admin) && contract.status !== 'review' && (
                  <div className="flex items-center gap-2">
                    <div className="w-52">
                      <Form.Select size="sm" aria-label={t('Изменить статус')} value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="">{t('Изменить статус…')}</option>
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {statusOf(item).label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={busy || !target}
                      onClick={async () => {
                        if (await run(() => setContractStatus(contract.id, target))) setTarget('')
                      }}
                    >
                      {t('Применить')}
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('История')}</p>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {[...contract.events].reverse().map((event) => (
                  <li key={event.id} className="flex gap-2.5">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', EVENT_DOT[event.type] ?? 'bg-subtle')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-fg">
                        <span className="font-medium">{CONTRACT_EVENT_LABELS[event.type] ?? event.type}</span>
                        {event.user && <span className="text-muted"> · {fullName(event.user)}</span>}
                      </p>
                      {event.toStatus && (
                        <p className="text-[12px] text-muted">
                          {event.fromStatus ? `${statusOf(event.fromStatus).label} → ` : ''}
                          {statusOf(event.toStatus).label}
                        </p>
                      )}
                      {event.note && (
                        <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-surface-2 px-2 py-1 text-[12px] text-fg">
                          {contractEventNote(event)}
                        </p>
                      )}
                      <p className="text-[11px] text-subtle">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-2 border-t border-line pt-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={comment}
                  placeholder={t('Написать комментарий…')}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={busy || !comment.trim()}
                    onClick={async () => {
                      if (await run(() => commentContract(contract.id, comment.trim()))) setComment('')
                    }}
                  >
                    {t('Отправить')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {/* Xavfli amal harakatlardan ajratilgan: pastki chiziqning chap tomonida. */}
        {admin && contract && !confirmDelete && (
          <Button variant="ghost" className="mr-auto text-danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            {t('Удалить')}
          </Button>
        )}
        {admin && contract && confirmDelete && (
          <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[13px] text-danger-soft-fg">
              {t('Удалить договор {number} вместе с файлами и историей? Задачи останутся без договора.', {
                number: contract.number,
              })}
            </span>
            <Button variant="outline-secondary" size="sm" onClick={() => setConfirmDelete(false)}>
              {t('Отмена')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await deleteContract(contract.id)
                  onChanged()
                  onHide()
                } catch (e) {
                  setError(e.message)
                  setConfirmDelete(false)
                  setBusy(false)
                }
              }}
            >
              {t('Удалить')}
            </Button>
          </div>
        )}
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Закрыть окно')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ContractDialog
export { ContractDialog }
