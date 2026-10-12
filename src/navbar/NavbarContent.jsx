import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LifeBuoy, LogOut, Menu, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react'
import { BrandMark, Button, Container, Dropdown, LanguageToggle, ThemeToggle } from '../ui'
import ServerSettings from './ServerSettings'
import SupportDialog from './SupportDialog'
import ProfileDialog from './ProfileDialog'
import { isAdminRole } from '../users/roles'
import { clearLocalData } from '../config/api'
import { t } from '../i18n'

/** Brend belgisi — logotip va nom. */
function Brand({ to = '/', subtitle }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <BrandMark className="transition-transform duration-150 group-hover:scale-105" />
      <span className="hidden leading-tight min-[420px]:block">
        <span className="block text-[13px] font-semibold tracking-tight text-fg">
          5858 UZ
        </span>
        <span className="block text-[10px] uppercase tracking-[0.14em] text-subtle">
          {subtitle ?? 'ERP System'}
        </span>
      </span>
    </Link>
  )
}

function initialsOf(name = '', surname = '') {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || 'U'
}

/**
 * Ilova ichidagi yuqori panel. Yopishqoq, shaffof-xira fonli va
 * sahifaning markazlashgan kengligiga moslashgan.
 */
function NavbarScreen({ onMenuClick }) {
  const navigate = useNavigate()
  const onSettings = useLocation().pathname === '/settings'
  const [showSupport, setShowSupport] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  // Profilda ism o'zgarsa panelda darrov ko'rinadi (qiymat localStorage da ham yangilanadi).
  const [name, setName] = useState(() => ({
    username: localStorage.getItem('username') || '',
    surname: localStorage.getItem('surname') || '',
  }))
  const username = name.username || t('Пользователь')
  const surname = name.surname
  const role = localStorage.getItem('role') || '—'
  const admin = isAdminRole()

  const handleProfileSaved = (profile) => {
    localStorage.setItem('username', profile.username)
    localStorage.setItem('surname', profile.surname)
    setName({ username: profile.username, surname: profile.surname })
  }

  return (
    <header className="sticky top-0 z-[1030] border-b border-line bg-app/80 backdrop-blur-xl">
      <Container size="full" className="flex h-14 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t('Открыть меню')}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        )}

        <Brand to="/home" />

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <button
            type="button"
            onClick={() => setShowSupport(true)}
            className="rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            {t('Поддержка')}
          </button>
          <a
            href="#plans"
            className="rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            {t('Планы')}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ServerSettings />

          <LanguageToggle />

          <ThemeToggle className="hidden sm:inline-flex" />
          <ThemeToggle compact className="sm:hidden" />

          <Dropdown>
            <Dropdown.Toggle
              as="div"
              className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2 transition hover:bg-surface-2"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-fg">
                {initialsOf(username, surname)}
              </span>
              <span className="hidden max-w-32 truncate text-[13px] font-medium text-fg sm:block">
                {username} {surname}
              </span>
              <ChevronDown className="size-3.5 text-subtle" />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end" className="min-w-56">
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-fg">
                  {initialsOf(username, surname)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-fg">
                    {username} {surname}
                  </p>
                  <p className="truncate text-[11px] text-subtle">{t('Роль: {role}', { role })}</p>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowProfile(true)}>
                <UserRound /> {t('Профиль')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowSupport(true)}>
                <LifeBuoy /> {t('Поддержка')}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                variant="danger"
                onClick={() => {
                  clearLocalData()
                  navigate('/login')
                }}
              >
                <LogOut /> {t('Выйти')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Sozlamalar sahifasi (menyu ruxsati, tizim rangi) — faqat administrator, panelning eng chetida. */}
          {admin && (
            <Button
              as={Link}
              to="/settings"
              variant={onSettings ? 'secondary' : 'ghost'}
              size="sm"
              title={t('Настройки')}
              aria-label={t('Настройки')}
              aria-current={onSettings ? 'page' : undefined}
              className="gap-1.5"
            >
              <SlidersHorizontal />
              <span className="hidden lg:inline">{t('Настройки')}</span>
            </Button>
          )}
        </div>
      </Container>

      <SupportDialog show={showSupport} onHide={() => setShowSupport(false)} />
      {showProfile && <ProfileDialog onHide={() => setShowProfile(false)} onSaved={handleProfileSaved} />}
    </header>
  )
}

/** Kirish/roʻyxatdan oʻtish sahifalari uchun soddalashtirilgan panel. */
function NavbarScreenFourAuth() {
  return (
    <header className="sticky top-0 z-[1030] border-b border-line bg-app/80 backdrop-blur-xl">
      <Container className="flex h-14 items-center gap-3">
        <Brand to="/" subtitle="ID Group" />
        <div className="ml-auto flex items-center gap-2">
          <ServerSettings />
          <LanguageToggle />
          <ThemeToggle compact />
          <Button as={Link} to="/register" variant="outline-primary" size="sm" aria-label={t('Регистрация')}>
            <Sparkles />
            <span className="hidden sm:inline">{t('Регистрация')}</span>
          </Button>
        </div>
      </Container>
    </header>
  )
}

export { NavbarScreenFourAuth, NavbarScreen, Brand }
