import { useState } from 'react'
import { Save, UserPlus, Users } from 'lucide-react'
import { Button, Collapse, Form, PageHeader, Tab, Tabs } from '../ui'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { CustomerListGroup } from './CustomerListContent'
import { CustomerFields } from './CustomerFields'
import { createCustomer } from './CustomerApi'
import { customerPayload, emptyCustomer, validateCustomer } from './customerForm'
import { t } from '../i18n'

/** Yangi kontragent: odam yoki tashkilot (tashkilotda faqat nomi majburiy). */
function CustomerForm({ onSubmit, busy }) {
  const [value, setValue] = useState(() => emptyCustomer('user'))
  const [invalid, setInvalid] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const check = validateCustomer(value)
    setInvalid(check.invalid)
    if (check.ok) onSubmit(value)
  }

  return (
    <Form onSubmit={submit} className="flex flex-col gap-3">
      <CustomerFields
        value={value}
        onChange={(next) => {
          setValue(next)
          setInvalid({})
        }}
        invalid={invalid}
        idPrefix="addCustomer"
      />

      <Button type="submit" loading={busy} block>
        {!busy && <Save />}
        {t('Сохранить')}
      </Button>
    </Form>
  )
}

function AddNewCustomer(props) {
  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRegister = async (value) => {
    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await createCustomer(customerPayload(value))
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(Array.isArray(result.message) ? result.message.join(', ') : result.message)
        psetShow(false)
      } else {
        setShowSuccess(true)
        setAlertMessage(t('Успешно...'))
        psetShow(false)
        const timer = setTimeout(() => props.tabChange('home'), 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setShowDanger(true)
      setAlertMessage(t('Не удалось подключиться к серверу'))
      psetShow(false)
    }
  }

  return (
    <div className="max-w-xl">
      {showDanger && <AlertDismissibleDanger alertMsg={alertMessage} />}
      {showSuccess && <AlertDismissibleSuccess alertMsg={alertMessage} />}
      <Collapse in={pshow}>
        <div>
          <ProgressDismissible />
        </div>
      </Collapse>
      <CustomerForm onSubmit={handleRegister} busy={pshow} />
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
            {t('Список клиентов')}
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
            {t('Добавить нового клиента')}
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
        title={t('Клиенты')}
        description={t('База покупателей и их контактные данные')}
      />
      <CustomerTabs />
    </div>
  )
}

export default CustomerScreen
