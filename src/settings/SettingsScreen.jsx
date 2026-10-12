import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ListChecks, Palette, SlidersHorizontal } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button, Container, EmptyState } from '../ui'
import { NavbarScreen } from '../navbar/NavbarContent'
import { isAdminRole } from '../users/roles'
import MenuAccessSettings from './MenuAccessSettings'
import AppearanceSettings from './AppearanceSettings'
import { t } from '../i18n'

const SECTIONS = [
  {
    key: 'menu',
    label: t('Доступ к меню'),
    hint: t('Кому какие разделы видны'),
    Icon: ListChecks,
    Component: MenuAccessSettings,
  },
  {
    key: 'appearance',
    label: t('Внешний вид'),
    hint: t('Цвета системы'),
    Icon: Palette,
    Component: AppearanceSettings,
  },
]

/**
 * "Настройки" — alohida sahifa (faqat administrator). Bo'lim URL da saqlanadi (`?tab=`):
 * sahifani yangilash yoki havolani yuborish aynan shu bo'limni ochadi.
 */
function SettingsScreen() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const signedIn = Boolean(localStorage.getItem('userid'))
  const admin = isAdminRole()

  useEffect(() => {
    if (!signedIn) navigate('/login')
  }, [signedIn, navigate])

  if (signedIn && !admin) {
    return (
      <div className="min-h-svh">
        <NavbarScreen />
        <Container className="py-10">
          <EmptyState
            icon={SlidersHorizontal}
            title={t('Недостаточно прав')}
            description={t('Настройки доступны только администратору.')}
            action={
              <Button as={Link} to="/home" variant="outline-primary">
                <ArrowLeft />
                {t('Вернуться в систему')}
              </Button>
            }
          />
        </Container>
      </div>
    )
  }

  const active = SECTIONS.find((section) => section.key === params.get('tab')) ?? SECTIONS[0]
  const Section = active.Component

  return (
    <div className="min-h-svh">
      <NavbarScreen />
      <Container size="full" className="flex flex-col gap-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-fg">{t('Настройки')}</h1>
              <p className="mt-0.5 text-xs text-subtle">{t('Параметры системы для всех сотрудников')}</p>
            </div>
          </div>
          <Button as={Link} to="/home" variant="outline-secondary" size="sm">
            <ArrowLeft />
            {t('В систему')}
          </Button>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav
            aria-label={t('Разделы настроек')}
            className="flex gap-1 overflow-x-auto rounded-card border border-line bg-surface p-1.5 shadow-soft lg:flex-col lg:overflow-visible"
          >
            {SECTIONS.map((section) => {
              const { Icon } = section
              const current = section.key === active.key
              return (
                <button
                  key={section.key}
                  type="button"
                  aria-current={current ? 'page' : undefined}
                  onClick={() => setParams({ tab: section.key }, { replace: true })}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left transition',
                    current ? 'bg-primary-soft text-primary-soft-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium">{section.label}</span>
                    <span className="hidden truncate text-[11px] opacity-70 lg:block">{section.hint}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          {/* key: bo'lim almashganda holat (tahrir qilinayotgan qoralama) tozalanadi. */}
          <div className="min-w-0">
            <Section key={active.key} />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default SettingsScreen
export { SettingsScreen }
