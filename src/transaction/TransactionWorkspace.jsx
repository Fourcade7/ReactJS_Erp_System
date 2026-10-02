import { useState } from 'react'
import { Info, ListOrdered, Plus } from 'lucide-react'
import { PageHeader, Tab, Tabs } from '../ui'
import Cart from './Cart'
import Checkout from './Checkout'
import ProductPicker from './ProductPicker'
import TransactionDetail from './TransactionDetail'
import TransactionList from './TransactionList'

/**
 * Savdo, kirim va qaytarish boʻlimlari uchun umumiy ish maydoni:
 * roʻyxat, yangi operatsiya (tovarlar → savat → hisob-kitob) va tafsilotlar.
 * Boʻlimlar orasidagi farq faqat `config` da.
 */
function TransactionWorkspace({ config }) {
  const [orderList, setOrderList] = useState([])
  const [activeTab, setActiveTab] = useState('sale')
  const [selectedSale, setSelectedSale] = useState(null)

  const { Icon } = config

  return (
    <div>
      <PageHeader icon={Icon} title={config.title} description={config.description} />

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
        <Tab
          eventKey="home"
          title={
            <>
              <ListOrdered />
              {config.listTitle}
            </>
          }
        >
          <TransactionList
            fetchPage={config.fetchPage}
            label={config.label}
            icon={Icon}
            activeTab={activeTab}
            setSelectedSale={setSelectedSale}
            setActiveTab={setActiveTab}
          />
        </Tab>

        <Tab
          eventKey="sale"
          title={
            <>
              <Plus />
              {config.newTitle}
            </>
          }
        >
          {/* Tovarlar va savat teng kenglikda — ikkalasida ham nom sigʻishi uchun;
              hisob-kitob savat ostida. */}
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <ProductPicker
              fetchProducts={config.fetchProducts}
              setOrderList={setOrderList}
              priceField={config.priceField}
              onlyStocked={config.onlyStocked}
              autoAddSingle={config.autoAddSingle}
            />
            <div className="flex min-w-0 flex-col gap-4">
              <Cart
                orderList={orderList}
                setOrderList={setOrderList}
                priceField={config.priceField}
                limitByStock={config.limitByStock}
              />
              <Checkout
                orderList={orderList}
                submit={config.submit}
                fetchCustomers={config.fetchCustomers}
                priceField={config.priceField}
                title={config.checkoutTitle}
                tone={config.tone}
                printable={config.printable}
                maxDiscountPercent={config.maxDiscountPercent}
                limitByStock={config.limitByStock}
              />
            </div>
          </div>
        </Tab>

        {activeTab === 'sale_detail' && (
          <Tab
            eventKey="sale_detail"
            title={
              <>
                <Info />
                {config.detailTitle}
              </>
            }
          >
            <TransactionDetail
              selectedSale={selectedSale}
              setActiveTab={setActiveTab}
              addNewPayment={config.addNewPayment}
              label={config.label}
              icon={Icon}
            />
          </Tab>
        )}
      </Tabs>
    </div>
  )
}

export default TransactionWorkspace
