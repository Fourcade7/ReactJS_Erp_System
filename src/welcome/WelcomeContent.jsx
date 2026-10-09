import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Boxes,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { NavbarScreenFourAuth } from '../navbar/NavbarContent'
import { Button, Container } from '../ui'
import { t } from '../i18n'

const FEATURES = [
  {
    Icon: Boxes,
    title: t('Складской учёт'),
    text: t('Остатки по складам обновляются автоматически при каждом приходе, продаже и возврате.'),
  },
  {
    Icon: ShoppingBag,
    title: t('Продажи и возвраты'),
    text: t('Оформление чека, печать документа и контроль долга покупателя в одном окне.'),
  },
  {
    Icon: Users,
    title: t('Клиенты и сотрудники'),
    text: t('Единая база контрагентов с ролями доступа и историей операций по каждому.'),
  },
  {
    Icon: Banknote,
    title: t('Платежи'),
    text: t('Приём оплат, частичное погашение и прозрачная картина дебиторской задолженности.'),
  },
  {
    Icon: BarChart3,
    title: t('Аналитика'),
    text: t('Выручка за день, неделю и месяц в наглядных графиках — без выгрузок в таблицы.'),
  },
  {
    Icon: PlugZap,
    title: t('Интеграции'),
    text: t('Подключение внешних сервисов и обмен данными через открытый программный интерфейс.'),
  },
]

const STATS = [
  { value: '12+', label: t('модулей учёта') },
  { value: '99.9%', label: t('доступность') },
  { value: '24/7', label: t('поддержка') },
]

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-muted shadow-soft">
            <ShieldCheck className="size-3.5 text-primary" />
            {t('Управление бизнесом в одной системе')}
          </span>

          <h1 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight text-fg sm:text-[42px]">
            {t('Добро пожаловать в')}{' '}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              {t('ERP-систему')}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-muted sm:text-sm">
            {t('ERP объединяет склад, продажи, закупки, финансы и кадры в единый контур. Продажа товара сразу обновляет остатки и финансовые отчёты — меньше ручной работы, меньше ошибок.')}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Button as={Link} to="/login" size="lg">
              {t('Начать работу')}
              <ArrowRight />
            </Button>
            <Button as="a" href="#features" variant="outline-secondary" size="lg">
              {t('Тарифы')}
            </Button>
          </div>

          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-line bg-surface/70 px-3 py-3 backdrop-blur-sm"
              >
                <dt className="text-lg font-semibold tracking-tight text-fg">{stat.value}</dt>
                <dd className="mt-0.5 text-[11px] text-subtle">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="absolute inset-x-8 -bottom-4 h-16 rounded-full bg-primary/20 blur-3xl" />
          <img
            src="https://static.vecteezy.com/system/resources/previews/024/218/792/non_2x/erp-enterprise-resource-planning-system-illustration-with-business-integration-productivity-and-company-enhancement-in-hand-drawn-templates-vector.jpg"
            alt={t('Схема работы ERP-системы')}
            width={700}
            height={700}
            loading="lazy"
            className="relative w-full rounded-2xl border border-line object-cover shadow-pop"
          />
        </div>
      </Container>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="border-b border-line">
      <Container className="py-16">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {t('Всё, что нужно для ежедневного учёта')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t('Каждый модуль работает с общими данными, поэтому отчёты сходятся без сверок между отделами.')}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="group rounded-card border border-line bg-surface p-4 shadow-soft transition-shadow duration-200 hover:shadow-raised"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary-soft">
                <Icon className="size-4" />
              </span>
              <h3 className="mt-3 text-[13px] font-semibold text-fg">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

function FooterScreen() {
  return (
    <footer>
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[13px] font-semibold text-fg">5858 UZ — ERP System</p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-subtle">
            {t('Учётная система для торговых и складских операций.')}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
            {t('Разделы')}
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-xs text-muted">
            <li>
              <Link to="/" className="transition hover:text-fg">
                {t('Главная')}
              </Link>
            </li>
            <li>
              <a href="#features" className="transition hover:text-fg">
                {t('Возможности')}
              </a>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-fg">
                {t('Вход в систему')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
            {t('Компания')}
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-xs text-muted">
            <li>
              <a href="#support" className="transition hover:text-fg">
                {t('Поддержка')}
              </a>
            </li>
            <li>
              <a href="#plans" className="transition hover:text-fg">
                {t('Тарифы')}
              </a>
            </li>
          </ul>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="sm:col-span-2 lg:col-span-1"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
            {t('Рассылка')}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder={t('Email адрес')}
              aria-label={t('Email адрес')}
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-xs text-fg outline-none transition placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
            />
            <Button type="submit" size="sm">
              {t('Подписаться')}
            </Button>
          </div>
        </form>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-[11px] text-subtle">
        <span>{t('© {year} ID Group. Все права защищены.', { year: new Date().getFullYear() })}</span>
        <span>{t('Сделано для эффективного учёта')}</span>
      </Container>
    </footer>
  )
}

function WelcomeScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('userid')) navigate('/home')
  }, [navigate])

  return (
    <div className="min-h-svh">
      <NavbarScreenFourAuth />
      <Hero />
      <Features />
      <FooterScreen />
    </div>
  )
}

export { WelcomeScreen }
