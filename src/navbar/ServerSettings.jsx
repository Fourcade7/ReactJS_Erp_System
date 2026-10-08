import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button, Form, Modal } from '../ui'
import { cn } from '../lib/cn'
import {
  API_BASE,
  getServerConfig,
  isValidIPv4,
  isValidPort,
  saveServerConfig,
} from '../config/api'

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 flex-1 rounded-md px-3 text-[13px] font-medium transition-colors duration-150',
        active ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}

/**
 * Server sozlamalari: Local (`localhost:<port>`) yoki API (`<IPv4>:<port>`).
 * Har bir rejimning qiymati alohida saqlanadi, shuning uchun rejim
 * almashtirilganda kiritilgan IPv4 va portlar yoʻqolmaydi.
 */
function ServerSettings() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(getServerConfig)
  const [errors, setErrors] = useState({})

  const isApi = draft.mode === 'api'
  const portKey = isApi ? 'apiPort' : 'localPort'
  const target = isApi
    ? `${draft.host.trim() || '…'}:${draft.apiPort.trim() || '…'}`
    : `localhost:${draft.localPort.trim() || '…'}`

  const openModal = () => {
    setDraft(getServerConfig())
    setErrors({})
    setOpen(true)
  }

  const update = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    setErrors({})
  }

  const save = () => {
    const saved = getServerConfig()
    const next = {
      mode: draft.mode,
      host: draft.host.trim(),
      apiPort: draft.apiPort.trim(),
      localPort: draft.localPort.trim(),
    }

    const found = {}
    if (isApi && !isValidIPv4(next.host)) found.host = true
    if (!isValidPort(next[portKey])) found.port = true
    if (found.host || found.port) {
      setErrors(found)
      return
    }

    // Ishlatilmayotgan rejimning yarim yozilgan qiymati saqlangan qiymatni buzmasin.
    if (!isValidIPv4(next.host)) next.host = saved.host
    if (!isValidPort(next.apiPort)) next.apiPort = saved.apiPort
    if (!isValidPort(next.localPort)) next.localPort = saved.localPort

    if (!saveServerConfig(next)) setOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={openModal}
        title="Настройки сервера"
        aria-label="Настройки сервера"
        className="gap-1.5"
      >
        <Settings />
        <span className="hidden max-w-40 truncate font-mono text-[11px] text-subtle md:inline">
          {API_BASE.replace('http://', '')}
        </span>
      </Button>

      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Настройки сервера</Modal.Title>
        </Modal.Header>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <Modal.Body className="flex flex-col gap-4">
            <div
              role="group"
              aria-label="Сервер"
              className="flex items-center rounded-lg border border-line bg-surface-2 p-0.5"
            >
              <ModeButton active={!isApi} onClick={() => update({ mode: 'local' })}>
                Local
              </ModeButton>
              <ModeButton active={isApi} onClick={() => update({ mode: 'api' })}>
                API
              </ModeButton>
            </div>

            {isApi && (
              <Form.Group controlId="serverHost">
                <Form.Label>IPv4 адрес</Form.Label>
                <Form.Control
                  value={draft.host}
                  isInvalid={errors.host}
                  onChange={(e) => update({ host: e.target.value })}
                  placeholder="192.168.1.10"
                  inputMode="decimal"
                  spellCheck={false}
                  autoComplete="off"
                />
                {errors.host && (
                  <Form.Text className="text-danger">Введите корректный IPv4 адрес</Form.Text>
                )}
              </Form.Group>
            )}

            <Form.Group controlId="serverPort">
              <Form.Label>Порт</Form.Label>
              <Form.Control
                value={draft[portKey]}
                isInvalid={errors.port}
                onChange={(e) => update({ [portKey]: e.target.value })}
                placeholder="3000"
                inputMode="numeric"
                spellCheck={false}
                autoComplete="off"
              />
              {errors.port && (
                <Form.Text className="text-danger">Порт должен быть от 1 до 65535</Form.Text>
              )}
            </Form.Group>

            <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-fg">
              http://{target}
            </p>

            <p className="text-[11px] leading-snug text-subtle">
              {isApi
                ? 'Запросы пойдут на указанный сервер.'
                : 'Запросы пойдут на локальный сервер и его базу данных.'}{' '}
              IPv4 и порты сохраняются: при переключении они не теряются. После смены
              сервера нужно войти заново.
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default ServerSettings
