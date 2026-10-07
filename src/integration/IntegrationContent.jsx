import { useCallback, useEffect, useState } from 'react'
import {
  Bot,
  Check,
  Copy,
  KeyRound,
  Link2,
  PlugZap,
  RefreshCw,
  Save,
  Send,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Badge, Button, Card, EmptyState, Form, Modal, PageHeader, Tab, Tabs } from '../ui'
import { addBot, deleteBot, deleteChat, getBots, relinkBot, testBot } from './IntegrationApi'

const STATUS = {
  running: { bg: 'success', label: 'Работает' },
  starting: { bg: 'neutral', label: 'Запуск…' },
  offline: { bg: 'warning', label: 'Нет интернета' },
  conflict: { bg: 'warning', label: 'Конфликт' },
  error: { bg: 'danger', label: 'Ошибка' },
  stopped: { bg: 'neutral', label: 'Остановлен' },
}

// Holat (internet, token) oʻzgarishini koʻrsatib turish uchun.
const REFRESH_MS = 5000

function TelegramBotCard({ bot, onChanged, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)

  const status = STATUS[bot.status] ?? STATUS.stopped

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const run = async (name, action) => {
    setBusy(name)
    try {
      await action()
    } catch (error) {
      setNotice({ error: true, text: error.message })
    } finally {
      setBusy('')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bot.link)
      setCopied(true)
    } catch {
      setNotice({ error: true, text: 'Не удалось скопировать' })
    }
  }

  return (
    <Card padded={false}>
      <Card.Header>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info-soft-fg">
            <Bot className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-fg">@{bot.username}</p>
            <p className="truncate text-[11px] text-subtle">
              {bot.botName} · <span className="font-mono">{bot.tokenHint}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge bg={status.bg} dot>
            {status.label}
          </Badge>
          <Button
            variant="outline-secondary"
            size="sm"
            loading={busy === 'test'}
            disabled={bot.chats.length === 0}
            title={bot.chats.length === 0 ? 'Сначала подключите хотя бы один чат' : 'Отправить тестовое сообщение'}
            onClick={() =>
              run('test', async () => {
                const { delivered } = await testBot(bot.id)
                setNotice({ error: delivered === 0, text: `Отправлено в чатов: ${delivered} из ${bot.chats.length}` })
              })
            }
          >
            {busy !== 'test' && <Send />}
            Проверить
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete(bot)} aria-label="Удалить бота">
            <Trash2 />
          </Button>
        </div>
      </Card.Header>

      <div className="flex flex-col gap-4 p-4">
        {bot.error && bot.status !== 'running' && (
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-[12px] text-warning-soft-fg">{bot.error}</p>
        )}

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
            <Link2 className="size-3.5" />
            Ссылка для подключения
          </p>
          <div className="flex gap-2">
            <Form.Control readOnly value={bot.link ?? ''} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
            <Button variant="outline-secondary" onClick={copyLink} disabled={!bot.link}>
              {copied ? <Check /> : <Copy />}
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
            <Button
              variant="outline-secondary"
              loading={busy === 'relink'}
              title="Старая ссылка перестанет работать. Уже подключённые чаты останутся."
              onClick={() =>
                run('relink', async () => {
                  await relinkBot(bot.id)
                  setNotice({ error: false, text: 'Создана новая ссылка — старая больше не работает' })
                  onChanged()
                })
              }
            >
              {busy !== 'relink' && <RefreshCw />}
              Новая
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-subtle">
            Отправьте ссылку тем, кто должен получать продажи и возвраты. Они откроют её и нажмут
            «Start». Без этой ссылки бот никому ничего не покажет. Ссылку можно открыть и в группе.
          </p>
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
            <Users className="size-3.5" />
            Подключены ({bot.chats.length})
          </p>
          {bot.chats.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-3 text-[12px] text-subtle">
              Пока никто не подключён.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-line rounded-lg border border-line p-0">
              {bot.chats.map((chat) => (
                <li key={chat.id} className="flex items-center gap-2.5 px-3 py-2">
                  <UserRound className="size-3.5 shrink-0 text-subtle" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-fg">{chat.title || 'Без имени'}</p>
                    <p className="truncate text-[11px] text-subtle">
                      {chat.username ? `@${chat.username} · ` : ''}
                      {new Date(chat.date).toLocaleString('uz')}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Отключить"
                    aria-label="Отключить"
                    disabled={busy === `chat${chat.id}`}
                    onClick={() =>
                      run(`chat${chat.id}`, async () => {
                        await deleteChat(chat.id)
                        onChanged()
                      })
                    }
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-subtle transition hover:bg-danger-soft hover:text-danger-soft-fg"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {notice && (
          <p className={notice.error ? 'text-[12px] text-danger-soft-fg' : 'text-[12px] text-success-soft-fg'}>
            {notice.text}
          </p>
        )}
      </div>
    </Card>
  )
}

function TelegramBots() {
  const [botName, setBotName] = useState('')
  const [botToken, setBotToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [bots, setBots] = useState([])
  const [loadError, setLoadError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      setBots(await getBots())
      setLoadError('')
    } catch {
      setLoadError('Не удалось подключиться к серверу')
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  const submit = async (e) => {
    e.preventDefault()
    if (!botToken.trim()) {
      setFormError('Введите токен бота')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await addBot(botName.trim() || undefined, botToken.trim())
      setBotName('')
      setBotToken('')
      await load()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="h-fit">
        <h3 className="text-[13px] font-semibold text-fg">Подключить бота</h3>
        <p className="mt-0.5 text-xs text-subtle">
          Создайте бота в @BotFather (команда /newbot) и вставьте его токен.
        </p>

        <Form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
          <Form.Group controlId="botToken">
            <Form.Label>Токен</Form.Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <Form.Control
                className="pl-8 font-mono text-xs"
                placeholder="123456789:AA..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
            </div>
          </Form.Group>
          <Form.Group controlId="botName">
            <Form.Label>Название (необязательно)</Form.Label>
            <Form.Control
              placeholder="Например: Магазин"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
            />
          </Form.Group>
          {formError && <p className="text-[12px] text-danger-soft-fg">{formError}</p>}
          <Button type="submit" block loading={saving}>
            {!saving && <Save />}
            Сохранить
          </Button>
        </Form>

        <div className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-subtle">
          <p className="font-medium text-muted">Что делает бот</p>
          <p className="mt-1">• Присылает каждую продажу и каждый возврат.</p>
          <p>• Кнопки «Сегодня», «Неделя», «Месяц» показывают сумму продаж за период.</p>
          <p>• Работает, пока открыта программа ERP и есть интернет.</p>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {loadError && <p className="text-[12px] text-danger-soft-fg">{loadError}</p>}
        {bots.length === 0 && !loadError ? (
          <EmptyState
            icon={Bot}
            title="Ботов пока нет"
            description="Добавьте токен бота слева — после этого появится ссылка для подключения."
          />
        ) : (
          bots.map((bot) => (
            <TelegramBotCard key={bot.id} bot={bot} onChanged={load} onDelete={setToDelete} />
          ))
        )}
      </div>

      <Modal show={Boolean(toDelete)} onHide={() => setToDelete(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Удалить бота</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Бот @{toDelete?.username} перестанет присылать уведомления, все подключённые чаты будут
          отключены.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setToDelete(null)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={async () => {
              setDeleting(true)
              try {
                await deleteBot(toDelete.id)
                setToDelete(null)
                await load()
              } catch (error) {
                setLoadError(error.message)
              } finally {
                setDeleting(false)
              }
            }}
          >
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

function IntegrationTab() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Send className="text-info" />
            Telegram Bots
          </>
        }
      >
        <TelegramBots />
      </Tab>
    </Tabs>
  )
}

function IntegrationScreen() {
  return (
    <div>
      <PageHeader
        icon={PlugZap}
        title="Интеграция"
        description="Подключение внешних сервисов и ботов"
      />
      <IntegrationTab />
    </div>
  )
}

export { IntegrationScreen }
