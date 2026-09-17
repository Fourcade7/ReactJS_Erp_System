import { useEffect, useState } from 'react'
import { CalendarClock, MoreHorizontal, Package, Plus, Save, Tags } from 'lucide-react'
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
import { addCategory, deleteCategory, getAllCategory, updateCategory } from './CategoryApi'

function CategoryList(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState('Загрузка...')
  const [showResTypeAlert, setShowResTypeAlert] = useState(false)

  const [cid, setCid] = useState(-1)
  const [cName, setCname] = useState('')

  const [categoryList, setCategoryList] = useState([])

  const isUser = localStorage.getItem('role') === 'User'

  useEffect(() => {
    const handleCategory = async () => {
      try {
        const res = await getAllCategory()

        if (!res.ok) {
          console.log(res)
        } else {
          setCategoryList(await res.json())
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    handleCategory()
  }, [props.activeTab, showResTypeAlert])

  return (
    <div>
      {categoryList.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Категорий пока нет"
          description="Добавьте первую категорию на соседней вкладке, чтобы начать раскладывать товары по группам."
        />
      ) : (
        <ListGroup as="ol">
          {categoryList.map((category) => (
            <ListGroup.Item key={category.id} as="li">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                {category.id}
              </span>

              <span className="min-w-0 flex-1 truncate font-medium text-fg">
                {category.name}
              </span>

              <Badge bg="primary" className="hidden sm:inline-flex">
                <Package />
                {category.products.length}
              </Badge>

              <Badge className="hidden md:inline-flex">
                <CalendarClock />
                {new Date(category.date).toLocaleString('uz')}
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
                    disabled={isUser}
                    onClick={() => {
                      setShowEdit(true)
                      setCid(category.id)
                      setCname(category.name)
                    }}
                  >
                    Изменить
                  </Dropdown.Item>
                  <Dropdown.Item
                    variant="danger"
                    disabled={isUser}
                    onClick={() => {
                      setShowDel(true)
                      setCid(category.id)
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
        <Modal.Body>
          <Form.Group controlId="editCategoryName">
            <Form.Label>Название категории</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите имя"
              value={cName}
              onChange={(e) => setCname(e.target.value)}
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

              const res = await updateCategory(cid, cName)
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResTypeAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResTypeAlert(true)
                setShowResTitle('Категория успешно обновлена')
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

              const res = await deleteCategory(cid)
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

function CategoryAdd(props) {
  const [wname, setWname] = useState('')

  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCategory = async (name) => {
    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await addCategory(name, "")
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
          handleCategory(wname)
        }}
        className="flex flex-col gap-3"
      >
        <Form.Group controlId="newCategoryName">
          <Form.Label>Название категории</Form.Label>
          <Form.Control
            type="text"
            value={wname}
            onChange={(e) => setWname(e.target.value)}
            placeholder="Введите имя"
          />
          <Form.Text>Например: «Напитки», «Бытовая химия», «Канцелярия».</Form.Text>
        </Form.Group>

        <Button type="submit" loading={pshow} block>
          {!pshow && <Save />}
          Сохранить
        </Button>
      </Form>
    </div>
  )
}

function CategoryTab() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Tags />
            Список категорий
          </>
        }
      >
        <CategoryList activeTab={activeTab} />
      </Tab>

      <Tab
        eventKey="profile"
        disabled={localStorage.getItem('role') === 'User'}
        title={
          <>
            <Plus />
            Добавить новую категорию
          </>
        }
      >
        <CategoryAdd tabChange={(tname) => setActiveTab(tname)} />
      </Tab>
    </Tabs>
  )
}

function CategoryScreen() {
  return (
    <div>
      <PageHeader
        icon={Tags}
        title="Категория"
        description="Группы товаров, по которым строится номенклатура"
      />
      <CategoryTab />
    </div>
  )
}

export default CategoryScreen
