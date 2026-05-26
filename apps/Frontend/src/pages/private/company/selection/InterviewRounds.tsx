import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, MapPin, Info, Search, Loader2,
  MessageSquare, CheckCircle, XCircle, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanySchedules, approveSchedule, fetchScheduleApplications, fetchScheduleMessages, sendScheduleMessage } from '@/redux/thunks/interviewThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';

// Types aligning with Prisma Schema
interface ScheduleMessage {
  id: number;
  message: string;
  senderName: string;
  createdAt: string;
  isAdmin: boolean;
}

interface InterviewSchedule {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  venue?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  companyApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  adminName: string;
  jobTitle: string;
  messages: ScheduleMessage[];
  applications?: any[];
}

const CompanyInterviewManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { schedules, loading } = useSelector((state: RootState) => state.interview);

  const [selectedSchedule, setSelectedSchedule] = useState<InterviewSchedule | null>(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [appsLoading, setAppsLoading] = useState<number | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgLoading, setMsgLoading] = useState<number | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);

  const activeSchedule = useMemo(() =>
    schedules.find(s => s.id === selectedSchedule?.id) || selectedSchedule,
    [schedules, selectedSchedule]
  );

  useEffect(() => {
    dispatch(fetchCompanySchedules());
  }, [dispatch]);

  const coordinators = useMemo(() => {
    const names = Array.from(new Set(schedules.map(s => s.adminName).filter(Boolean)));
    return names.length > 0 ? names : ['Placement Admin'];
  }, [schedules]);

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setStatusLoading(id);
    try {
      await dispatch(approveSchedule({ 
        id, 
        status, 
        rejectionReason: status === 'REJECTED' ? declineReason : undefined 
      })).unwrap();
      toast.success(`Schedule ${status.toLowerCase()} successfully`);
      setIsRejectModalOpen(false);
      setDeclineReason('');
    } catch (error: any) {
      toast.error(error || `Failed to ${status.toLowerCase()} schedule`);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleOpenApplications = async (schedule: InterviewSchedule) => {
    setSelectedSchedule(schedule);
    setIsApplicationsModalOpen(true);
    setAppsLoading(schedule.id);
    try {
      await dispatch(fetchScheduleApplications({ id: schedule.id })).unwrap();
    } catch (error: any) {
      toast.error(error || "Failed to load candidates");
    } finally {
      setAppsLoading(null);
    }
  };

  const handleOpenMessages = async (schedule: InterviewSchedule) => {
    setSelectedSchedule(schedule);
    setIsMessagesOpen(true);
    setMsgLoading(schedule.id);
    try {
      await dispatch(fetchScheduleMessages(schedule.id)).unwrap();
    } catch (error: any) {
      toast.error(error || "Failed to load messages");
    } finally {
      setMsgLoading(null);
    }
  };

  const handleSendMessage = async () => {
    if (!activeSchedule || !messageText.trim()) return;
    setSendingMsg(true);
    try {
      const formalNote = messageText.trim();
      await dispatch(sendScheduleMessage({ id: activeSchedule.id, message: formalNote })).unwrap();
      await dispatch(fetchScheduleMessages(activeSchedule.id)).unwrap();
      setMessageText('');
    } catch (error: any) {
      toast.error(error || "Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.map(s => ({
      ...s,
      // Derive jobTitle from the first job in the schedule
      jobTitle: s.jobUniversities?.[0]?.job?.title || 'Recruitment Drive',
      // Derive adminName from the admin user relation
      adminName: s.admin?.user ? `${s.admin.user.firstname} ${s.admin.user.lastname || ''}` : 'Placement Admin'
    })).filter(s => {
      const matchesFilter = filterType === 'ALL' || s.companyApprovalStatus === filterType;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [schedules, filterType, searchQuery]);

  const stats = useMemo(() => ({
    total: schedules.length,
    pending: schedules.filter(s => s.companyApprovalStatus === 'PENDING').length,
    activeCandidates: schedules.reduce((acc, s) => acc + (s.jobUniversities?.reduce((sum: number, ju: any) => sum + (ju._count?.applications || 0), 0) || 0), 0),
  }), [schedules]);

  return (
    <div className="flex flex-col gap-10 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Hero Banner */}
      <div className="company-hero-banner relative group">
        <div className="hero-mesh">
          <div className="bubble-primary" />
          <div className="bubble-secondary" />
        </div>
        <div className="hero-texture" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="hero-badge">
              <Calendar className="w-3 h-3" />
              <span>Selection Pipeline</span>
            </div>
            <h1 className="hero-title">
              Interview <span>Scheduler</span>
            </h1>
            <p className="hero-description text-blue-100/80">
              Manage your recruitment rounds with precision. Review candidate lists, 
              coordinate with the placement office, and track selection progress in real-time.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {coordinators.slice(0, 3).map((name, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl border-2 border-primary bg-blue-400 flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform cursor-help overflow-hidden" title={name}>
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white">
                      {name.charAt(0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-bold text-blue-100/90 tracking-wide">
                {coordinators.length} Active Coordinators Available
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* <div className="glass-card p-5 rounded-3xl border-white/10 flex flex-col items-center justify-center min-w-[140px] backdrop-blur-xl bg-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 mb-1">Status</span>
              <span className="text-2xl font-black text-white tracking-tighter">{stats.pending}</span>
              <span className="text-[9px] font-bold text-blue-200/80 mt-1 uppercase">Pending Review</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Rounds', value: stats.total, color: 'indigo', icon: Calendar, trend: 'All Drives' },
          { label: 'Needs Action', value: stats.pending, color: 'amber', icon: Clock, trend: 'Awaiting Approval' },
          { label: 'Shortlisted Students', value: stats.activeCandidates, color: 'emerald', icon: Users, trend: 'Across All Rounds' }
        ].map((stat, idx) => (
          <div key={idx} className={cn("premium-stat-card", `stat-glow-${stat.color}`)}>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("stat-icon-box", 
                stat.color === 'indigo' ? "bg-primary/10 text-primary" : 
                stat.color === 'amber' ? "bg-amber-500/10 text-amber-600" : 
                "bg-emerald-500/10 text-emerald-600"
              )}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <Badge variant="outline" className="border-border/50 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 opacity-60">
                {stat.trend}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="stat-value-text">{stat.value}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 dark:bg-card/40 backdrop-blur-md p-3 rounded-2xl border border-border/50">
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${filterType === type
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-[380px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by title or job role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-muted/30 border-transparent focus:bg-white dark:focus:bg-background focus:border-primary/20 rounded-xl transition-all font-bold text-xs"
            />
          </div>
        </div>

        {/* Schedule List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 saas-card bg-transparent border-dashed border-2">
               <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary/10 border-b-primary rounded-full animate-spin [animation-duration:1s]" />
                </div>
              </div>
              <p className="text-foreground font-black text-xs tracking-[0.4em] uppercase">Loading Pipeline</p>
            </div>
          ) : filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className={cn(
                  "group saas-card p-0 overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500",
                  schedule.companyApprovalStatus === 'PENDING' && "border-amber-500/20 bg-amber-500/[0.01]"
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Round Type & Job Info */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* Minimalist Date Display */}
                    <div className="flex flex-col items-center justify-center min-w-[90px] h-[90px] rounded-[2rem] bg-muted/40 border border-border/50 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                      <span className="text-2xl font-black text-foreground group-hover:text-white transition-colors">
                        {new Date(schedule.startTime).getDate()}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white/80 transition-colors">
                        {new Date(schedule.startTime).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                          {schedule.jobTitle}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground/40 tracking-widest uppercase">
                          REF #{String(schedule.id).padStart(4, '0')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {schedule.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wide">
                            <Clock size={14} className="text-primary/60" />
                            <span>
                              {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wide">
                            <MapPin size={14} className="text-primary/60" />
                            <span>{schedule.venue || 'Virtual Round'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleOpenApplications(schedule)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 text-[10px] font-bold text-muted-foreground hover:text-primary transition-all border border-border/50 uppercase tracking-widest group/btn"
                        >
                          <Users size={12} className="group-hover/btn:scale-110 transition-transform" />
                          <span>Candidates {(schedule.applications?.length || 0) > 0 ? `(${schedule.applications.length})` : ''}</span>
                        </button>
                        <button
                          onClick={() => handleOpenMessages(schedule)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-amber-500/10 text-[10px] font-bold text-muted-foreground hover:text-amber-600 transition-all border border-border/50 uppercase tracking-widest group/btn"
                        >
                          <MessageSquare size={12} className="group-hover/btn:scale-110 transition-transform" />
                          <span>Discussions {(schedule.messages?.length || 0) > 0 && `(${schedule.messages.length})`}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Section */}
                  <div className="lg:w-[240px] p-6 md:p-8 bg-muted/20 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-border/50">
                    {schedule.companyApprovalStatus === 'PENDING' ? (
                      <div className="flex flex-col gap-3 w-full">
                        <Button 
                          onClick={() => handleUpdateStatus(schedule.id, 'APPROVED')}
                          disabled={statusLoading === schedule.id}
                          className="w-full rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          {statusLoading === schedule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Round'}
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => { setSelectedSchedule(schedule); setIsRejectModalOpen(true); }}
                          className="w-full text-destructive hover:bg-destructive/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-11"
                        >
                          Decline / Notes
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 w-full">
                        <div className={cn(
                          "w-full py-2.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] border flex items-center justify-center gap-2",
                          schedule.companyApprovalStatus === 'APPROVED' 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}>
                          {schedule.companyApprovalStatus === 'APPROVED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {schedule.companyApprovalStatus}
                        </div>
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                          Decision finalized
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card/40 rounded-[3rem] p-24 text-center border-2 border-dashed border-border/50 shadow-inner group">
              <div className="w-20 h-20 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-500">
                <Calendar className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 tracking-tight uppercase">Empty Pipeline</h3>
              <p className="text-muted-foreground font-medium text-xs max-w-sm mx-auto mb-8 leading-relaxed">
                No interview rounds match your current filters. New schedules will appear once the placement office confirms the coordination.
              </p>
              <Button
                variant="outline"
                onClick={() => { setFilterType('ALL'); setSearchQuery(''); }}
                className="text-primary border-primary/20 hover:bg-primary/5 rounded-xl font-bold text-[10px] uppercase tracking-widest px-8"
              >
                Reset Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Candidates Modal */}
      <Modal
        isOpen={isApplicationsModalOpen}
        onClose={() => setIsApplicationsModalOpen(false)}
        title="Round Candidates"
        subtitle={`Viewing shortlists for ${activeSchedule?.title}`}
      >
        <div className="space-y-6 pt-2">
          {appsLoading === activeSchedule?.id ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin opacity-20" />
              <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Syncing Student Data...</p>
            </div>
          ) : activeSchedule?.applications && activeSchedule.applications.length > 0 ? (
            <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {activeSchedule.applications.map((app: any) => (
                <div key={app.applicationId || app.id} className="flex items-center justify-between p-4 saas-card border-border/50 hover:border-primary/20 hover:bg-primary/[0.01] transition-all group rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-black text-xs border border-primary/10 shadow-sm">
                      {(app.name || app.student?.user?.firstname || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-foreground">{app.name || (app.student?.user?.firstname ? `${app.student.user.firstname} ${app.student.user.lastname || ''}` : 'Candidate')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {app.student?.rollNumber || `ID: #${app.studentId || app.applicationId}`}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {app.department?.name || app.student?.department?.name || 'Technical'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-muted/50 text-muted-foreground border-transparent text-[9px] font-black uppercase tracking-widest">
                    {app.status || 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/5">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center">
                <Users size={32} className="text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-tight">No Students Registered</p>
                <p className="text-xs text-muted-foreground font-medium max-w-[240px]">Wait for the admin to sync the candidate shortlist for this round.</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => setIsApplicationsModalOpen(false)}
              className="w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] bg-muted hover:bg-muted/80 text-foreground border-transparent"
            >
              Close List
            </Button>
          </div>
        </div>
      </Modal>

      {/* Decline/Reschedule Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Request Coordination"
        subtitle="Provide feedback to the placement office"
      >
        <div className="space-y-6 pt-2">
          <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20 flex items-start gap-4">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Info size={18} className="text-amber-600" />
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold leading-relaxed">
              Decline only if there's a critical scheduling conflict. Providing clear reasoning helps the admin find a better slot for your team.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Change Request Notes</label>
            <textarea
              className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-bold min-h-[160px] resize-none"
              placeholder="e.g., Clashing with our internal leadership sync. Possible to shift this to the next day morning?"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="flex-1 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              Go Back
            </Button>
            <Button
              disabled={!declineReason.trim() || statusLoading !== null}
              variant="destructive"
              className="flex-1 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-destructive/10"
              onClick={() => selectedSchedule && handleUpdateStatus(selectedSchedule.id, 'REJECTED')}
            >
              {statusLoading !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discussion Modal */}
      <Modal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        title="Round Discussion"
        subtitle={`Communications for ${activeSchedule?.title}`}
      >
        <div className="flex flex-col gap-6 pt-2">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth p-1">
            {msgLoading === activeSchedule?.id ? (
              <div className="py-20 flex flex-col items-center gap-4">
                 <Loader2 className="w-8 h-8 text-primary animate-spin opacity-20" />
                 <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Loading Conversation...</p>
              </div>
            ) : activeSchedule?.messages && activeSchedule.messages.length > 0 ? (
              [...activeSchedule.messages].reverse().map((msg: any) => (
                <div key={msg.id} className={cn(
                  "p-5 rounded-2xl border transition-all",
                  msg.isAdmin 
                    ? "bg-primary/[0.03] border-primary/10 mr-8" 
                    : "bg-muted/40 border-border/50 ml-8"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm",
                        msg.isAdmin ? "bg-primary text-white" : "bg-emerald-500 text-white"
                      )}>
                        {msg.isAdmin ? 'A' : 'Y'}
                      </div>
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                        {msg.isAdmin ? 'Placement Admin' : 'Your Team'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground/50">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
                    {msg.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/5">
                <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} className="text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">No Messages Yet</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Start a coordination thread with the placement office.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <textarea
              rows={3}
              placeholder="Type your message to the admin..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-bold resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendingMsg}
              className="w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-primary/20"
            >
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyInterviewManager;
