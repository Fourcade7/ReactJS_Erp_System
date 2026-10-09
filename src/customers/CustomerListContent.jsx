import { useEffect, useState } from 'react'
import { CalendarClock, MoreHorizontal, Pencil, Phone, Save, Trash2, Users } from 'lucide-react'
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
import { ImportExportMenu, ImportModal } from '../utils/ImportExportContent'
import { exportToExcel } from '../utils/ExcelUtils'
import {
  deleteCustomer,
  getAllCustomersPaginationSearch,
  importCustomers,
  updateCustomer,
} from './CustomerApi'
import { t } from '../i18n'

const CUSTOMER_IMPORT_FIELDS = [
  { key: 'username', label: t('Имя'), required: true, aliases: ['имя', 'name', 'firstname', 'ism'] },
  { key: 'surname', label: t('Фамилия'), required: true, aliases: ['фамилия', 'surname', 'lastname', 'familiya'] },
  {
    key: 'phone',
    label: t('Телефон'),
    required: true,
    aliases: ['телефон', 'тел', 'phone', 'номер', 'номер телефона', 'telefon', 'raqam', 'telefon raqami'],
  },
]

const CUSTOMER_EXPORT_COLUMNS = [
  { key: 'username', label: t('Имя') },
  { key: 'surname', label: t('Фамилия') },
  { key: 'phone', label: t('Телефон') },
  {
    key: 'createdAt',
    label: t('Дата регистрации'),
    value: (row) => new Date(row.createdAt).toLocaleString('UZ'),
  },
]

function CustomerListGroup(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState(t('Загрузка...'))
  const [showResAlert, setShowResAlert] = useState(false)

  const [userName, setUserName] = useState('')
  const [surName, setSurname] = useState('')
  const [phone, setPhone] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [uid, setUid] = useState(-1)

  const [customerList, setCustomerList] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [active, setActive] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [showImport, setShowImport] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Har bir belgida soʻrov ketmasligi uchun qidiruv 500 ms kechiktiriladi.
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
        const userListPag = await getAllCustomersPaginationSearch(active, 10, debouncedSearch)
        setPageCount(userListPag.meta.totalPages)
        setCustomerList(userListPag.data)
        setShowLoad(false)
      } catch (error) {
        console.log(error.message)
        setShowLoad(false)
      }
    }

    if (props.activeTab === 'home') loadAllUserPag()
  }, [active, showResAlert, reloadKey, props.activeTab, debouncedSearch])

  const handleImportChunk = (rows) => importCustomers(rows)

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportToExcel({
        fetchRows: async () => {
          const result = await getAllCustomersPaginationSearch(1, 100000, '')
          return result?.data ?? []
        },
        columns: CUSTOMER_EXPORT_COLUMNS,
        fileName: t('Клиенты.xlsx'),
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
          placeholder={t('Поиск по имени, фамилии или телефону...')}
          className="flex-1"
        />
        <ImportExportMenu
          onImport={() => setShowImport(true)}
          onExport={handleExport}
          exporting={exporting}
        />
      </div>

      {customerList.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('Клиенты не найдены')}
          description={t('Измените условия поиска или добавьте нового клиента на соседней вкладке.')}
        />
      ) : (
        <ListGroup as="ol">
          {customerList.map((customer, index) => (
            <ListGroup.Item key={customer.id} as="li">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">
                  {customer.username} {customer.surname}
                </p>
                <p className="text-[11px] text-subtle">ID: {customer.id}</p>
              </div>

              <Badge bg="success" className="hidden sm:inline-flex">
                <Phone />
                {customer.phone}
              </Badge>

              <Badge className="hidden lg:inline-flex">
                <CalendarClock />
                {new Date(customer.createdAt).toLocaleString('UZ')}
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
                      setUid(customer.id)
                      setUserName(customer.username)
                      setSurname(customer.surname)
                      setPhone(customer.phone)
                    }}
                  >
                    <Pencil /> {t('Изменить')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    variant="danger"
                    onClick={() => {
                      setShowDel(true)
                      setUid(customer.id)
                    }}
                  >
                    <Trash2 /> {t('Удалить')}
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
          <Modal.Title>{t('Редактировать клиента')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          <Form.Group controlId="editCustomerName">
            <Form.Label>{t('Имя')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('Введите имя')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editCustomerSurname">
            <Form.Label>{t('Фамилия')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('Введите фамилию')}
              value={surName}
              onChange={(e) => setSurname(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editCustomerPhone">
            <Form.Label>{t('Телефон')}</Form.Label>
            <Form.Control
              type="tel"
              placeholder={t('Введите номер телефона')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await updateCustomer(uid, userName, surName, phone)
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle(t('Клиент успешно обновлён'))
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

              const res = await deleteCustomer(uid)
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
          entityTitle={t('клиенты')}
          fields={CUSTOMER_IMPORT_FIELDS}
          onImportChunk={handleImportChunk}
          onFinished={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  )
}

export { CustomerListGroup }
