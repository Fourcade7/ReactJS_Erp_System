import { useEffect, useState } from 'react'

/**
 * `key` o'zgarganda `fetcher()` ni chaqiradi. Eski javob kech kelsa yangisini bosib ketmaydi.
 * Qayta yuklanayotganda oldingi `data` saqlanadi (sahifa sakramaydi), `loading` esa `true`.
 * `key === null` — so'rov yuborilmaydi.
 */
export function useRequest(fetcher, key) {
  const [state, setState] = useState({ key: null, data: undefined, error: null })

  useEffect(() => {
    if (key === null) return undefined
    let stale = false
    fetcher()
      .then((data) => !stale && setState({ key, data, error: null }))
      .catch((error) => !stale && setState((prev) => ({ key, data: prev.data, error })))
    return () => {
      stale = true
    }
    // So'rov faqat kalit o'zgarganda qayta yuboriladi — `fetcher` har renderda yangi funksiya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return {
    data: state.data,
    error: state.error,
    loading: key !== null && state.key !== key,
  }
}
