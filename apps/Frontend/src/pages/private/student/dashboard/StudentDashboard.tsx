import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Bell,
  CalendarClock,
  FileText,
  User,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { UpcomingEventsList } from "@/components/dashboard/UpcomingEventsList"

import type { AppDispatch } from "@/redux/store/store"
import type { RootState } from "@/redux/reducers/rootReducer"
import { fetchUpcomingEvents, fetchUnreadCount } from "@/redux/thunks/notificationThunks"
import { fetchJobApplications, fetchStudentProfile } from "@/redux/thunks/studentThunk"
import { useSocket } from "@/socket/SocketProvider"
import { SOCKET_EVENTS } from "@/socket/socket.events"
import { StudentPageLayout } from "@/components/layout/StudentPageLayout"

export default function StudentDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { socket } = useSocket()

  const { upcomingEvents = [], unreadCount = 0 } = useSelector(
    (state: RootState) => state.notification || {}
  )

  const { applications = [], profile } = useSelector((state: RootState) => state.student)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchUpcomingEvents())
    dispatch(fetchUnreadCount())
    dispatch(fetchJobApplications({ page: 1, limit: 100 }))
    dispatch(fetchStudentProfile())
  }, [dispatch])

  useEffect(() => {
    if (!socket || !user) return;
    const handleConnect = () => {
      socket.emit("join", { userId: user.id, role: user.role });
    };
    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);
    return () => { socket.off("connect", handleConnect); };
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      dispatch(fetchUpcomingEvents());
      dispatch(fetchUnreadCount());
      dispatch(fetchJobApplications({ page: 1, limit: 100 }));
    };
    socket.on(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED, handleUpdate);
    socket.on(SOCKET_EVENTS.NEW_JOB, handleUpdate);
    socket.on(SOCKET_EVENTS.SCHEDULE_APPROVED, handleUpdate);
    socket.on(SOCKET_EVENTS.SCHEDULE_CREATED, handleUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED, handleUpdate);
      socket.off(SOCKET_EVENTS.NEW_JOB, handleUpdate);
      socket.off(SOCKET_EVENTS.SCHEDULE_APPROVED, handleUpdate);
      socket.off(SOCKET_EVENTS.SCHEDULE_CREATED, handleUpdate);
    };
  }, [dispatch, socket]);

  // Compute profile completeness score dynamically
  const profileCompletion = useMemo(() => {
    if (!profile) return 30; // base registered student score
    let score = 30;
    if (profile.cgpa) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.resumeUrl || profile.resume) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 15;
    return Math.min(100, score);
  }, [profile]);

  // Compute live activities dynamically based on database state
  const activities = useMemo(() => {
    if (applications && applications.length > 0) {
      return applications.slice(0, 3).map((app: any) => {
        const companyName = app.jobUniversity?.job?.company?.name || "Corporate Partner";
        const jobTitle = app.jobUniversity?.job?.title || "Role Opening";
        const appStatus = app.status || "APPLIED";
        const dateStr = app.createdAt || app.appliedAt || new Date().toISOString();
        const timeAgo = new Date(dateStr).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });

        let icon = CheckCircle2;
        let colorClass = "text-indigo-500";
        let bgClass = "bg-indigo-500/10";
        if (appStatus === "SELECTED" || appStatus === "APPROVED") {
          icon = CheckCircle2;
          colorClass = "text-emerald-500";
          bgClass = "bg-emerald-500/10";
        } else if (appStatus === "REJECTED") {
          icon = XCircle;
          colorClass = "text-rose-500";
          bgClass = "bg-rose-500/10";
        } else if (appStatus === "PENDING" || appStatus === "APPLIED") {
          icon = Clock;
          colorClass = "text-amber-500";
          bgClass = "bg-amber-500/10";
        }

        return {
          title: `Application to ${companyName}`,
          time: timeAgo,
          icon,
          color: colorClass,
          bg: bgClass,
          desc: `Candidate file for ${jobTitle} status updated to ${appStatus.toUpperCase()}.`
        };
      });
    }

    // Dynamic placeholders mapping direct student metadata
    return [
      {
        title: "Workspace Profile Registered Successfully",
        time: "Active",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        desc: `Account approved and verified for ${user?.firstname || "student"}. Core systems ready.`
      },
      profile ? {
        title: "Academic Profiling Verified",
        time: "Verified",
        icon: Sparkles,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        desc: `Verified CGPA is verified as ${profile.cgpa || "Pending"}. Department criteria maps correctly.`
      } : {
        title: "Setup Academic Profile",
        time: "Action required",
        icon: AlertTriangle,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        desc: "Complete your profile details to unlock eligible placement matching suggestion algorithms."
      }
    ].filter(Boolean);
  }, [applications, profile, user]);

  return (
    <StudentPageLayout containerClassName="space-y-8 pb-12">
      {/* Dynamic Ambient Background Blur Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="space-y-8 w-full">
        {/* 1. Large Hero Section - Unified Student Hero Banner Style */}
        <section className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-blue"></div>
            <div className="bubble-sky"></div>
          </div>
          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>

          <div className="relative z-10 w-full text-left">
            <div className="student-hero-badge">
              <Sparkles size={12} className="animate-spin-slow shrink-0" />
              <span>Placement Portal Workspace</span>
            </div>

            <h1 className="student-hero-title">
              Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-300 dark:to-sky-300 bg-clip-text text-transparent">{user?.firstname || "Student"}</span> ✨
            </h1>

            <p className="student-hero-description">
              Your professional workplace to track active openings, monitor milestones, submit resumes, and secure top placement offers.
            </p>

            <div className="pt-6 flex flex-wrap gap-3">
              <Link to="/student/jobs" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                Explore Active Openings <ArrowRight size={14} />
              </Link>
              <Link to="/student/profile" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all dark:text-white dark:border-white/20 dark:hover:bg-white/5">
                Optimize Profile
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Quick Stats Grid */}
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Upcoming Milestones",
              value: upcomingEvents.length,
              icon: CalendarClock,
              iconBg: "bg-indigo-50 dark:bg-indigo-950/50",
              iconColor: "text-indigo-600 dark:text-indigo-400",
              progress: Math.min(100, (upcomingEvents.length / 5) * 100),
              trend: "Next round scheduled",
              progressColor: "bg-indigo-500"
            },
            {
              label: "Unread Placement Updates",
              value: unreadCount,
              icon: Bell,
              iconBg: "bg-amber-50 dark:bg-amber-950/50",
              iconColor: "text-amber-600 dark:text-amber-400",
              progress: unreadCount > 0 ? 40 : 100,
              trend: unreadCount > 0 ? "Action required" : "All caught up!",
              progressColor: "bg-amber-500"
            },
            { 
              label: "Submitted Applications", 
              value: applications.length, 
              icon: Briefcase, 
              iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
              iconColor: "text-emerald-600 dark:text-emerald-400",
              progress: Math.min(100, (applications.length / 10) * 100),
              trend: "Job pipelines active",
              progressColor: "bg-emerald-500"
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden text-left"
            >
              {/* Interactive background accent glow on card hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex items-start justify-between relative z-10">
                <div className={`p-3 rounded-2xl ${stat.iconBg} transition-all duration-500 group-hover:scale-110`}>
                  <stat.icon size={24} className={stat.iconColor} />
                </div>
                <div className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[9px] font-black uppercase text-slate-400 group-hover:border-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {stat.trend}
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
              </div>

              {/* Progress Slider Indicator */}
              <div className="mt-6 space-y-1.5 relative z-10">
                <div className="w-full h-1 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${stat.progressColor} rounded-full transition-all duration-1000`} style={{ width: `${stat.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 3. Main Content Columns */}
        <section className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          
          {/* Left Large Column (Schedules and Activity) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Schedule Section */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Upcoming Schedule</h3>
                    <p className="text-[11px] font-semibold text-slate-400">Never miss a critical stage round</p>
                  </div>
                </div>
                <Link to="/student/interview" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:opacity-85 transition-opacity">
                  View Full Hub <ChevronRight size={14} />
                </Link>
              </div>

              {/* timeline left layout padding container */}
              <div className="pl-1 border-l-2 border-indigo-100 dark:border-slate-800 space-y-2">
                <UpcomingEventsList events={upcomingEvents.map(e => ({ ...e, status: 'SCHEDULED' }))} showApprovalStatus={false} />
              </div>
            </div>

            {/* 4. Activity Feed Section (Fully Dynamic - Zero Hardcoding) */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Live Activity Feed</h3>
                    <p className="text-[11px] font-semibold text-slate-400">Real-time placement logging updates</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
              </div>

              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className={`p-2 rounded-xl ${act.bg} ${act.color} shrink-0 mt-0.5 group-hover:scale-110 duration-300`}>
                      <act.icon size={16} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                          {act.title}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Smaller Column (Navigation, Profile Strength, Insight) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 5. Quick Navigation shortcuts */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Quick Commands</h3>
              
              <div className="grid gap-3 grid-cols-1">
                {[
                  { to: "/student/profile", icon: User, label: "Profile Strength", bg: "bg-indigo-50 dark:bg-indigo-950/40", color: "text-indigo-600 dark:text-indigo-400", desc: "Manage resumes & settings" },
                  { to: "/student/jobs", icon: Briefcase, label: "Placement Openings", bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400", desc: "Browse active jobs" },
                  { to: "/student/application", icon: FileText, label: "My Applications", bg: "bg-purple-50 dark:bg-purple-950/40", color: "text-purple-600 dark:text-purple-400", desc: "Monitor hiring timelines" },
                  { to: "/student/notifications", icon: Bell, label: "Notification Center", bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400", desc: "Review recruiter updates" },
                ].map((nav) => (
                  <Link
                    key={nav.to}
                    to={nav.to}
                    className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-sm group"
                  >
                    <div className={`h-11 w-11 rounded-xl ${nav.bg} ${nav.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0`}>
                      <nav.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="block font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight truncate">{nav.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate font-medium mt-0.5">{nav.desc}</span>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                      <ArrowUpRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 6. Profile Completion Card (Fully Dynamic - Zero Hardcoding) */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] rounded-[2rem] p-6 shadow-sm text-left relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Readiness</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">{profileCompletion}% Complete</span>
              </div>

              <div className="flex items-center gap-5">
                {/* Circular Gauge Graphic using SVG */}
                <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                  <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-600 dark:text-indigo-400"
                      strokeDasharray={`${profileCompletion}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">{profileCompletion}%</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Complete Placement Profile</p>
                  <p className="text-[10px] text-slate-400 leading-snug font-medium">Add skills, resume, and experience details to unlock higher Suggestion suggestives.</p>
                </div>
              </div>

              <Link to="/student/profile" className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
                Unlock 100% Strength
              </Link>
            </div>

            {/* Recruiter Insight Card */}
            <div className="bg-slate-950 dark:bg-slate-950/80 border border-slate-900 dark:border-white/[0.04] rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 transition-transform group-hover:scale-125 duration-1000 rotate-12 pointer-events-none">
                <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Pro Insight</span>
                </div>
                <p className="text-sm sm:text-base font-bold leading-relaxed text-slate-200">
                  Update your technical profile skills <span className="text-indigo-400 italic font-black">bi-weekly</span> to boost your search rank by <span className="text-white px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 font-black">40%</span>.
                </p>
                <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2">
                  Learn Recruitment Tactics <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </section>
      </div>
    </StudentPageLayout>
  )
}