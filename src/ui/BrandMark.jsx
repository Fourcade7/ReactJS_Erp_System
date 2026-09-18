import { cn } from '../lib/cn'
import logo from '../assets/idgroup-logo.png'

/** ID GROUP logotipi. `public/favicon.png` va desktop ilova ikonkasi ham shu rasmdan. */
function BrandMark({ className, title }) {
  return (
    <img
      src={logo}
      alt={title ?? ''}
      aria-hidden={title ? undefined : 'true'}
      className={cn('size-8 shrink-0 rounded-lg shadow-soft', className)}
    />
  )
}

export default BrandMark
export { BrandMark }
