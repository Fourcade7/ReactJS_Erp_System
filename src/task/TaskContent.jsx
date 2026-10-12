import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Columns3, List, Plus, RefreshCw, Settings } from 'lucide-react'
import { cn } from '../lib/cn'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Card, EmptyState, Form, PageHeader, SearchField, Spinner } from '../ui'
import { t, td } from '../i18n'
import { getPipelineCounts, getTaskBoard, getTaskMembers, getTaskPipelines, getTasks, moveTask } from './TaskApi'
import { TaskBoard } from './TaskBoard'
import { TaskDialog } from './TaskDialog'
import { TaskFormModal } from './TaskFormModal'
import { TaskList } from './TaskList'
import { TaskSettings } from './TaskSettings'
import { currentUserId, fullName, isAdmin } from './taskView'

const REFRESH_MS = 30_000
const PAGE_SIZE = 15
const VIEW_KEY = 'taskView'
const PIPELINE_KEY = 'taskPipeline'
/** Ro'yxat ko'rinishida: barcha voronkalar birga. */
const ALL = 'all'

/** Oxirgi tanlangan voronka (tab) brauzerda eslab qolinadi; yo'q bo'lsa — avtomatik tanlanadi. */
function readPipeline() {
  try {
    const value = localStorage.getItem(PIPELINE_KEY)
    return value === ALL ? ALL : Number(value) || null
  } catch {
    return null
  }
}

/** Oxirgi tanlangan ko'rinish (doska / ro'yxat) brauzerda eslab qolinadi. */
function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'board'
  } catch {
    return 'board'
  }
}

/** Doska va ro'yxat o'rtasida almashtirgich. */
function ViewToggle({ value, onChange }) {
  const options = [
    { key: 'board', label: t('Доска'), Icon: Columns3 },
    { key: 'list', label: t('Список'), Icon: List },
  ]
  return (
    <div role="radiogroup" aria-label={t('Вид отображения')} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((option) => {
        const { key, label, Icon } = option
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => onChange(key)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition',
              active ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Vazifalar: jarayon bo'yicha kanban doskasi yoki etap bo'yicha filtrlanadigan ro'yxat (sahifalash bilan).
 * Faqat administrator vazifa ochadi va hammasini ko'radi; qolganlar faqat o'zlariga tegishlisini
 * ko'radi (buni server ham majburlaydi). "Закрыта" ga faqat admin o'tkazadi.
 */
function TaskScreen() {
  const admin = isAdmin()
  const me = currentUserId()

  const [view, setView] = useState(readView)
  // null — avtomatik; son — tanlangan voronka; 'all' — ro'yxatda barcha voronkalar.
  const [pipelineId, setPipelineId] = useState(readPipeline)
  const [autoId, setAutoId] = useState(null)
  const [stateFilter, setStateFilter] = useState('')
  const [mine, setMine] = useState(false)
  const [responsibleId, setResponsibleId] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [stageId, setStageId] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [reload, setReload] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [settings, setSettings] = useState(false)
  const [notice, setNotice] = useState('')
  const [created, setCreated] = useState('')
  // Sichqoncha bilan surilgan kartochka javob kelguncha shu yerda turadi (taskId -> etap).
  const [pending, setPending] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  // Doska boshqalar o'zgartirganda ham yangilanib turadi (socket yo'q — oddiy so'rov).
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setReload((value) => value + 1)
    }, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [])

  const pipelinesRequest = useRequest(getTaskPipelines, `pipelines-${reload}`)
  const membersRequest = useRequest(getTaskMembers, 'members')
  const pipelines = pipelinesRequest.data ?? []
  const members = membersRequest.data ?? []

  // Tablardagi sonlar: foydalanuvchiga ko'rinadigan vazifalar voronkalar bo'yicha (joriy filtrlar bilan).
  const countsKey = `${mine}|${responsibleId}|${overdueOnly}|${debounced}|${reload}`
  const countsRequest = useRequest(
    () =>
      getPipelineCounts({
        member_id: mine ? me : undefined,
        responsible_id: responsibleId || undefined,
        overdue: overdueOnly || undefined,
        search: debounced || undefined,
      }),
    countsKey,
  )
  const counts = countsRequest.data?.pipelines ?? null

  // Avtomatik tanlov bir marta: vazifasi bor birinchi voronka (bo'lmasa — birinchisi). Keyin o'zgarmaydi,
  // aks holda har yangilanishda tab o'zi sakrab ketardi.
  if (autoId === null && pipelines.length > 0 && (counts || countsRequest.error)) {
    const withTasks = counts
      ? (pipelines.find((p) => (counts[p.id]?.active ?? 0) > 0) ?? pipelines.find((p) => (counts[p.id]?.total ?? 0) > 0))
      : null
    setAutoId((withTasks ?? pipelines[0]).id)
  }

  const allMode = view === 'list' && pipelineId === ALL
  const chosen = pipelines.find((pipeline) => pipeline.id === pipelineId)
  const activePipeline = allMode ? null : (chosen ?? pipelines.find((pipeline) => pipeline.id === autoId) ?? null)
  const activePipelineId = activePipeline?.id ?? null
  // Voronkalar bor, lekin sonlar hali kelmagan — tabni taxmin qilmasdan kutamiz.
  const waitingFirst = pipelines.length > 0 && !activePipeline && !allMode

  // Ro'yxat va doska bir xil filtrlardan foydalanadi. Admin bo'lmaganlarga server o'zi cheklaydi.
  const query = {
    pipeline_id: activePipelineId ?? undefined,
    member_id: mine ? me : undefined,
    responsible_id: responsibleId || undefined,
    overdue: overdueOnly || undefined,
    search: debounced || undefined,
  }
  const filterKey = `${allMode ? ALL : activePipelineId}|${mine}|${responsibleId}|${overdueOnly}|${debounced}|${reload}`

  const boardKey = activePipelineId && view === 'board' ? filterKey : null
  const boardRequest = useRequest(() => getTaskBoard(query), boardKey)
  const board = boardRequest.data

  const listKey = (activePipelineId || allMode) && view === 'list' ? `${filterKey}|${stageId}|${stateFilter}|${page}` : null
  const listRequest = useRequest(
    () =>
      getTasks({
        ...query,
        // Barcha voronkalarda etaplar har xil — shu bois holat (открытые / на проверке / закрытые) bo'yicha filtrlanadi.
        stage_id: allMode ? undefined : stageId || undefined,
        state: allMode ? stateFilter || undefined : undefined,
        page,
        limit: PAGE_SIZE,
      }),
    listKey,
  )
  const list = listRequest.data

  // Oxirgi sahifadagi vazifalar boshqa etapga o'tib ketsa, sahifa bo'sh qolmasin.
  const totalPages = list?.meta.totalPages ?? 0
  if (view === 'list' && totalPages > 0 && page > totalPages) setPage(totalPages)

  const refresh = () => setReload((value) => value + 1)

  /** Filtr o'zgarganda ro'yxat 1-sahifaga qaytadi. */
  const resetPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const changeView = (next) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // brauzer saqlashga ruxsat bermasa — ko'rinish shu seans uchun qoladi
    }
  }

  const selectPipeline = (id) => {
    setPipelineId(id)
    setStageId('')
    setStateFilter('')
    setPage(1)
    try {
      localStorage.setItem(PIPELINE_KEY, String(id))
    } catch {
      // brauzer saqlashga ruxsat bermasa — tanlov shu seans uchun qoladi
    }
  }

  // Optimistik ko'rinish: surilgan vazifa darrov yangi ustunda ko'rinadi.
  const stages = useMemo(() => {
    if (!board) return []
    if (!pending || pending.base !== board) return board.stages

    const moved = board.stages.flatMap((stage) => stage.tasks).find((task) => task.id === pending.taskId)
    if (!moved) return board.stages
    return board.stages.map((stage) => {
      const rest = stage.tasks.filter((task) => task.id !== pending.taskId)
      if (stage.id === pending.stageId) {
        return { ...stage, total: stage.total + 1, tasks: [{ ...moved, stage: { ...moved.stage, id: stage.id } }, ...rest] }
      }
      return rest.length === stage.tasks.length ? stage : { ...stage, total: stage.total - 1, tasks: rest }
    })
  }, [board, pending])

  const overdueCount = stages.reduce((sum, stage) => sum + stage.tasks.filter((task) => task.overdue).length, 0)
  const overdueShown = view === 'list' ? (list?.summary.overdue ?? 0) : overdueCount

  const handleMove = async (task, stage) => {
    setNotice('')
    setPending({ base: board, taskId: task.id, stageId: stage.id })
    try {
      await moveTask(task.id, stage.id)
    } catch (e) {
      setNotice(e.message)
    } finally {
      refresh()
    }
  }

  const active = view === 'list' ? listRequest : boardRequest
  const loadingFirst =
    (pipelinesRequest.loading && !pipelinesRequest.data) ||
    waitingFirst ||
    (view === 'list' ? listRequest.loading && !list : boardRequest.loading && !board)
  const error = pipelinesRequest.error || active.error

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ClipboardList}
        title={t('Задачи')}
        description={t('Задачи по этапам: от постановки до проверки администратором')}
        actions={
          <>
            <Button variant="outline-secondary" icon aria-label={t('Обновить')} title={t('Обновить')} onClick={refresh}>
              <RefreshCw className={cn(active.loading && 'animate-spin')} />
            </Button>
            {admin && (
              <Button variant="outline-secondary" onClick={() => setSettings(true)}>
                <Settings />
                {t('Воронки и этапы')}
              </Button>
            )}
            {/* Vazifani faqat administrator ochadi: qolganlarda tugma umuman ko'rinmaydi. */}
            {admin && (
              <Button onClick={() => setCreating(true)} disabled={pipelines.length === 0}>
                <Plus />
                {t('Новая задача')}
              </Button>
            )}
          </>
        }
      />

      {pipelines.length > 1 && (
        <div role="tablist" aria-label={t('Воронка')} className="flex flex-wrap gap-1.5">
          {[
            // "Все воронки" faqat ro'yxatda: doska bitta voronkaning etaplaridan iborat.
            ...(view === 'list' ? [{ id: ALL, name: t('Все воронки') }] : []),
            ...pipelines,
          ].map((pipeline) => {
            const isAll = pipeline.id === ALL
            const selected = isAll ? allMode : pipeline.id === activePipelineId
            const stat = isAll
              ? counts && {
                  active: Object.values(counts).reduce((sum, item) => sum + item.active, 0),
                  overdue: Object.values(counts).reduce((sum, item) => sum + item.overdue, 0),
                }
              : counts?.[pipeline.id] ?? (counts ? { active: 0, overdue: 0 } : null)
            return (
              <button
                key={pipeline.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectPipeline(pipeline.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition',
                  selected
                    ? 'border-primary/40 bg-primary-soft text-primary-soft-fg'
                    : 'border-line text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                {isAll ? pipeline.name : td(pipeline.name)}
                {stat && (
                  <span
                    title={stat.overdue > 0 ? t('Просрочено: {count}', { count: stat.overdue }) : undefined}
                    className={cn(
                      'rounded-full px-1.5 text-[11px] tabular-nums leading-5',
                      stat.overdue > 0
                        ? 'bg-danger-soft text-danger-soft-fg'
                        : stat.active > 0
                          ? 'bg-surface-2 text-fg'
                          : 'text-subtle',
                    )}
                  >
                    {stat.active}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <Card className="flex flex-wrap items-center gap-3">
        {/* Admin bo'lmaganlar doim faqat o'z vazifalarini ko'radi, shu bois "Мои задачи" ularga kerak emas. */}
        {admin && (
          <Form.Check
            type="switch"
            label={t('Мои задачи')}
            checked={mine}
            onChange={(e) => resetPage(setMine)(e.target.checked)}
          />
        )}
        <Form.Check
          type="switch"
          label={t('Только просроченные')}
          checked={overdueOnly}
          onChange={(e) => resetPage(setOverdueOnly)(e.target.checked)}
        />
        <div className="w-56">
          <Form.Select
            aria-label={t('Ответственный')}
            value={responsibleId}
            onChange={(e) => resetPage(setResponsibleId)(e.target.value)}
          >
            <option value="">{t('Все ответственные')}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {fullName(member)}
              </option>
            ))}
          </Form.Select>
        </div>
        <SearchField
          className="min-w-52 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={t('Поиск по названию или описанию...')}
        />
        {overdueShown > 0 && <Badge bg="danger">{t('Просрочено: {count}', { count: overdueShown })}</Badge>}
        <div className="ml-auto">
          <ViewToggle value={view} onChange={changeView} />
        </div>
      </Card>

      {created && (
        <Alert variant="success" dismissible onClose={() => setCreated('')}>
          {t('Задача «{title}» создана', { title: created })}
        </Alert>
      )}
      {notice && (
        <Alert variant="danger" dismissible onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}
      {error && <Alert variant="danger">{error.message}</Alert>}

      {loadingFirst ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : view === 'list' ? (
        activePipeline || allMode ? (
          <TaskList
            data={list}
            loading={listRequest.loading}
            allPipelines={allMode}
            stages={activePipeline?.stages ?? []}
            stageId={allMode ? stateFilter : stageId}
            onStage={allMode ? resetPage(setStateFilter) : resetPage(setStageId)}
            page={page}
            onPage={setPage}
            filtered={Boolean(debounced || responsibleId || overdueOnly || stageId || stateFilter || mine)}
            admin={admin}
            onOpen={(task) => setOpenId(task.id)}
          />
        ) : (
          !error && (
            <EmptyState
              icon={ClipboardList}
              title={t('Воронок пока нет')}
              description={t('Администратор может создать воронку в разделе «Воронки и этапы».')}
            />
          )
        )
      ) : stages.length > 0 ? (
        <TaskBoard stages={stages} admin={admin} onOpen={(task) => setOpenId(task.id)} onMove={handleMove} />
      ) : (
        !error && (
          <EmptyState
            icon={ClipboardList}
            title={t('Воронок пока нет')}
            description={t('Администратор может создать воронку в разделе «Воронки и этапы».')}
          />
        )
      )}

      {creating && admin && (
        <TaskFormModal
          pipelines={pipelines}
          members={members}
          defaultPipelineId={activePipelineId}
          onHide={() => setCreating(false)}
          onSaved={(task, uploadErrors = []) => {
            setCreating(false)
            setPipelineId(task.pipeline?.id ?? activePipelineId)
            // Yangi vazifa filtr tufayli yashirinib qolmasin: qidiruv va qo'shimcha filtrlar tozalanadi
            // ("Мои задачи" ochgan odamni ham qamraydi).
            setSearch('')
            setDebounced('')
            setResponsibleId('')
            setOverdueOnly(false)
            setStageId('')
            setPage(1)
            setCreated(task.title)
            if (uploadErrors.length) {
              setNotice(`${t('Задача создана, но не все файлы загрузились')}: ${uploadErrors.join('; ')}`)
            }
            refresh()
          }}
        />
      )}

      {openId !== null && (
        <TaskDialog
          taskId={openId}
          pipelines={pipelines}
          members={members}
          onHide={() => setOpenId(null)}
          onChanged={refresh}
        />
      )}

      {settings && <TaskSettings pipelines={pipelines} onChanged={refresh} onHide={() => setSettings(false)} />}
    </div>
  )
}

export { TaskScreen }
