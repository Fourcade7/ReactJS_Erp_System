import { CalendarClock, ClipboardList, FileText, Paperclip } from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, EmptyState, Spinner, Table } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { t, td } from '../i18n'
import { Avatar } from './TaskCard'
import { dueSoon, formatShortDateTime, formatSum, fullName, priorityOf, stageStyle } from './taskView'

/**
 * Vazifalar ro'yxati — kanban doskasining ikkinchi ko'rinishi: etap bo'yicha filtr (tugmalarda sonlar)
 * va sahifalash. Ma'lumot va filtrlar `TaskContent` da turadi, bu yerda faqat ko'rinish.
 *
 * `data` — `GET /task/allpagsearch` javobi (`data`, `meta`, `stageCounts`, `summary`).
 * `allPipelines` — barcha voronkalar birga: etaplar har xil, shu bois tugmalar holat bo'yicha
 * (открытые / на проверке / закрытые) va jadvalda "Воронка" ustuni bor.
 */
function TaskList({ data, loading, stages, stageId, onStage, page, onPage, filtered, admin, onOpen, allPipelines = false }) {
  const rows = data?.data ?? []
  const counts = data?.stageCounts ?? {}
  const all = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const summary = data?.summary
  const chips = allPipelines
    ? [
        { id: '', label: t('Все'), dot: null, count: summary ? summary.open + summary.review + summary.done : undefined },
        { id: 'open', label: t('Открытые'), dot: 'bg-info', count: summary?.open },
        { id: 'review', label: t('На проверке'), dot: 'bg-warning', count: summary?.review },
        { id: 'done', label: t('Закрытые'), dot: 'bg-success', count: summary?.done },
      ]
    : [
        { id: '', label: t('Все этапы'), dot: null, count: data ? all : undefined },
        ...stages.map((stage) => ({
          id: stage.id,
          label: td(stage.name),
          dot: stageStyle(stage.color).dot,
          count: data ? (counts[stage.id] ?? 0) : undefined,
        })),
      ]

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={allPipelines ? t('Состояние') : t('Этап')} className="flex flex-wrap gap-1.5">
        {chips.map((chip) => {
          const active = String(stageId) === String(chip.id)
          return (
            <button
              key={chip.id || 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStage(chip.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition',
                active
                  ? 'border-primary/40 bg-primary-soft text-primary-soft-fg'
                  : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {chip.dot && <span className={cn('size-2 rounded-full', chip.dot)} />}
              {chip.label}
              {chip.count !== undefined && <span className="text-[11px] tabular-nums opacity-70">{chip.count}</span>}
            </button>
          )
        })}
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('Задач не найдено')}
          description={
            filtered || admin
              ? t('Измените фильтры или выберите другой этап.')
              : t('Здесь появятся задачи, которые администратор назначит вам.')
          }
        />
      ) : (
        <Table className={cn(loading && 'opacity-60')}>
          <thead>
            <tr>
              <th>{t('Задача')}</th>
              {allPipelines && <th>{t('Воронка')}</th>}
              <th>{t('Этап')}</th>
              <th>{t('Контрагент')}</th>
              <th>{t('Ответственный')}</th>
              <th>{t('Срок')}</th>
              <th>{t('Приоритет')}</th>
              <th className="text-right">{t('Файлы')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => {
              const priority = priorityOf(task.priority)
              const soon = dueSoon(task)
              return (
                <tr
                  key={task.id}
                  tabIndex={0}
                  className="cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  onClick={() => onOpen(task)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onOpen(task)
                  }}
                >
                  <td className="max-w-80">
                    <span className="block truncate font-medium text-fg">{task.title}</span>
                    {task.contract && (
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-subtle">
                        <FileText className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {task.contract.number}
                          {task.contract.amount > 0 && ' · ' + formatSum(task.contract.amount, task.contract.currency)}
                        </span>
                      </span>
                    )}
                  </td>
                  {allPipelines && (
                    <td className="whitespace-nowrap text-muted">{task.pipeline ? td(task.pipeline.name) : '—'}</td>
                  )}
                  <td>
                    <Badge bg={task.stage?.color ?? 'neutral'}>{td(task.stage?.name ?? '')}</Badge>
                  </td>
                  <td className="max-w-44">
                    {task.customer ? (
                      <span className="block truncate text-fg" title={task.customer.phone}>
                        {fullName(task.customer)}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="max-w-48">
                    <span className="flex items-center gap-1.5">
                      <Avatar user={task.responsible} />
                      <span className="truncate text-muted">
                        {task.responsible ? fullName(task.responsible) : t('Не назначена')}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    {task.dueDate ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          task.overdue ? 'font-semibold text-danger-soft-fg' : soon ? 'text-warning-soft-fg' : 'text-muted',
                        )}
                      >
                        <CalendarClock className="size-3.5 shrink-0" />
                        {formatShortDateTime(task.dueDate)}
                        {task.overdue && <span>· {t('просрочено')}</span>}
                        {task.state === 'done' && task.closedLate !== null && (
                          <span className={task.closedLate ? 'text-warning-soft-fg' : 'text-success-soft-fg'}>
                            · {task.closedLate ? t('с опозданием') : t('в срок')}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td>
                    <Badge bg={priority.tone}>{priority.label}</Badge>
                  </td>
                  <td className="text-right">
                    {task.attachmentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Paperclip className="size-3.5" />
                        {task.attachmentsCount}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      <div className="flex justify-center">
        <CustomPaginationScreen active={page} pageCount={data?.meta.totalPages ?? 0} setActive={onPage} />
      </div>
    </div>
  )
}

export default TaskList
export { TaskList }
