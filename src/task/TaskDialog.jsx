import { useState } from 'react'
import { CalendarClock, CircleCheck, Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Form, Modal, Spinner } from '../ui'
import { t, td } from '../i18n'
import {
  approveTask,
  commentTask,
  deleteTask,
  getTask,
  moveTask,
  rejectTask,
  setTaskCustomer,
  submitTask,
} from './TaskApi'
import { Attachments } from '../attachment/Attachments'
import { statusOf } from '../contract/contractView'
import { CustomerPicker } from '../customers/CustomerPicker'
import { Avatar } from './TaskCard'
import { TaskFormModal } from './TaskFormModal'
import {
  EVENT_LABELS,
  canAttachCustomer,
  eventNote,
  formatDateTime,
  fullName,
  isAdmin,
  priorityOf,
} from './taskView'

const EVENT_DOT = {
  created: 'bg-info',
  moved: 'bg-subtle',
  submitted: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-danger',
  reopened: 'bg-warning',
  updated: 'bg-subtle',
  comment: 'bg-primary',
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
 * Vazifa kartochkasi: tafsilot, tarix, izoh va harakatlar.
 *  - ijrochi "Закрыть" bosadi -> "На проверке";
 *  - admin "Утвердить" (yopiladi) yoki sabab bilan "Вернуть" qiladi.
 */
function TaskDialog({ taskId, pipelines, members, onHide, onChanged }) {
  const admin = isAdmin()
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [target, setTarget] = useState('')

  const { data: task, error: loadError } = useRequest(() => getTask(taskId), `${taskId}-${version}`)

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

  if (editing && task) {
    return (
      <TaskFormModal
        task={task}
        pipelines={pipelines}
        members={members}
        onHide={() => setEditing(false)}
        onSaved={() => {
          setEditing(false)
          refresh()
        }}
      />
    )
  }

  const stages = pipelines.find((pipeline) => pipeline.id === task?.pipeline?.id)?.stages ?? []
  const moveOptions = stages.filter((stage) => stage.id !== task?.stage?.id && (admin || stage.type !== 'done'))
  const priority = task ? priorityOf(task.priority) : null

  return (
    <Modal show onHide={onHide} centered size="xl" scrollable>
      <Modal.Header closeButton>
        {task ? (
          <>
            <Modal.Title>{task.title}</Modal.Title>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge bg={task.stage?.color ?? 'neutral'}>{td(task.stage?.name ?? '')}</Badge>
              <Badge bg={priority.tone}>{priority.label}</Badge>
              {task.pipeline && <Badge bg="neutral">{td(task.pipeline.name)}</Badge>}
              {task.overdue && <Badge bg="danger">{t('Просрочена')}</Badge>}
              {task.state === 'done' && task.closedLate !== null && (
                <Badge bg={task.closedLate ? 'warning' : 'success'}>
                  {task.closedLate ? t('Закрыта с опозданием') : t('Закрыта в срок')}
                </Badge>
              )}
            </div>
          </>
        ) : (
          <Modal.Title>{t('Задача')}</Modal.Title>
        )}
      </Modal.Header>

      <Modal.Body className="min-h-40 overflow-y-auto">
        {loadError && <Alert variant="danger">{loadError.message}</Alert>}
        {!task && !loadError && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {task && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              {error && <Alert variant="danger">{error}</Alert>}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label={t('Ответственный')}>
                  <Person user={task.responsible} />
                </Field>
                <Field label={t('Создал')}>
                  <Person user={task.creator} />
                </Field>
                <Field label={t('Срок выполнения')}>
                  {task.dueDate ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        task.overdue && 'font-semibold text-danger-soft-fg',
                      )}
                    >
                      <CalendarClock className="size-3.5" />
                      {formatDateTime(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-subtle">{t('Без срока')}</span>
                  )}
                </Field>
                <Field label={t('Создана')}>{formatDateTime(task.date)}</Field>
                {task.contract && (
                  <Field label={t('Договор')}>
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">{task.contract.number}</span>
                      <Badge bg={statusOf(task.contract.status).tone}>{statusOf(task.contract.status).label}</Badge>
                    </span>
                    {task.contract.subject && (
                      <span className="mt-0.5 block text-[12px] text-muted">{task.contract.subject}</span>
                    )}
                  </Field>
                )}
                {/* Kontragentni faqat buxgalter (va admin) biriktiradi/almashtiradi; qolganlar faqat ko'radi. */}
                {(task.customer || (canAttachCustomer() && task.state !== 'done')) && (
                  <div className="col-span-2 min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Контрагент')}</dt>
                    <dd className="mt-1 text-[13px] text-fg">
                      <CustomerPicker
                        value={task.customer}
                        readOnly={!canAttachCustomer() || task.state === 'done'}
                        disabled={busy}
                        onChange={(customer) => run(() => setTaskCustomer(task.id, customer?.id ?? null))}
                      />
                    </dd>
                  </div>
                )}
                {task.submittedAt && (
                  <Field label={t('Отправлена на проверку')}>
                    {formatDateTime(task.submittedAt)}
                    {task.submittedBy && <span className="text-subtle"> · {fullName(task.submittedBy)}</span>}
                  </Field>
                )}
                {task.approvedAt && (
                  <Field label={t('Утверждена')}>
                    {formatDateTime(task.approvedAt)}
                    {task.approvedBy && <span className="text-subtle"> · {fullName(task.approvedBy)}</span>}
                  </Field>
                )}
              </dl>

              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Соисполнители')}</p>
                {task.participants.length === 0 ? (
                  <p className="text-[13px] text-subtle">—</p>
                ) : (
                  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                    {task.participants.map((user) => (
                      <li key={user.id}>
                        <Badge bg="neutral">{fullName(user)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Описание')}</p>
                <p className="whitespace-pre-wrap text-[13px] text-fg">{task.description || '—'}</p>
              </div>

              <Attachments files={task.files} target={{ taskId: task.id }} onChanged={refresh} />

              {task.state === 'review' && !admin && (
                <Alert variant="info">{t('Задача на проверке у администратора')}</Alert>
              )}

              {/* Harakatlar */}
              <div className="flex flex-col gap-2 border-t border-line pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {task.state === 'open' && (
                    <Button variant="success" disabled={busy} onClick={() => run(() => submitTask(task.id))}>
                      <Send />
                      {t('Закрыть (на проверку)')}
                    </Button>
                  )}
                  {task.state === 'review' && admin && (
                    <>
                      <Button variant="success" disabled={busy} onClick={() => run(() => approveTask(task.id))}>
                        <CircleCheck />
                        {t('Утвердить')}
                      </Button>
                      <Button variant="outline-danger" disabled={busy} onClick={() => setRejecting((value) => !value)}>
                        <Undo2 />
                        {t('Вернуть')}
                      </Button>
                    </>
                  )}
                  {/* Tahrirlash (muddat, javobgar, ishtirokchilar) faqat administratorda. */}
                  {admin && task.state !== 'done' && (
                    <Button variant="outline-secondary" disabled={busy} onClick={() => setEditing(true)}>
                      <Pencil />
                      {t('Изменить')}
                    </Button>
                  )}
                </div>

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
                          if (await run(() => rejectTask(task.id, reason.trim()))) {
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

                {moveOptions.length > 0 && task.state !== 'done' && (
                  <div className="flex items-center gap-2">
                    <div className="w-52">
                      <Form.Select size="sm" aria-label={t('Переместить в этап')} value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="">{t('Переместить в этап…')}</option>
                        {moveOptions.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {td(stage.name)}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={busy || !target}
                      onClick={async () => {
                        if (await run(() => moveTask(task.id, Number(target)))) setTarget('')
                      }}
                    >
                      {t('Переместить')}
                    </Button>
                  </div>
                )}

                {task.state === 'done' && admin && moveOptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-52">
                      <Form.Select size="sm" aria-label={t('Открыть заново')} value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="">{t('Открыть заново в этапе…')}</option>
                        {moveOptions
                          .filter((stage) => stage.type !== 'done')
                          .map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {td(stage.name)}
                            </option>
                          ))}
                      </Form.Select>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={busy || !target}
                      onClick={async () => {
                        if (await run(() => moveTask(task.id, Number(target)))) setTarget('')
                      }}
                    >
                      {t('Открыть')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Tarix va izoh */}
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('История')}</p>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {[...task.events].reverse().map((event) => (
                  <li key={event.id} className="flex gap-2.5">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', EVENT_DOT[event.type] ?? 'bg-subtle')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-fg">
                        <span className="font-medium">{EVENT_LABELS[event.type] ?? event.type}</span>
                        {event.user && <span className="text-muted"> · {fullName(event.user)}</span>}
                      </p>
                      {event.toStage && event.type !== 'created' && (
                        <p className="text-[12px] text-muted">
                          {event.fromStage ? `${td(event.fromStage)} → ` : ''}
                          {td(event.toStage)}
                        </p>
                      )}
                      {event.type === 'created' && event.toStage && (
                        <p className="text-[12px] text-muted">{td(event.toStage)}</p>
                      )}
                      {event.note && (
                        <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-surface-2 px-2 py-1 text-[12px] text-fg">
                          {eventNote(event)}
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
                      if (await run(() => commentTask(task.id, comment.trim()))) setComment('')
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
        {admin && task && !confirmDelete && (
          <Button variant="ghost" className="mr-auto text-danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            {t('Удалить')}
          </Button>
        )}
        {admin && task && confirmDelete && (
          <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[13px] text-danger-soft-fg">
              {t('Удалить задачу «{title}» вместе с историей?', { title: task.title })}
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
                  await deleteTask(task.id)
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

export default TaskDialog
export { TaskDialog }
