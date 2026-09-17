import { useEffect, useState } from 'react'
import { Barcode, PackageSearch, Plus, Warehouse } from 'lucide-react'
import { cn } from '../lib/cn'
import { EmptyState, OverlayTrigger, SearchField, Spinner, Tooltip } from '../ui'
import placeholderImage from '../assets/placeholder.jpg'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { ResultModal } from '../utils/StatusModals'
import { stockOf } from './pricing'

/**
 * Savatga qoʻshish uchun mahsulot tanlagich.
 *
 * - `limitByStock` — savdoda qoldiqdan ortiq qoʻshib boʻlmaydi;
 * - `onlyStocked` — faqat omborda yozuvi bor mahsulotlar koʻrsatiladi;
 * - `autoAddSingle` — qidiruv (masalan, shtrixkod skaneri) bitta natija qaytarsa,
 *   u darhol savatga tushadi.
 */
function ProductPicker({
  fetchProducts,
  setOrderList,
  priceField = 'buyPrice',
  limitByStock = false,
  onlyStocked = false,
  autoAddSingle = false,
}) {
  const [showLoad, setShowLoad] = useState(false)
  const [showRes, setShowRes] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [productList, setProductList] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [active, setActive] = useState(1)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  function addProductToOrder(product) {
    const stockQty = stockOf(product)
    if (limitByStock && stockQty <= 0) return

    setOrderList((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) => {
          if (item.id !== product.id) return item
          if (limitByStock && item.quantity >= stockQty) return item
          return { ...item, quantity: item.quantity + 1 }
        })
      }
      return [...prev, { ...product, quantity: 1, checkPrice: false }]
    })
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        setShowLoad(true)
        const page = await fetchProducts(active, 20, debouncedSearch)
        setPageCount(page.meta.totalPages)
        setProductList(page.data)
        setShowLoad(false)

        if (autoAddSingle && page.data.length === 1) {
          addProductToOrder(page.data[0])
          setSearchTerm('')
        }
      } catch (error) {
        console.log(error.message)
        setShowRes(true)
        setShowLoad(false)
      }
    }
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, debouncedSearch])

  const visible = onlyStocked ? productList.filter((p) => p.stock?.[0]?.id) : productList

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[13px] font-semibold text-fg">Товары</h3>
        {showLoad && <Spinner size="sm" />}
      </div>

      <SearchField
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setActive(1)
        }}
        onClear={() => setSearchTerm('')}
        placeholder="Название или штрихкод..."
      />

      {visible.length === 0 && !showLoad ? (
        <EmptyState icon={PackageSearch} title="Ничего не найдено" className="py-8" />
      ) : (
        <ul className="m-0 max-h-[60vh] list-none divide-y divide-line overflow-y-auto rounded-card border border-line bg-surface p-0 shadow-soft">
          {visible.map((product) => {
            const totalStock = stockOf(product)
            const blocked = limitByStock && totalStock <= 0
            const image = product.imgUrl ? product.imgUrl : placeholderImage

            return (
              <li key={product.id}>
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => addProductToOrder(product)}
                  className="group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip className="p-1">
                        <img
                          src={image}
                          alt={product.name}
                          className="size-[200px] rounded-lg object-cover"
                        />
                      </Tooltip>
                    }
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-9 shrink-0 rounded-lg border border-line object-cover"
                    />
                  </OverlayTrigger>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-fg">
                      {product.name}
                    </p>
                    <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-subtle">
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono">
                        <Barcode className="size-3" />
                        {product.barCode}
                      </span>
                      {product.stock?.length > 0 && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Warehouse className="size-3 shrink-0" />
                          <span className="truncate">
                            {product.stock.map((s) => s.warehouse?.name).join(', ')}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-[13px] font-semibold tabular-nums text-fg">
                      {Number(product[priceField] || 0).toLocaleString('uz')}
                    </span>
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        totalStock < 10 ? 'text-danger-soft-fg' : 'text-subtle',
                      )}
                    >
                      {totalStock} {product.unit}
                    </span>
                  </div>

                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-subtle transition group-hover:bg-primary group-hover:text-primary-fg">
                    <Plus className="size-3.5" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex justify-center pt-1">
        <CustomPaginationScreen active={active} pageCount={pageCount} setActive={setActive} />
      </div>

      <ResultModal
        show={showRes}
        onHide={() => setShowRes(false)}
        success={false}
        message="Не удалось подключиться к серверу"
      />
    </section>
  )
}

export default ProductPicker
