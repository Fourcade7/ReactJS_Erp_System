import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '../lib/cn'
import { useTheme } from '../theme/ThemeProvider'
import { t } from '../i18n'

const options = [
  { value: 'light', label: t('Светлая'), Icon: Sun },
  { value: 'dark', label: t('Тёмная'), Icon: Moon },
  { value: 'system', label: t('Системная'), Icon: Monitor },
]

/**
 * Uch holatli tema almashtirgichi: yorugʻ / qorongʻi / tizim.
 * `compact` rejimida faqat ikkita holat orasida almashadigan bitta tugma boʻladi.
 */
function ThemeToggle({ compact = false, className }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  if (compact) {
    const isDark = resolvedTheme === 'dark'
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? t('Включить светлую тему') : t('Включить тёмную тему')}
        title={isDark ? t('Светлая тема') : t('Тёмная тема')}
        className={cn(
          'relative inline-flex size-9 items-center justify-center overflow-hidden rounded-lg',
          'border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg',
          className,
        )}
      >
        <Sun
          className={cn(
            'absolute size-4 transition-all duration-300',
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
          )}
        />
        <Moon
          className={cn(
            'absolute size-4 transition-all duration-300',
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
          )}
        />
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('Тема оформления')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5',
        className,
      )}
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-[7px] transition-all duration-150',
            theme === value
              ? 'bg-surface text-fg shadow-soft'
              : 'text-subtle hover:text-fg',
          )}
        >
          <Icon className="size-3.5" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle
export { ThemeToggle }
