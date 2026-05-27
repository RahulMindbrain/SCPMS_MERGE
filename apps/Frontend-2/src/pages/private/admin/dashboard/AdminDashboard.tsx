import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { fetchDashboardStats } from "@/redux/thunks/dashboardThunk"
import { fetchSchedules } from "@/redux/thunks/interviewThunk"
import type { RootState, AppDispatch } from "@/redux/store/store"

import { 
  LayoutDashboard, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  UserPlus,
  Mail,
  Building2
} from "lucide-react"
import { fetchNotifications, fetchUpcomingEvents } from "@/redux/thunks/notificationThunks"
import { AdminPageLayout } from "@/components/layout/AdminPageLayout"
import { PageHeader } from "@/components/PageHeader"
import Loader from "@/components/Loader"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UpcomingEventsList } from "@/components/dashboard/UpcomingEventsList"



const DeptStatsTable = ({ deptStats }: { deptStats: any[] }) => {
  return (
    <div className="saas-card overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">Departmental ROI</h3>
          <p className="text-xs font-medium text-muted-foreground">Detailed performance metrics across divisions</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Performance</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-4">Department</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center py-4">Students</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center py-4">Placement</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right py-4 pr-6">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deptStats.map((dept, idx) => {
              const rate = dept.totalStudents > 0 
                ? ((dept.placedStudents / dept.totalStudents) * 100).toFixed(1) 
                : "0.0"
              return (
                <TableRow key={idx} className="border-border/50 hover:bg-muted/30 transition-all group cursor-default">
                  <TableCell className="font-bold text-foreground py-4 group-hover:text-primary transition-colors">
                    {dept.department || dept.departmentName || dept.name || dept.deptName || 'N/A'}
                  </TableCell>
                  <TableCell className="text-center font-medium text-muted-foreground py-4 tabular-nums">
                    {dept.totalStudents}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className="px-2 py-0.5 rounded-md bg-muted font-black text-[10px] text-foreground tabular-nums">
                      {dept.placedStudents}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-[11px] font-black tabular-nums ${Number(rate) > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {rate}%
                      </span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${Number(rate) > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const ActivityFeed = ({ notifications, loading }: { notifications: any[]; loading: boolean }) => {
  const getNotificationStyles = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PLACEMENT':
      case 'JOB_POSTED':
        return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'INTERVIEW':
      case 'SCHEDULED':
        return { icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
      case 'SYSTEM':
      case 'USER_REGISTERED':
        return { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      default:
        return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHrs < 24) return `${diffInHrs}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <div className="saas-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-foreground tracking-tight">Recent Activity</h3>
        {/* <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button> */}
      </div>
      
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="size-10 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-16 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 8).map((item) => {
            const styles = getNotificationStyles(item.type);
            return (
              <div key={item.id} className="flex items-start gap-4 group cursor-pointer">
                <div className={`size-10 shrink-0 rounded-2xl ${styles.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <styles.icon className={`size-5 ${styles.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">{item.type?.replace('_', ' ')}</span>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.title || item.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
            <Activity className="size-10 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No recent activity</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
          <div className="size-2 rounded-full bg-primary animate-ping" />
          <p className="text-xs font-bold text-primary">Live Notification Sync Active</p>
        </div>
      </div>
    </div>
  );
};

const QuickActions = () => {
  const navigate = useNavigate()
  const actions = [
    { label: 'Schedule Interview', icon: UserPlus, color: 'bg-indigo-500', path: '/admin/event-management' },
  
    { label: 'Send Announcement', icon: Mail, color: 'bg-amber-500', path: '/admin/bulk-email' },
  ]

  return (
    <div className="saas-card h-full">
      <h3 className="text-lg font-black text-foreground tracking-tight mb-6">Quick Operations</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-primary hover:text-white transition-all duration-300 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`size-8 rounded-xl ${action.color} text-white flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-colors`}>
                <action.icon className="size-4" />
              </div>
              <span className="text-sm font-black">{action.label}</span>
            </div>
            <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  )
}

const OnboardingOverlay = ({ step, user }: { step: string; user: any }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
      <div className="max-w-md w-full saas-card border-indigo-500/30 shadow-2xl shadow-indigo-500/10 text-center space-y-8 p-10">
        <div className="mx-auto size-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
           {step === 'ACTIVATE_ACCOUNT' ? <ShieldCheck className="size-10 text-white" /> : 
            step === 'UNIVERSITY_ACCEPTANCE' ? <Building2 className="size-10 text-white" /> : 
            <UserPlus className="size-10 text-white" />}
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">
            {step === 'ACTIVATE_ACCOUNT' ? "Verification Pending" : 
             step === 'UNIVERSITY_ACCEPTANCE' ? "University Acceptance" : 
             "Profile Genesis"}
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            {step === 'ACTIVATE_ACCOUNT' ? `Welcome ${user?.firstname}. Your account is currently awaiting Super Admin activation. Access will be granted shortly.` : 
             step === 'UNIVERSITY_ACCEPTANCE' ? "Your account is active. Please send a request to join your university node to begin operations." : 
             "Final step: Complete your institutional profile to finalize the onboarding process."}
          </p>
        </div>

        <div className="space-y-4">
           {step === 'UNIVERSITY_ACCEPTANCE' && (
             <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20">
               Request Acceptance
             </Button>
           )}
           {step === 'CREATE_PROFILE' && (
             <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20">
               Initialize Profile
             </Button>
           )}
           <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             Contact Support
           </Button>
        </div>
        
        <div className="pt-4 flex items-center justify-center gap-4">
           <div className={`h-1.5 w-12 rounded-full ${step === 'ACTIVATE_ACCOUNT' ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'}`} />
           <div className={`h-1.5 w-12 rounded-full ${step === 'UNIVERSITY_ACCEPTANCE' ? 'bg-indigo-600 animate-pulse' : step === 'CREATE_PROFILE' || step === 'COMPLETED' ? 'bg-emerald-500' : 'bg-muted'}`} />
           <div className={`h-1.5 w-12 rounded-full ${step === 'CREATE_PROFILE' ? 'bg-indigo-600 animate-pulse' : step === 'COMPLETED' ? 'bg-emerald-500' : 'bg-muted'}`} />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { data: dashboardData, loading: dashLoading, error } = useSelector((state: RootState) => state.dashboard)
  const { loading: schedLoading } = useSelector((state: RootState) => state.interview)
  const { items: notifications, upcomingEvents = [], loading: notifLoading } = useSelector((state: RootState) => state.notification)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchSchedules(undefined))
    dispatch(fetchNotifications({ page: 1, limit: 10 }))
    dispatch(fetchUpcomingEvents())
  }, [dispatch])

  // Onboarding Logic
  const onboardingStep = (user as any)?.onboardingStep || 'COMPLETED';
  const showOnboarding = onboardingStep !== 'COMPLETED';

  if ((dashLoading || schedLoading || notifLoading) && !dashboardData) {
    return <Loader text="Synchronizing tactical data..." />
  }

  if (error) {
    return (
      <AdminPageLayout>
        <div className="flex flex-1 flex-col items-center justify-center p-8 space-y-4 min-h-[400px]">
          <div className="text-rose-400 font-bold uppercase tracking-widest text-sm bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
            Error Synchronizing: {error}
          </div>
          <button
            onClick={() => {
              dispatch(fetchDashboardStats())
              dispatch(fetchSchedules(undefined))
              dispatch(fetchNotifications({ page: 1, limit: 10 }))
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Zap className="size-4" />
            Retry Connection
          </button>
        </div>
      </AdminPageLayout>
    )
  }

  const stats = dashboardData || {
    totalPlacedStudents: 0,
    avgSalary: 0,
    deptStats: [],
    deptAvgSalary: []
  }

  const totalStudents = stats.deptStats.reduce((acc, curr) => acc + curr.totalStudents, 0)
  const totalDepartments = stats.deptStats.length

  return (
    <AdminPageLayout>
      {showOnboarding && <OnboardingOverlay step={onboardingStep} user={user} />}
      
      <PageHeader
        title={`Command Center, ${user?.firstname || "Admin"}`}
        description="Unified interface for campus-wide placement operations and analytical intelligence."
        badge="Enterprise Control"
        icon={LayoutDashboard}
        variant="indigo"
      >
         <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Network Status</span>
               <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs uppercase">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synchronized
               </div>
            </div>
           
         </div>
      </PageHeader>

      <div className="space-y-8 pb-10">
        {/* Row 1: Key Metrics */}
        <SectionCards
          totalPlaced={stats.totalPlacedStudents}
          avgSalary={stats.avgSalary}
          totalStudents={totalStudents}
          totalDepartments={totalDepartments}
        />

        <UpcomingEventsList events={upcomingEvents.map(e => ({ ...e, status: 'SCHEDULED' }))} />

        {/* Row 2: Analytics & Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 flex flex-col">
            <div className="saas-card flex-1">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Placement Velocity</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">Rolling trends for current academic session</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">Active Session</span>
                  </div>
               </div>
               <div className="h-[400px]">
                 <ChartAreaInteractive data={stats.deptStats} />
               </div>
            </div>
          </div>
          
          <div className="xl:col-span-4">
            <ActivityFeed notifications={notifications} loading={notifLoading} />
          </div>
        </div>

        {/* Row 3: Department Performance & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            <DeptStatsTable deptStats={stats.deptStats} />
          </div>
          
          <div className="xl:col-span-4 flex flex-col gap-8">
            <QuickActions />
          </div>
        </div>
      </div>
    </AdminPageLayout>
  )
}
