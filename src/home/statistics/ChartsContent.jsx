import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../theme/ThemeProvider'

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/**
 * Grafiklar uchun rang to'plami. Recharts SVG atributlariga haqiqiy rang
 * qiymatini talab qiladi, shuning uchun tokenlar temaga qarab shu yerda tanlanadi.
 */
function useChartTheme() {
  const { resolvedTheme } = useTheme()

  return useMemo(() => {
    const dark = resolvedTheme === 'dark'
    return {
      accent: dark ? 'oklch(0.7 0.17 273)' : 'oklch(0.55 0.21 273)',
      accent2: dark ? 'oklch(0.72 0.13 230)' : 'oklch(0.62 0.15 230)',
      grid: dark ? 'oklch(0.32 0.013 265)' : 'oklch(0.917 0.005 265)',
      axis: dark ? 'oklch(0.62 0.014 265)' : 'oklch(0.58 0.012 265)',
      surface: dark ? 'oklch(0.205 0.011 265)' : 'oklch(1 0 0)',
      border: dark ? 'oklch(0.32 0.013 265)' : 'oklch(0.917 0.005 265)',
      fg: dark ? 'oklch(0.965 0.003 265)' : 'oklch(0.21 0.014 265)',
    }
  }, [resolvedTheme])
}

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`

/** Qisqartirilgan oʻq belgilari: 1 200 000 → 1.2M. */
const compact = (value) => {
  const n = Number(value) || 0
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-pop">
      <p className="text-[11px] font-medium text-subtle">
        {unit} {label}
      </p>
      <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-fg">
        {money(payload[0].value)}
      </p>
    </div>
  )
}

/** Haftalik savdo — kunlar kesimida ustunli diagramma. */
function BarChartEdited({ weekSaleList = [] }) {
  const c = useChartTheme()

  const week = useMemo(() => {
    const rows = WEEK_DAYS.map((name) => ({ name, pv: 0 }))
    weekSaleList.forEach((sale) => {
      const day = new Date(sale.date).getDay() // 0 = Якшанба
      rows[day === 0 ? 6 : day - 1].pv += Number(sale.total || 0)
    })
    return rows
  }, [weekSaleList])

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
        <BarChart data={week} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: c.axis }}
            tickLine={false}
            axisLine={{ stroke: c.grid }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: c.axis }}
            tickLine={false}
            axisLine={false}
            tickFormatter={compact}
          />
          <Tooltip
            cursor={{ fill: c.accent, fillOpacity: 0.08 }}
            content={<ChartTooltip unit="" />}
          />
          <Bar dataKey="pv" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Oylik savdo — kunma-kun maydonli grafik. */
function ChartLinearEdited({ monthSaleList = [] }) {
  const c = useChartTheme()

  const month = useMemo(() => {
    const rows = Array.from({ length: 31 }, (_, i) => ({ name: String(i + 1), uv: 0 }))
    monthSaleList.forEach((sale) => {
      const day = new Date(sale.date).getDate()
      if (day >= 1 && day <= 31) rows[day - 1].uv += Number(sale.total || 0)
    })
    return rows
  }, [monthSaleList])

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 208 }}>
        <AreaChart data={month} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="saleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: c.axis }}
            tickLine={false}
            axisLine={{ stroke: c.grid }}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: c.axis }}
            tickLine={false}
            axisLine={false}
            tickFormatter={compact}
          />
          <Tooltip
            cursor={{ stroke: c.accent, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={<ChartTooltip unit="День" />}
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke={c.accent}
            strokeWidth={2}
            fill="url(#saleGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export { BarChartEdited, ChartLinearEdited }
