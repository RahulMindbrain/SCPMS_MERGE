import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DeptStat } from "@/redux/slices/dashboardSlice"

interface PlacementChartProps {
  data: DeptStat[];
}

const chartConfig = {
  totalStudents: {
    label: "Total Students",
    color: "#4f46e5", // Deep Indigo
  },
  placedStudents: {
    label: "Placed Students",
    color: "#10b981", // Emerald
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-foreground/80">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
          <TrendingUp className="size-3 text-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-500 uppercase">Trend Analysis Active</span>
        </div>
      </div>
    )
  }
  return null
}

export function ChartAreaInteractive({ data }: PlacementChartProps) {
  return (
    <div className="w-full h-full relative group/chart">
      {/* Decorative backdrop mesh */}
      <div className="absolute inset-0 bg-primary/[0.02] rounded-3xl -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[320px] w-full"
      >
        <AreaChart 
          data={data} 
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.totalStudents.color} stopOpacity={0.2} />
              <stop offset="50%" stopColor={chartConfig.totalStudents.color} stopOpacity={0.05} />
              <stop offset="95%" stopColor={chartConfig.totalStudents.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillPlaced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.placedStudents.color} stopOpacity={0.3} />
              <stop offset="50%" stopColor={chartConfig.placedStudents.color} stopOpacity={0.1} />
              <stop offset="95%" stopColor={chartConfig.placedStudents.color} stopOpacity={0} />
            </linearGradient>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid 
            vertical={false} 
            stroke="var(--border)" 
            strokeDasharray="8 8" 
            opacity={0.3} 
          />

          <XAxis
            dataKey="department"
            tickLine={false}
            axisLine={false}
            tickMargin={20}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={20}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />

          <Area
            name="Total Students"
            dataKey="totalStudents"
            type="monotone"
            fill="url(#fillTotal)"
            stroke={chartConfig.totalStudents.color}
            strokeWidth={2}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />

          <Area
            name="Placed Students"
            dataKey="placedStudents"
            type="monotone"
            fill="url(#fillPlaced)"
            stroke={chartConfig.placedStudents.color}
            strokeWidth={4}
            filter="url(#shadow)"
            animationDuration={2500}
            animationEasing="ease-in-out"
            strokeLinecap="round"
            activeDot={{ 
              r: 6, 
              fill: chartConfig.placedStudents.color, 
              stroke: "#fff", 
              strokeWidth: 2,
              className: "animate-pulse"
            }}
          />
        </AreaChart>
      </ChartContainer>
      
      {/* Interactive Legend overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 backdrop-blur border border-border/50 shadow-sm">
            <div className="size-2 rounded-full bg-[#4f46e5]" />
            <span className="text-[10px] font-black text-foreground/70 uppercase tracking-wider">Target Pool</span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 backdrop-blur border border-border/50 shadow-sm">
            <div className="size-2 rounded-full bg-[#10b981]" />
            <span className="text-[10px] font-black text-foreground/70 uppercase tracking-wider">Conversion</span>
         </div>
      </div>
    </div>
  )
}

