import { useState } from 'react'
import { ChevronDown, ChevronUp, Lock, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Button, Form, Modal } from '../ui'
import { t, td } from '../i18n'
import {
  addPipeline,
  addStage,
  deletePipeline,
  deleteStage,
  reorderStages,
  updatePipeline,
  updateStage,
} from './TaskApi'
import { STAGE_COLORS, stageStyle } from './taskView'

/**
 * Jarayon (voronka) va etaplarni sozlash — faqat admin. "На проверке" va "Закрыта"
 * har jarayonda bittadan, doim oxirida turadi: ularni qayta nomlash va rang berish mumkin,
 * lekin o'chirib bo'lmaydi.
 */
function TaskSettings({ pipelines, onChanged, onHide }) {
  const [selectedId, setSelectedId] = useState(pipelines[0]?.id ?? null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pipelineName, setPipelineName] = useState('')
  const [stageName, setStageName] = useState('')
  const [stageColor, setStageColor] = useState('info')

  const pipeline = pipelines.find((item) => item.id === selectedId) ?? pipelines[0]

  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      const result = await action()
      onChanged()
      return result
    } catch (e) {
      setError(e.message)
      return undefined
    } finally {
      setBusy(false)
    }
  }

  const normal = pipeline ? pipeline.stages.filter((stage) => stage.type === 'normal') : []

  const move = (stage, direction) => {
    const ids = normal.map((item) => item.id)
    const index = ids.indexOf(stage.id)
    const next = index + direction
    if (next < 0 || next >= ids.length) return
    ;[ids[index], ids[next]] = [ids[next], ids[index]]
    run(() => reorderStages(pipeline.id, ids))
  }

  return (
    <Modal show onHide={onHide} centered size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{t('Настройка воронок и этапов')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="overflow-y-auto">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="grid gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
          {/* Jarayonlar */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Воронки')}</p>
            {pipelines.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition',
                  item.id === pipeline?.id
                    ? 'border-primary/40 bg-primary-soft text-primary-soft-fg'
                    : 'border-line text-fg hover:bg-surface-2',
                )}
              >
                <span className="truncate">{td(item.name)}</span>
                <span className="text-[11px] tabular-nums text-subtle">{item.tasksCount}</span>
              </button>
            ))}
            <form
              className="mt-1 flex gap-1.5"
              onSubmit={async (event) => {
                event.preventDefault()
                if (!pipelineName.trim()) return
                const created = await run(() => addPipeline(pipelineName.trim()))
                if (created) {
                  setPipelineName('')
                  setSelectedId(created.id)
                }
              }}
            >
              <Form.Control
                size="sm"
                value={pipelineName}
                placeholder={t('Новая воронка')}
                aria-label={t('Новая воронка')}
                onChange={(e) => setPipelineName(e.target.value)}
              />
              <Button size="sm" icon type="submit" disabled={busy || !pipelineName.trim()} aria-label={t('Добавить воронку')}>
                <Plus />
              </Button>
            </form>
          </div>

          {/* Tanlangan jarayon */}
          {pipeline && (
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <Form.Label>{t('Название воронки')}</Form.Label>
                  <Form.Control
                    key={`${pipeline.id}-${pipeline.name}`}
                    defaultValue={pipeline.name}
                    maxLength={100}
                    onBlur={(e) => {
                      const name = e.target.value.trim()
                      if (name && name !== pipeline.name) run(() => updatePipeline(pipeline.id, { name }))
                      else e.target.value = pipeline.name
                    }}
                  />
                </div>
                <Button
                  variant="outline-danger"
                  disabled={busy || pipelines.length <= 1 || pipeline.tasksCount > 0}
                  title={pipeline.tasksCount > 0 ? t('В воронке есть задачи') : undefined}
                  onClick={async () => {
                    await run(() => deletePipeline(pipeline.id))
                    setSelectedId(null)
                  }}
                >
                  <Trash2 />
                  {t('Удалить воронку')}
                </Button>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-subtle">{t('Этапы')}</p>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {pipeline.stages.map((stage) => {
                    const fixed = stage.type !== 'normal'
                    const index = normal.findIndex((item) => item.id === stage.id)
                    return (
                      <li key={stage.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-2">
                        <span className={cn('size-2.5 shrink-0 rounded-full', stageStyle(stage.color).dot)} />
                        <div className="min-w-40 flex-1">
                          <Form.Control
                            size="sm"
                            key={`${stage.id}-${stage.name}`}
                            defaultValue={stage.name}
                            aria-label={t('Название этапа')}
                            maxLength={100}
                            onBlur={(e) => {
                              const name = e.target.value.trim()
                              if (name && name !== stage.name) run(() => updateStage(stage.id, { name }))
                              else e.target.value = stage.name
                            }}
                          />
                        </div>
                        <div className="w-32">
                          <Form.Select
                            size="sm"
                            aria-label={t('Цвет')}
                            value={stage.color}
                            onChange={(e) => run(() => updateStage(stage.id, { color: e.target.value }))}
                          >
                            {STAGE_COLORS.map((color) => (
                              <option key={color.key} value={color.key}>
                                {color.label}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        {fixed ? (
                          <span
                            className="inline-flex w-[5.75rem] items-center justify-end gap-1 text-[11px] text-subtle"
                            title={t('Обязательный этап: его нельзя удалить или переместить')}
                          >
                            <Lock className="size-3.5" />
                            {stage.type === 'review' ? t('проверка') : t('закрытие')}
                          </span>
                        ) : (
                          <div className="flex w-[5.75rem] justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon
                              disabled={busy || index === 0}
                              aria-label={t('Выше')}
                              onClick={() => move(stage, -1)}
                            >
                              <ChevronUp />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon
                              disabled={busy || index === normal.length - 1}
                              aria-label={t('Ниже')}
                              onClick={() => move(stage, 1)}
                            >
                              <ChevronDown />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon
                              disabled={busy || normal.length <= 1 || stage.tasksCount > 0}
                              title={stage.tasksCount > 0 ? t('В этапе есть задачи') : t('Удалить')}
                              aria-label={t('Удалить этап')}
                              onClick={() => run(() => deleteStage(stage.id))}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <form
                className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-line p-3"
                onSubmit={async (event) => {
                  event.preventDefault()
                  if (!stageName.trim()) return
                  const created = await run(() =>
                    addStage({ pipeline_id: pipeline.id, name: stageName.trim(), color: stageColor }),
                  )
                  if (created) setStageName('')
                }}
              >
                <div className="min-w-40 flex-1">
                  <Form.Label>{t('Новый этап')}</Form.Label>
                  <Form.Control
                    size="sm"
                    value={stageName}
                    maxLength={100}
                    placeholder={t('Название этапа')}
                    onChange={(e) => setStageName(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Form.Select size="sm" aria-label={t('Цвет')} value={stageColor} onChange={(e) => setStageColor(e.target.value)}>
                    {STAGE_COLORS.map((color) => (
                      <option key={color.key} value={color.key}>
                        {color.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <Button size="sm" type="submit" disabled={busy || !stageName.trim()}>
                  <Plus />
                  {t('Добавить этап')}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Закрыть окно')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default TaskSettings
export { TaskSettings }
