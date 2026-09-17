import { useEffect, useState } from 'react'
import { ArrowDownLeft, Banknote, CalendarClock, ChevronRight, ShoppingBag, Undo2 } from 'lucide-react'
import { Badge, EmptyState, SearchField } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { getAllPaymentListPaginationSearch } from './PaymentApi'

const paidOf = (record) => record.payments.reduce((sum, item) => sum + item.amount, 0)

/** Toʻlov qaysi operatsiyaga tegishli ekanini aniqlaydi. */
function sourceOf(payment) {
  if (payment.sale) return { record: payment.sale, label: 'Продажа', Icon: ShoppingBag, tone: 'primary' }
  if (payment.purchase) return { record: payment.purchase, label: 'Приход', Icon: ArrowDownLeft, tone: 'info' }
  if (payment.returns) return { record: payment.returns, label: 'Возврат', Icon: Undo2, tone: 'warning' }
  return null
}

function PaymentListGroup(props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paymentList, setPaymentList] = useState([])
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
    async function loadPayments() {
      try {
        const page = await getAllPaymentListPaginationSearch(active, 10, debouncedSearch)
        setPageCount(page.meta.totalPages)
        setPaymentList(page.data)
      } catch (error) {
        console.log(error.message)
      }
    }
    if (props.activeTab === 'home') loadPayments()
  }, [active, props.activeTab, debouncedSearch])

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setActive(1)
        }}
        onClear={() => setSearchTerm('')}
      />

      {paymentList.length === 0 ? (
        <EmptyState icon={Banknote} title="Платежей пока нет" />
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-card border border-line bg-surface p-0 shadow-soft">
          {paymentList.map((payment, index) => {
            const source = sourceOf(payment)
            const record = source?.record
            // Qarz sharti manba turiga qarab asl koddagidek hisoblanadi.
            const inDebt =
              record &&
              (payment.sale
                ? paidOf(record) < record.total - record.discount
                : record.total !== paidOf(record) + record.discount)
            const SourceIcon = source?.Icon ?? Banknote

            return (
              <li key={payment.id}>
                <button
                  type="button"
                  onClick={() => {
                    props.setSelectedSale(source)
                    props.setActiveTab('payment_detail')
                  }}
                  className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle sm:inline-flex">
                    {index + 1}
                  </span>
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                    <SourceIcon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">Платеж #{payment.id}</p>
                    <p className="flex items-center gap-1 text-[11px] text-subtle">
                      <CalendarClock className="size-3" />
                      {new Date(payment.date).toLocaleString('UZ')}
                    </p>
                  </div>

                  {source && (
                    <Badge bg={source.tone} className="hidden sm:inline-flex">
                      {source.label} #{record.id}
                    </Badge>
                  )}
                  {record && record.discount > 0 && (
                    <Badge className="hidden lg:inline-flex">
                      Скидка {record.discount.toLocaleString('uz')}
                    </Badge>
                  )}
                  {inDebt && (
                    <Badge bg="danger" dot>
                      В долг
                    </Badge>
                  )}

                  <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-success-soft-fg">
                    +{payment.amount.toLocaleString('uz')}
                    <span className="ml-1 text-[11px] font-normal text-subtle">So&apos;m</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex justify-center pt-1">
        <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
      </div>
    </div>
  )
}

export { PaymentListGroup }
