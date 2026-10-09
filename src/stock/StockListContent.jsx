import { useEffect, useState } from 'react'
import { Barcode, Boxes, CalendarClock, MoreHorizontal, Pencil, Save, Trash2, Warehouse } from 'lucide-react'
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
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import { deleteStock, getAllStockPaginationSearch, getAllWareHouse, updateStock } from './StockApi'
import { t, td } from '../i18n'

function StockListGroup(props) {
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState(t('Загрузка...'))
  const [showResAlert, setShowResAlert] = useState(false)

  const [showStockAlert, setShowStockAlert] = useState(false)
  const [quantity, setQuantity] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [sid, setSid] = useState(-1)
  const [pid, setPid] = useState(-1)

  const [productList, setProductList] = useState([])
  const [pageCount, setPageCount] = useState(0)

  const [wareHouseList, setWareHouseList] = useState([])
  const [wareHouseId, setWareHouseId] = useState(-1)

  const [active, setActive] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    async function loadAllStockPag() {
      try {
        const productListPag = await getAllStockPaginationSearch(active, 10, debouncedSearch)
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

    if (props.activeTab === 'home') loadAllStockPag()
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
        placeholder={t('Поиск по названию или штрихкоду...')}
      />

      {productList.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={t('Остатки не найдены')}
          description={t('Остатки появятся после оформления прихода товара на склад.')}
        />
      ) : (
        <ListGroup as="ol">
          {productList.map((stock, index) => {
            const low = stock.quantity < 10
            return (
              <ListGroup.Item key={stock.id} as="li">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{stock.product.name}</p>
                  <p className="text-[11px] text-subtle">ID: {stock.id}</p>
                </div>

                <Badge className="hidden font-mono md:inline-flex">
                  <Barcode />
                  {stock.product.barCode}
                </Badge>
                <Badge bg="info" className="hidden sm:inline-flex">
                  <Warehouse />
                  {stock.warehouse.name}
                </Badge>

                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      <p className="font-medium">
                        {stock.user?.username} {stock.user?.surname}
                      </p>
                      <p className="text-subtle">{stock.user?.email}</p>
                    </Tooltip>
                  }
                >
                  <span tabIndex={0}>
                    <Badge bg={low ? 'danger' : 'success'} className="tabular-nums">
                      {stock.quantity} {td(stock.product.unit)}
                    </Badge>
                  </span>
                </OverlayTrigger>

                <Badge className="hidden xl:inline-flex">
                  <CalendarClock />
                  {new Date(stock.date).toLocaleString('UZ')}
                </Badge>

                <Dropdown>
                  <Dropdown.Toggle
                    as="div"
                    className="inline-flex size-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-3 hover:text-fg"
                  >
                    <MoreHorizontal className="size-4" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item
                      disabled={stock.stock && stock.stock.length > 0}
                      onClick={() => {
                        setShowStockAlert(true)
                        setSid(stock.id)
                        setPid(stock.product.id)
                        setWareHouseId(stock.warehouse.id)
                        setQuantity(stock.quantity)
                      }}
                    >
                      <Pencil /> {t('Изменить')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      variant="danger"
                      onClick={() => {
                        setShowDel(true)
                        setSid(stock.id)
                        setPid(stock.product.id)
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
      <Modal show={showStockAlert} onHide={() => setShowStockAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Редактировать остаток')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="editStockQuantity">
            <Form.Label>{t('Остаток')}</Form.Label>
            <Form.Control
              type="number"
              placeholder={t('Введите остаток')}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editStockWarehouse">
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
            variant="warning"
            onClick={async () => {
              setShowResAlert(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await updateStock(sid, pid, wareHouseId, Number(quantity))
              const data = await res.json()
              setShowLoad(false)
              setShowStockAlert(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle(t('Остаток успешно обновлён'))
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

              const res = await deleteStock(sid)
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
    </div>
  )
}

export { StockListGroup }
