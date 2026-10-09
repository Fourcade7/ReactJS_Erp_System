/**
 * "Uxlayapti" belgisi (💤): lucide-react'da bunday ikonka yoʻq, shuning uchun
 * lucide uslubida (24×24, 2px chiziq, yumaloq uchlar) chizilgan. `className` orqali
 * oʻlcham va rang beriladi: `<ZzzIcon className="size-8 text-muted" />`.
 */
function ZzzIcon({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M3 12h8l-8 9h8" />
      <path d="M14 4h6l-6 7h6" />
      <path d="M19.5 14.5H23l-3.5 4H23" />
    </svg>
  )
}

export default ZzzIcon
export { ZzzIcon }
