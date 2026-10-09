import { cn } from '../lib/cn'
import { LANGUAGES, lang, setLanguage, t } from '../i18n'

/**
 * Interfeys tili almashtirgichi: RU | UZ. Tanlov saqlanadi, sahifa qayta yuklanadi
 * (shunda barcha matnlar, sana va raqam formatlari bir vaqtda almashadi).
 * Tor ekranda (sm dan kichik) bitta ixcham tugma: joriy til kodi, bosilsa — keyingisiga oʻtadi.
 */
function LanguageToggle({ className }) {
  const next = LANGUAGES.find((item) => item.code !== lang)

  return (
    <>
      <div
        role="radiogroup"
        aria-label={t('Язык интерфейса')}
        className={cn(
          'hidden items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5 sm:inline-flex',
          className,
        )}
      >
        {LANGUAGES.map(({ code, label, name }) => (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={lang === code}
            title={name}
            onClick={() => setLanguage(code)}
            className={cn(
              'inline-flex h-7 min-w-8 items-center justify-center rounded-[7px] px-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150',
              lang === code ? 'bg-surface text-fg shadow-soft' : 'text-subtle hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLanguage(next.code)}
        aria-label={`${t('Язык интерфейса')}: ${next.name}`}
        title={next.name}
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-[11px] font-semibold tracking-wide text-muted',
          'transition-colors hover:bg-surface-2 hover:text-fg sm:hidden',
          className,
        )}
      >
        {LANGUAGES.find((item) => item.code === lang).label}
      </button>
    </>
  )
}

export default LanguageToggle
export { LanguageToggle }
