import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit3, Building2, Clock, 
  MapPin, Briefcase, ChevronDown, ChevronUp, 
  Search, MessageSquare, Send, Trash2,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

import { EditScheduleModal } from './components/EditScheduleModal';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { 
  fetchSchedules, 
  deleteSchedule, 
  fetchScheduleMessages, 
  sendScheduleMessage,
  fetchActiveCompaniesForSchedule,
  fetchActiveUniversitiesForSchedule,
  fetchCompanyJobsForSchedule,
  createSchedule
} from '@/redux/thunks/interviewThunk';
import { fetchCompanies } from '@/redux/thunks/companyThunk';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';

const InterviewSchedulerPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    schedules: rawSchedules, 
    loading,
    schedulerUniversities,
    schedulerJobs,
    schedulerLoading
  } = useSelector((state: RootState) => state.interview);
  const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];
  const { companies } = useSelector((state: RootState) => state.company);
  const { userType } = useSelector((state: RootState) => state.auth);

  const isSuperAdmin = userType === 'SUPER_ADMIN' || userType === 'SUPERADMIN';


  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [wizardCompanyId, setWizardCompanyId] = useState<string>('');
  const [wizardUniversityId, setWizardUniversityId] = useState<string>('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('edit');
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgLoading, setMsgLoading] = useState<number | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);

  const [schedulerType, setSchedulerType] = useState<'companies' | 'universities'>('companies');
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedJobToSchedule, setSelectedJobToSchedule] = useState<any>(null);
  const [finalizeData, setFinalizeData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    venue: '',
    message: ''
  });
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanies({ page: 1, limit: 100 }));
    // Fetch initial scheduler data
    if (schedulerType === 'companies') {
      dispatch(fetchActiveCompaniesForSchedule());
    } else {
      dispatch(fetchActiveUniversitiesForSchedule());
    }
  }, [dispatch, schedulerType]);

  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== 'all') {
      dispatch(fetchSchedules(Number(selectedCompanyId)));
    } else if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id.toString());
    }
  }, [selectedCompanyId, companies, dispatch]);

  const handleWizardCompanyChange = (id: string) => {
    setWizardCompanyId(id);
    if (id && id !== 'all') {
      dispatch(fetchCompanyJobsForSchedule(Number(id)));
      dispatch(fetchSchedules(Number(id))); // Ensure we have the schedules for this company to check against
    }
  };

  const handleWizardUniversityChange = (id: string) => {
    setWizardUniversityId(id);
    // Optionally fetch companies for this university if the API supports it
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleScheduleClick = (job: any) => {
    setSelectedJobToSchedule(job);
    setFinalizeData({
      title: `${job.job?.title || 'Drive'} @ ${job.university?.name || job.job?.company?.name || 'Campus'}`,
      startTime: '',
      endTime: '',
      venue: '',
      message: ''
    });
    setIsFinalizeModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!finalizeData.title || !finalizeData.startTime || !finalizeData.endTime || !finalizeData.venue) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmittingSchedule(true);
    try {
      const payload = {
        title: finalizeData.title,
        companyId: selectedJobToSchedule.job.companyId,
        universityId: selectedJobToSchedule.universityId,
        jobUniversityIds: [selectedJobToSchedule.id],
        startTime: new Date(finalizeData.startTime).toISOString(),
        endTime: new Date(finalizeData.endTime).toISOString(),
        venue: finalizeData.venue
      };

      const res = await dispatch(createSchedule(payload)).unwrap();
      
      if (finalizeData.message.trim() && res?.data?.id) {
        await dispatch(sendScheduleMessage({ id: res.data.id, message: finalizeData.message.trim() })).unwrap();
      }

      toast.success("Interview scheduled successfully!");
      setIsFinalizeModalOpen(false);
      setIsWizardOpen(false);
      // Refresh schedules if needed
      if (selectedCompanyId) {
        dispatch(fetchSchedules(Number(selectedCompanyId)));
      }
    } catch (error: any) {
      toast.error(error || "Failed to schedule interview");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    setMode('edit');
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const activeSchedule = useMemo(
    () => schedules.find((s: any) => s.id === selectedSchedule?.id) || selectedSchedule,
    [schedules, selectedSchedule]
  );

  const handleOpenMessages = async (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setIsMessagesOpen(true);
    setMsgLoading(schedule.id);
    try {
      await dispatch(fetchScheduleMessages(schedule.id)).unwrap();
    } catch (error: any) {
      toast.error(error || "Failed to load notes");
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
      toast.success("Formal note sent successfully");
    } catch (error: any) {
      toast.error(error || "Failed to send note");
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredSchedules = Array.isArray(schedules)
    ? schedules.filter((s) => {
      const matchesCompany =
        selectedCompanyId === 'all' ||
        String(s.companyId) === selectedCompanyId;
      const matchesSearch =
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCompany && matchesSearch;
    })
    : [];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Interview Scheduler"
        description="Coordinate and manage interview timelines for diverse recruitment drives."
        badge="Ops Center"
        icon={Calendar}
        variant="indigo"
      >
        <Button 
          onClick={() => setIsWizardOpen(true)}
          className="h-11 px-8 rounded-2xl bg-[#1A6CFF] hover:bg-[#0055FF] text-white font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-[#1A6CFF]/20 active:scale-95 transition-all flex items-center gap-2.5"
        >
          <Plus size={18} />
          Schedule Drive
        </Button>
      </PageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/50 backdrop-blur-md p-6 rounded-[2rem] border border-border shadow-sm mb-10">
        <div className="flex flex-wrap items-center gap-4">
          {isSuperAdmin && (
            <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border">
              <button
                onClick={() => setSchedulerType('companies')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  schedulerType === 'companies' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Companies
              </button>
              <button
                onClick={() => setSchedulerType('universities')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  schedulerType === 'universities' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Universities
              </button>
            </div>
          )}

          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-full lg:w-[220px] h-12 rounded-2xl bg-background border-border text-xs font-black uppercase tracking-widest px-5 shadow-sm">
              <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border shadow-2xl">
              <SelectItem value="all">All Registered Entities</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full lg:w-[320px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search active timelines..."
            className="pl-11 pr-5 h-12 bg-background border-border rounded-2xl text-sm font-medium focus-visible:ring-primary/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-12">
        {/* Existing Schedules List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
              <Calendar className="size-4" />
              Active Timelines
            </h2>
          </div>
        {loading ? (
          <div className="py-32 flex justify-center">
            <Loader text="Syncing schedule data..." />
          </div>
        ) : filteredSchedules.length > 0 ? (
          filteredSchedules.map((drive) => {
            const dateInfo = formatDate(drive.startTime);
            const isExpanded = expandedId === drive.id;

            return (
              <div
                key={drive.id}
                className={cn(
                  "saas-card p-0 overflow-hidden transition-all duration-300",
                  isExpanded ? "ring-2 ring-primary/20 shadow-xl" : "hover:border-primary/20"
                )}
              >
                <div
                  className="flex flex-col lg:flex-row cursor-pointer group"
                  onClick={() => toggleExpand(drive.id)}
                >
                  {/* Date Sidebar */}
                  <div className="lg:w-32 bg-muted/30 p-6 flex flex-row lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border gap-4 lg:gap-1 shrink-0">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{dateInfo.month}</span>
                    <span className="text-4xl font-black text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                      {dateInfo.day}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{dateInfo.weekday}</span>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">{drive.title}</h3>
                        <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                          <Building2 size={13} />
                          {drive.company?.name || "Corporate Partner"}
                        </div>
                      </div>
                      <Badge className={cn(
                        "px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm self-start",
                        drive.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          drive.status === 'ONGOING' ? "bg-sky-500/10 text-sky-600 border-sky-500/20" :
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {drive.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary border border-border"><Clock size={16} /></div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Timing</p>
                          <p className="text-sm font-bold text-foreground">{formatTime(drive.startTime)} - {formatTime(drive.endTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-rose-500 border border-border"><MapPin size={16} /></div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Venue</p>
                          <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{drive.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-amber-500 border border-border"><Briefcase size={16} /></div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Linked Roles</p>
                          <p className="text-sm font-bold text-foreground">{drive.jobs?.length || 0} Openings</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="bg-muted/10 p-6 lg:w-56 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-border shrink-0">
                    <div className="flex flex-col gap-3 w-full">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2" 
                        onClick={(e) => handleOpenEdit(e, drive)}
                      >
                        <Edit3 size={14} />
                        Edit Schedule
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 h-10 rounded-xl border-border text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest" 
                          onClick={(e) => handleOpenMessages(e, drive)}
                        >
                          <MessageSquare size={14} />
                          Notes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="size-10 shrink-0 rounded-xl border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all" 
                          onClick={(e) => {
                            e.stopPropagation();
                            const toastId = toast.loading("Removing schedule...");
                            dispatch(deleteSchedule(drive.id))
                              .unwrap()
                              .then(() => toast.success("Schedule deleted", { id: toastId }))
                              .catch((err) => toast.error(err || "Delete failed", { id: toastId }));
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={(e) => { e.stopPropagation(); toggleExpand(drive.id); }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-muted/5"
                    >
                      <div className="p-5 md:p-6 space-y-8">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Sparkles size={18} />
                          </div>
                          <h4 className="text-base font-black text-foreground uppercase tracking-widest">Opening Specifications</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(drive.jobUniversities || []).map((ju: any) => (
                            <div key={ju.id} className="saas-card bg-background p-6 space-y-4 hover:border-primary/30 transition-all">
                              <div className="space-y-1">
                                <p className="font-bold text-foreground tracking-tight">{ju.job?.title}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                  <MapPin size={10} /> {ju.job?.location || 'Remote'}
                                </p>
                              </div>
                              <div className="pt-4 border-t border-border flex items-center justify-between">
                                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none">{ju.status}</Badge>
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest">View Specs</div>
                              </div>
                            </div>
                          )) || <div className="col-span-full py-12 text-muted-foreground font-bold text-center italic text-sm saas-card bg-muted/10 border-dashed">No openings linked to this schedule.</div>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center saas-card border-dashed bg-muted/10">
            <div className="size-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="size-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No schedules found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
              Adjust your filters or company selection to see interview schedules.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearchTerm(''); setSelectedCompanyId('all'); }}
              className="rounded-xl px-8 border-border font-bold text-xs uppercase tracking-widest h-11"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>
    </div>

      {/* Consolidated Schedule Wizard Modal */}
      {/* Consolidated Schedule Wizard Modal */}
<Modal
  isOpen={isWizardOpen}
  onClose={() => {
    setIsWizardOpen(false);
    setWizardCompanyId('');
    setWizardUniversityId('');
  }}
  title="Campus Drive Wizard"
  subtitle="Initiate and configure new recruitment timelines"
  maxWidth="max-w-5xl"
>
  <div className="space-y-10 py-2">
    {/* Step 1: Configuration Header */}
    <div className="relative overflow-hidden bg-indigo-600 dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row gap-6">
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <Sparkles size={120} className="text-white" />
      </div>
      
        {isSuperAdmin && (
          <div className="flex-1 space-y-3 w-full relative z-10">
            <label className="text-[10px] font-black text-white/60 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Building2 size={12} className="text-white/80" /> Target University
            </label>
            <div className="relative group">
              <Select value={wizardUniversityId} onValueChange={handleWizardUniversityChange}>
                <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold text-xs uppercase tracking-tight pl-12 focus:ring-white/20 transition-all hover:bg-white/10 data-placeholder:text-white/60 [&_svg]:text-white/70">
                  <SelectValue placeholder="Select University" />
                </SelectTrigger>
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-white transition-colors" />
                <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                  <SelectItem value="all">All Universities</SelectItem>
                  {schedulerUniversities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id.toString()}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3 w-full relative z-10">
          <label className="text-[10px] font-black text-white/60 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Briefcase size={12} className="text-white/80" /> Select Company
          </label>
          <div className="relative group">
            <Select value={wizardCompanyId} onValueChange={handleWizardCompanyChange}>
              <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold text-xs uppercase tracking-tight pl-12 focus:ring-white/20 transition-all hover:bg-white/10 data-placeholder:text-white/60 [&_svg]:text-white/70">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50 group-focus-within:text-white transition-colors" />
              <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                {companies.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id.toString()}>{comp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
    </div>

    {/* Section Title */}
    {wizardCompanyId && (
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Approved Openings</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            Ready for Scheduling
          </p>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found: {schedulerJobs.length}</span>
        </div>
      </div>
    )}

    <AnimatePresence mode="wait">
      {!wizardCompanyId ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="py-24 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
        >
          <div className="bg-white size-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Building2 className="size-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Awaiting Selection</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-[240px] mx-auto">Choose a partner company to view available job slots.</p>
        </motion.div>
      ) : schedulerLoading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />
            ))}
          </div>
        </motion.div>
      ) : schedulerJobs.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] border border-primary/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {companies.find(c => c.id.toString() === wizardCompanyId)?.name} 
                <span className="text-primary ml-2">({schedulerJobs.length} Positions)</span>
              </h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ready for scheduling</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-2xl py-3 px-5 border border-slate-200 shadow-sm text-center min-w-[90px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Approved</p>
                <p className="text-lg font-black text-emerald-600 leading-none">{schedulerJobs.filter(j => j.status === 'APPROVED').length}</p>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar py-2">
            {schedulerJobs.map((ju: any) => (
              <motion.div
                key={ju.id}
                whileHover={{ y: -4 }}
                className="group relative bg-white border border-slate-200 hover:border-primary/40 p-6 rounded-[2.5rem] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-14 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-primary transition-colors">
                      {ju.job?.title?.[0] || 'J'}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-black text-slate-900 text-lg leading-none tracking-tight truncate">{ju.job?.title}</h5>
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1 truncate">{ju.university?.name || "Global"}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black uppercase px-3 py-1 shrink-0">
                    {ju.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(ju.job?.eligibleDepartments || []).slice(0, 2).map((dept: any) => (
                    <Badge key={dept.id} variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] font-black uppercase px-3 py-1 tracking-widest">
                      {dept.name || `Dept #${dept.id}`}
                    </Badge>
                  ))}
                  {(ju.job?.eligibleDepartments || []).length > 2 && (
                    <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-slate-100 text-[8px] font-black uppercase px-3 py-1">
                      +{(ju.job?.eligibleDepartments || []).length - 2}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 mb-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Package</p>
                    <p className="text-sm font-black text-emerald-600">₹{(ju.salary / 100000).toFixed(1)} LPA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vacancies</p>
                    <p className="text-sm font-black text-slate-900">{ju.openings} Seats</p>
                  </div>
                </div>

                <Button 
                  onClick={() => handleScheduleClick(ju)}
                  disabled={schedules.some((s: any) => s.jobUniversities?.some((j: any) => j.id === ju.id || j.job?.id === ju.job?.id))}
                  className={cn(
                    "mt-auto w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3",
                    schedules.some((s: any) => s.jobUniversities?.some((j: any) => j.id === ju.id || j.job?.id === ju.job?.id))
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-slate-900 hover:bg-primary text-white shadow-lg shadow-slate-900/10 hover:shadow-primary/20"
                  )}
                >
                  {schedules.some((s: any) => s.jobUniversities?.some((j: any) => j.id === ju.id || j.job?.id === ju.job?.id)) ? (
                    <>
                      <CheckCircle2 size={16} />
                      Scheduled
                    </>
                  ) : (
                    <>
                      <Calendar size={16} />
                      Launch Drive
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Briefcase className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Approved Openings</h3>
            <p className="text-slate-500 text-sm mb-8">This company has no pending job approvals.</p>
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs" onClick={() => setWizardCompanyId('')}>
                Refresh List
            </Button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</Modal>


      {/* Finalize Schedule Modal */}
      {/* Finalize Schedule Modal */}
<Modal
  isOpen={isFinalizeModalOpen}
  onClose={() => setIsFinalizeModalOpen(false)}
  title="Drive Logistics"
  subtitle="Finalize the interview schedule details"
  maxWidth="max-w-xl"
>
  <div className="space-y-8 py-2">
    {/* Selection Summary Card */}
    {selectedJobToSchedule && (
      <div className="relative overflow-hidden bg-primary/[0.03] border border-primary/10 rounded-3xl p-6 flex items-center gap-5">
        <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
          <Briefcase className="size-7 text-primary" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
            {selectedJobToSchedule.job?.title}
          </h4>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <Building2 size={12} className="text-primary/60" />
            {selectedJobToSchedule.university?.name || "Global Selection"}
          </p>
        </div>
        <div className="absolute -right-4 -top-4 size-24 bg-primary/5 rounded-full blur-2xl" />
      </div>
    )}

    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drive Identifier</label>
        <div className="relative group">
          <Input 
            value={finalizeData.title}
            onChange={(e) => setFinalizeData({...finalizeData, title: e.target.value})}
            placeholder="e.g. 2024 Product Engineering Drive"
            className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold focus:ring-primary/20 text-slate-800 placeholder:font-medium pl-12 transition-all group-focus-within:bg-white"
          />
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date & Time</label>
          <div className="relative group">
            <Input 
              type="datetime-local"
              value={finalizeData.startTime}
              onChange={(e) => {
                const newStart = e.target.value;
                setFinalizeData(prev => {
                  const updates = { ...prev, startTime: newStart };
                  if (newStart) {
                    const startDate = new Date(newStart);
                    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                    updates.endTime = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  }
                  return updates;
                });
              }}
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-800 pl-12 focus:ring-primary/20 [color-scheme:light] transition-all group-focus-within:bg-white"
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected End</label>
          <div className="relative group">
            <Input 
              type="datetime-local"
              value={finalizeData.endTime}
              onChange={(e) => setFinalizeData({...finalizeData, endTime: e.target.value})}
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-800 pl-12 focus:ring-primary/20 [color-scheme:light] transition-all group-focus-within:bg-white"
            />
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue / Virtual Link</label>
        <div className="relative group">
          <Input 
              value={finalizeData.venue}
              onChange={(e) => setFinalizeData({...finalizeData, venue: e.target.value})}
              placeholder="Room 402 or Zoom/Meet URL"
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold pl-12 text-slate-800 focus:ring-primary/20 transition-all group-focus-within:bg-white"
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidate Briefing</label>
        <div className="relative group">
          <Textarea 
            placeholder="Detailed instructions for students..."
            value={finalizeData.message}
            onChange={(e) => setFinalizeData({...finalizeData, message: e.target.value})}
            className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-200 font-medium p-5 pl-12 text-slate-700 focus:ring-primary/20 resize-none transition-all group-focus-within:bg-white"
          />
          <MessageSquare className="absolute left-4 top-5 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
      </div>
    </div>

    <div className="pt-4 flex flex-col gap-3">
      <Button 
        onClick={handleFinalSubmit}
        disabled={isSubmittingSchedule}
        className="h-14 bg-primary hover:bg-[#0045FF] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        {isSubmittingSchedule ? <Loader size="sm" /> : (
          <>
            <Send size={16} />
            Confirm & Launch Timeline
          </>
        )}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => setIsFinalizeModalOpen(false)}
        className="h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-slate-100 transition-all"
      >
        Go Back
      </Button>
    </div>
  </div>
</Modal>

      <EditScheduleModal
        schedule={selectedSchedule}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode={mode}
      />

     <Modal
  isOpen={isMessagesOpen}
  onClose={() => setIsMessagesOpen(false)}
  title="Drive Communications"
  subtitle={`History for ${activeSchedule?.title || "Drive"}`}
>
  <div className="flex flex-col gap-6 py-4">
    <div className="space-y-6 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
      {msgLoading === activeSchedule?.id ? (
        <div className="py-20 text-center">
          <Loader size="sm" text="Syncing logs..." />
        </div>
      ) : activeSchedule?.messages && activeSchedule.messages.length > 0 ? (
        [...activeSchedule.messages].reverse().map((msg: any) => (
          <div key={msg.id} className="relative group">
            <div className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'}`}>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                 {msg.senderName || (msg.isAdmin ? 'System Admin' : 'Partner')} • Just now
               </span>
               <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed max-w-[85%] shadow-sm border 
                 ${msg.isAdmin ? 'bg-white border-slate-200 text-slate-800' : 'bg-primary text-white border-primary'}`}>
                 {msg.message}
               </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="size-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
             <MessageSquare className="size-6 text-slate-300" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No internal notes yet.</p>
        </div>
      )}
    </div>

    <div className="pt-6 border-t border-slate-100">
      <div className="bg-slate-50 p-2 rounded-[1.8rem] border border-slate-200 shadow-inner">
        <textarea
          rows={3}
          placeholder="Type a formal update..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="w-full px-4 py-3 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none resize-none"
        />
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-2">
            <div className="flex gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Internal Visibility</span>
            </div>
            <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendingMsg}
                className="bg-slate-900 hover:bg-primary text-white rounded-2xl px-6 h-10 font-bold text-[10px] uppercase tracking-widest transition-all"
            >
                {sendingMsg ? <Loader size="sm" /> : <><Send className="size-3 mr-2" /> Dispatch</>}
            </Button>
        </div>
      </div>
    </div>
  </div>
</Modal>
    </AdminPageLayout>
  );
};

export default InterviewSchedulerPage;