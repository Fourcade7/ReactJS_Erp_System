import { useState } from 'react'
import { UserPlus, UserRound, Users } from 'lucide-react'
import { PageHeader, Tab, Tabs } from '../ui'
import { RegisterScreenforTab } from '../auth/RegisterContent'
import { UserListGroup } from './UserListContent'
import { t } from '../i18n'

function UserTabs() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Users />
            {t('Список сотрудников')}
          </>
        }
      >
        <UserListGroup activeTab={activeTab} />
      </Tab>
      <Tab
        eventKey="profile"
        title={
          <>
            <UserPlus />
            {t('Добавить нового сотрудника')}
          </>
        }
      >
        <RegisterScreenforTab tabChange={(tabName) => setActiveTab(tabName)} />
      </Tab>
    </Tabs>
  )
}

function UserScreen() {
  return (
    <div>
      <PageHeader
        icon={UserRound}
        title={t('Сотрудники')}
        description={t('Учётные записи и роли доступа')}
      />
      <UserTabs />
    </div>
  )
}

export default UserScreen
