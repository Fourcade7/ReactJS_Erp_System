import { Fragment, useEffect, useState } from 'react'
import { Info, ListOrdered, Plus, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button, Modal, PageHeader, Tab, Tabs } from '../ui'
import { roundQty } from '../lib/quantity'
import Cart from './Cart'
import Checkout from './Checkout'
import ProductPicker from './ProductPicker'
import TransactionDetail from './TransactionDetail'
import TransactionList from './TransactionList'
import { unitPrice } from './pricing'
import { t } from '../i18n'

/** Bir vaqtda ochiq turadigan cheklar soni chegarasi (kassada 8 tadan ortiq kerak emas). */
const MAX_DRAFTS = 8

/**
 * Ish maydoni panellari joylashuvi. Keng ekranda tovarlar roʻyxati ~440px da qoladi, qolgan joy savatga.
 * `productsOnRight` (kirim, qaytarish) — panellar teskari: hisob-kitob chapda, tovarlar o'ngda,
 * shunda bu bo'limlar savdo ekrani bilan adashtirilmaydi.
 */
const LAYOUTS = {
  default: {
    grid: 'lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_290px] 2xl:grid-cols-[440px_minmax(0,1fr)_290px]',
    picker: 'lg:row-span-2 xl:row-span-1',
    cart: '',
    checkout: '',
  },
  productsOnRight: {
    grid: 'lg:grid-cols-2 xl:grid-cols-[290px_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[290px_minmax(0,1fr)_440px]',
    picker: 'lg:col-start-2 lg:row-start-1 lg:row-span-2 xl:col-start-3 xl:row-span-1',
    cart: 'lg:col-start-1 lg:row-start-1 xl:col-start-2',
    checkout: 'lg:col-start-1 lg:row-start-2 xl:row-start-1',
  },
}

/**
 * Brauzer seansi davomida cheklar saqlanadi: boshqa bo'limga o'tib qaytilsa ham yo'qolmaydi.
 * Kalit — foydalanuvchi va bo'lim, shuning uchun boshqa xodim kirsa eskisini ko'rmaydi.
 */
const sessions = new Map()

let counter = 0
const makeId = () => `d${Date.now().toString(36)}${(counter += 1)}`

/** Bo'sh raqam: 1, 2, 3 … (yopilgan chekning raqami qayta ishlatiladi). */
function freeNumber(drafts) {
  const used = new Set(drafts.map((draft) => draft.number))
  let number = 1
  while (used.has(number)) number += 1
  return number
}

/** Chekni ro'yxatdan olib tashlaydi; oxirgisi bo'lsa — bo'sh chek qoladi. Faol chek o'chsa — qo'shnisi faol bo'ladi. */
function dropDraft(current, id) {
  const index = current.drafts.findIndex((draft) => draft.id === id)
  if (index === -1) return current
  const rest = current.drafts.filter((draft) => draft.id !== id)
  if (rest.length === 0) {
    const fresh = makeDraft([])
    return { drafts: [fresh], activeId: fresh.id }
  }
  const activeId = current.activeId === id ? rest[Math.max(0, index - 1)].id : current.activeId
  return { drafts: rest, activeId }
}

/**
 * Sotilgan tovarlar miqdorini boshqa cheklardagi shu tovar nusxalarining qoldig'idan ayiradi:
 * aks holda ularda eski (katta) qoldiq ko'rinib, ortiqcha miqdor tekshiruvi noto'g'ri ishlardi.
 * Savdo tovarni birinchi (stock[0]) ombordan yozadi (SaleApi.addNewSale), shu ombor kamaytiriladi.
 */
function withSoldStock(orderList, sold) {
  return orderList.map((item) => {
    const soldItem = sold.find((entry) => entry.id === item.id)
    const warehouseId = soldItem?.stock?.[0]?.warehouse?.id
    if (!soldItem || warehouseId === undefined || !item.stock?.length) return item
    return {
      ...item,
      stock: item.stock.map((entry) =>
        entry.warehouse?.id === warehouseId
          ? { ...entry, quantity: roundQty(Math.max(0, entry.quantity - soldItem.quantity)) }
          : entry,
      ),
    }
  })
}

const makeDraft = (drafts, extra = {}) => ({
  id: makeId(),
  number: freeNumber(drafts),
  orderList: [],
  // Usta xizmatlari (savdo summasiga kirmaydi): [{ key, master, amount }].
  masterFees: [],
  // Hisob-kitob paneli holati (kontragent, to'lov usuli, chegirma) — chek almashganda saqlanadi.
  checkout: null,
  // Zakazdan o'tgan chek: savdo yozilgach zakaz yakunlanadi.
  onSubmitted: undefined,
  ...extra,
})

/**
 * Savdo, kirim va qaytarish boʻlimlari uchun umumiy ish maydoni:
 * roʻyxat, yangi operatsiya (tovarlar → savat → hisob-kitob) va tafsilotlar.
 * Boʻlimlar orasidagi farq faqat `config` da.
 *
 * "Yangi operatsiya" tabida bir nechta chek parallel ochiladi: har birining o'z savati va
 * hisob-kitobi bor, birini tugatmasdan ikkinchisiga o'tish mumkin. Chek yozilgach faqat o'sha chek
 * yopiladi — sahifa yangilanmaydi, qolgan cheklar joyida turadi.
 */
function TransactionWorkspace({ config, initialOrderList = [], initialCustomer = null, onSubmitted }) {
  const [activeTab, setActiveTab] = useState('sale')
  const [selectedSale, setSelectedSale] = useState(null)

  const sessionKey = `${localStorage.getItem('userid') ?? ''}:${config.title}`

  const [session, setSession] = useState(() => {
    const saved = sessions.get(sessionKey)
    const handoff = initialOrderList.length > 0 || Boolean(initialCustomer)
    const base = saved ?? { drafts: [], activeId: null }

    // Savat yoki kontragent tayyor holda kelgan bo'lsa (zakazdan) — alohida chek bo'lib ochiladi.
    if (handoff || base.drafts.length === 0) {
      const draft = makeDraft(base.drafts, {
        orderList: initialOrderList,
        checkout: initialCustomer
          ? {
              customerId: initialCustomer.id,
              customerLabel: `${initialCustomer.username} ${initialCustomer.surname}`.trim(),
              paymentType: 'Наличные',
              discountType: 'sum',
              discountSum: 0,
            }
          : null,
        onSubmitted,
      })
      return { drafts: [...base.drafts, draft], activeId: draft.id }
    }
    return base
  })
  const [productsVersion, setProductsVersion] = useState(0)
  const [closing, setClosing] = useState(null)

  useEffect(() => {
    sessions.set(sessionKey, session)
  }, [session, sessionKey])

  const { drafts } = session
  const active = drafts.find((draft) => draft.id === session.activeId) ?? drafts[0]

  const patchDraft = (id, patch) =>
    setSession((current) => ({
      ...current,
      drafts: current.drafts.map((draft) =>
        draft.id === id ? { ...draft, ...(typeof patch === 'function' ? patch(draft) : patch) } : draft,
      ),
    }))

  const setOrderListFor = (id) => (updater) =>
    patchDraft(id, (draft) => ({
      orderList: typeof updater === 'function' ? updater(draft.orderList) : updater,
    }))

  const addMasterFeeFor = (id) => (fee) =>
    patchDraft(id, (draft) => ({ masterFees: [...(draft.masterFees ?? []), { ...fee, key: makeId() }] }))

  const removeMasterFeeFor = (id) => (key) =>
    patchDraft(id, (draft) => ({ masterFees: (draft.masterFees ?? []).filter((fee) => fee.key !== key) }))

  const openDraft = (id) => setSession((current) => ({ ...current, activeId: id }))

  const addDraft = () =>
    setSession((current) => {
      if (current.drafts.length >= MAX_DRAFTS) return current
      const draft = makeDraft(current.drafts)
      return { drafts: [...current.drafts, draft], activeId: draft.id }
    })

  const removeDraft = (id) => setSession((current) => dropDraft(current, id))

  // Savdo yozilgach: faqat shu chek yopiladi; boshqa cheklar o'z joyida, ularda sotilgan tovar qoldig'i
  // kamayadi (savdoda) va tovarlar ro'yxati qayta yuklanadi.
  const finishDraft = (id) => {
    setSession((current) => {
      const sold = current.drafts.find((draft) => draft.id === id)
      if (!sold) return current
      const drafts = config.limitByStock
        ? current.drafts.map((draft) =>
            draft.id === id ? draft : { ...draft, orderList: withSoldStock(draft.orderList, sold.orderList) },
          )
        : current.drafts
      return dropDraft({ ...current, drafts }, id)
    })
    setProductsVersion((version) => version + 1)
  }

  const requestClose = (draft) => {
    if (draft.orderList.length === 0) removeDraft(draft.id)
    else setClosing(draft)
  }

  const { Icon } = config
  const draftLabel = config.draftLabel ?? t('Чек')
  const layout = config.productsOnRight ? LAYOUTS.productsOnRight : LAYOUTS.default

  // Parallel cheklar: har birida o'z savati va hisob-kitobi, birini tugatmasdan ikkinchisiga o'tiladi.
  // Panel sahifa sarlavhasining o'ng tomonida turadi (bo'sh joy) — tovarlar ro'yxati yuqoriga ko'tariladi.
  const draftBar = (
    <div
      role="tablist"
      aria-label={t('Открытые чеки')}
      className="flex max-w-full flex-wrap items-center justify-end gap-1.5"
    >
      {drafts.map((draft) => {
        const selected = draft.id === active.id
        const count = roundQty(draft.orderList.reduce((sum, item) => sum + item.quantity, 0))
        const total = Math.round(
          draft.orderList.reduce((sum, item) => sum + unitPrice(item, config.priceField) * item.quantity, 0),
        )
        return (
          <div
            key={draft.id}
            className={cn(
              'inline-flex shrink-0 items-center rounded-lg border text-[12px] transition',
              selected
                ? 'border-primary/50 bg-primary-soft text-primary-soft-fg'
                : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => openDraft(draft.id)}
              className="flex items-center gap-2 py-1.5 pl-3 pr-2 text-left"
            >
              <span className="font-medium">
                {draftLabel} {draft.number}
              </span>
              {count > 0 && (
                <span className="tabular-nums opacity-80">
                  {count} · {total.toLocaleString('uz')}
                </span>
              )}
            </button>
            {(drafts.length > 1 || draft.orderList.length > 0) && (
              <button
                type="button"
                onClick={() => requestClose(draft)}
                aria-label={t('Закрыть чек {number}', { number: draft.number })}
                title={t('Закрыть чек')}
                className="mr-1 inline-flex size-5 items-center justify-center rounded-md opacity-60 transition hover:bg-danger-soft hover:text-danger-soft-fg hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={addDraft}
        disabled={drafts.length >= MAX_DRAFTS}
        title={t('Открыть ещё один чек, не закрывая текущий')}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-[12px] font-medium text-muted transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-3.5" />
        {draftLabel}
      </button>
    </div>
  )

  return (
    <div>
      <PageHeader
        icon={Icon}
        title={config.title}
        description={config.description}
        actions={activeTab === 'sale' ? draftBar : undefined}
      />

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} variant="underline">
        <Tab
          eventKey="home"
          title={
            <>
              <ListOrdered />
              {config.listTitle}
            </>
          }
        >
          <TransactionList
            fetchPage={config.fetchPage}
            label={config.label}
            icon={Icon}
            activeTab={activeTab}
            setSelectedSale={setSelectedSale}
            setActiveTab={setActiveTab}
          />
        </Tab>

        <Tab
          eventKey="sale"
          title={
            <>
              <Plus />
              {config.newTitle}
              {drafts.length > 1 && (
                <span className="rounded-full bg-primary-soft px-1.5 text-[10px] font-semibold tabular-nums text-primary-soft-fg">
                  {drafts.length}
                </span>
              )}
            </>
          }
        >
          <div className={cn('grid items-start gap-4', layout.grid)}>
            <div className={layout.picker}>
              <ProductPicker
                fetchProducts={config.fetchProducts}
                setOrderList={setOrderListFor(active.id)}
                priceField={config.priceField}
                onlyStocked={config.onlyStocked}
                autoAddSingle={config.autoAddSingle}
                reloadKey={productsVersion}
                masterFeeEnabled={Boolean(config.masterFees)}
                onAddMasterFee={addMasterFeeFor(active.id)}
              />
            </div>
            {/* Hamma cheklar ulangan turadi (faol bo'lmaganlari yashirin) — shuning uchun holati yo'qolmaydi. */}
            {drafts.map((draft) => {
              const visible = draft.id === active.id
              return (
                <Fragment key={draft.id}>
                  <div className={cn(layout.cart, !visible && 'hidden')}>
                    <Cart
                      orderList={draft.orderList}
                      setOrderList={setOrderListFor(draft.id)}
                      priceField={config.priceField}
                      limitByStock={config.limitByStock}
                      editablePrice={config.editablePrice}
                      masterFees={draft.masterFees ?? []}
                      onRemoveMasterFee={removeMasterFeeFor(draft.id)}
                    />
                  </div>
                  <div className={cn('xl:sticky xl:top-20', layout.checkout, !visible && 'hidden')}>
                    <Checkout
                      orderList={draft.orderList}
                      submit={config.submit}
                      fetchCustomers={config.fetchCustomers}
                      priceField={config.priceField}
                      title={config.checkoutTitle}
                      tone={config.tone}
                      printable={config.printable}
                      maxDiscountPercent={config.maxDiscountPercent}
                      limitByStock={config.limitByStock}
                      initialState={draft.checkout}
                      onStateChange={(checkout) => patchDraft(draft.id, { checkout })}
                      onSubmitted={draft.onSubmitted}
                      onFinished={() => finishDraft(draft.id)}
                      contractSale={Boolean(config.contractSale)}
                      masterFees={draft.masterFees ?? []}
                    />
                  </div>
                </Fragment>
              )
            })}
          </div>
        </Tab>

        {activeTab === 'sale_detail' && (
          <Tab
            eventKey="sale_detail"
            title={
              <>
                <Info />
                {config.detailTitle}
              </>
            }
          >
            <TransactionDetail
              selectedSale={selectedSale}
              setActiveTab={setActiveTab}
              addNewPayment={config.addNewPayment}
              fetchDetail={config.fetchDetail}
              returnFromSale={config.returnFromSale}
              changeCustomer={config.changeCustomer}
              label={config.label}
              icon={Icon}
            />
          </Tab>
        )}
      </Tabs>

      <Modal show={closing !== null} onHide={() => setClosing(null)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('Закрыть чек {number}?', { number: closing?.number })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('В чеке {count} поз. — они будут удалены, чек не оформлен.', { count: closing?.orderList.length ?? 0 })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setClosing(null)}>
            {t('Оставить')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              removeDraft(closing.id)
              setClosing(null)
            }}
          >
            {t('Закрыть чек')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TransactionWorkspace
