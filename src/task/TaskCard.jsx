import { CalendarClock, FileText, Handshake, Paperclip, Users } from 'lucide-react'
import { cn } from '../lib/cn'
import { t } from '../i18n'
import { dueSoon, formatShortDateTime, fullName, initials, priorityOf } from './taskView'

const PRIORITY_DOT = {
  low: 'bg-subtle',
  normal: 'bg-info',
  high: 'bg-danger',
}

/** Kichik doira: foydalanuvchi bosh harflari. */
function Avatar({ user, className }) {
  return (
    <span
      title={user ? fullName(user) : t('Не назначена')}
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-[10px] font-semibold text-muted',
        className,
      )}
    >
      {initials(user)}
    </span>
  )
}

/**
 * Doskadagi vazifa kartochkasi. Sudralganda (draggable) etap ustuniga tashlanadi;
 * bosilganda ochiladi. Muddati o'tgan vazifa qizil ko'rinadi.
 */
function TaskCard({ task, dragging = false, draggable = true, onOpen, onDragStart, onDragEnd }) {
  const priority = priorityOf(task.priority)
  const soon = dueSoon(task)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(task)
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', String(task.id))
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.(task)
      }}
      onDragEnd={() => onDragEnd?.()}
      className={cn(
        'cursor-pointer rounded-lg border p-3 text-left shadow-soft transition',
        'hover:shadow-raised focus-visible:outline-2 focus-visible:outline-primary',
        task.overdue ? 'border-danger/60 bg-danger-soft' : 'border-line bg-surface hover:border-line-strong',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <span
          title={priority.label}
          className={cn('mt-1.5 size-2 shrink-0 rounded-full', PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.normal)}
        />
        <p className="line-clamp-2 min-w-0 flex-1 text-[13px] font-medium leading-snug text-fg">{task.title}</p>
      </div>

      {task.dueDate && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-[11px]',
            task.overdue ? 'font-semibold text-danger-soft-fg' : soon ? 'text-warning-soft-fg' : 'text-subtle',
          )}
        >
          <CalendarClock className="size-3.5 shrink-0" />
          <span>{formatShortDateTime(task.dueDate)}</span>
          {task.overdue && <span>· {t('просрочено')}</span>}
          {task.state === 'done' && task.closedLate !== null && (
            <span className={task.closedLate ? 'text-warning-soft-fg' : 'text-success-soft-fg'}>
              · {task.closedLate ? t('с опозданием') : t('в срок')}
            </span>
          )}
        </p>
      )}

      {(task.contract || task.customer || task.attachmentsCount > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.customer && (
            <span
              title={`${fullName(task.customer)}${task.customer.phone ? ` · ${task.customer.phone}` : ''}`}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted"
            >
              <Handshake className="size-3.5 shrink-0" />
              <span className="truncate">{fullName(task.customer)}</span>
            </span>
          )}
          {task.contract && (
            <span
              title={task.contract.subject || task.contract.number}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted"
            >
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">{task.contract.number}</span>
            </span>
          )}
          {task.attachmentsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-subtle" title={t('Файлы')}>
              <Paperclip className="size-3.5" />
              {task.attachmentsCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Avatar user={task.responsible} />
          <span className="truncate text-[11px] text-muted">
            {task.responsible ? fullName(task.responsible) : t('Не назначена')}
          </span>
        </div>
        {task.participants.length > 0 && (
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[11px] text-subtle"
            title={task.participants.map((user) => fullName(user)).join(', ')}
          >
            <Users className="size-3.5" />
            {task.participants.length}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
export { Avatar, TaskCard }
