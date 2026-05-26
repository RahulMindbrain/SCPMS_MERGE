"use client"


import { Users, TrendingUp, GraduationCap, Building2 } from "lucide-react"

interface SectionCardsProps {
  totalPlaced: number;
  avgSalary: number;
  totalStudents?: number;
  totalDepartments: number;
  hideStudents?: boolean;
}

const cards = [
  {
    label: "Total Placed",
    sub: "Overall Placement Status",
    footer: "Current academic year",
    icon: GraduationCap,
    gradient: "from-indigo-500/10 to-indigo-500/0",
    border: "border-t-2 border-t-indigo-500/80",
    iconBg: "bg-indigo-500/10 text-indigo-400",
    key: "totalPlaced" as const,
    format: (v: number) => String(v),
  },
  {
    label: "Average Salary",
    sub: "Average CTC offered",
    footer: "Across all departments",
    icon: TrendingUp,
    gradient: "from-emerald-500/10 to-emerald-500/0",
    border: "border-t-2 border-t-emerald-500/80",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    key: "avgSalary" as const,
    format: (v: number) => `₹${(v / 100000).toFixed(2)} LPA`,
  },
  {
    label: "Total Students",
    sub: "Registered Students",
    footer: "Total student database",
    icon: Users,
    gradient: "from-cyan-500/10 to-cyan-500/0",
    border: "border-t-2 border-t-cyan-500/80",
    iconBg: "bg-cyan-500/10 text-cyan-400",
    key: "totalStudents" as const,
    format: (v: number) => String(v),
  },
  {
    label: "Departments",
    sub: "Active Departments",
    footer: "Academic divisions",
    icon: Building2,
    gradient: "from-amber-500/10 to-amber-500/0",
    border: "border-t-2 border-t-amber-500/80",
    iconBg: "bg-amber-500/10 text-amber-400",
    key: "totalDepartments" as const,
    format: (v: number) => String(v),
  },
]

export function SectionCards({ 
  totalPlaced, 
  avgSalary, 
  totalStudents = 0, 
  totalDepartments, 
  hideStudents = false 
}: SectionCardsProps) {
  const values = { totalPlaced, avgSalary, totalStudents, totalDepartments }
  const activeCards = hideStudents ? cards.filter(c => c.key !== "totalStudents") : cards;

  return (
    <div className={`grid grid-cols-1 gap-6 @xl/main:grid-cols-2 ${hideStudents ? "@5xl/main:grid-cols-3" : "@5xl/main:grid-cols-4"}`}>
      {activeCards.map(({ label, sub, footer, icon: Icon, iconBg, key, format }) => {
        const glowClass = 
          key === "totalPlaced" ? "stat-glow-indigo" :
          key === "avgSalary" ? "stat-glow-emerald" :
          key === "totalStudents" ? "stat-glow-cyan" :
          "stat-glow-amber";

        return (
          <div
            key={key}
            className={`premium-stat-card ${glowClass} group`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`stat-icon-box ${iconBg}`}>
                <Icon className="size-6 transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  Metric ID: {key.slice(0, 5).toUpperCase()}
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                   <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[9px] font-bold text-primary uppercase">Live Data</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <h2 className="stat-value-text tabular-nums">
                {format(values[key])}
              </h2>
            </div>

            <div className="flex flex-col gap-1 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground">{sub}</span>
                <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
              </div>
              <p className="text-[10px] text-muted-foreground/70">{footer}</p>
            </div>
            
            {/* Decorative mesh background element */}
            <div className="absolute -bottom-6 -right-6 size-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        );
      })}
    </div>
  )
}

