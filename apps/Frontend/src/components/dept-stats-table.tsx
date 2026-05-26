import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DeptStat } from "@/redux/slices/dashboardSlice"

interface DeptStatsTableProps {
  deptStats: DeptStat[];
}

function PlacementBadge({ pct }: { pct: number }) {
  if (pct >= 70) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      {pct.toFixed(1)}%
    </span>
  )
  if (pct >= 40) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
      {pct.toFixed(1)}%
    </span>
  )
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
      {pct.toFixed(1)}%
    </span>
  )
}

export function DeptStatsTable({ deptStats }: DeptStatsTableProps) {
  return (
    <div className="w-full">
      <Table className="saas-table">
        <TableHeader>
          <TableRow className="bg-transparent hover:bg-transparent border-b border-border/50">
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 h-12">
              Department
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 h-12">
              Total
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 h-12">
              Placed
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 h-12">
              Success
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deptStats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-50">
                No data points
              </TableCell>
            </TableRow>
          ) : (
            deptStats.map((stat) => (
              <TableRow
                key={stat.department}
                className="group/row hover:bg-primary/[0.02] transition-colors border-b border-border/30 last:border-0"
              >
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-foreground text-xs tracking-tight">{stat.department}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Engineering</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-black tabular-nums text-xs">{stat.totalStudents}</TableCell>
                <TableCell className="text-right text-foreground font-black tabular-nums text-xs">{stat.placedStudents}</TableCell>
                <TableCell className="text-right">
                  <PlacementBadge pct={stat.percentage} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

