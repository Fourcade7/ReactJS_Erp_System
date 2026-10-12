import { useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Form, Spinner } from '../ui'
import { t } from '../i18n'
import { fullName, roleLabel } from './taskView'

const MIN_QUERY = 2
const LIMIT = 6
const NONE = []

/** Kichik harf, bir xil apostrof va ortiqcha bo'shliqsiz ("Bo'sh" = "Boʻsh"). */
const norm = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[’ʻʼ‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Xodimlarni qidirib tanlash (bir nechta). Ro'yxat ochilmaydi: faqat qidiruv bo'yicha (kamida 2 belgi)
 * eng ko'pi bilan {LIMIT} ta natija chiqadi, tanlanganlar chip bo'lib turadi. Shu sababli xodim ko'p bo'lsa ham
 * oyna kattalashmaydi.
 *
 *  - `members` — tanlash mumkin bo'lgan xodimlar ({ id, username, surname, role });
 *  - `known` — qo'shimcha ma'lum xodimlar (ro'yxatda yo'q, lekin allaqachon biriktirilganlar);
 *  - `value` — tanlanganlar id lari, `onChange(ids)`;
 *  - `exclude` — ro'yxatdan chiqarib tashlanadigan id (masalan, javobgar).
 */
function MemberPicker({ members, known = NONE, value, onChange, exclude = null }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef(null)

  const byId = useMemo(() => new Map([...known, ...members].map((user) => [user.id, user])), [known, members])
  const chosen = useMemo(() => value.filter((id) => id !== exclude).map((id) => byId.get(id)).filter(Boolean), [value, exclude, byId])

  const query = norm(search)
  const searching = query.length >= MIN_QUERY

  const matches = useMemo(() => {
    if (query.length < MIN_QUERY) return []
    const words = query.split(' ')
    const found = []
    for (const member of members) {
      if (member.id === exclude) continue
      const name = norm(fullName(member))
      if (words.every((word) => `${name} ${norm(roleLabel(member.role))}`.includes(word))) {
        // ismi so'rov bilan boshlanadiganlar oldinda turadi
        found.push({ member, rank: name.startsWith(query) || name.split(' ').some((part) => part.startsWith(words[0])) ? 0 : 1 })
      }
    }
    return found.sort((a, b) => a.rank - b.rank).map((item) => item.member)
  }, [members, exclude, query])

  const available = matches.filter((member) => !value.includes(member.id))
  const shown = available.slice(0, LIMIT)
  const current = Math.min(active, Math.max(shown.length - 1, 0))

  if (members.length === 0) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">{t('Соисполнители')}</p>
        <Spinner size="sm" />
      </div>
    )
  }

  const openList = () => {
    // Ro'yxat pastda sig'masa, maydon tepasiga ochiladi (modal pastki qismida turadi).
    const rect = box.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setUp(below < 320 && rect.top > below)
    }
    setOpen(true)
  }

  const add = (id) => {
    onChange([...value, id])
    setSearch('')
    setActive(0)
    setOpen(false)
  }

  const remove = (id) => onChange(value.filter((item) => item !== id))

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(Math.min(current + 1, shown.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (open && shown[current]) add(shown[current].id)
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{t('Соисполнители')}</p>
        {chosen.length > 0 && (
          <span className="flex items-center gap-2 text-[11px] text-subtle">
            {t('Выбрано: {count}', { count: chosen.length })}
            <button type="button" onClick={() => onChange([])} className="font-medium text-primary hover:underline">
              {t('Убрать всех')}
            </button>
          </span>
        )}
      </div>

      <div ref={box} className="relative">
        <Form.Control
          value={search}
          placeholder={t('Имя или фамилия сотрудника…')}
          autoComplete="off"
          onFocus={openList}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setSearch(event.target.value)
            setActive(0)
            openList()
          }}
        />
        {open && (
          <ul
            className={cn(
              'absolute z-30 max-h-64 w-full list-none overflow-auto rounded-lg border border-line bg-surface p-1 shadow-pop',
              up ? 'bottom-full mb-1' : 'mt-1',
            )}
          >
            {!searching ? (
              <li className="px-3 py-2 text-xs text-subtle">{t('Начните вводить имя или фамилию')}</li>
            ) : matches.length === 0 ? (
              <li className="px-3 py-2 text-xs text-subtle">{t('Сотрудники не найдены')}</li>
            ) : available.length === 0 ? (
              <li className="px-3 py-2 text-xs text-subtle">{t('Все найденные сотрудники уже добавлены')}</li>
            ) : (
              shown.map((member, index) => (
                <li key={member.id}>
                  <button
                    type="button"
                    // mousedown: fokus yo'qolib ro'yxat yopilishidan oldin tanlov bajariladi.
                    onMouseDown={(event) => {
                      event.preventDefault()
                      add(member.id)
                    }}
                    onMouseEnter={() => setActive(index)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-fg',
                      index === current ? 'bg-surface-2' : 'hover:bg-surface-2',
                    )}
                  >
                    <span className="truncate">{fullName(member)}</span>
                    <span className="shrink-0 text-[11px] text-subtle">{roleLabel(member.role)}</span>
                  </button>
                </li>
              ))
            )}
            {searching && available.length > shown.length && (
              <li className="px-3 py-1.5 text-[11px] text-subtle">
                {t('Показаны первые {count} — уточните поиск', { count: shown.length })}
              </li>
            )}
          </ul>
        )}
      </div>

      {chosen.length > 0 && (
        // Tanlanganlar ko'p bo'lsa ham maydon o'sib ketmaydi: balandligi cheklangan, ichida skroll.
        <ul className="m-0 mt-2 flex max-h-24 list-none flex-wrap gap-1.5 overflow-y-auto p-0">
          {chosen.map((member) => (
            <li
              key={member.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface-2 py-0.5 pl-2.5 pr-1 text-[12px] text-fg"
            >
              <span className="min-w-0 truncate">{fullName(member)}</span>
              <span className="shrink-0 text-[10px] text-subtle">{roleLabel(member.role)}</span>
              <button
                type="button"
                aria-label={t('Убрать: {name}', { name: fullName(member) })}
                onClick={() => remove(member.id)}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-subtle transition hover:bg-danger-soft hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MemberPicker
export { MemberPicker }
