import { useId, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

export interface ChartDatum {
  name: string
  [key: string]: string | number | undefined
}

export interface SeriesDef {
  key: string
  name: string
  color: string
}

interface ChartPalette {
  tick: string
  grid: string
}

function useChartPalette(): ChartPalette {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark"
    ? { tick: "#94a3b8", grid: "#1e293b" }
    : { tick: "#64748b", grid: "#e2e8f0" }
}

function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  footer,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  footer?: ReactNode
}) {
  return (
    <Card className={cn("gap-0 p-0", className)}>
      <CardHeader className="flex-row items-start justify-between border-b py-4">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-2">{children}</CardContent>
      {footer}
    </Card>
  )
}

interface TooltipEntry {
  name?: string
  value?: string | number
  color?: string
  fill?: string
  dataKey?: string | number
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormat,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  valueFormat?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
      <p className="text-muted-foreground mb-1.5 text-xs font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((p, i) => {
          const color = p.color ?? p.fill ?? "var(--primary)"
          const val = typeof p.value === "number" ? p.value : Number(p.value ?? 0)
          return (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ background: color }}
                />
                {p.name ?? p.dataKey}
              </span>
              <span className="text-sm font-semibold">
                {valueFormat ? valueFormat(val) : val.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AreaTrend({
  data,
  series,
  xKey = "name",
  height = 260,
  valueFormat,
  showGrid = true,
}: {
  data: ChartDatum[]
  series: SeriesDef[]
  xKey?: string
  height?: number
  valueFormat?: (v: number) => string
  showGrid?: boolean
}) {
  const palette = useChartPalette()
  const gradId = useId().replace(/:/g, "")
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fill: palette.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: palette.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip valueFormat={valueFormat} />}
          cursor={{ stroke: palette.grid, strokeWidth: 1.5 }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            fill={`url(#grad-${s.key}-${gradId})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BarTrend({
  data,
  series,
  xKey = "name",
  height = 260,
  valueFormat,
  stacked = false,
  rounded = [6, 6, 0, 0],
}: {
  data: ChartDatum[]
  series: SeriesDef[]
  xKey?: string
  height?: number
  valueFormat?: (v: number) => string
  stacked?: boolean
  rounded?: [number, number, number, number]
}) {
  const palette = useChartPalette()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: palette.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: palette.tick, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip valueFormat={valueFormat} />}
          cursor={{ fill: palette.grid, opacity: 0.35 }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId={stacked ? "stack" : undefined}
            fill={s.color}
            radius={stacked && i !== series.length - 1 ? [0, 0, 0, 0] : rounded}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({
  data,
  height = 240,
  valueFormat,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number; color: string }[]
  height?: number
  valueFormat?: (v: number) => string
  centerLabel?: string
  centerValue?: string
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="92%"
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight">{centerValue}</span>
          {centerLabel && (
            <span className="text-muted-foreground text-xs">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function LegendItem({ color, label, value }: { color: string; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="size-2.5 rounded-[4px]" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      {value && <span className="font-semibold">{value}</span>}
    </div>
  )
}

export { ChartCard }
