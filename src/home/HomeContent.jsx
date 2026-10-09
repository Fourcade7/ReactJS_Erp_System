import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CalendarDays, CalendarRange, LayoutDashboard, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button, Card, PageHeader } from '../ui'
import { BarChartEdited, ChartLinearEdited } from './statistics/ChartsContent'
import {
  getAllSaleDebt,
  getAllSaleMonth,
  getAllSaleToday,
  getAllSaleWeek,
} from './statistics/HomeApi'
import { SaleTabForHome } from '../sale/SaleContent'
import { locale, t } from '../i18n'

const sum = (list, pick) => list.reduce((acc, item) => acc + pick(item), 0)

const TONES = {
  success: 'text-success-soft-fg bg-success-soft border-success/20',
  primary: 'text-primary-soft-fg bg-primary-soft border-primary/20',
  info: 'text-info-soft-fg bg-info-soft border-info/20',
  danger: 'text-danger-soft-fg bg-danger-soft border-danger/20',
}

/** Bitta koʻrsatkich kartasi. */
function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
  return (
    <Card padded={false} hoverable className="p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-lg border',
            TONES[tone] ?? TONES.primary,
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-[10px] uppercase tracking-wider text-subtle">{hint}</span>
      </div>

      <p className="mt-3 truncate text-lg font-semibold tracking-tight tabular-nums text-fg">
        {value.toLocaleString('uz')}
        <span className="ml-1 text-xs font-medium text-subtle">So&apos;m</span>
      </p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </Card>
  )
}

function HomeScreen() {
  const today = new Date()
  const monthName = today.toLocaleString(locale, { month: 'long' })
  const todayLabel = today.toLocaleDateString(locale)

  const [todaySaleList, setTodaySaleList] = useState([])
  const [weekSaleList, setWeekSaleList] = useState([])
  const [monthSaleList, setMonthSaleList] = useState([])
  const [allSaleDebtList, setAllSaleDebtList] = useState([])

  useEffect(() => {
    const handleSalesRange = async () => {
      try {
        const resToday = await getAllSaleToday()
        const resWeek = await getAllSaleWeek()
        const resMonth = await getAllSaleMonth()
        const resDebt = await getAllSaleDebt()

        if (!resToday.ok) {
          console.log(resToday)
          return
        }

        setTodaySaleList(await resToday.json())
        setWeekSaleList(await resWeek.json())
        setMonthSaleList(await resMonth.json())
        setAllSaleDebtList(await resDebt.json())
      } catch (error) {
        console.log(error.message)
      }
    }
    handleSalesRange()
  }, [])

  const stats = [
    {
      icon: CalendarDays,
      tone: 'success',
      hint: todayLabel,
      label: t('Сумма сегодняшних продаж'),
      value: sum(todaySaleList, (i) => i.total),
    },
    {
      icon: CalendarRange,
      tone: 'primary',
      hint: t('Неделя'),
      label: t('Еженедельная сумма продаж'),
      value: sum(weekSaleList, (i) => i.total),
    },
    {
      icon: TrendingUp,
      tone: 'info',
      hint: monthName,
      label: t('Ежемесячная сумма продаж'),
      value: sum(monthSaleList, (i) => i.total),
    },
    {
      icon: Wallet,
      tone: 'danger',
      hint: t('Долг'),
      label: t('Сумма продажи долгов'),
      value: sum(allSaleDebtList, (i) => i.total - i.totalPaid),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={LayoutDashboard}
        title={t('Главная страница')}
        description={t('Сводка продаж и задолженности по компании')}
        actions={
          <Button as={Link} to="/dashboard" variant="outline-primary" size="sm">
            <BarChart3 />
            {t('Полная статистика')}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card padded={false} className="lg:col-span-2">
          <Card.Header>
            <div>
              <Card.Title>{t('Продажи за месяц')}</Card.Title>
              <Card.Subtitle className="mt-0.5 capitalize">{monthName}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="pl-1 pr-3">
            <ChartLinearEdited monthSaleList={monthSaleList} />
          </Card.Body>
        </Card>

        <Card padded={false}>
          <Card.Header>
            <div>
              <Card.Title>{t('Продажи за неделю')}</Card.Title>
              <Card.Subtitle className="mt-0.5">{t('По дням недели')}</Card.Subtitle>
            </div>
          </Card.Header>
          <Card.Body className="pl-1 pr-3">
            <BarChartEdited weekSaleList={weekSaleList} />
          </Card.Body>
        </Card>
      </div>

      <SaleTabForHome />
    </div>
  )
}

export default HomeScreen
