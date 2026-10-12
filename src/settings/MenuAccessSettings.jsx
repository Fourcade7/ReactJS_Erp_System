import { Fragment, useMemo, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Alert, Button, Card, Form, Spinner, Table } from '../ui'
import { saveMenuAccess, useMenuAccess } from '../main/menuAccess'
import { ACCESS_ROLES, NAV_GROUPS, defaultVisible, isVisible } from '../main/menuItems'
import { t } from '../i18n'

/** Hozirgi ko'rinish: `{ rol: { kalit: true|false } }` (standart + administrator belgilaganlar). */
function currentMatrix(overrides) {
  const matrix = {}
  for (const role of ACCESS_ROLES) {
    matrix[role.key] = {}
    for (const group of NAV_GROUPS) {
      for (const item of group.items) matrix[role.key][item.key] = isVisible(role.key, item, overrides)
    }
  }
  return matrix
}

function defaultMatrix() {
  return currentMatrix({})
}

/** Faqat standartdan farq qiladiganlarini yuboramiz: yangi bo'limlar o'z standartini oladi. */
function toOverrides(matrix) {
  const overrides = {}
  for (const role of ACCESS_ROLES) {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (matrix[role.key][item.key] !== defaultVisible(role.key, item)) {
          overrides[role.key] = { ...overrides[role.key], [item.key]: matrix[role.key][item.key] }
        }
      }
    }
  }
  return overrides
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * "Доступ к разделам меню" (faqat administrator): chap menyudagi bo'limlar kimga ko'rinishini belgilaydi.
 * Belgisi olingan bo'lim menyudan butunlay yo'qoladi (administrator hammasini ko'radi).
 */
function MenuAccessSettings() {
  // Bo'lim ochilganda mount bo'ladi: serverdan so'nggi sozlama olinadi, boshqa bo'limga o'tilsa holat tozalanadi.
  const { overrides, loaded } = useMenuAccess()
  const saved = useMemo(() => currentMatrix(overrides), [overrides])
  // Sozlama serverdan kelgach (yoki saqlangach) jadval shundan boshlanadi; tahrir shu yerda.
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const matrix = draft ?? saved
  const dirty = !same(matrix, saved)

  const toggle = (roleKey, itemKey) => {
    setDone(false)
    setDraft((current) => {
      const base = current ?? saved
      return { ...base, [roleKey]: { ...base[roleKey], [itemKey]: !base[roleKey][itemKey] } }
    })
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await saveMenuAccess(toOverrides(matrix))
      setDraft(null)
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card padded={false}>
      <Card.Header>
        <div className="min-w-0">
          <Card.Title>{t('Доступ к разделам меню')}</Card.Title>
          <Card.Subtitle className="mt-0.5">
            {t('Снимите галочку — раздел полностью исчезнет из меню у этой роли. Администратор видит все разделы.')}
          </Card.Subtitle>
        </div>
      </Card.Header>

      <Card.Body className="flex flex-col gap-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {done && <Alert variant="success">{t('Сохранено. У сотрудников меню обновится в течение минуты.')}</Alert>}

        {!loaded && !draft ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>{t('Раздел')}</th>
                <th className="text-center">
                  Admin
                  <span className="block text-[10px] font-normal normal-case tracking-normal text-subtle">
                    {t('администратор')}
                  </span>
                </th>
                {ACCESS_ROLES.map((role) => (
                  <th key={role.key} className="text-center">
                    {role.name}
                    <span className="block text-[10px] font-normal normal-case tracking-normal text-subtle">
                      {role.hint}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAV_GROUPS.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-surface-2/60">
                    <td colSpan={2 + ACCESS_ROLES.length} className="py-1.5! text-[11px] font-semibold uppercase tracking-wider text-subtle">
                      {group.label}
                    </td>
                  </tr>
                  {group.items.map((item) => {
                    const { Icon } = item
                    return (
                      <tr key={item.key}>
                        <td>
                          <span className="inline-flex items-center gap-2 font-medium text-fg">
                            <Icon className="size-4 text-subtle" />
                            {item.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            title={t('Администратор видит всё')}
                            className="inline-flex size-5 items-center justify-center rounded-md bg-success-soft text-success-soft-fg"
                          >
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                        </td>
                        {ACCESS_ROLES.map((role) => (
                          <td key={role.key} className="text-center">
                            <span className="inline-flex justify-center">
                              <Form.Check
                                type="checkbox"
                                aria-label={`${item.label} — ${role.name}`}
                                checked={matrix[role.key][item.key]}
                                onChange={() => toggle(role.key, item.key)}
                              />
                            </span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </Table>
        )}

        <p className="text-[12px] text-subtle">
          {t('Это настройка меню. Права на сами действия (например, создание задач) определяются ролью и сервером.')}
        </p>
      </Card.Body>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-b-card border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <Button
          variant="ghost"
          className="mr-auto"
          disabled={busy || same(matrix, defaultMatrix())}
          onClick={() => {
            setDone(false)
            setDraft(defaultMatrix())
          }}
        >
          <RotateCcw />
          {t('Сбросить по умолчанию')}
        </Button>
        <Button onClick={submit} disabled={busy || !dirty}>
          {busy && <Spinner size="sm" />}
          {t('Сохранить')}
        </Button>
      </div>
    </Card>
  )
}

export default MenuAccessSettings
export { MenuAccessSettings }
