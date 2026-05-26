import { useState, useEffect, useMemo } from 'react';
import { Calendar, Timer, Building2, MapPin, ArrowRight, Bell, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  company?: { name: string } | string;
  university?: { name: string } | string;
  startTime: string;
  endTime: string;
  venue: string;
  status: string;
  companyApprovalStatus?: string;
}

interface UpcomingEventsListProps {
  events: Event[];
  showApprovalStatus?: boolean;
}

export const UpcomingEventsList = ({ events, showApprovalStatus = true }: UpcomingEventsListProps) => {
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.startTime).getTime() > now - 1000 * 60 * 60) // Show ongoing too
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, now]);

  if (sortedEvents.length === 0) {
    return (
      <div className="saas-card flex flex-col items-center justify-center py-12 text-center">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Calendar className="size-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No Upcoming Events</h3>
        <p className="text-sm text-muted-foreground max-w-[240px] mt-1">
          You're all caught up! New recruitment drives and sessions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Upcoming Drives</h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded-full">
          {sortedEvents.length} Events Scheduled
        </span>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {sortedEvents.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isFirst={index === 0} 
              now={now} 
              showApprovalStatus={showApprovalStatus}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const EventCard = ({ event, isFirst, now, showApprovalStatus }: { event: Event; isFirst: boolean; now: number; showApprovalStatus: boolean }) => {
  const startTime = new Date(event.startTime).getTime();
  const isOngoing = startTime <= now && new Date(event.endTime).getTime() > now;
  const distance = startTime - now;

  const timeLeft = useMemo(() => {
    if (distance < 0) return null;
    return {
      d: Math.floor(distance / (1000 * 60 * 60 * 24)),
      h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }, [distance]);

  const companyName = typeof event.company === 'object' ? event.company?.name : event.company;
  const universityName = typeof event.university === 'object' ? event.university?.name : event.university;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isFirst
          ? 'bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-lg shadow-primary/5'
          : 'bg-background border-border/50 hover:border-primary/30 hover:shadow-md'
        }`}
    >
      {/* Glow effect for the first item */}
      {isFirst && (
        <div className="absolute -top-24 -right-24 size-48 bg-primary/10 blur-3xl rounded-full" />
      )}

      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
        {/* Date Section */}
        <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-1 min-w-[70px] sm:text-center p-3 rounded-xl bg-muted/30 border border-border/50 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
            {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-2xl font-black text-foreground leading-none">
            {new Date(event.startTime).getDate()}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground sm:mt-1">
            {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isOngoing ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live Now
              </span>
            ) : isFirst ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                <Sparkles className="size-3" />
                Up Next
              </span>
            ) : null}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Building2 className="size-3" />
              {companyName || 'Corporate Drive'}
            </span>
            {showApprovalStatus && event.companyApprovalStatus === 'PENDING' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                Pending Approval
              </span>
            )}
          </div>

          <h4 className="text-lg font-black text-foreground leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h4>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary/60" />
              {event.venue || 'TBA'}
            </span>
            <span className="flex items-center gap-1.5">
              <Bell className="size-3.5 text-primary/60" />
              {universityName || 'Campus Placement'}
            </span>
          </div>
        </div>

        {/* Countdown Section (only for first item if not ongoing) */}
        {isFirst && !isOngoing && timeLeft && (
          <div className="sm:ml-auto flex items-center gap-2 bg-foreground text-background dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl shadow-foreground/10">
            <Timer className="size-5 animate-pulse" />
            <div className="flex items-center gap-3">
              {[
                { val: timeLeft.d, label: 'd' },
                { val: timeLeft.h, label: 'h' },
                { val: timeLeft.m, label: 'm' },
                { val: timeLeft.s, label: 's' }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center min-w-[24px]">
                  <span className="text-sm font-black tabular-nums leading-none">{String(t.val).padStart(2, '0')}</span>
                  <span className="text-[8px] font-bold uppercase opacity-60 mt-0.5">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button / Meeting Link */}
        <div className="sm:ml-auto">
          {event.venue?.toLowerCase().includes('http') || event.venue?.toLowerCase().includes('meet') || event.venue?.toLowerCase().includes('zoom') ? (
            <a
              href={event.venue.startsWith('http') ? event.venue : `https://${event.venue}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Launch Meeting <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <ArrowRight className="size-5" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
