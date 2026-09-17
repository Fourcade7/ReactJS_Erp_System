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
  updateProductWImage,
} from './ProductApi'
import placeholderImage from '../assets/placeholder.jpg'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'

const money = (v) => `${Number(v || 0).toLocaleString('uz')} So'm`

function ProductListGroup(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState('Загрузка...')
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

  const fileInputRef = useRef(null)
  const [pid, setPid] = useState(-1)

  const [productList, setProductList] = useState([])
  const [pageCount, setPageCount] = useState(0)

  const [wareHouseList, setWareHouseList] = useState([])
  const [wareHouseId, setWareHouseId] = useState(-1)

  const [active, setActive] = useState(1)

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
        const productListPag = await getAllProductPaginationSearch(active, 10, debouncedSearch)
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
  }, [active, showResAlert, props.activeTab, debouncedSearch])

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setActive(1)
        }}
        onClear={() => setSearchTerm('')}
        placeholder="Поиск по названию или штрихкоду..."
      />

      {productList.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Продукты не найдены"
          description="Измените условия поиска или добавьте новый продукт."
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
                        <span className="text-subtle">Цена</span>
                        <span className="text-right font-medium">{money(product.price)}</span>
                        <span className="text-subtle">Оптом</span>
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
                  {isNew ? 'Новый' : totalStock}
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
                      <PackagePlus /> Добавить начальный остаток
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
                      <Pencil /> Изменить
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
                      <Trash2 /> Удалить
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
          <Modal.Title>Редактировать продукт</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="editProductName">
            <Form.Label>Название</Form.Label>
            <Form.Control
              placeholder="Введите имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editProductBarcode">
            <Form.Label>Штрихкод</Form.Label>
            <Form.Control
              className="font-mono"
              placeholder="Введите штрихкод"
              value={barCode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </Form.Group>
          <div className="grid gap-3 sm:grid-cols-3">
            <Form.Group controlId="editProductPrice">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editProductBulk">
              <Form.Label>Оптом</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editProductBuy">
              <Form.Label>Закупка</Form.Label>
              <Form.Control
                inputMode="decimal"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </Form.Group>
          </div>
          <Form.Group controlId="editProductImage">
            <Form.Label>Изображение</Form.Label>
            <Form.Control type="file" accept="image/*" ref={fileInputRef} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
            Отмена
          </Button>
          <Button
            variant="warning"
            onClick={async () => {
              setShowResAlert(false)
              const file = fileInputRef.current?.files?.[0]
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle('Загрузка...')

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
                setShowResTitle('Продукт успешно обновлён')
              }
              setShowRes(true)
            }}
          >
            <Save />
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Начальный остаток */}
      <Modal show={showStockAlert} onHide={() => setShowStockAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Добавить начальный остаток</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="initialStockQuantity">
            <Form.Label>Остаток</Form.Label>
            <Form.Control
              type="number"
              placeholder="Введите остаток"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="initialStockWarehouse">
            <Form.Label>Склад</Form.Label>
            <Form.Select
              value={wareHouseId}
              onChange={(e) => setWareHouseId(Number(e.target.value))}
            >
              <option value={-1} disabled>
                Выберите склад
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
            Отмена
          </Button>
          <Button
            onClick={async () => {
              setShowResAlert(false)
              setShowLoad(true)
              setShowLoadTitle('Загрузка...')

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
                setShowResTitle('Остаток успешно добавлен')
              }

              setShowRes(true)
              const timer = setTimeout(() => setShowRes(false), 1000)
              return () => clearTimeout(timer)
            }}
          >
            <Save />
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Удалить */}
      <Modal show={showDel} onHide={() => setShowDel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удалить</Modal.Title>
        </Modal.Header>
        <Modal.Body>Вы уверены, что хотите его удалить?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDel(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              setShowResAlert(false)
              setShowLoadTitle('Загрузка...')
              setShowDel(false)
              setShowLoad(true)

              const res = await deleteProduct(pid)
              const deleteResponse = await res.json()
              setShowResAlert(res.ok)

              setTimeout(() => setShowLoadTitle('Почти готово'), 1000)
              setTimeout(() => {
                setShowLoad(false)
                setShowResTitle(deleteResponse.message)
                setShowRes(true)
              }, 2000)
            }}
          >
            <Trash2 />
            Удалить
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
    </div>
  )
}

export { ProductListGroup }
