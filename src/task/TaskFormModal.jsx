import { useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from '../ui'
import { useRequest } from '../lib/useRequest'
import { t, td } from '../i18n'
import { uploadMany } from '../attachment/AttachmentApi'
import { FilePicker } from '../attachment/Attachments'
import { getContracts } from '../contract/ContractApi'
import { ContractFormModal } from '../contract/ContractFormModal'
import { customerName } from '../contract/contractView'
import { CustomerPicker } from '../customers/CustomerPicker'
import { MemberPicker } from './MemberPicker'
import { addTask, updateTask } from './TaskApi'
import { PRIORITIES, canAttachCustomer, fromLocalInput, fullName, isAdmin, roleLabel, toLocalInput } from './taskView'

const NEW_CONTRACT = '__new__'

/**
 * Vazifa ochish / tahrirlash. Tahrirlashda jarayon va etap o'zgarmaydi
 * (etap doskada suriladi).
 */
function TaskFormModal({ task, pipelines, members, defaultPipelineId, defaultContractId, onHide, onSaved }) {
  const editing = Boolean(task)
  // Shartnoma bilan ishlash faqat adminda (keyin buxgalter bo'limida ham ochiladi).
  const admin = isAdmin()

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'normal')
  const [pipelineId, setPipelineId] = useState(task?.pipeline?.id ?? defaultPipelineId ?? pipelines[0]?.id ?? '')
  const [stageId, setStageId] = useState('')
  const [due, setDue] = useState(toLocalInput(task?.dueDate))
  const [responsibleId, setResponsibleId] = useState(task?.responsible?.id ?? '')
  const [participantIds, setParticipantIds] = useState(task ? task.participants.map((user) => user.id) : [])
  const [contractId, setContractId] = useState(task?.contract?.id ?? defaultContractId ?? '')
  const [customer, setCustomer] = useState(task?.customer ?? null)
  const [files, setFiles] = useState([])
  const [quickContract, setQuickContract] = useState(false)
  const [createdContracts, setCreatedContracts] = useState([])
  const [invalid, setInvalid] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const contractsRequest = useRequest(() => getContracts({ limit: 100 }), admin ? 'contracts' : null)

  // Faol shartnomalar + hozir biriktirilgani + shu oynada yangi ochilganlar.
  const contractOptions = (() => {
    const map = new Map()
    for (const item of contractsRequest.data?.data ?? []) {
      if (!['closed', 'cancelled'].includes(item.status) || item.id === Number(contractId)) map.set(item.id, item)
    }
    for (const item of createdContracts) map.set(item.id, item)
    if (task?.contract && !map.has(task.contract.id)) map.set(task.contract.id, task.contract)
    return [...map.values()]
  })()

  const pipeline = pipelines.find((item) => item.id === Number(pipelineId))
  const startStages = (pipeline?.stages ?? []).filter((stage) => stage.type === 'normal')
  const responsible = Number(responsibleId) || null

  const save = async () => {
    if (!title.trim()) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setSaving(true)
    setError('')

    const participants = participantIds.filter((id) => id !== responsible)
    try {
      const saved = editing
        ? await updateTask(task.id, {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: fromLocalInput(due),
            responsible_id: responsible,
            participant_ids: participants,
            contract_id: admin ? Number(contractId) || null : undefined,
            customer_id: canAttachCustomer() ? (customer?.id ?? null) : undefined,
          })
        : await addTask({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            pipeline_id: Number(pipelineId),
            stage_id: stageId ? Number(stageId) : undefined,
            dueDate: fromLocalInput(due) || undefined,
            responsible_id: responsible || undefined,
            participant_ids: participants,
            contract_id: admin ? Number(contractId) || undefined : undefined,
            customer_id: canAttachCustomer() ? (customer?.id ?? undefined) : undefined,
          })
      // Yangi vazifaga tanlangan fayllar yaratilgach yuklanadi (xatolar qaytariladi).
      const uploadErrors = !editing && files.length ? await uploadMany(files, { taskId: saved.id }) : []
      onSaved(saved, uploadErrors)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // Shartnoma ochilayotganda faqat o'sha oyna ko'rinadi (ikkita modal Escape'ni bo'lishmasligi uchun);
  // forma holati saqlanib qoladi, chunki komponent o'zi unmount bo'lmaydi.
  if (quickContract) {
    return (
      <ContractFormModal
        members={members}
        defaultResponsibleId={responsible ?? undefined}
        onHide={() => setQuickContract(false)}
        onSaved={(contract) => {
          setCreatedContracts((current) => [...current, contract])
          setContractId(contract.id)
          setQuickContract(false)
        }}
      />
    )
  }

  return (
    // Keng va ikki ustunli: balandligi kamayadi; baribir ekranga sig'masa tanasi skroll bo'ladi (sarlavha va tugmalar joyida).
    <Modal show onHide={onHide} centered size="full" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? t('Изменить задачу') : t('Новая задача')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="min-h-0 overflow-y-auto">
        {error && (
          <div className="mb-4">
            <Alert variant="danger">{error}</Alert>
          </div>
        )}

        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
          {/* Chap ustun: nima qilish kerak */}
          <div className="flex min-w-0 flex-col gap-4">
            <Form.Group controlId="taskTitle">
              <Form.Label>{t('Название')}</Form.Label>
              <Form.Control
                value={title}
                isInvalid={invalid}
                maxLength={200}
                placeholder={t('Что нужно сделать')}
                onChange={(e) => setTitle(e.target.value)}
              />
              {invalid && <Form.Text className="text-danger">{t('Укажите название задачи')}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="taskDescription">
              <Form.Label>{t('Описание')}</Form.Label>
              <Form.Control as="textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            {canAttachCustomer() && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">{t('Контрагент')}</p>
                <CustomerPicker value={customer} onChange={setCustomer} />
                <p className="mt-1.5 text-[11px] leading-snug text-subtle">
                  {t('Ищите по имени или телефону. Нет в списке — создайте нового: он попадёт в «Клиенты».')}
                </p>
              </div>
            )}

            {!editing && <FilePicker files={files} onChange={setFiles} />}
          </div>

          {/* O'ng ustun: kim, qachon va qaysi jarayonda */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editing && (
                <>
                  <Form.Group controlId="taskPipeline">
                    <Form.Label>{t('Воронка')}</Form.Label>
                    <Form.Select
                      value={pipelineId}
                      onChange={(e) => {
                        setPipelineId(e.target.value)
                        setStageId('')
                      }}
                    >
                      {pipelines.map((item) => (
                        <option key={item.id} value={item.id}>
                          {td(item.name)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="taskStage">
                    <Form.Label>{t('Начальный этап')}</Form.Label>
                    <Form.Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
                      <option value="">{startStages[0] ? td(startStages[0].name) : '—'}</option>
                      {startStages.slice(1).map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {td(stage.name)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              <Form.Group controlId="taskPriority">
                <Form.Label>{t('Приоритет')}</Form.Label>
                <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="taskDue">
                <Form.Label>{t('Срок выполнения')}</Form.Label>
                <Form.Control type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
              </Form.Group>
            </div>

            <Form.Group controlId="taskResponsible">
              <Form.Label>{t('Ответственный')}</Form.Label>
              <Form.Select
                value={responsibleId}
                onChange={(e) => {
                  setResponsibleId(e.target.value)
                  // Javobgar qo'shimcha ijrochilar ro'yxatida takrorlanmaydi.
                  setParticipantIds((current) => current.filter((id) => id !== Number(e.target.value)))
                }}
              >
                <option value="">{t('Не назначен')}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {fullName(member)} · {roleLabel(member.role)}
                  </option>
                ))}
              </Form.Select>
              <Form.Text>{t('Закрытая и утверждённая задача засчитывается ответственному')}</Form.Text>
            </Form.Group>

            {admin && (
              <Form.Group controlId="taskContract">
                <Form.Label>{t('Договор')}</Form.Label>
                <Form.Select
                  value={contractId}
                  onChange={(e) => {
                    if (e.target.value === NEW_CONTRACT) setQuickContract(true)
                    else setContractId(e.target.value)
                  }}
                >
                  <option value="">{t('Без договора')}</option>
                  {contractOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.number}
                      {item.subject ? ` · ${item.subject.slice(0, 50)}` : ''}
                      {item.customer ? ` · ${customerName(item.customer)}` : ''}
                    </option>
                  ))}
                  <option value={NEW_CONTRACT}>{t('＋ Новый договор…')}</option>
                </Form.Select>
                <Form.Text>{t('Задача выполняется по этому договору; он виден в карточке задачи')}</Form.Text>
              </Form.Group>
            )}

            {/* Qidirib topiladi: xodim ko'p bo'lsa ham oyna kattalashmaydi. */}
            <MemberPicker
              members={members}
              known={task?.participants}
              value={participantIds}
              onChange={setParticipantIds}
              exclude={responsible}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Отмена')}
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving && <Spinner size="sm" />}
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default TaskFormModal
export { TaskFormModal }
