import { useEffect, useRef, useState } from 'react'
import {
  Barcode,
  CalendarClock,
  MoreHorizontal,
  Package,
  PackagePlus,
  Pencil,
  Save,
  Tag,
  Trash2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Dropdown,
  EmptyState,
  Form,
  ListGroup,
  Modal,
  OverlayTrigger,
  SearchField,
  Tooltip,
} from '../ui'
import {
  addStock,
  deleteProduct,
  getAllProductPaginationSearch,
  getAllWareHouse,
  importProducts,
  updateProductWImage,
} from './ProductApi'
import { getAllCategory } from '../category/CategoryApi'
import placeholderImage from '../assets/placeholder.jpg'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import { ImportExportMenu, ImportModal } from '../utils/ImportExportContent'
import { exportToExcel } from '../utils/ExcelUtils'
import { t } from '../i18n'

const money = (v) => `${Number(v || 0).toLocaleString('uz')} So'm`

const PRODUCT_IMPORT_FIELDS = [
  { key: 'name', label: t('Название'), required: true, aliases: ['название', 'наименование', 'name', 'товар', 'nomi', 'nom', 'tovar', 'mahsulot'] },
  { key: 'category', label: t('Категория'), required: true, aliases: ['категория', 'category', 'группа', 'kategoriya', 'guruh'] },
  {
    key: 'buyPrice',
    label: t('Цена продажи'),
    required: true,
    aliases: ['цена', 'розница', 'розничная цена', 'цена продажи', 'продажа', 'price', 'sale price', 'narx', 'chakana', 'chakana narx', 'sotuv narxi', 'sotuv'],
  },
  {
    key: 'price',
    label: t('Цена закупки'),
    required: false,
    aliases: ['закупка', 'закупочная цена', 'цена закупки', 'себестоимость', 'purchase', 'cost', 'xarid', 'xarid narxi', 'tannarx'],
  },
  {
    key: 'bulkPrice',
    label: t('Цена оптом'),
    required: false,
    aliases: ['опт', 'оптом', 'цена оптом', 'оптовая цена', 'bulk', 'wholesale', 'ulgurji', 'ulgurji narx'],
    hint: t('Если не указана — равна цене продажи.'),
  },
  {
    key: 'quantity',
    label: t('Остаток'),
    required: false,
    aliases: ['остаток', 'количество', 'кол-во', 'кол во', 'qty', 'quantity', 'stock', 'qoldiq', 'miqdor', 'soni'],
    hint: t('Записывается на выбранный ниже склад.'),
  },
  {
    key: 'barCode',
    label: t('Штрихкод'),
    required: false,
    aliases: ['штрихкод', 'штрих-код', 'barcode', 'код', 'shtrix-kod', 'shtrixkod', 'kod'],
    hint: t('Если столбец не указан, штрихкод будет сгенерирован автоматически.'),
  },
  {
    key: 'unit',
    label: t('Единица измерения'),
    required: false,
    aliases: ['единица', 'единица измерения', 'ед изм', 'unit', 'birlik', "o'lchov birligi"],
    hint: t('По умолчанию — «Штук».'),
  },
]

const PRODUCT_EXPORT_COLUMNS = [
  { key: 'name', label: t('Название') },
  { key: 'barCode', label: t('Штрихкод') },
  { key: 'category', label: t('Категория'), value: (row) => row.category?.name ?? '' },
  { key: 'buyPrice', label: t('Цена продажи') },
  { key: 'price', label: t('Цена закупки') },
  { key: 'bulkPrice', label: t('Цена оптом') },
  { key: 'unit', label: t('Единица измерения') },
  {
    key: 'stock',
    label: t('Остаток'),
    value: (row) => row.stock?.reduce((sum, s) => sum + s.quantity, 0) ?? 0,
  },
]

function ProductListGroup(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState(t('Загрузка...'))
  const [showResAlert, setShowResAlert] = useState(false)

  const [name, setName] = useState('')
  const [barCode, setBarcode] = useState('')
  const [price, setPrice] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [buyPrice, setBuyPrice] = useState('')

  const [showStockAlert, setShowStockAlert] = useState(false)
  const [quantity, setQuantity] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // `props.categoryId` berilsa (Категория boʻlimidan) roʻyxat shu kategoriyaga
  // qotiriladi: filtr va import/eksport menyusi koʻrsatilmaydi.
  const fixedCategory = Boolean(props.categoryId)
  const [categoryList, setCategoryList] = useState([])
  const [categoryId, setCategoryId] = useState(props.categoryId ?? '')

  const fileInputRef = useRef(null)
  const [pid, setPid] = useState(-1)

  const [productList, setProductList] = useState([])
  const [pageCount, setPageCount] = useState(0)

  const [wareHouseList, setWareHouseList] = useState([])
  const [wareHouseId, setWareHouseId] = useState(-1)

  const [active, setActive] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [showImport, setShowImport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [createMissingCategories, setCreateMissingCategories] = useState(true)
  const [importWarehouseId, setImportWarehouseId] = useState('')

  const isUser = localStorage.getItem('role') === 'User'

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    async function loadAllProductPag() {
      try {
        const productListPag = await getAllProductPaginationSearch(
          active,
          10,
          debouncedSearch,
          categoryId,
        )
        const wareHouseListResult = await getAllWareHouse()
        setWareHouseList(wareHouseListResult)
        setPageCount(productListPag.meta.totalPages)
        setProductList(productListPag.data)
        setShowLoad(false)
      } catch (error) {
        console.log(error.message)
        setShowLoad(false)
      }
    }

    if (props.activeTab === 'home') loadAllProductPag()
  }, [active, showResAlert, reloadKey, props.activeTab, debouncedSearch, categoryId])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategory()
        if (res.ok) setCategoryList(await res.json())
      } catch (error) {
        console.log(error.message)
      }
    }
    if (props.activeTab === 'home' && !fixedCategory) loadCategories()
  }, [props.activeTab, reloadKey, fixedCategory])

  const handleImportChunk = (rows) =>
    importProducts(rows, createMissingCategories, importWarehouseId ? Number(importWarehouseId) : undefined)

  const openImport = () => {
    // Omborsiz mahsulotni sotib ham, kirim qilib ham boʻlmaydi — shuning uchun birinchi ombor standart.
    setImportWarehouseId(wareHouseList?.[0]?.id ? String(wareHouseList[0].id) : '')
    setShowImport(true)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportToExcel({
        fetchRows: async () => {
          const result = await getAllProductPaginationSearch(1, 100000, '')
          return result?.data ?? []
        },
        columns: PRODUCT_EXPORT_COLUMNS,
        fileName: t('Продукты.xlsx'),
      })
    } catch (error) {
      console.log(error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchField
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setActive(1)
          }}
          onClear={() => setSearchTerm('')}
          placeholder={t('Поиск по названию или штрихкоду...')}
          className="flex-1"
        />
        {!fixedCategory && (
          <>
            <div className="w-48 shrink-0">
              <Form.Select
                aria-label={t('Категория')}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setActive(1)
                }}
              >
                <option value="">{t('Все категории')}</option>
                {categoryList.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </div>
            <ImportExportMenu
              onImport={openImport}
              onExport={handleExport}
              exporting={exporting}
            />
          </>
        )}
      </div>

      {productList.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('Продукты не найдены')}
          description={t('Измените условия поиска или добавьте новый продукт.')}
        />
      ) : (
        <ListGroup as="ol">
          {productList.map((product, index) => {
            const totalStock = product.stock?.reduce((sum, s) => sum + s.quantity, 0)
            const isNew = product.stock?.[0]?.quantity === undefined
            const image = product.imgUrl ? product.imgUrl : placeholderImage

            return (
              <ListGroup.Item key={product.id} as="li">
                <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle sm:inline-flex">
                  {index + 1}
                </span>

                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip className="p-1">
                      <img
                        src={image}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="size-[200px] rounded-lg object-cover"
                      />
                    </Tooltip>
                  }
                >
                  <img
                    src={image}
                    alt=""
                    width={36}
                    height={36}
                    tabIndex={0}
                    className="size-9 shrink-0 rounded-lg border border-line object-cover"
                  />
                </OverlayTrigger>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{product.name}</p>
                  <p className="flex items-center gap-1 truncate font-mono text-[11px] text-subtle">
                    <Barcode className="size-3" />
                    {product.barCode}
                  </p>
                </div>

                <Badge bg="primary" className="hidden lg:inline-flex">
                  <Tag />
                  {product.category.name}
                </Badge>

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums">
                        <span className="text-subtle">{t('Закупка')}</span>
                        <span className="text-right font-medium">{money(product.price)}</span>
                        <span className="text-subtle">{t('Оптом')}</span>
                        <span className="text-right font-medium">{money(product.bulkPrice)}</span>
                      </div>
                    </Tooltip>
                  }
                >
                  <span
                    tabIndex={0}
                    className="hidden text-[13px] font-semibold tabular-nums text-fg sm:inline"
                  >
                    {money(product.buyPrice)}
                  </span>
                </OverlayTrigger>

                <Badge bg={isNew ? 'warning' : 'success'} className="tabular-nums">
                  {isNew ? t('Новый') : totalStock}
                </Badge>

                <Badge className="hidden xl:inline-flex">
                  <CalendarClock />
                  {new Date(product.date).toLocaleString('UZ')}
                </Badge>

                <Dropdown>
                  <Dropdown.Toggle
                    as="div"
                    className="inline-flex size-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-3 hover:text-fg"
                  >
                    <MoreHorizontal className="size-4" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="min-w-56">
                    <Dropdown.Item
                      disabled={(product.stock && product.stock.length > 0) || isUser}
                      onClick={() => {
                        setShowStockAlert(true)
                        setPid(product.id)
                      }}
                    >
                      <PackagePlus /> {t('Добавить начальный остаток')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      disabled={isUser}
                      onClick={() => {
                        setShowEdit(true)
                        setPid(product.id)
                        setName(product.name)
                        setBarcode(product.barCode)
                        setPrice(product.price)
                        setBulkPrice(product.bulkPrice)
                        setBuyPrice(product.buyPrice)
                      }}
                    >
                      <Pencil /> {t('Изменить')}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      variant="danger"
                      disabled={isUser}
                      onClick={() => {
                        setShowDel(true)
                        setPid(product.id)
                      }}
                    >
                      <Trash2 /> {t('Удалить')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}

      <div className="flex justify-center pt-1">
        <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
      </div>

      {/* Изменить */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Редактировать продукт')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="editProductName">
            <Form.Label>{t('Название')}</Form.Label>
            <Form.Control
              placeholder={t('Введите имя')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editProductBarcode">
            <Form.Label>{t('Штрихкод')}</Form.Label>
            <Form.Control
              className="font-mono"
              placeholder={t('Введите штрихкод')}
              value={barCode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </Form.Group>
          <div className="grid gap-3 sm:grid-cols-3">
            <Form.Group controlId="editProductPrice">
              <Form.Label>{t('Закупка')}</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editProductBulk">
              <Form.Label>{t('Оптом')}</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editProductBuy">
              <Form.Label>{t('Продажа')}</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </Form.Group>
          </div>
          <Form.Group controlId="editProductImage">
            <Form.Label>{t('Изображение')}</Form.Label>
            <Form.Control type="file" accept="image/*" ref={fileInputRef} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
            {t('Отмена')}
          </Button>
          <Button
            variant="warning"
            onClick={async () => {
              setShowResAlert(false)
              const file = fileInputRef.current?.files?.[0]
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await updateProductWImage(
                pid,
                name,
                barCode,
                Number(price),
                Number(bulkPrice),
                Number(buyPrice),
                file,
              )
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle(t('Продукт успешно обновлён'))
              }
              setShowRes(true)
            }}
          >
            <Save />
            {t('Сохранить')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Начальный остаток */}
      <Modal show={showStockAlert} onHide={() => setShowStockAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Добавить начальный остаток')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="initialStockQuantity">
            <Form.Label>{t('Остаток')}</Form.Label>
            <Form.Control
              type="number"
              placeholder={t('Введите остаток')}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="initialStockWarehouse">
            <Form.Label>{t('Склад')}</Form.Label>
            <Form.Select
              value={wareHouseId}
              onChange={(e) => setWareHouseId(Number(e.target.value))}
            >
              <option value={-1} disabled>
                {t('Выберите склад')}
              </option>
              {wareHouseList?.map((wareHouse) => (
                <option key={wareHouse.id} value={wareHouse.id}>
                  {wareHouse.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowStockAlert(false)}>
            {t('Отмена')}
          </Button>
          <Button
            onClick={async () => {
              setShowResAlert(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await addStock(
                pid,
                wareHouseId,
                Number(localStorage.getItem('userid')),
                Number(quantity),
              )
              const data = await res.json()
              setShowLoad(false)
              setShowStockAlert(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle(t('Остаток успешно добавлен'))
              }

              setShowRes(true)
              const timer = setTimeout(() => setShowRes(false), 1000)
              return () => clearTimeout(timer)
            }}
          >
            <Save />
            {t('Сохранить')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Удалить */}
      <Modal show={showDel} onHide={() => setShowDel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Удалить')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('Вы уверены, что хотите его удалить?')}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDel(false)}>
            {t('Отмена')}
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              setShowResAlert(false)
              setShowLoadTitle(t('Загрузка...'))
              setShowDel(false)
              setShowLoad(true)

              const res = await deleteProduct(pid)
              const deleteResponse = await res.json()
              setShowResAlert(res.ok)

              setTimeout(() => setShowLoadTitle(t('Почти готово')), 1000)
              setTimeout(() => {
                setShowLoad(false)
                setShowResTitle(deleteResponse.message)
                setShowRes(true)
              }, 2000)
            }}
          >
            <Trash2 />
            {t('Удалить')}
          </Button>
        </Modal.Footer>
      </Modal>

      <LoadingModal show={showLoad} onHide={() => setShowLoad(false)} title={showLoadTitle} />
      <ResultModal
        show={showRes}
        onHide={() => setShowRes(false)}
        success={showResAlert}
        message={showResTitle}
      />

      {showImport && (
        <ImportModal
          onHide={() => setShowImport(false)}
          entityTitle={t('продукты')}
          fields={PRODUCT_IMPORT_FIELDS}
          options={
            <div className="flex flex-col gap-3">
              <Form.Check
                type="switch"
                id="importCreateCategories"
                label={t('Создавать отсутствующие категории')}
                checked={createMissingCategories}
                onChange={(e) => setCreateMissingCategories(e.target.checked)}
              />
              <Form.Group controlId="importWarehouse">
                <Form.Label>{t('Склад для остатков')}</Form.Label>
                <Form.Select
                  value={importWarehouseId}
                  onChange={(e) => setImportWarehouseId(e.target.value)}
                >
                  <option value="">{t('— не привязывать к складу —')}</option>
                  {(wareHouseList ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text>
                  {importWarehouseId
                    ? t('Товары сразу появятся в «Продаже» и «Приходе».')
                    : t('Без склада товары нельзя продать или оприходовать, пока не добавите их на склад.')}
                </Form.Text>
              </Form.Group>
            </div>
          }
          onImportChunk={handleImportChunk}
          onFinished={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  )
}

export { ProductListGroup }
