import { useState } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '../lib/cn'
import { t, td } from '../i18n'
import { TaskCard } from './TaskCard'
import { formatAmounts, stageStyle } from './taskView'

/**
 * Kanban doskasi: ustun = etap. Vazifa sichqoncha bilan etapdan etapga suriladi.
 * Qoida (server ham tekshiradi): "Закрыта" ga va yopilgan vazifani qayta ochishga faqat admin.
 * Sudrash hodisalarida `dataTransfer` qiymatini o'qib bo'lmaydi, shuning uchun sudralayotgan
 * vazifa holatda saqlanadi.
 */
function TaskBoard({ stages, admin, onOpen, onMove }) {
  const [dragging, setDragging] = useState(null)
  const [over, setOver] = useState(null)

  const canDrop = (task, stage) => {
    if (!task || task.stage?.id === stage.id) return false
    if (!admin && (stage.type === 'done' || task.state === 'done')) return false
    return true
  }

  // Voronkada shartnomali vazifa bo'lsagina etap tepasida summa chiqadi (boshqa voronkalarda ortiqcha shovqin bo'lmasin).
  const showAmounts = stages.some((stage) => Object.values(stage.amounts ?? {}).some((value) => value > 0))

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-3">
      {stages.map((stage) => {
        const style = stageStyle(stage.color)
        const allowed = canDrop(dragging, stage)
        const blocked = dragging && !allowed && stage.type === 'done' && !admin
        const highlighted = over === stage.id && allowed

        return (
          <section
            key={stage.id}
            aria-label={td(stage.name)}
            onDragOver={(event) => {
              if (!allowed) return
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              if (over !== stage.id) setOver(stage.id)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOver((current) => (current === stage.id ? null : current))
            }}
            onDrop={(event) => {
              event.preventDefault()
              const task = dragging
              setDragging(null)
              setOver(null)
              if (task && canDrop(task, stage)) onMove(task, stage)
            }}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-xl border border-t-4 bg-surface-2/60 transition-colors',
              style.bar,
              highlighted ? 'border-primary bg-primary-soft/40' : 'border-line',
            )}
          >
            <header className="flex flex-col gap-0.5 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', style.dot)} />
                <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg">{td(stage.name)}</h3>
                {stage.type === 'done' && <Lock className="size-3.5 text-subtle" aria-hidden="true" />}
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted">
                  {stage.total}
                </span>
              </div>
              {showAmounts && (
                <p
                  className="truncate pl-4 text-[12px] font-medium tabular-nums text-muted"
                  title={t('Сумма договоров на этапе')}
                >
                  {formatAmounts(stage.amounts)}
                </p>
              )}
            </header>

            <div className="flex min-h-24 flex-col gap-2 px-2 pb-2">
              {stage.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dragging={dragging?.id === task.id}
                  draggable
                  onOpen={onOpen}
                  onDragStart={setDragging}
                  onDragEnd={() => {
                    setDragging(null)
                    setOver(null)
                  }}
                />
              ))}

              {stage.tasks.length === 0 && (
                <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-subtle">
                  {blocked ? t('Закрывает администратор') : t('Нет задач')}
                </p>
              )}
              {blocked && stage.tasks.length > 0 && (
                <p className="px-1 text-center text-[11px] text-subtle">{t('Закрывает администратор')}</p>
              )}
              {stage.total > stage.tasks.length && (
                <p className="px-1 text-center text-[11px] text-subtle">
                  {t('Показаны последние {shown} из {total}', { shown: stage.tasks.length, total: stage.total })}
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default TaskBoard
export { TaskBoard }
