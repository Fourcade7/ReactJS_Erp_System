import { useEffect, useState } from 'react'
import { Info, ShoppingBag, Wallet } from 'lucide-react'
import { Tab, Tabs } from '../ui'
import {
  clearMasterOrderHandoff,
  peekMasterOrderHandoff,
} from '../masterorder/handoff'
import { completeMasterOrder } from '../masterorder/MasterOrderApi'
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
  getSaleDetail,
  returnFromSale,
} from './SaleApi'
import { t } from '../i18n'

const SALE_CONFIG = {
  Icon: ShoppingBag,
  title: t('Продажа'),
  description: t('Оформление продаж, печать чека и контроль долга'),
  label: t('Продажа'),
  listTitle: t('Список продаж'),
  newTitle: t('Новая продажа'),
  detailTitle: t('Детали продажи'),
  checkoutTitle: t('Оформление продажи'),
  tone: 'primary',
  priceField: 'buyPrice',
  limitByStock: true,
  // Savatda narxni shu savdo uchun oʻzgartirish (opt narxdan past emas).
  editablePrice: true,
  maxDiscountPercent: 20,
  onlyStocked: false,
  autoAddSingle: true,
  printable: true,
  fetchPage: getAllSaleListPaginationSearch,
  fetchProducts: getAllProductPaginationSearch,
  fetchCustomers: getAllCustomersForSale,
  submit: addNewSale,
  addNewPayment,
  // Tafsilotda tovarni shu yerning oʻzidan qaytarish uchun.
  fetchDetail: getSaleDetail,
  returnFromSale,
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
            {t('Продажи с задолженностью')}
          </>
        }
      >
        <TransactionList
          fetchAll={getAllSaleDebtList}
          label={t('Продажа')}
          icon={ShoppingBag}
          activeTab={activeTab}
          setSelectedSale={setSelectedSale}
          setActiveTab={setActiveTab}
          emptyText={t('Долгов нет — все продажи оплачены')}
        />
      </Tab>

      {activeTab === 'sale_detail' && (
        <Tab
          eventKey="sale_detail"
          title={
            <>
              <Info />
              {t('Детали продажи')}
            </>
          }
        >
          <TransactionDetail
            selectedSale={selectedSale}
            setActiveTab={setActiveTab}
            addNewPayment={addNewPayment}
            fetchDetail={getSaleDetail}
            returnFromSale={returnFromSale}
            label={t('Продажа')}
            icon={ShoppingBag}
          />
        </Tab>
      )}
    </Tabs>
  )
}

function SaleScreen() {
  // "Заказы мастеров" dan o'tgan zakaz bo'lsa — savat va kontragent tayyor holda ochiladi.
  const [handoff] = useState(peekMasterOrderHandoff)
  useEffect(() => {
    clearMasterOrderHandoff()
  }, [])

  return (
    <TransactionWorkspace
      config={SALE_CONFIG}
      initialOrderList={handoff?.orderList}
      initialCustomer={handoff?.customer}
      // Savdo yozilgach zakaz yakunlanadi va savdoga bog'lanadi.
      onSubmitted={handoff ? (sale) => completeMasterOrder(handoff.orderId, sale.id) : undefined}
    />
  )
}

export { SaleScreen, SaleTabForHome }
