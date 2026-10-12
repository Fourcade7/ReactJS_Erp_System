import { useEffect, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { cn } from '../lib/cn'
import { Alert, Badge, Button, Card, Form, Spinner } from '../ui'
import { useTheme } from '../theme/ThemeProvider'
import {
  ACCENTS,
  DEFAULT_ACCENT,
  clearPreview,
  previewAccent,
  primaryColor,
  saveAppearance,
  useAppearance,
} from '../theme/appearance'
import { t } from '../i18n'

/**
 * "Внешний вид" (faqat administrator): tizimning asosiy rangi. Tanlangan rang darrov shu sahifada
 * ko'rinadi (faqat sizda), "Сохранить" bosilgach hamma foydalanuvchida o'zgaradi.
 */
function AppearanceSettings() {
  const { accent, saved } = useAppearance()
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Saqlanmagan ko'rinish sahifadan chiqilganda qaytadi.
  useEffect(() => clearPreview, [])

  const dirty = accent !== saved

  const choose = (key) => {
    setDone(false)
    setError('')
    previewAccent(key)
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await saveAppearance(accent)
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
          <Card.Title>{t('Цветовая схема системы')}</Card.Title>
          <Card.Subtitle className="mt-0.5">
            {t('Выберите основной цвет: он заменит акцентный цвет кнопок, выделений, ссылок и тон фона у всех сотрудников.')}
          </Card.Subtitle>
        </div>
      </Card.Header>

      <Card.Body className="flex flex-col gap-5">
        {error && <Alert variant="danger">{error}</Alert>}
        {done && <Alert variant="success">{t('Сохранено. У сотрудников цвет обновится в течение минуты.')}</Alert>}

        <div
          role="radiogroup"
          aria-label={t('Основной цвет')}
          className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-5"
        >
          {ACCENTS.map((item) => {
            const active = item.key === accent
            return (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={active}
                data-accent={item.key}
                onClick={() => choose(item.key)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
                  active
                    ? 'border-primary bg-primary-soft'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2',
                )}
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg shadow-soft min-[480px]:size-10"
                  style={{ backgroundColor: primaryColor(item.key, mode), color: mode === 'dark' ? 'oklch(0.15 0.02 0)' : '#fff' }}
                >
                  {active && <Check className="size-5" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block break-words text-[13px] font-medium leading-snug text-fg">{item.name}</span>
                  <span className="block break-words text-[11px] leading-snug text-subtle">
                    {item.key === saved
                      ? t('Сейчас в системе')
                      : item.key === DEFAULT_ACCENT
                        ? t('По умолчанию')
                        : ' '}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{t('Предпросмотр')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button>{t('Основная')}</Button>
            <Button variant="outline-primary">{t('Контурная')}</Button>
            <Button variant="ghost">{t('Прозрачная')}</Button>
            <Badge bg="primary">{t('Новая')}</Badge>
            <Form.Check type="switch" defaultChecked label={t('Включено')} />
            <Form.Check type="checkbox" defaultChecked label={t('Выбрано')} />
            <span className="text-[13px] font-medium text-primary">{t('Ссылка')}</span>
          </div>
        </div>

        <p className="text-[12px] text-subtle">
          {t('Цвета статусов (успех, предупреждение, ошибка) не меняются — они несут смысл. Светлая и тёмная темы работают с любым цветом.')}
        </p>
      </Card.Body>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-b-card border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <Button
          variant="ghost"
          className="mr-auto"
          disabled={busy || accent === DEFAULT_ACCENT}
          onClick={() => choose(DEFAULT_ACCENT)}
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

export default AppearanceSettings
export { AppearanceSettings }
