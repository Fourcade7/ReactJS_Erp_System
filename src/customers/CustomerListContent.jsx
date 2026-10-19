import { useEffect, useState } from 'react'
import { Building2, CalendarClock, MoreHorizontal, Pencil, Phone, Save, Trash2, Users, Wallet } from 'lucide-react'
import { cn } from '../lib/cn'
import {
  Badge,
  Button,
  Dropdown,
  EmptyState,
  ListGroup,
  Modal,
  SearchField,
} from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import { CustomerProfile } from './CustomerProfile'
import { ImportExportMenu, ImportModal } from '../utils/ImportExportContent'
import { exportToExcel } from '../utils/ExcelUtils'
import {
  deleteCustomer,
  getAllCustomersPaginationSearch,
  importCustomers,
  updateCustomerData,
} from './CustomerApi'
import { CustomerFields } from './CustomerFields'
import { customerPayload, customerToForm, isOrganization, validateCustomer } from './customerForm'
import { useMenuAccess } from '../main/menuAccess'
import { NAV_ITEMS, SALES_TAB, isVisible, roleKey } from '../main/menuItems'
import { setSaleHandoff } from '../sale/saleHandoff'
import { t } from '../i18n'

/** Ro'yxat filtri: odamlar va tashkilotlar aralash turadi, kerak bo'lsa ajratib olinadi. */
const TYPE_FILTERS = [
  { key: '', label: t('Все') },
  { key: 'user', label: t('Люди') },
  { key: 'organization', label: t('Организации') },
]

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
  { key: 'type', label: t('Тип'), value: (row) => (isOrganization(row) ? t('Организация') : t('Человек')) },
  { key: 'inn', label: t('ИНН') },
  { key: 'debt', label: t('Долг'), value: (row) => row.debt ?? 0 },
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

  // Tahrirlash formasi (odam yoki tashkilot maydonlari) va tekshiruv natijasi.
  const [editForm, setEditForm] = useState(() => customerToForm({}))
  const [editInvalid, setEditInvalid] = useState({})
  const [typeFilter, setTypeFilter] = useState('')
  // Faqat qarzi borlar (tur filtri bilan birga ishlaydi: masalan, qarzdor tashkilotlar).
  const [debtOnly, setDebtOnly] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [uid, setUid] = useState(-1)

  // Ro'yxatdagi kontragentni bossak — uning kartochkasi (operatsiyalar, summalar) ochiladi.
  const [profileId, setProfileId] = useState(null)
  const [profileVersion, setProfileVersion] = useState(0)

  const [customerList, setCustomerList] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [active, setActive] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [showImport, setShowImport] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Kartochkadagi "Продажа #id" — "Продажа" bo'limida shu savdoning tafsilotini ochadi (bo'lim shu rolga ochiq bo'lsa).
  const { overrides } = useMenuAccess({ load: false })
  const salesItem = NAV_ITEMS.find((item) => item.key === SALES_TAB)
  const openSale =
    props.goTo && isVisible(roleKey(localStorage.getItem('role')), salesItem, overrides)
      ? (saleId) => {
          setSaleHandoff(saleId)
          props.goTo(salesItem.key)
        }
      : undefined

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
        const userListPag = await getAllCustomersPaginationSearch(active, 10, debouncedSearch, typeFilter, debtOnly)
        setPageCount(userListPag.meta.totalPages)
        setCustomerList(userListPag.data)
        setShowLoad(false)
      } catch (error) {
        console.log(error.message)
        setShowLoad(false)
      }
    }

    if (props.activeTab === 'home') loadAllUserPag()
  }, [active, showResAlert, reloadKey, props.activeTab, debouncedSearch, typeFilter, debtOnly])

  const handleImportChunk = (rows) => importCustomers(rows)

  const openEdit = (customer) => {
    setUid(customer.id)
    setEditForm(customerToForm(customer))
    setEditInvalid({})
    setShowEdit(true)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportToExcel({
        fetchRows: async () => {
          // Eksport ekrandagi filtrlarga mos: "Должники" yoqilgan bo'lsa — faqat qarzdorlar.
          const result = await getAllCustomersPaginationSearch(1, 100000, '', typeFilter, debtOnly)
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
      {profileId !== null ? (
        // Kontragent kartochkasi ro'yxat o'rniga ochiladi; tahrirlash/o'chirish oynalari pastda doim turadi.
        <CustomerProfile
          customerId={profileId}
          version={profileVersion}
          onBack={() => setProfileId(null)}
          onEdit={openEdit}
          onOpenSale={openSale}
        />
      ) : (
        <>
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

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label={t('Тип клиента')} className="inline-flex w-fit rounded-lg border border-line bg-surface-2 p-0.5">
              {TYPE_FILTERS.map((option) => (
                <button
                  key={option.key || 'all'}
                  type="button"
                  aria-pressed={typeFilter === option.key}
                  onClick={() => {
                    setTypeFilter(option.key)
                    setActive(1)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition',
                    typeFilter === option.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={debtOnly}
              onClick={() => {
                setDebtOnly((value) => !value)
                setActive(1)
              }}
              title={t('Только клиенты с неоплаченными продажами')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                debtOnly
                  ? 'border-danger/40 bg-danger-soft text-danger-soft-fg'
                  : 'border-line bg-surface-2 text-muted hover:text-fg',
              )}
            >
              <Wallet className="size-3.5" />
              {t('Должники')}
            </button>
          </div>

          {customerList.length === 0 ? (
            debtOnly ? (
              <EmptyState icon={Wallet} title={t('Должников нет')} description={t('Все продажи оплачены.')} />
            ) : (
              <EmptyState
                icon={Users}
                title={t('Клиенты не найдены')}
                description={t('Измените условия поиска или добавьте нового клиента на соседней вкладке.')}
              />
            )
          ) : (
            <ListGroup as="ol">
              {customerList.map((customer, index) => (
                <ListGroup.Item
                  key={customer.id}
                  as="li"
                  onClick={() => setProfileId(customer.id)}
                  title={t('Открыть карточку клиента')}
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-2 font-medium text-fg">
                      <span className="truncate">
                        {customer.username} {customer.surname}
                      </span>
                      {isOrganization(customer) && (
                        <Badge bg="info" className="shrink-0">
                          <Building2 />
                          {t('Организация')}
                        </Badge>
                      )}
                    </p>
                    <p className="text-[11px] text-subtle">
                      ID: {customer.id}
                      {isOrganization(customer) && customer.inn && ` · ${t('ИНН')} ${customer.inn}`}
                    </p>
                  </div>

                  {customer.debt > 0 && (
                    <Badge
                      bg="danger"
                      title={t('Неоплаченных продаж: {count}', { count: customer.debtSales })}
                      className="font-semibold tabular-nums"
                    >
                      <Wallet />
                      {t('Долг: {amount} сум', { amount: customer.debt.toLocaleString('uz') })}
                    </Badge>
                  )}

                  {customer.phone && (
                    <Badge bg="success" className="hidden sm:inline-flex">
                      <Phone />
                      {customer.phone}
                    </Badge>
                  )}

                  <Badge className="hidden lg:inline-flex">
                    <CalendarClock />
                    {new Date(customer.createdAt).toLocaleString('UZ')}
                  </Badge>

                  {/* Menyu elementlari va uning tugmasi qatorni bosish (kartochkani ochish) bilan aralashmaydi. */}
                  <span onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                      <Dropdown.Toggle
                        as="div"
                        className="inline-flex size-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-3 hover:text-fg"
                      >
                        <MoreHorizontal className="size-4" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu align="end">
                        <Dropdown.Item onClick={() => openEdit(customer)}>
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
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <div className="flex justify-center pt-1">
            <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
          </div>
        </>
      )}

      {/* Изменить */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Редактировать клиента')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-3">
          {/* Turi (odam / tashkilot) yaratilganda belgilanadi va keyin o'zgartirilmaydi. */}
          <CustomerFields
            value={editForm}
            onChange={(next) => {
              setEditForm(next)
              setEditInvalid({})
            }}
            invalid={editInvalid}
            idPrefix="editCustomer"
            lockType
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
            {t('Отмена')}
          </Button>
          <Button
            variant="warning"
            onClick={async () => {
              const check = validateCustomer(editForm)
              setEditInvalid(check.invalid)
              if (!check.ok) return

              setShowResAlert(false)
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await updateCustomerData(uid, customerPayload(editForm))
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResAlert(false)
                setShowResTitle(Array.isArray(data.message) ? data.message.join(', ') : data.message)
              } else {
                setShowResAlert(true)
                setShowResTitle(t('Клиент успешно обновлён'))
                setProfileVersion((version) => version + 1)
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
