import { useState } from 'react'
import { Bot, KeyRound, PlugZap, Save, Send } from 'lucide-react'
import { Badge, Button, Card, Form, ListGroup, PageHeader, Tab, Tabs } from '../ui'

const bots = [
  { name: 'my_first_bot', token: '1234567890:AAExampleToken_1abcdefghijk' },
  { name: 'news_bot', token: '1234567890:AAExampleToken_2abcdefghijk' },
  { name: 'shop_bot', token: '1234567890:AAExampleToken_3abcdefghijk' },
]

function TelegramBotLists() {
  return (
    <ListGroup as="ol">
      {bots.map((item, index) => (
        <ListGroup.Item as="li" key={item.name}>
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-info-soft text-info-soft-fg">
            <Bot className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-fg">@{item.name}</p>
            <p className="truncate font-mono text-[11px] text-subtle">
              {item.token.slice(0, 15)}…
            </p>
          </div>
          <Badge bg="success" dot>
            Активен
          </Badge>
          <span className="hidden text-[11px] tabular-nums text-subtle sm:inline">#{index + 1}</span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

function TelegramBots() {
  const [username, setUsername] = useState('')
  const [username2, setUsername2] = useState('')

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="h-fit">
        <h3 className="text-[13px] font-semibold text-fg">Подключить бота</h3>
        <p className="mt-0.5 text-xs text-subtle">Токен выдаёт @BotFather в Telegram.</p>

        <Form className="mt-4 flex flex-col gap-3">
          <Form.Group controlId="botName">
            <Form.Label>Имя бота</Form.Label>
            <Form.Control
              placeholder="Введите имя бота"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="botToken">
            <Form.Label>Токен</Form.Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <Form.Control
                className="pl-8 font-mono text-xs"
                placeholder="Введите токен бота"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
              />
            </div>
          </Form.Group>
          <Button block>
            <Save />
            Сохранить
          </Button>
        </Form>
      </Card>

      <TelegramBotLists />
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
