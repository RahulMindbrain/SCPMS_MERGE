import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DeptStatsTable } from "@/components/dept-stats-table"
import { SectionCards } from "@/components/section-cards"
import type { RootState } from "@/redux/reducers/rootReducer"
import type { AppDispatch } from "@/redux/store/store"
import { fetchCompanyJobs, fetchJobApplications } from "@/redux/thunks/companyThunk"
import { fetchUpcomingEvents } from "@/redux/thunks/notificationThunks"

import Loader from "@/components/Loader"
import { Sparkles } from "lucide-react"
import { UpcomingEventsList } from "@/components/dashboard/UpcomingEventsList"

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { jobs, applications, loading, error } = useSelector((state: RootState) => state.company)
  const { upcomingEvents = [] } = useSelector((state: RootState) => state.notification || {})

  useEffect(() => {
    dispatch(fetchCompanyJobs({ page: 1, limit: 100 }))
    dispatch(fetchJobApplications({ page: 1 }))
    dispatch(fetchUpcomingEvents())
  }, [dispatch])

  const metrics = useMemo(() => {
    const totalJobs = jobs.length

    // Derive avgSalary from applications → jobUniversity.salary
    // Deduplicate by jobUniversity id so each drive counts only once
    const seenJU = new Set<number>()
    let totalSalary = 0
    let salaryCount = 0
    applications.forEach((app: any) => {
      const ju = app.jobUniversity
      if (!ju) return
      const juId = ju.id
      if (juId && seenJU.has(juId)) return
      if (juId) seenJU.add(juId)
      const sal = Number(ju.salary)
      if (sal > 0) {
        totalSalary += sal
        salaryCount++
      }
    })
    const avgSalary = salaryCount > 0 ? totalSalary / salaryCount : 0

    const placedApps = applications.filter(
      (app: any) => app.status === "SELECTED" || app.status === "OFFER_ACCEPTED"
    )
    const uniqueStudents = new Set(
      applications.map((app: any) => app.student?.id).filter(Boolean)
    ).size

    const departmentMap = new Map<
      string,
      { students: Set<number>; selectedStudents: Set<number> }
    >()

    applications.forEach((app: any) => {
      const department = app.student?.department?.name || "Unknown"
      const studentId = app.student?.id
      if (!studentId) return

      if (!departmentMap.has(department)) {
        departmentMap.set(department, { students: new Set(), selectedStudents: new Set() })
      }

      const current = departmentMap.get(department)!
      current.students.add(studentId)
      if (app.status === "SELECTED" || app.status === "OFFER_ACCEPTED") {
        current.selectedStudents.add(studentId)
      }
    })

    const deptStats = Array.from(departmentMap.entries()).map(([department, data]) => {
      const totalStudents = data.students.size
      const placedStudents = data.selectedStudents.size
      const percentage = totalStudents ? (placedStudents / totalStudents) * 100 : 0

      return { department, totalStudents, placedStudents, percentage }
    })

    return {
      totalJobs,
      avgSalary,
      totalApplicants: uniqueStudents,
      totalPlaced: new Set(placedApps.map((app: any) => app.student?.id).filter(Boolean)).size,
      deptStats,
    }
  }, [applications, jobs])

  if (loading && jobs.length === 0 && applications.length === 0) {
    return <Loader text="Loading dashboard data..." />
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-destructive">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      {/* ── Company Hero ── */}
      <div className="company-hero-banner min-h-[320px] flex flex-col justify-center">
        <div className="hero-mesh">
          <div className="bubble-primary" />
          <div className="bubble-secondary" />
        </div>
        <div className="hero-texture" />
        
        <div className="relative z-10">
          <div className="hero-badge mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Company Command Center
          </div>
          <h1 className="hero-title text-4xl lg:text-5xl font-black mb-4">
            Welcome back to <span className="text-blue-400">SCPMS</span>
          </h1>
          <p className="hero-description text-base opacity-90 max-w-lg mb-0">
            Monitor your job drives, track applicant progress, and discover top talent effortlessly.
          </p>
        </div>
      </div>

      <div className="@container/main flex flex-1 flex-col gap-8">
        <SectionCards
          totalPlaced={metrics.totalPlaced}
          avgSalary={metrics.avgSalary}
          totalDepartments={metrics.deptStats.length}
          hideStudents={true}
        />

        <UpcomingEventsList events={upcomingEvents.map(e => ({ ...e, status: 'SCHEDULED' }))} />
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 saas-card flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Placement Performance</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Analytics Overview</p>
              </div>
              <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <ChartAreaInteractive data={metrics.deptStats} />
            </div>
          </div>
          
          <div className="xl:col-span-5 saas-card p-0 overflow-hidden flex flex-col">
             <div className="px-8 py-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-black text-foreground uppercase tracking-[0.15em]">Dept Insights</h3>
                   <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Real-time status</p>
                </div>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                      <div key={i} className="size-6 rounded-full border-2 border-card bg-muted animate-pulse" />
                   ))}
                </div>
             </div>
             <div className="flex-1 overflow-auto p-2">
                <DeptStatsTable deptStats={metrics.deptStats} />
             </div>
          </div>
        </div>
      </div>

    </div>
  )
}
