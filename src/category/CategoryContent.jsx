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
import { ProductListGroup } from '../product/ProductListContent'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { LoadingModal, ResultModal } from '../utils/StatusModals'
import { ImportExportMenu, ImportModal } from '../utils/ImportExportContent'
import { exportToExcel } from '../utils/ExcelUtils'
import {
  addCategory,
  deleteCategory,
  getAllCategory,
  importCategories,
  updateCategory,
} from './CategoryApi'
import { t } from '../i18n'

const CATEGORY_IMPORT_FIELDS = [
  {
    key: 'name',
    label: t('Название'),
    required: true,
    aliases: ['название', 'наименование', 'категория', 'группа', 'name', 'category', 'nomi', 'nom', 'kategoriya', 'guruh'],
  },
]

const CATEGORY_EXPORT_COLUMNS = [
  { key: 'name', label: t('Название') },
  { key: 'products', label: t('Товаров'), value: (row) => row.products?.length ?? 0 },
  {
    key: 'date',
    label: t('Дата создания'),
    value: (row) => new Date(row.date).toLocaleString('uz'),
  },
]

function CategoryList(props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const [showResTitle, setShowResTitle] = useState('Success')
  const [showLoadTitle, setShowLoadTitle] = useState(t('Загрузка...'))
  const [showResTypeAlert, setShowResTypeAlert] = useState(false)

  const [cid, setCid] = useState(-1)
  const [cName, setCname] = useState('')

  const [categoryList, setCategoryList] = useState([])
  const [reloadKey, setReloadKey] = useState(0)
  const [showImport, setShowImport] = useState(false)

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
  }, [props.activeTab, showResTypeAlert, reloadKey])

  const handleExport = () =>
    exportToExcel({
      fetchRows: async () => categoryList,
      columns: CATEGORY_EXPORT_COLUMNS,
      fileName: t('Категории.xlsx'),
    })

  return (
    <div className="flex flex-col gap-3">
      {!isUser && (
        <div className="flex justify-end">
          <ImportExportMenu onImport={() => setShowImport(true)} onExport={handleExport} />
        </div>
      )}

      {categoryList.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={t('Категорий пока нет')}
          description={t('Добавьте первую категорию на соседней вкладке, чтобы начать раскладывать товары по группам.')}
        />
      ) : (
        <ListGroup as="ol">
          {categoryList.map((category) => (
            <ListGroup.Item key={category.id} as="li" onClick={() => props.onOpenCategory(category)}>
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

              {/* Menyu bosilganda kategoriya mahsulotlari ochilib ketmasin. */}
              <span className="contents" onClick={(e) => e.stopPropagation()}>
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
                      {t('Изменить')}
                    </Dropdown.Item>
                    <Dropdown.Item
                      variant="danger"
                      disabled={isUser}
                      onClick={() => {
                        setShowDel(true)
                        setCid(category.id)
                      }}
                    >
                      {t('Удалить')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Изменить */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Редактировать')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="editCategoryName">
            <Form.Label>{t('Название категории')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('Введите имя')}
              value={cName}
              onChange={(e) => setCname(e.target.value)}
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
              setShowResTypeAlert(false)
              setShowEdit(false)
              setShowLoad(true)
              setShowLoadTitle(t('Загрузка...'))

              const res = await updateCategory(cid, cName)
              const data = await res.json()
              setShowLoad(false)

              if (!res.ok) {
                setShowResTypeAlert(false)
                setShowResTitle(data.message)
              } else {
                setShowResTypeAlert(true)
                setShowResTitle(t('Категория успешно обновлена'))
              }

              setShowRes(true)
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
              setShowResTypeAlert(false)
              setShowLoadTitle(t('Загрузка...'))
              setShowDel(false)
              setShowLoad(true)

              const res = await deleteCategory(cid)
              const deleteResponse = await res.json()

              setShowResTypeAlert(res.ok)

              setTimeout(() => setShowLoadTitle(t('Почти готово')), 1000)
              setTimeout(() => {
                setShowLoad(false)
                setShowResTitle(deleteResponse.message)
                setShowRes(true)
              }, 2000)
            }}
          >
            {t('Удалить')}
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

      {showImport && (
        <ImportModal
          onHide={() => setShowImport(false)}
          entityTitle={t('категории')}
          fields={CATEGORY_IMPORT_FIELDS}
          onImportChunk={importCategories}
          onFinished={() => setReloadKey((k) => k + 1)}
        />
      )}
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
        setAlertMessage(t('Успешно...'))
        const timer = setTimeout(() => props.tabChange('home'), 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setShowDanger(true)
      setAlertMessage(t('Не удалось подключиться к серверу'))
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
          <Form.Label>{t('Название категории')}</Form.Label>
          <Form.Control
            type="text"
            value={wname}
            onChange={(e) => setWname(e.target.value)}
            placeholder={t('Введите имя')}
          />
          <Form.Text>{t('Например: «Напитки», «Бытовая химия», «Канцелярия».')}</Form.Text>
        </Form.Group>

        <Button type="submit" loading={pshow} block>
          {!pshow && <Save />}
          {t('Сохранить')}
        </Button>
      </Form>
    </div>
  )
}

function CategoryTab() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
      <Tab
        eventKey="home"
        title={
          <>
            <Tags />
            {t('Список категорий')}
          </>
        }
      >
        <CategoryList
          activeTab={activeTab}
          onOpenCategory={(category) => {
            setSelectedCategory(category)
            setActiveTab('category_products')
          }}
        />
      </Tab>

      <Tab
        eventKey="profile"
        disabled={localStorage.getItem('role') === 'User'}
        title={
          <>
            <Plus />
            {t('Добавить новую категорию')}
          </>
        }
      >
        <CategoryAdd tabChange={(tname) => setActiveTab(tname)} />
      </Tab>

      {activeTab === 'category_products' && selectedCategory && (
        <Tab
          eventKey="category_products"
          title={
            <>
              <Package />
              {selectedCategory.name}
            </>
          }
        >
          {/* ProductListGroup faqat activeTab === 'home' da yuklaydi. */}
          <ProductListGroup activeTab="home" categoryId={selectedCategory.id} />
        </Tab>
      )}
    </Tabs>
  )
}

function CategoryScreen() {
  return (
    <div>
      <PageHeader
        icon={Tags}
        title={t('Категория')}
        description={t('Группы товаров, по которым строится номенклатура')}
      />
      <CategoryTab />
    </div>
  )
}

export default CategoryScreen
