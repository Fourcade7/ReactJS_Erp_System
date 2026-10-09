import { useEffect, useRef, useState } from 'react'
import { ListOrdered, Package, PackagePlus, Save } from 'lucide-react'
import { Button, Collapse, Form, PageHeader, Tab, Tabs } from '../ui'
import { getAllCategory } from '../category/CategoryApi'
import { addProduct } from './ProductApi'
import { ProductListGroup } from './ProductListContent'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { t } from '../i18n'

function ProductAdd(props) {
  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const [name, setName] = useState('')
  const [barCode, setBarcode] = useState('')
  const [price, setPrice] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [buyPrice, setBuyerPrice] = useState('')
  const [categoryId, setCategoryId] = useState(-1)
  const [categoryList, setCategoryList] = useState([])
  const nameRef = useRef(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategory()
        if (!res.ok) console.log(res)
        else setCategoryList(await res.json())
      } catch (error) {
        console.log(error.message)
      }
    }
    loadCategories()
  }, [props.activeTab])

  const handleProduct = async () => {
    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await addProduct(
        name,
        barCode,
        Number(price),
        Number(bulkPrice),
        Number(buyPrice),
        categoryId,
      )
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
      } else {
        setShowSuccess(true)
        psetShow(false)
        setAlertMessage(t('Успешно...'))

        // Keyingi mahsulotni darhol kiritish uchun. Kategoriya saqlanadi —
        // odatda bir guruh tovarlari ketma-ket kiritiladi.
        setName('')
        setBarcode('')
        setPrice('')
        setBulkPrice('')
        setBuyerPrice('')
        nameRef.current?.focus()
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

      <Form
        onSubmit={(e) => {
          e.preventDefault()
          handleProduct()
        }}
        className="flex flex-col gap-3"
      >
        <Form.Group controlId="productName">
          <Form.Label>{t('Название')}</Form.Label>
          <Form.Control
            ref={nameRef}
            placeholder={t('Введите имя')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="productCategory">
          <Form.Label>{t('Категория')}</Form.Label>
          <Form.Select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option value={-1} disabled>
              {t('Выберите категорию')}
            </option>
            {categoryList?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="grid gap-3 sm:grid-cols-3">
          <Form.Group controlId="productPrice">
            <Form.Label>{t('Цена закупки')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="productBulkPrice">
            <Form.Label>{t('Цена оптом')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              placeholder="0"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="productBuyPrice">
            <Form.Label>{t('Цена продажи')}</Form.Label>
            <Form.Control
              inputMode="decimal"
              placeholder="0"
              value={buyPrice}
              onChange={(e) => setBuyerPrice(e.target.value)}
            />
          </Form.Group>
        </div>

        <Form.Group controlId="productBarcode">
          <Form.Label>{t('Штрихкод (необязательно)')}</Form.Label>
          <Form.Control
            className="font-mono"
            placeholder={t('Введите или отсканируйте штрихкод')}
            value={barCode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" loading={pshow} block className="mt-1">
          {!pshow && <Save />}
          {t('Сохранить')}
        </Button>
      </Form>
    </div>
  )
}

function ProductTab() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <ListOrdered />
            {t('Список продуктов')}
          </>
        }
      >
        <ProductListGroup activeTab={activeTab} />
      </Tab>
      <Tab
        eventKey="add_new"
        disabled={localStorage.getItem('role') === 'User'}
        title={
          <>
            <PackagePlus />
            {t('Добавить новый продукт')}
          </>
        }
      >
        <ProductAdd activeTab={activeTab} tabChange={(tabName) => setActiveTab(tabName)} />
      </Tab>
    </Tabs>
  )
}

function ProductScreen() {
  return (
    <div>
      <PageHeader
        icon={Package}
        title={t('Продукты')}
        description={t('Номенклатура товаров, цены и штрихкоды')}
      />
      <ProductTab />
    </div>
  )
}

export default ProductScreen
