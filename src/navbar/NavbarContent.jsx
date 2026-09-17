import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LifeBuoy, LogOut, Menu, Sparkles, UserRound } from 'lucide-react'
import { BrandMark, Button, Container, Dropdown, ThemeToggle } from '../ui'

/** Brend belgisi — logotip va nom. */
function Brand({ to = '/', subtitle }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <BrandMark className="transition-colors duration-150 group-hover:border-primary/40 group-hover:bg-primary-soft" />
      <span className="leading-tight">
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
  const username = localStorage.getItem('username') || 'Пользователь'
  const surname = localStorage.getItem('surname') || ''
  const role = localStorage.getItem('role') || '—'

  return (
    <header className="sticky top-0 z-[1030] border-b border-line bg-app/80 backdrop-blur-xl">
      <Container className="flex h-14 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Открыть меню"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-fg lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <Brand to="/home" />

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <a
            href="#support"
            className="rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            Поддержка
          </a>
          <a
            href="#plans"
            className="rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            Планы
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

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
                  <p className="truncate text-[11px] text-subtle">Роль: {role}</p>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item>
                <UserRound /> Профиль
              </Dropdown.Item>
              <Dropdown.Item>
                <LifeBuoy /> Поддержка
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                variant="danger"
                onClick={() => {
                  localStorage.clear()
                  navigate('/login')
                }}
              >
                <LogOut /> Выйти
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
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
          <ThemeToggle compact />
          <Button as={Link} to="/register" variant="outline-primary" size="sm">
            <Sparkles />
            Регистрация
          </Button>
        </div>
      </Container>
    </header>
  )
}

export { NavbarScreenFourAuth, NavbarScreen, Brand }
