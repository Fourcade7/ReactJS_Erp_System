import { useEffect, useState } from 'react'
import { CalendarClock, ChevronRight, Inbox, Percent, UserRound } from 'lucide-react'
import { Badge, EmptyState, SearchField } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { amountsOf } from './amounts'
import { t } from '../i18n'

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
  emptyText = t('Операций пока нет'),
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

  // Chegirma va holat ustunlari faqat sahifada kamida bitta shunday qator bo'lsa joy oladi.
  const anyDiscount = saleList.some((sale) => sale.discount > 0)
  const anyDebt = saleList.some((sale) => amountsOf(sale).inDebt)

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
            // Asosiy summa doim ko'rinadi; qarz bo'lsa to'langani va qarz summasi ham (ichiga kirmasdan).
            const { net, paid, remaining, inDebt } = amountsOf(sale)

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
                    <p className="flex min-w-0 items-center gap-2 text-[13px]">
                      <span className="shrink-0 font-medium text-fg">
                        {label} #{sale.id}
                      </span>
                      {/* Kontragent nomi: ichiga kirmasdan kimga sotilgani ko'rinadi (keng ekranda sarlavha yonida). */}
                      {sale.customer && (
                        <span
                          title={`${sale.customer.username ?? ''} ${sale.customer.surname ?? ''} ${sale.customer.phone ?? ''}`.trim()}
                          className="hidden min-w-0 items-center gap-1 text-muted sm:inline-flex"
                        >
                          <UserRound className="size-3 shrink-0 text-subtle" />
                          <span className="truncate">
                            {`${sale.customer.username ?? ''} ${sale.customer.surname ?? ''}`.trim()}
                          </span>
                        </span>
                      )}
                    </p>
                    {/* Tor ekranda nom alohida qatorga tushadi, summa ustuni uni siqib qo'ymaydi. */}
                    {sale.customer && (
                      <p className="flex min-w-0 items-center gap-1 text-[12px] text-muted sm:hidden">
                        <UserRound className="size-3 shrink-0 text-subtle" />
                        <span className="truncate">
                          {`${sale.customer.username ?? ''} ${sale.customer.surname ?? ''}`.trim()}
                        </span>
                      </p>
                    )}
                    <p className="flex min-w-0 items-center gap-1 text-[11px] text-subtle">
                      <CalendarClock className="size-3 shrink-0" />
                      <span className="truncate">
                        {new Date(sale.date).toLocaleString('UZ')}
                        {/* Список продаж ichidan qilingan qaytarish */}
                        {sale.sale && <span className="ml-1">{t('· из продажи #{id}', { id: sale.sale.id })}</span>}
                      </span>
                    </p>
                  </div>

                  {/*
                    O'ng blok. Keng ekranda (xl) hammasi bitta gorizontal qatorda: chegirma | holat | to'langan · qarz | jami.
                    Slotlar qat'iy kenglikda va o'ngga tekislangan, shuning uchun ustunlar qatorlar bo'ylab bir joyda turadi.
                    Tor ekranda — oldingidek: summa tepada, to'langan va qarz uning ostida.
                  */}
                  {anyDiscount && (
                    <span className="hidden justify-end md:flex xl:w-[4.5rem]">
                      {sale.discount > 0 && (
                        <Badge bg="info">
                          <Percent />
                          {sale.discount.toLocaleString('uz')}
                        </Badge>
                      )}
                    </span>
                  )}

                  {anyDebt && (
                    <span className="hidden justify-end sm:flex xl:w-[4.5rem]">
                      {inDebt && (
                        <Badge bg="danger" dot>
                          {t('В долг')}
                        </Badge>
                      )}
                    </span>
                  )}

                  <span className="flex shrink-0 flex-col items-end text-right xl:flex-row xl:items-center xl:gap-3">
                    <span className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-fg xl:order-2 xl:min-w-[7.5rem]">
                      {net.toLocaleString('uz')}
                      <span className="ml-1 text-[11px] font-normal text-subtle">So&apos;m</span>
                    </span>
                    {inDebt ? (
                      <span className="whitespace-nowrap text-[11px] tabular-nums text-subtle xl:order-1 xl:min-w-[13rem]">
                        {t('Оплачено')} {paid.toLocaleString('uz')} ·{' '}
                        <span className="font-medium text-danger-soft-fg">
                          {t('Долг')} {remaining.toLocaleString('uz')}
                        </span>
                      </span>
                    ) : (
                      // Qarzsiz qatorda joy band turadi: chegirma va holat ustunlari qarzli qatorlar bilan bir xil joyda.
                      anyDebt && <span aria-hidden="true" className="hidden xl:order-1 xl:block xl:min-w-[13rem]" />
                    )}
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
