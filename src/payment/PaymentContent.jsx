import { useState } from 'react'
import { Banknote, Info, ListOrdered } from 'lucide-react'
import { PageHeader, Tab, Tabs } from '../ui'
import TransactionDetail from '../transaction/TransactionDetail'
import { PaymentListGroup } from './PaymentListContent'
import { t } from '../i18n'

function PaymentTab() {
  const [activeTab, setActiveTab] = useState('home')
  const [selected, setSelected] = useState(null)

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <ListOrdered />
            {t('Список платежей')}
          </>
        }
      >
        <PaymentListGroup
          activeTab={activeTab}
          setSelectedSale={setSelected}
          setActiveTab={setActiveTab}
        />
      </Tab>

      {activeTab === 'payment_detail' && (
        <Tab
          eventKey="payment_detail"
          title={
            <>
              <Info />
              {t('Детали платежа')}
            </>
          }
        >
          <TransactionDetail
            selectedSale={selected?.record}
            setActiveTab={setActiveTab}
            label={selected?.label}
            icon={selected?.Icon}
          />
        </Tab>
      )}
    </Tabs>
  )
}

function PaymentScreen() {
  return (
    <div>
      <PageHeader
        icon={Banknote}
        title={t('Платеж')}
        description={t('Все поступления и выплаты по продажам, приходам и возвратам')}
      />
      <PaymentTab />
    </div>
  )
}

export default PaymentScreen
