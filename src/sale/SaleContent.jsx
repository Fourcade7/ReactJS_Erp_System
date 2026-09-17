import { useState } from 'react'
import { Info, ShoppingBag, Wallet } from 'lucide-react'
import { Tab, Tabs } from '../ui'
import TransactionWorkspace from '../transaction/TransactionWorkspace'
import TransactionList from '../transaction/TransactionList'
import TransactionDetail from '../transaction/TransactionDetail'
import {
  addNewPayment,
  addNewSale,
  getAllCustomersForSale,
  getAllProductPaginationSearch,
  getAllSaleDebtList,
  getAllSaleListPaginationSearch,
} from './SaleApi'

const SALE_CONFIG = {
  Icon: ShoppingBag,
  title: 'Продажа',
  description: 'Оформление продаж, печать чека и контроль долга',
  label: 'Продажа',
  listTitle: 'Список продаж',
  newTitle: 'Новая продажа',
  detailTitle: 'Детали продажи',
  checkoutTitle: 'Оформление продажи',
  tone: 'primary',
  priceField: 'buyPrice',
  limitByStock: true,
  onlyStocked: false,
  autoAddSingle: true,
  printable: true,
  fetchPage: getAllSaleListPaginationSearch,
  fetchProducts: getAllProductPaginationSearch,
  fetchCustomers: getAllCustomersForSale,
  submit: addNewSale,
  addNewPayment,
}

/** Bosh sahifadagi "qarzdor savdolar" bloki. */
function SaleTabForHome() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedSale, setSelectedSale] = useState(null)

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Wallet />
            Продажи с задолженностью
          </>
        }
      >
        <TransactionList
          fetchAll={getAllSaleDebtList}
          label="Продажа"
          icon={ShoppingBag}
          activeTab={activeTab}
          setSelectedSale={setSelectedSale}
          setActiveTab={setActiveTab}
          emptyText="Долгов нет — все продажи оплачены"
        />
      </Tab>

      {activeTab === 'sale_detail' && (
        <Tab
          eventKey="sale_detail"
          title={
            <>
              <Info />
              Детали продажи
            </>
          }
        >
          <TransactionDetail
            selectedSale={selectedSale}
            setActiveTab={setActiveTab}
            addNewPayment={addNewPayment}
            label="Продажа"
            icon={ShoppingBag}
          />
        </Tab>
      )}
    </Tabs>
  )
}

function SaleScreen() {
  return <TransactionWorkspace config={SALE_CONFIG} />
}

export { SaleScreen, SaleTabForHome }
