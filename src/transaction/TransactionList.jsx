import { useEffect, useState } from 'react'
import { CalendarClock, ChevronRight, Inbox, Percent } from 'lucide-react'
import { Badge, EmptyState, SearchField } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'

const paidOf = (sale) => sale.payments.reduce((sum, item) => sum + item.amount, 0)

/**
 * Operatsiyalar roʻyxati (savdo / kirim / qaytarish).
 *
 * - `fetchPage(page, size, search)` berilsa — qidiruv va sahifalash bilan;
 * - `fetchAll()` berilsa — bitta soʻrovda butun roʻyxat (masalan, qarzdorlar).
 */
function TransactionList({
  fetchPage,
  fetchAll,
  label,
  icon: Icon = Inbox,
  activeTab,
  setSelectedSale,
  setActiveTab,
  emptyText = 'Операций пока нет',
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [saleList, setSaleList] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [active, setActive] = useState(1)

  useEffect(() => {
    if (!fetchPage) return
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm, fetchPage])

  useEffect(() => {
    async function load() {
      try {
        if (fetchPage) {
          const page = await fetchPage(active, 10, debouncedSearch)
          setPageCount(page.meta.totalPages)
          setSaleList(page.data)
        } else {
          setSaleList(await fetchAll())
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    if (activeTab === 'home') load()
  }, [active, activeTab, debouncedSearch, fetchPage, fetchAll])

  return (
    <div className="flex flex-col gap-3">
      {fetchPage && (
        <SearchField
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setActive(1)
          }}
          onClear={() => setSearchTerm('')}
        />
      )}

      {saleList.length === 0 ? (
        <EmptyState icon={Icon} title={emptyText} />
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-card border border-line bg-surface p-0 shadow-soft">
          {saleList.map((sale, index) => {
            const paid = paidOf(sale)
            const inDebt = sale.total !== paid + sale.discount

            return (
              <li key={sale.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSale(sale)
                    setActiveTab('sale_detail')
                  }}
                  className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[11px] font-semibold tabular-nums text-subtle sm:inline-flex">
                    {index + 1}
                  </span>

                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                    <Icon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {label} #{sale.id}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-subtle">
                      <CalendarClock className="size-3" />
                      {new Date(sale.date).toLocaleString('UZ')}
                    </p>
                  </div>

                  {sale.discount > 0 && (
                    <Badge bg="info" className="hidden md:inline-flex">
                      <Percent />
                      {sale.discount.toLocaleString('uz')}
                    </Badge>
                  )}

                  {inDebt && (
                    <Badge bg="danger" dot>
                      В долг
                    </Badge>
                  )}

                  <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-fg">
                    {paid.toLocaleString('uz')}
                    <span className="ml-1 text-[11px] font-normal text-subtle">So&apos;m</span>
                  </span>

                  <ChevronRight className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {fetchPage && (
        <div className="flex justify-center pt-1">
          <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
        </div>
      )}
    </div>
  )
}

export default TransactionList
