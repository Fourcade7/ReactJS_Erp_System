import { Fragment, useEffect, useState } from 'react'
import { BadgeCheck, CalendarClock, ChevronRight, Inbox, Percent, UserRound, Wallet, Wrench, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Badge, EmptyState, Form, SearchField } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { amountsOf } from './amounts'
import { isMaster, personName, useMembers } from './masterFee'
import { t } from '../i18n'

const NO_FILTER = { masterId: '', userId: '', debt: false }

/** Savdodagi ustalar nomlari, takrorlanmasdan (bir usta bir nechta xizmat ko'rsatgan bo'lishi mumkin). */
const mastersOf = (sale) => [...new Set((sale.masterFees ?? []).map((fee) => personName(fee.master) || '—'))]

/**
 * Operatsiyalar roʻyxati (savdo / kirim / qaytarish).
 *
 * - `fetchPage(page, size, search, filters)` berilsa — qidiruv va sahifalash bilan;
 * - `fetchAll()` berilsa — bitta soʻrovda butun roʻyxat.
 *
 * `filters` (savdolar uchun) — qidiruv yonida filtrlar: usta, sotgan xodim (kassir/admin) va `debt: true` bo'lsa
 * "Только с долгом". `filters.fixed` — doim qo'shiladigan filtr (masalan, bosh sahifadagi qarzdorlar: `{ debt: true }`).
 */
function TransactionList({
  fetchPage,
  fetchAll,
  filters,
  searchPlaceholder,
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
  const [found, setFound] = useState(0)
  const [active, setActive] = useState(1)
  const [filter, setFilter] = useState(NO_FILTER)

  const filterable = Boolean(fetchPage && filters)
  const members = useMembers(filterable)
  const masters = members.filter(isMaster)
  // Sotuvchilar: ustalardan boshqa hamma xodim (kassir, admin ...).
  const sellers = members.filter((member) => !isMaster(member))
  const filtered = Boolean(filter.masterId || filter.userId || filter.debt)

  const changeFilter = (patch) => {
    setFilter((current) => ({ ...current, ...patch }))
    setActive(1)
  }

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
          const page = await fetchPage(active, 10, debouncedSearch, { ...filter, ...filters?.fixed })
          setPageCount(page.meta.totalPages)
          setFound(page.meta.total)
          setSaleList(page.data)
        } else {
          setSaleList(await fetchAll())
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    if (activeTab === 'home') load()
  }, [active, activeTab, debouncedSearch, fetchPage, fetchAll, filter, filters])

  // Chegirma va holat ustunlari faqat sahifada kamida bitta shunday qator bo'lsa joy oladi.
  const anyDiscount = saleList.some((sale) => sale.discount > 0)
  const anyDebt = saleList.some((sale) => amountsOf(sale).inDebt)

  return (
    <div className="flex flex-col gap-3">
      {fetchPage && (
        <div className="flex flex-wrap items-center gap-2">
          <SearchField
            className="min-w-56 flex-1"
            value={searchTerm}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setActive(1)
            }}
            onClear={() => setSearchTerm('')}
          />
          {filterable && (
            <>
              <div className="w-full sm:w-44">
                <Form.Select
                  aria-label={t('Мастер')}
                  value={filter.masterId}
                  onChange={(e) => changeFilter({ masterId: e.target.value })}
                >
                  <option value="">{t('Все мастера')}</option>
                  {masters.map((master) => (
                    <option key={master.id} value={master.id}>
                      {personName(master)}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="w-full sm:w-44">
                <Form.Select
                  aria-label={t('Продавец')}
                  value={filter.userId}
                  onChange={(e) => changeFilter({ userId: e.target.value })}
                >
                  <option value="">{t('Все продавцы')}</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {personName(seller)}
                    </option>
                  ))}
                </Form.Select>
              </div>
              {filters.debt && (
                <button
                  type="button"
                  aria-pressed={filter.debt}
                  onClick={() => changeFilter({ debt: !filter.debt })}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition',
                    filter.debt
                      ? 'border-danger/50 bg-danger-soft text-danger-soft-fg'
                      : 'border-line bg-surface text-muted hover:text-fg',
                  )}
                >
                  <Wallet className="size-3.5" />
                  {t('Только с долгом')}
                </button>
              )}
              {filtered && (
                <button
                  type="button"
                  onClick={() => changeFilter(NO_FILTER)}
                  className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-[12px] text-subtle transition hover:text-fg"
                >
                  <X className="size-3.5" />
                  {t('Сбросить')}
                </button>
              )}
            </>
          )}
        </div>
      )}
      {filterable && (filtered || debouncedSearch.trim()) && (
        <p className="-mt-1 text-[12px] text-subtle">{t('Найдено: {count}', { count: found })}</p>
      )}

      {saleList.length === 0 ? (
        <EmptyState icon={Icon} title={emptyText} />
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-card border border-line bg-surface p-0 shadow-soft">
          {saleList.map((sale, index) => {
            // Asosiy summa doim ko'rinadi; qarz bo'lsa to'langani va qarz summasi ham (ichiga kirmasdan).
            const { net, paid, remaining, inDebt } = amountsOf(sale)
            const seller = filterable ? personName(sale.user) : ''
            const masters = mastersOf(sale)

            // Sana ostidagi ustun: qaysi savdodan qaytarilgan, kim sotgan, qaysi usta — " · " bilan ajratiladi.
            const details = [
              // Список продаж ichidan qilingan qaytarish.
              sale.sale && (
                <span key="sale" className="shrink-0">
                  {t('из продажи #{id}', { id: sale.sale.id })}
                </span>
              ),
              // Kim sotgan (kassir/admin) — qidiruv va filtr shu bo'yicha ham ishlaydi.
              seller && (
                <span key="seller" className="inline-flex min-w-0 items-center gap-1" title={t('Продавец')}>
                  <BadgeCheck className="size-3 shrink-0" />
                  <span className="truncate">{seller}</span>
                </span>
              ),
              // Usta — sotuvchidan keyin, shu qatorda (qator balandligi o'zgarmaydi); bir nechta bo'lsa — "+N".
              masters.length > 0 && (
                <span
                  key="masters"
                  title={sale.masterFees
                    .map((fee) =>
                      `${personName(fee.master) || '—'}: ${t('Услуга мастера: {master} · доля компании: {company}', {
                        master: fee.amount.toLocaleString('uz'),
                        company: fee.companyAmount.toLocaleString('uz'),
                      })}`,
                    )
                    .join('\n')}
                  className="inline-flex min-w-0 items-center gap-1"
                >
                  <Wrench className="size-3 shrink-0 text-primary" />
                  <span className="truncate">{masters[0]}</span>
                  {masters.length > 1 && <span className="shrink-0">+{masters.length - 1}</span>}
                </span>
              ),
            ].filter(Boolean)

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

                  {/*
                    Keng ekranda (sm) ikki ustun: chapda raqam va sana (qat'iy kenglik), o'ngda kontragent va
                    sotuvchi/usta. Raqam uzunligi (#8 yoki #1234) qanday bo'lmasin, kontragent va sotuvchi hamma
                    qatorlarda bitta chiziqdan boshlanadi. Tor ekranda: raqam, kontragent, so'ng sana · sotuvchi.
                  */}
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-4">
                    <p className="w-full truncate text-[13px] font-medium text-fg">
                      {label} #{sale.id}
                    </p>
                    {/* Kontragent nomi: ichiga kirmasdan kimga sotilgani ko'rinadi. Bo'lmasa ham katak band turadi. */}
                    <p
                      title={
                        sale.customer
                          ? `${sale.customer.username ?? ''} ${sale.customer.surname ?? ''} ${sale.customer.phone ?? ''}`.trim()
                          : undefined
                      }
                      className={cn(
                        'w-full min-w-0 items-center gap-1 text-[12px] text-muted sm:text-[13px]',
                        sale.customer ? 'flex' : 'hidden sm:block',
                      )}
                    >
                      {sale.customer && (
                        <>
                          <UserRound className="size-3 shrink-0 text-subtle" />
                          <span className="truncate">
                            {`${sale.customer.username ?? ''} ${sale.customer.surname ?? ''}`.trim()}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="flex shrink-0 items-center gap-1 text-[11px] text-subtle">
                      <CalendarClock className="size-3 shrink-0" />
                      <span className="truncate">{new Date(sale.date).toLocaleString('UZ')}</span>
                    </p>
                    <p className="flex min-w-0 flex-1 items-center gap-1 text-[11px] text-subtle">
                      {details.map((detail, position) => (
                        <Fragment key={detail.key}>
                          {/* Tor ekranda sanadan ajratadi; keng ekranda birinchi element ustun boshida turadi. */}
                          <span aria-hidden="true" className={cn(position === 0 && 'sm:hidden')}>
                            ·
                          </span>
                          {detail}
                        </Fragment>
                      ))}
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
