import { useState } from 'react'
import { Save, UserPlus, Users } from 'lucide-react'
import { Button, Collapse, Form, PageHeader, Tab, Tabs } from '../ui'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { CustomerListGroup } from './CustomerListContent'
import { addCustomer } from './CustomerApi'

function CustomerForm({ handleRegister, busy }) {
  const [username, setUsername] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')

  const submit = (e) => handleRegister(e, username, surname, phone)

  return (
    <Form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Form.Group controlId="customerName">
          <Form.Label>Имя</Form.Label>
          <Form.Control
            placeholder="Введите имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="customerSurname">
          <Form.Label>Фамилия</Form.Label>
          <Form.Control
            placeholder="Введите фамилию"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </Form.Group>
      </div>

      <Form.Group controlId="customerPhone">
        <Form.Label>Телефон</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Введите номер телефона"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Form.Group>

      <Button type="submit" loading={busy} block>
        {!busy && <Save />}
        Сохранить
      </Button>
    </Form>
  )
}

function AddNewCustomer(props) {
  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRegister = async (e, username, surname, phone) => {
    e.preventDefault()

    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await addCustomer(username, surname, phone)
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
      } else {
        setShowSuccess(true)
        setAlertMessage('Успешно...')
        psetShow(false)
        const timer = setTimeout(() => props.tabChange('home'), 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setShowDanger(true)
      setAlertMessage('Не удалось подключиться к серверу')
      psetShow(false)
    }
  }

  return (
    <div className="max-w-md">
      {showDanger && <AlertDismissibleDanger alertMsg={alertMessage} />}
      {showSuccess && <AlertDismissibleSuccess alertMsg={alertMessage} />}
      <Collapse in={pshow}>
        <div>
          <ProgressDismissible />
        </div>
      </Collapse>
      <CustomerForm handleRegister={handleRegister} busy={pshow} />
    </div>
  )
}

function CustomerTabs() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Users />
            Список клиентов
          </>
        }
      >
        <CustomerListGroup activeTab={activeTab} />
      </Tab>
      <Tab
        eventKey="profile"
        title={
          <>
            <UserPlus />
            Добавить нового клиента
          </>
        }
      >
        <AddNewCustomer tabChange={(tabName) => setActiveTab(tabName)} />
      </Tab>
    </Tabs>
  )
}

function CustomerScreen() {
  return (
    <div>
      <PageHeader
        icon={Users}
        title="Клиенты"
        description="База покупателей и их контактные данные"
      />
      <CustomerTabs />
    </div>
  )
}

export default CustomerScreen
