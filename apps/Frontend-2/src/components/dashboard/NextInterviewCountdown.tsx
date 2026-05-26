import { useState, useEffect, useMemo } from 'react';
import { Calendar, Timer, Building2, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface NextInterviewCountdownProps {
  schedules: any[];
}

export const NextInterviewCountdown = ({ schedules }: NextInterviewCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  
  const nextSchedule = useMemo(() => {
    if (!schedules || schedules.length === 0) return null;
    const now = new Date().getTime();
    return schedules
      .filter(s => new Date(s.startTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }, [schedules]);

  useEffect(() => {
    if (!nextSchedule) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(nextSchedule.startTime).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextSchedule]);

  if (!nextSchedule) {
    return (
      <div className="saas-card h-full bg-white dark:bg-slate-900 text-foreground dark:text-white border border-slate-100 dark:border-slate-800 overflow-hidden group relative min-h-[180px] shadow-sm">
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Next Event</h3>
            </div>
            <h3 className="text-xl font-black mb-1 text-slate-900 dark:text-white">No Upcoming Drives</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium leading-relaxed">All systems operational. No interview schedules pending for the immediate future.</p>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div className="text-3xl font-black text-slate-100 dark:text-white/5">--:--:--</div>
            <div className="size-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center backdrop-blur-md border border-slate-100 dark:border-white/5">
              <ShieldCheck className="size-5 text-slate-200 dark:text-white/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card h-full bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-slate-900 text-white border-none overflow-hidden group relative shadow-xl shadow-indigo-500/20">
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-indigo-100 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Countdown Initiated</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/20 border border-white/30 text-[9px] font-black uppercase text-white">Next Drive</span>
          </div>
          
          <div>
            <h3 className="text-xl font-black leading-tight mb-1 truncate text-white">{nextSchedule.title}</h3>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="size-3" /> {nextSchedule.company?.name || nextSchedule.company || 'Unknown Company'}
            </p>
          </div>

          {timeLeft && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { label: 'Days', val: timeLeft.d },
                { label: 'Hrs', val: timeLeft.h },
                { label: 'Min', val: timeLeft.m },
                { label: 'Sec', val: timeLeft.s }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-lg font-black tabular-nums text-white">{String(t.val).padStart(2, '0')}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">{t.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Venue</span>
              <span className="text-xs font-bold text-white truncate max-w-[120px]">{nextSchedule.venue}</span>
           </div>
           <div className="size-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
              <ArrowUpRight className="size-5" />
           </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-400/30 rounded-full -ml-10 -mb-10 blur-xl" />
    </div>
  );
};
