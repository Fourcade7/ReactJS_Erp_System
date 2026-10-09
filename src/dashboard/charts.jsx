import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '../lib/cn'
import { formatCompact, formatMoney } from '../lib/format'
import { useChartColors } from './chartColors'
import { bucketLabel, bucketTick } from './range'
import { formatShare, toSegments } from './segments'
import { t } from '../i18n'

/** HTML legenda: chiziqli grafikka chiziq kaliti, ustunliga — kvadrat. */
export function ChartLegend({ items, shape = 'line' }) {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-muted">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-[3px]'}
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Bitta tooltip — shu nuqtadagi barcha seriyalar; qiymat qalin, nom ikkinchi darajali. */
function SeriesTooltip({ active, payload, label, granularity, series, unit = t('сум') }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-44 rounded-xl border border-line bg-surface px-3 py-2 shadow-pop">
      <p className="mb-1 text-[11px] font-medium text-subtle">{bucketLabel(label, granularity)}</p>
      {series.map((s) => {
        const point = payload.find((p) => p.dataKey === s.key)
        if (!point || point.value === null || point.value === undefined) return null
        return (
          <div key={s.key} className="flex items-center justify-between gap-4 py-0.5 text-[12px]">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-fg">
              {unit ? `${formatMoney(point.value)} ${unit}` : formatMoney(point.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const axisProps = (c) => ({
  tick: { fontSize: 11, fill: c.axis },
  tickLine: false,
})

/** Bir nechta pul seriyasi, bitta o'q (bir xil birlik — so'm). */
export function TrendChart({ data, granularity, series, height = 280 }) {
  const c = useChartColors()
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="bucket"
            {...axisProps(c)}
            axisLine={{ stroke: c.baseline }}
            tickFormatter={(b) => bucketTick(b, granularity)}
            minTickGap={24}
          />
          <YAxis {...axisProps(c)} axisLine={false} tickFormatter={formatCompact} width={64} />
          <ReferenceLine y={0} stroke={c.baseline} />
          <Tooltip
            cursor={{ stroke: c.axis, strokeWidth: 1 }}
            content={<SeriesTooltip granularity={granularity} series={series} />}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={data.length === 1 ? { r: 4, fill: s.color, stroke: c.surface, strokeWidth: 2 } : false}
              activeDot={{ r: 4, fill: s.color, stroke: c.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Ustunli grafik: 1 yoki 2 seriya (guruhlangan), ustun ≤ 24px, oxiri 4px yumaloq. */
export function ColumnChart({ data, granularity, series, unit = t('сум'), height = 240 }) {
  const c = useChartColors()
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barGap={2} barCategoryGap="20%">
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="bucket"
            {...axisProps(c)}
            axisLine={{ stroke: c.baseline }}
            tickFormatter={(b) => bucketTick(b, granularity)}
            minTickGap={16}
          />
          <YAxis
            {...axisProps(c)}
            axisLine={false}
            width={64}
            allowDecimals={false}
            tickFormatter={unit ? formatCompact : (v) => formatMoney(v)}
          />
          <ReferenceLine y={0} stroke={c.baseline} />
          <Tooltip
            cursor={{ fill: c.axis, fillOpacity: 0.1 }}
            content={<SeriesTooltip granularity={granularity} series={series} unit={unit} />}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Qism va butun: eng ko'pi 5 rangli segment + kulrang "Другие". Segmentlar orasida
 * 2px sirt rangidagi oraliq. Yonidagi jadval — legenda va ma'lumotlar ko'rinishi
 * bir vaqtda (qiymat va ulush matn bo'lib turadi). Segment yoki jadval qatoriga
 * hover/fokus — ikkalasi birga yonadi, markaz esa shu segmentni ko'rsatadi
 * (alohida tooltip markazdagi yozuvni to'sib qo'yardi).
 */
export function DonutChart({ rows, total, order, centerLabel, emptyText = t('Нет данных') }) {
  const c = useChartColors()
  const [hover, setHover] = useState(null)
  const { segments, total: whole } = useMemo(() => toSegments(rows, { total, order }), [rows, total, order])

  if (!segments.length) return <p className="py-10 text-center text-xs text-subtle">{emptyText}</p>

  const colorOf = (segment) => (segment.slot === null ? c.other : c.parts[segment.slot])
  const dim = (key) => hover !== null && hover !== key
  const active = segments.find((segment) => segment.key === hover)

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="relative mx-auto size-44 shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 176, height: 176 }}>
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke={c.surface}
              strokeWidth={2}
              isAnimationActive={false}
              onMouseEnter={(_, index) => setHover(segments[index]?.key ?? null)}
              onMouseLeave={() => setHover(null)}
            >
              {segments.map((segment) => (
                <Cell key={segment.key} fill={colorOf(segment)} fillOpacity={dim(segment.key) ? 0.35 : 1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-[18%] flex flex-col items-center justify-center text-center"
        >
          <span className="max-w-full truncate text-[11px] text-subtle">{active ? active.label : centerLabel}</span>
          <span className="text-base font-semibold tracking-tight text-fg">
            {formatCompact(active ? active.value : whole)}
          </span>
          {active && <span className="text-[11px] tabular-nums text-muted">{formatShare(active.value, whole)}</span>}
        </div>
      </div>

      <ul className="m-0 min-w-52 flex-1 list-none divide-y divide-line p-0 text-[13px]">
        {segments.map((segment) => (
          <li
            key={segment.key}
            tabIndex={0}
            onMouseEnter={() => setHover(segment.key)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(segment.key)}
            onBlur={() => setHover(null)}
            className={cn(
              'rounded-md py-1.5 outline-offset-2 transition-opacity',
              dim(segment.key) && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colorOf(segment) }} />
              <span className="min-w-0 flex-1 truncate text-muted" title={segment.label}>
                {segment.label}
              </span>
              <span className="whitespace-nowrap font-medium tabular-nums text-fg">{formatMoney(segment.value)}</span>
              <span className="w-12 text-right text-[11px] tabular-nums text-subtle">{formatShare(segment.value, whole)}</span>
            </div>
            {segment.members?.length > 0 && (
              <ul className="m-0 mt-1 list-none p-0 pl-[1.125rem] text-[12px]">
                {segment.members.map((member) => (
                  <li key={member.key} className="flex items-center gap-2 py-0.5">
                    <span className="min-w-0 flex-1 truncate text-subtle" title={member.label}>
                      {member.label}
                    </span>
                    <span className="whitespace-nowrap tabular-nums text-muted">{formatMoney(member.value)}</span>
                    <span className="w-12 text-right text-[11px] tabular-nums text-subtle">
                      {formatShare(member.value, whole)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
