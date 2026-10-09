import { useEffect, useState } from 'react'
import { Barcode, PackageSearch, Plus, Warehouse } from 'lucide-react'
import { cn } from '../lib/cn'
import { EmptyState, Form, OverlayTrigger, SearchField, Spinner, Tooltip } from '../ui'
import { getAllCategory } from '../category/CategoryApi'
import placeholderImage from '../assets/placeholder.jpg'
import CustomPaginationScreen from '../utils/CustomPaginationContent'
import { ResultModal } from '../utils/StatusModals'
import { stockOf } from './pricing'
import { roundQty } from '../lib/quantity'

/**
 * Savatga qoʻshish uchun mahsulot tanlagich.
 *
 * - `onlyStocked` — faqat omborda yozuvi bor mahsulotlar koʻrsatiladi;
 * - `autoAddSingle` — kiritilgan matn mahsulot shtrixkodiga aynan teng boʻlsa
 *   (shtrixkod skaneri), u darhol savatga tushadi. Nom yozilganda ishlamaydi.
 */
function ProductPicker({
  fetchProducts,
  setOrderList,
  priceField = 'buyPrice',
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

  const [categoryList, setCategoryList] = useState([])
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategory()
        if (res.ok) setCategoryList(await res.json())
      } catch (error) {
        console.log(error.message)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setActive(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Qoldiqdan ortiq ham qoʻshiladi: savdo tugmasi (Checkout) ortiqcha miqdor
  // kamaytirilmaguncha bloklanadi.
  function addProductToOrder(product) {
    setOrderList((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: roundQty(item.quantity + 1) } : item,
        )
      }
      return [...prev, { ...product, quantity: 1, checkPrice: false }]
    })
  }

  useEffect(() => {
    // Keyinroq yuborilgan qidiruvning javobi oldinroq kelsa, eski javob
    // yangisining ustiga yozilmasin.
    let stale = false

    async function loadProducts() {
      try {
        setShowLoad(true)
        // `onlyStocked` backend da filtrlanadi — sahifalash faqat omborli tovarlar boʻyicha.
        const page = await fetchProducts(active, 20, debouncedSearch, categoryId, onlyStocked)
        if (stale) return
        setPageCount(page.meta.totalPages)
        setProductList(page.data)
        setShowLoad(false)

        // Faqat shtrixkod aynan mos kelsa (skaner). Nom yozilayotganda bitta natija
        // qolsa ham qoʻshilmaydi — aks holda tovar savatga oʻz-oʻzidan tushib,
        // qidiruv tozalanib ketadi.
        const code = debouncedSearch.trim().toLowerCase()
        const scanned =
          autoAddSingle && code
            ? page.data.find((p) => `${p.barCode ?? ''}`.trim().toLowerCase() === code)
            : null
        if (scanned) {
          addProductToOrder(scanned)
          setSearchTerm('')
        }
      } catch (error) {
        if (stale) return
        console.log(error.message)
        setShowRes(true)
        setShowLoad(false)
      }
    }
    loadProducts()
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, debouncedSearch, categoryId])

  const visible = onlyStocked ? productList.filter((p) => p.stock?.[0]?.id) : productList

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-[13px] font-semibold text-fg">Товары</h3>
        {showLoad && <Spinner size="sm" />}
      </div>

      <div className="flex gap-2">
        <SearchField
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setActive(1)
          }}
          onClear={() => setSearchTerm('')}
          placeholder="Название или штрихкод..."
          className="flex-1"
        />
        <div className="w-40 shrink-0">
          <Form.Select
            aria-label="Категория"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setActive(1)
            }}
          >
            <option value="">Все категории</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {visible.length === 0 && !showLoad ? (
        <EmptyState
          icon={PackageSearch}
          title="Ничего не найдено"
          description={
            onlyStocked
              ? 'Здесь показываются только товары, привязанные к складу. Добавьте их на склад в разделе «Продукты».'
              : undefined
          }
          className="py-8"
        />
      ) : (
        <ul className="m-0 max-h-[60vh] list-none divide-y divide-line overflow-y-auto rounded-card border border-line bg-surface p-0 shadow-soft">
          {visible.map((product) => {
            const totalStock = stockOf(product)
            const image = product.imgUrl ? product.imgUrl : placeholderImage

            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => addProductToOrder(product)}
                  className="group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2"
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
