import { useEffect, useState } from 'react'
import { CalendarClock, MoreHorizontal, Plus, Ruler, Save, Warehouse } from 'lucide-react'
import {
  Badge,
  Button,
  Collapse,
  Dropdown,
  EmptyState,
  Form,
  ListGroup,
  Modal,
  PageHeader,
  Tab,
  Tabs,
} from '../ui'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import {
  addWareHouse,
  deleteWareHouse,
  getAllWareHouse,
  updateWareHouse,
} from './WareHouseApi'

function WarehouseListGroup(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState('Загрузка...')
  const [showResTypeAlert, setShowResTypeAlert] = useState(false)

  const [wid, setWid] = useState(-1)
  const [wName, setWname] = useState('')
  const [weight, setWeight] = useState('')

  const [wList, setWlist] = useState([])

  useEffect(() => {
    const handleWareHouse = async () => {
      try {
        const res = await getAllWareHouse()

        if (!res.ok) {
          console.log(res)
        } else {
          setWlist(await res.json())
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    handleWareHouse()
  }, [props.activeTab, showResTypeAlert])

  return (
    <div>
      {wList.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="Складов пока нет"
          description="Создайте склад, чтобы распределять по нему остатки товаров."
        />
      ) : (
        <ListGroup as="ol">
          {wList.map((whouse) => (
            <ListGroup.Item key={whouse.id} as="li">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                {whouse.id}
              </span>

              <span className="min-w-0 flex-1 truncate font-medium text-fg">
                {whouse.name}
              </span>

              <Badge bg="info" className="hidden sm:inline-flex">
                <Ruler />
                {whouse.weight}
              </Badge>

              <Badge className="hidden md:inline-flex">
                <CalendarClock />
                {new Date(whouse.date).toLocaleString('uz')}
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
                    onClick={() => {
                      setShowEdit(true)
                      setWid(whouse.id)
                      setWname(whouse.name)
                      setWeight(whouse.weight)
                    }}
                  >
                    Изменить
                  </Dropdown.Item>
                  <Dropdown.Item
                    variant="danger"
                    onClick={() => {
                      setShowDel(true)
                      setWid(whouse.id)
                    }}
                  >
                    Удалить
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Изменить */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="editWarehouseName">
            <Form.Label>Название склада</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите имя"
              value={wName}
              onChange={(e) => setWname(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editWarehouseWeight">
            <Form.Label>Объём</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите объём"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
            Отмена
          </Button>
          <Button
            variant="warning"
            onClick={async () => {
              setShowResTypeAlert(false)
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle('Загрузка...')

              const res = await updateWareHouse(wid, wName, weight)
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResTypeAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResTypeAlert(true)
                setShowResTitle('Склад успешно обновлён')
              }

              setShowRes(true)
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
              setShowResTypeAlert(false)
              setShowLoadTitle('Загрузка...')
              setShowDel(false)
              setShowLoad(true)

              const res = await deleteWareHouse(wid)
              const deleteResponse = await res.json()

              setShowResTypeAlert(res.ok)

              setTimeout(() => setShowLoadTitle('Почти готово'), 1000)
              setTimeout(() => {
                setShowLoad(false)
                setShowResTitle(deleteResponse.message)
                setShowRes(true)
              }, 2000)
            }}
          >
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <LoadingModal show={showLoad} onHide={() => setShowLoad(false)} title={showLoadTitle} />

      <ResultModal
        show={showRes}
        onHide={() => setShowRes(false)}
        success={showResTypeAlert}
        message={showResTitle}
      />
    </div>
  )
}

function WareHouseAdd(props) {
  const [wname, setWname] = useState('')
  const [weight, setWeight] = useState('')

  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleWareHouse = async (name, volume) => {
    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await addWareHouse(name, volume)
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
      } else {
        setShowSuccess(true)
        psetShow(false)
        setAlertMessage('Успешно...')
        const timer = setTimeout(() => props.tabChange('home'), 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setShowDanger(true)
      setAlertMessage('Не удалось подключиться к серверу')
      psetShow(false)
    }
  }

  return (
    <div className="max-w-md">
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
          handleWareHouse(wname, weight)
        }}
        className="flex flex-col gap-3"
      >
        <Form.Group controlId="newWarehouseName">
          <Form.Label>Название склада</Form.Label>
          <Form.Control
            type="text"
            value={wname}
            onChange={(e) => setWname(e.target.value)}
            placeholder="Введите имя"
          />
        </Form.Group>

        <Form.Group controlId="newWarehouseWeight">
          <Form.Label>Объём</Form.Label>
          <Form.Control
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Введите объём"
          />
        </Form.Group>

        <Button type="submit" loading={pshow} block>
          {!pshow && <Save />}
          Сохранить
        </Button>
      </Form>
    </div>
  )
}

function WareHouseTab() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Warehouse />
            Список складов
          </>
        }
      >
        <WarehouseListGroup activeTab={activeTab} />
      </Tab>

      <Tab
        eventKey="profile"
        title={
          <>
            <Plus />
            Добавить новый склад
          </>
        }
      >
        <WareHouseAdd tabChange={(tname) => setActiveTab(tname)} />
      </Tab>
    </Tabs>
  )
}

function WareHouseScreen() {
  return (
    <div>
      <PageHeader
        icon={Warehouse}
        title="Склад"
        description="Места хранения, по которым распределяются остатки"
      />
      <WareHouseTab />
    </div>
  )
}

export default WareHouseScreen
