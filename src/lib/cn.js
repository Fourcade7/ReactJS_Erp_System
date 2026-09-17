import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Shartli sinflarni birlashtiradi va Tailwind ziddiyatlarini yechadi. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
