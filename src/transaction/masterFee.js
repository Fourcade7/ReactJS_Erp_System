import { useEffect, useState } from 'react'
import { getTaskMembers } from '../task/TaskApi'

/** Usta — `Master` rolidagi xodim (Android ilovaga kiradiganlar). */
export const isMaster = (user) => `${user?.role ?? ''}`.trim().toLowerCase() === 'master'

/** "520 000" yoki "520000" → 520000 (butun son; noto'g'ri bo'lsa NaN). */
export const parseSum = (value) => Math.round(Number(`${value}`.replace(/\s/g, '').replace(',', '.')))

export const personName = (user) => `${user?.username ?? ''} ${user?.surname ?? ''}`.trim()

/**
 * Kassir ikkala summani alohida yozadi — hech biri ikkinchisidan ayirilmaydi: `amount` ustaga (savdo summasiga
 * kirmaydi), `companyAmount` kompaniyaga (savdo summasiga qo'shiladi). Maydonlar majburiy emas: bo'sh — 0, ikkalasi
 * bo'sh bo'lsa ham usta savdoga 0 / 0 bilan bog'lanadi. Faqat butun va manfiy bo'lmasligi shart (backend ham tekshiradi).
 * Masalan, ustaga 500 000 va kompaniyaga 20 000 → mijoz xizmat uchun jami 520 000 to'laydi.
 */
export function readFee(masterInput, companyInput) {
  const amount = `${masterInput}`.trim() === '' ? 0 : parseSum(masterInput)
  const companyAmount = `${companyInput}`.trim() === '' ? 0 : parseSum(companyInput)
  const valid = Number.isFinite(amount) && amount >= 0 && Number.isFinite(companyAmount) && companyAmount >= 0
  return { amount, companyAmount, total: amount + companyAmount, valid }
}

/** Xodimlar ro'yxati (`/task/members`: id, ism, rol) — usta va sotuvchi tanlovlari uchun, bir marta yuklanadi. */
export function useMembers(enabled = true) {
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    getTaskMembers()
      .then((list) => {
        if (!cancelled) setMembers(list ?? [])
      })
      .catch((e) => console.log(e.message))
    return () => {
      cancelled = true
    }
  }, [enabled])

  return members
}
