import { useState } from 'react'
import { Boxes, ListOrdered } from 'lucide-react'
import { PageHeader, Tab, Tabs } from '../ui'
import { StockListGroup } from './StockListContent'
import { t } from '../i18n'

function StockTab() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <ListOrdered />
            {t('Список остатков')}
          </>
        }
      >
        <StockListGroup activeTab={activeTab} />
      </Tab>
    </Tabs>
  )
}

function StockScreen() {
  return (
    <div>
      <PageHeader
        icon={Boxes}
        title={t('Остатки')}
        description={t('Количество товаров на каждом складе')}
      />
      <StockTab />
    </div>
  )
}

export default StockScreen
