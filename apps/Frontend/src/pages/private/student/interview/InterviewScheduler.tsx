import React, { useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  Video,
  Rocket,
  TrendingUp,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { UpcomingEventsList } from '@/components/dashboard/UpcomingEventsList';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchUpcomingEvents } from '@/redux/thunks/notificationThunks';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { StudentPageLayout } from '@/components/layout/StudentPageLayout';

const InterviewSchedule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { upcomingEvents = [], loading } = useSelector((state: RootState) => state.notification || {}) as { upcomingEvents: any[]; loading: boolean };

  useEffect(() => {
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);



  if (loading && upcomingEvents.length === 0) {
    return <Loader text="Syncing your interview schedule..." fullScreen />;
  }

  return (
    <StudentPageLayout>
      <div className="space-y-10 student-hero-animate fade-in slide-in-from-bottom-2 duration-500">

        {/* Adaptive Hero Banner */}
        <div className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-indigo"></div>
            <div className="bubble-sky"></div>
          </div>

          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>

          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="student-hero-badge">
                <Sparkles size={14} />
                <span>Interview Hub</span>
              </div>
              <h1 className="student-hero-title">
                Master Your <span>Interviews</span> 🎯
              </h1>
              <p className="student-hero-description">
                Prepare, practice, and ace your upcoming technical and behavioral rounds with confidence.
              </p>
            </div>
             <div className="hidden lg:block shrink-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-indigo-500/10 dark:bg-white/5 backdrop-blur-2xl border border-indigo-500/10 dark:border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Video className="h-16 w-16 text-indigo-600 dark:text-white/40" />
              </div>
            </div>
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Invitations</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 font-medium">
                  {upcomingEvents.length > 0
                    ? `You have ${upcomingEvents.length} interviews scheduled.`
                    : "No interviews scheduled at the moment."}
                </p>
              </div>
              <Button variant="ghost" className="text-[10px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest self-start sm:self-center">
                History <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>

            <UpcomingEventsList events={upcomingEvents.map(e => ({ ...e, status: 'SCHEDULED' }))} showApprovalStatus={false} />
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-2xl shadow-indigo-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-black mb-3">Interview Readiness</h3>
                <p className="text-indigo-100/70 text-xs md:text-sm leading-relaxed mb-8 font-medium">
                  Candidates who complete mock interviews are <span className="text-white font-bold">2.4x</span> more likely to receive an offer.
                </p>
                <Button className="w-full py-6 md:py-7 bg-white text-indigo-600 hover:bg-indigo-50 rounded-[1.25rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                  Start Preparation
                </Button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 shadow-inner">
                    <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="font-black text-slate-900 dark:text-white tracking-[0.1em] uppercase text-[10px] md:text-xs">Recent Activity</h2>
                </div>
              </div>

              <div className="space-y-8">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((act, i) => (
                    <div key={i} className="flex gap-5 relative group/item">
                      <div className={cn("w-1 rounded-full shrink-0 h-12", i === 0 ? "bg-emerald-500" : i === 1 ? "bg-blue-500" : "bg-indigo-500")} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-black text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {typeof act.company === 'object' ? act.company?.name : act.company || 'Corporate Drive'}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 truncate">{act.title}</p>
                        <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-600 mt-2 uppercase font-black tracking-widest">
                          {act.startTime ? (
                            <>
                              {new Date(act.startTime).toLocaleDateString()} • {new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          ) : 'Date TBA'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">No recent activity to show.</p>
                )}
              </div>

              <button className="w-full mt-10 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase tracking-widest border-t border-slate-100 dark:border-white/5 pt-6">
                Full Activity History <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </StudentPageLayout>
  );
};

export default InterviewSchedule;
