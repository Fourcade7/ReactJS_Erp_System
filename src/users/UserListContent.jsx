import { useEffect, useState } from 'react'
import {
  CalendarClock,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import {
  Badge,
  Button,
  Dropdown,
  EmptyState,
  Form,
  ListGroup,
  Modal,
  SearchField,
} from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import { deleteUser, getAllUsersPaginationSearch, updateUser } from './UserApi'
import { roleOptions } from './roles'

function UserListGroup(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState('Загрузка...')
  const [showResAlert, setShowResAlert] = useState(false)

  const [userName, setUserName] = useState('')
  const [surName, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [uid, setUid] = useState(-1)

  const [userList, setUserList] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [active, setActive] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    async function loadAllUserPag() {
      try {
        const userListPag = await getAllUsersPaginationSearch(active, 10, debouncedSearch)
        setPageCount(userListPag.meta.totalPages)
        setUserList(userListPag.data)
        setShowLoad(false)
      } catch (error) {
        console.log(error.message)
        setShowLoad(false)
      }
    }

    if (props.activeTab === 'home') loadAllUserPag()
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
        placeholder="Поиск сотрудника..."
      />

      {userList.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Сотрудники не найдены"
          description="Измените условия поиска или добавьте сотрудника на соседней вкладке."
        />
      ) : (
        <ListGroup as="ol">
          {userList.map((user, index) => (
            <ListGroup.Item key={user.id} as="li">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">
                  {user.username} {user.surname}
                </p>
                <p className="truncate text-[11px] text-subtle">ID: {user.id}</p>
              </div>

              <Badge bg="success" className="hidden md:inline-flex">
                <Phone />
                {user.phone}
              </Badge>
              <Badge bg="warning" className="hidden lg:inline-flex">
                <Mail />
                {user.email}
              </Badge>
              <Badge bg={user.role === 'Admin' ? 'primary' : 'neutral'}>
                <ShieldCheck />
                {user.role}
              </Badge>
              <Badge className="hidden xl:inline-flex">
                <CalendarClock />
                {new Date(user.createdAt).toLocaleString('UZ')}
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
                      setUid(user.id)
                      setUserName(user.username)
                      setSurname(user.surname)
                      setPhone(user.phone)
                      setEmail(user.email)
                      setRole(user.role)
                    }}
                  >
                    <Pencil /> Изменить
                  </Dropdown.Item>
                  <Dropdown.Item
                    variant="danger"
                    onClick={() => {
                      setShowDel(true)
                      setUid(user.id)
                    }}
                  >
                    <Trash2 /> Удалить
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <div className="flex justify-center pt-1">
        <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
      </div>

      {/* Изменить */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать сотрудника</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Group controlId="editUserName">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                placeholder="Введите имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editUserSurname">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                placeholder="Введите фамилию"
                value={surName}
                onChange={(e) => setSurname(e.target.value)}
              />
            </Form.Group>
          </div>
          <Form.Group controlId="editUserPhone">
            <Form.Label>Телефон</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Введите номер телефона"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editUserEmail">
            <Form.Label>Электронная почта</Form.Label>
            <Form.Control
              type="email"
              placeholder="Введите адрес электронной почты"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Group controlId="editUserRole">
              <Form.Label>Роль</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="" disabled>
                  Выберите роль
                </option>
                {roleOptions(role).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="editUserPassword">
              <Form.Label>Новый пароль</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
            Отмена
          </Button>
          <Button
            variant="warning"
            onClick={async () => {
              setShowResAlert(false)
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle('Загрузка...')

              const res = await updateUser(uid, userName, surName, phone, email, role, password)
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle('Сотрудник успешно обновлён')
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

              const res = await deleteUser(uid)
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

export { UserListGroup }
