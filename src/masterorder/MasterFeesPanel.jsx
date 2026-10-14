import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight, Phone, UserRound, Wrench } from 'lucide-react'
import { Alert, Button, Card, EmptyState, Form, SearchField, Spinner } from '../ui'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { getMasterFeeDetail, getMasterFeeSummary } from './MasterOrderApi'
import { t } from '../i18n'

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`
const personName = (person) => `${person?.username ?? ''} ${person?.surname ?? ''}`.trim() || '—'
// Mahalliy sana: `toISOString` UTC beradi — Toshkentda 00:00–05:00 orasida kechagi sana chiqib, bugungi savdolar ko'rinmasdi.
const todayIso = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const monthStart = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10)
}

/** Qidiruv, sana oralig'i: ro'yxat ham, usta tafsiloti ham shu filtrdan foydalanadi. */
function Filters({ search, onSearch, start, end, onStart, onEnd, withSearch = true }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {withSearch && (
        <div className="min-w-56 flex-1">
          <SearchField
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onClear={() => onSearch('')}
            placeholder={t('Поиск мастера…')}
          />
        </div>
      )}
      <Form.Group controlId="feeStart" className="w-44">
        <Form.Label>{t('С')}</Form.Label>
        <Form.Control type="date" value={start} max={end} onChange={(e) => onStart(e.target.value)} />
      </Form.Group>
      <Form.Group controlId="feeEnd" className="w-44">
        <Form.Label>{t('По')}</Form.Label>
        <Form.Control type="date" value={end} min={start} onChange={(e) => onEnd(e.target.value)} />
      </Form.Group>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3 shadow-soft">
      <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-subtle">{label}</p>
      <p className="m-0 mt-0.5 text-lg font-semibold tabular-nums text-fg">{value}</p>
    </div>
  )
}

/** Bitta usta: nechta savdoda qatnashgani, savdolar summasi, haqi va har bir savdodagi mahsulotlar. */
function MasterDetail({ masterId, start, end, onStart, onEnd, onBack }) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getMasterFeeDetail(masterId, page, 10, start, end)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError('')
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [masterId, page, start, end])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline-secondary" size="sm" onClick={onBack}>
          <ArrowLeft />
          {t('Назад')}
        </Button>
        <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-fg">
          <UserRound className="size-4 text-primary" />
          {data ? personName(data.master) : '…'}
        </h3>
        {data?.master?.phone && (
          <span className="inline-flex items-center gap-1 text-[12px] text-muted">
            <Phone className="size-3" />
            {data.master.phone}
          </span>
        )}
      </div>

      <Filters
        withSearch={false}
        start={start}
        end={end}
        onStart={(value) => {
          setPage(1)
          onStart(value)
        }}
        onEnd={(value) => {
          setPage(1)
          onEnd(value)
        }}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {!data ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={t('Продаж')} value={data.totals.sales} />
            <Stat label={t('Сумма продаж')} value={money(data.totals.salesTotal)} />
            <Stat label={t('Услуги (его заработок)')} value={money(data.totals.amount)} />
            <Stat label={t('Доля компании (в продажах)')} value={money(data.totals.companyAmount)} />
          </div>

          {data.data.length === 0 ? (
            <EmptyState icon={Wrench} title={t('За период продаж нет')} />
          ) : (
            <Card padded={false}>
              <ul className="m-0 list-none divide-y divide-line p-0">
                {data.data.map((sale) => {
                  const products = sale.items
                    .map((item) => `${item.name ?? t('Товар удалён')} × ${item.quantity}`)
                    .join(', ')
                  return (
                    <li key={sale.saleId} className="flex flex-col gap-1 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                        <span className="font-medium text-fg">{t('Продажа #{id}', { id: sale.saleId })}</span>
                        <span className="text-[11px] text-subtle">{new Date(sale.date).toLocaleString('uz')}</span>
                        {sale.customer?.name && <span className="text-muted">· {sale.customer.name}</span>}
                        <span className="ml-auto flex items-center gap-4 tabular-nums">
                          <span className="text-muted">
                            {t('Сумма продажи')}: <span className="text-fg">{money(sale.saleTotal)}</span>
                          </span>
                          {sale.companyAmount > 0 && (
                            <span className="text-muted">
                              {t('Доля компании')}: <span className="text-fg">{money(sale.companyAmount)}</span>
                            </span>
                          )}
                          <span className="font-semibold text-fg">{money(sale.amount)}</span>
                        </span>
                      </div>
                      <p className="m-0 text-[12px] leading-snug text-muted" title={products}>
                        {products || '—'}
                        {sale.note && <span className="ml-2 text-subtle">({sale.note})</span>}
                      </p>
                    </li>
                  )
                })}
              </ul>
              {data.meta.totalPages > 1 && (
                <div className="flex justify-center border-t border-line p-2">
                  <CustomPaginationScreen active={page} pageCount={data.meta.totalPages} setActive={setPage} />
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}

/**
 * "Услуги мастеров": ustalarga beriladigan haqlar. Bu summalar savdo summasi, foyda va hisobotlarga kirmaydi —
 * shu yerda alohida hisoblanadi. Xizmatdan kompaniya ulushi esa savdo summasida (bu yerda faqat ma'lumot uchun).
 * Ro'yxat (qidiruv, sana oralig'i, sahifalash) → usta tafsiloti.
 */
function MasterFeesPanel() {
  const [start, setStart] = useState(monthStart)
  const [end, setEnd] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (openId !== null) return undefined
    let cancelled = false
    getMasterFeeSummary(page, 10, debounced, start, end)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError('')
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [page, debounced, start, end, openId])

  if (openId !== null) {
    return (
      <MasterDetail
        masterId={openId}
        start={start}
        end={end}
        onStart={setStart}
        onEnd={setEnd}
        onBack={() => setOpenId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Filters
        search={search}
        onSearch={setSearch}
        start={start}
        end={end}
        onStart={(value) => {
          setPage(1)
          setStart(value)
        }}
        onEnd={(value) => {
          setPage(1)
          setEnd(value)
        }}
      />

      <Alert variant="info">
        {t('Услуги мастеров не входят в сумму продаж и прибыль — это деньги мастеров, они считаются отдельно.')}{' '}
        {t('Доля компании из услуги (если указана) входит в сумму продажи.')}
      </Alert>

      {error && <Alert variant="danger">{error}</Alert>}

      {!data ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={t('Мастеров')} value={data.totals.masters} />
            <Stat label={t('Продаж')} value={data.totals.sales} />
            <Stat label={t('Итого мастерам:')} value={money(data.totals.amount)} />
            <Stat label={t('Доля компании (в продажах)')} value={money(data.totals.companyAmount)} />
          </div>

          {data.data.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title={t('Услуг мастеров за период нет')}
              description={t('Услугу мастера добавляют при оформлении продажи — в списке товаров.')}
            />
          ) : (
            <Card padded={false}>
              <ul className="m-0 list-none divide-y divide-line p-0">
                {data.data.map((master) => (
                  <li key={master.masterId ?? 'none'}>
                    <button
                      type="button"
                      onClick={() => master.masterId && setOpenId(master.masterId)}
                      disabled={!master.masterId}
                      className="group flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-surface-2 disabled:cursor-default"
                    >
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
                        <UserRound className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-fg">{personName(master)}</span>
                        {master.phone && <span className="block text-[11px] text-subtle">{master.phone}</span>}
                      </span>
                      <span className="text-[12px] text-muted">
                        {t('Продаж: {count}', { count: master.sales })}
                      </span>
                      <span className="min-w-32 text-right text-[12px] tabular-nums text-muted">
                        {t('Сумма продаж')}: <span className="text-fg">{money(master.salesTotal)}</span>
                      </span>
                      {master.companyAmount > 0 && (
                        <span className="text-right text-[12px] tabular-nums text-muted">
                          {t('Доля компании')}: <span className="text-fg">{money(master.companyAmount)}</span>
                        </span>
                      )}
                      <span className="min-w-28 text-right text-[13px] font-semibold tabular-nums text-fg">
                        {money(master.amount)}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" />
                    </button>
                  </li>
                ))}
              </ul>
              {data.meta.totalPages > 1 && (
                <div className="flex justify-center border-t border-line p-2">
                  <CustomPaginationScreen active={page} pageCount={data.meta.totalPages} setActive={setPage} />
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default MasterFeesPanel
