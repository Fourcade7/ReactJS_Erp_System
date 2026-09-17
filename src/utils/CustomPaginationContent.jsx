import { Pagination } from '../ui'

/**
 * Mavjud ekranlardagi `active` / `setActive` API sini saqlab qolgan qobiq.
 * Koʻrinish va mantiq `ui/Pagination` da.
 */
function CustomPaginationScreen({ active, pageCount, setActive, className }) {
  return (
    <Pagination
      page={active}
      pageCount={pageCount}
      onChange={setActive}
      className={className}
    />
  )
}

export default CustomPaginationScreen
