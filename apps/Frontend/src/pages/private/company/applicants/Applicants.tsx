import React from 'react';
import { 
  Search, 
  User, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Target, 
  X, 
  FileText, 
  ExternalLink, 
  FilterX, 
  Award, 
  Code2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobApplications, updateJobApplicationStatus } from '@/redux/thunks/companyThunk';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { CandidateDetailsDrawer } from './CandidateDetailsDrawer';
import { StatusUpdateModal } from './StatusUpdateModal';
import { cn } from '@/lib/utils';

// Dynamic avatar gradient generator based on candidate's name for visual aesthetic consistency
const getAvatarGradient = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-indigo-500 to-purple-500 text-indigo-50 dark:from-indigo-600 dark:to-purple-600',
    'from-emerald-400 to-teal-600 text-emerald-50 dark:from-emerald-500 dark:to-teal-700',
    'from-pink-500 to-rose-500 text-pink-50 dark:from-pink-600 dark:to-rose-600',
    'from-amber-400 to-orange-500 text-amber-50 dark:from-amber-500 dark:to-orange-600',
    'from-blue-500 to-cyan-500 text-blue-50 dark:from-blue-600 dark:to-cyan-600',
    'from-violet-500 to-fuchsia-500 text-violet-50 dark:from-violet-600 dark:to-fuchsia-600'
  ];
  return gradients[hash % gradients.length];
};

// Compact relative time formatting helper
const getRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'recently';
  }
};

export const STATUS_FLOW = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'OFFER_ACCEPTED'];

export const isBackward = (current: string, next: string) => {
  if (next === 'REJECTED') return false; // Can always reject unless already rejected or finalized
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);
  
  // If next status is not in our primary flow (like REJECTED), we handle it differently
  if (nextIndex === -1) return false; 
  if (currentIndex === -1) return false;

  return nextIndex < currentIndex;
};

export const isRoundBackward = (currentRound: string | null | undefined, nextRound: string) => {
  if (!currentRound) return false;
  const ROUNDS_ORDER = ['APTITUDE', 'TECHNICAL', 'HR'];
  const currentIndex = ROUNDS_ORDER.indexOf(currentRound);
  const nextIndex = ROUNDS_ORDER.indexOf(nextRound);
  
  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex < currentIndex;
};

export const formatRound = (round: string) => {
  return round
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatStage = (status: string, round?: string | null) => {
  switch (status) {
    case 'APPLIED':
      return 'Application Submitted';
    case 'SHORTLISTED':
      return round ? `Shortlisted: ${formatRound(round)}` : 'Shortlisted';
    case 'SELECTED':
      return 'Selected / Offered';
    case 'REJECTED':
      return 'Rejected';
    case 'OFFER_ACCEPTED':
      return 'Offer Accepted';
    case 'OFFER_REJECTED':
      return 'Offer Declined';
    case 'WITHDRAWN':
      return 'Withdrawn';
    case 'NOT_ELIGIBLE':
      return 'Not Eligible';
    default:
      return status;
  }
};

const getPresetReason = (status: string, round: string) => {
  if (status === 'SHORTLISTED') {
    switch (round) {
      case 'APTITUDE':
        return 'Resume shortlisted';
      case 'TECHNICAL':
        return 'Cleared aptitude round';
      case 'HR':
        return 'Technical round cleared';
      default:
        return 'Process progressed to next round';
    }
  }
  if (status === 'SELECTED') {
    return 'Excellent overall performance';
  }
  if (status === 'REJECTED') {
    return 'Did not clear technical interview';
  }
  return '';
};

const Applicants: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.company);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [selectedJob, setSelectedJob] = React.useState('All Jobs');
  const [selectedDepartment, setSelectedDepartment] = React.useState('All Departments');

  // Custom states for timeline history, candidate details sheet, and recruitment modal
  const [selectedCandidateForDrawer, setSelectedCandidateForDrawer] = React.useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<any>(null);
  const [targetStatus, setTargetStatus] = React.useState<string>('');
  const [targetRound, setTargetRound] = React.useState<string>('APTITUDE');
  const [reasonText, setReasonText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<{ title: string; message: string; type: 'error'; icon?: string } | null>(null);

  const validationError = React.useMemo(() => {
    if (!selectedApp) return null;

    // 1. Rejected application
    if (selectedApp.status === 'REJECTED') {
      return {
        title: 'Application Re-evaluation',
        message: 'This candidate is currently rejected. You can update their status to reopen their application.',
        type: 'info',
        icon: 'Info'
      };
    }

    // 2. Finalized application
    if (['OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(selectedApp.status)) {
      return {
        title: 'Application override',
        message: 'This application is in a finalized state. You can still adjust the status or round if needed.',
        type: 'info',
        icon: 'Info'
      };
    }

    // 3. Offer Accepted Elsewhere
    if (selectedApp.student?.isPlaced && selectedApp.status !== 'OFFER_ACCEPTED') {
      return {
        title: 'Candidate Already Placed',
        message: 'This student has accepted another offer. You can still adjust their status on this job application if needed.',
        type: 'info',
        icon: 'Info'
      };
    }

    // 4. Eligibility failure
    const reqCgpa = selectedApp.jobUniversity?.minCgpa || 0;
    const reqBacklogs = selectedApp.jobUniversity?.maxBacklogs || 0;
    const candCgpa = selectedApp.student?.cgpa || 0;
    const candBacklogs = selectedApp.student?.activeBacklogs || 0;
    const isEligible = candCgpa >= reqCgpa && candBacklogs <= reqBacklogs;
    if (!isEligible && (targetStatus === 'SHORTLISTED' || targetStatus === 'SELECTED')) {
      return {
        title: 'Candidate Not Eligible',
        message: 'This student does not meet the CGPA or backlog requirements for this position.',
        type: 'warning',
        icon: 'Info'
      };
    }

    // 5. Invalid status transition
    if (isBackward(selectedApp.status, targetStatus)) {
      return {
        title: 'Invalid Workflow Transition',
        message: 'Candidates must progress sequentially through Aptitude, Technical, and HR rounds.',
        type: 'error',
        icon: 'AlertCircle'
      };
    }

    // 6. Invalid round transition
    if (targetStatus === 'SHORTLISTED' && isRoundBackward(selectedApp.currentRound, targetRound)) {
      return {
        title: 'Invalid Workflow Transition',
        message: 'Candidates must progress sequentially through Aptitude, Technical, and HR rounds.',
        type: 'error',
        icon: 'AlertCircle'
      };
    }

    // 7. Destructive action warning for REJECTED status
    if (targetStatus === 'REJECTED') {
      return {
        title: 'Confirm Application Closure',
        message: 'Rejecting this candidate will permanently close their application. This action cannot be undone.',
        type: 'warning',
        icon: 'AlertCircle'
      };
    }

    return null;
  }, [selectedApp, targetStatus, targetRound]);

  const openUpdateModal = React.useCallback((app: any, newStatus: string, initialRound?: string) => {
    setSubmissionError(null);
    if (newStatus === app.status && newStatus !== 'SHORTLISTED') return;

    if (isBackward(app.status, newStatus)) {
      toast.error("Invalid Workflow Transition", {
        description: "Candidates must progress sequentially through Aptitude, Technical, and HR rounds."
      });
      return;
    }

    setSelectedApp(app);
    setTargetStatus(newStatus);
    
    // Set intelligent defaults for rounds and reasons based on the new status
    if (newStatus === 'SHORTLISTED') {
      let nextRound = initialRound || 'APTITUDE';
      if (!initialRound) {
        if (app.currentRound === 'APTITUDE') nextRound = 'TECHNICAL';
        else if (app.currentRound === 'TECHNICAL') nextRound = 'HR';
      }
      
      setTargetRound(nextRound);
      setReasonText(getPresetReason('SHORTLISTED', nextRound));
    } else {
      setTargetRound('');
      setReasonText(getPresetReason(newStatus, ''));
    }
    
    setIsUpdateModalOpen(true);
  }, []);

  const submitStatusUpdate = async () => {
    if (!selectedApp) return;

    // Frontend validation: Status cannot be moved backward
    if (isBackward(selectedApp.status, targetStatus)) {
      toast.error(`Process integrity error: Cannot move status backward from ${formatStage(selectedApp.status, selectedApp.currentRound)} to ${formatStage(targetStatus, targetRound)}`);
      return;
    }

    // Frontend validation: Round cannot be moved backward
    if (targetStatus === 'SHORTLISTED' && isRoundBackward(selectedApp.currentRound, targetRound)) {
      toast.error(`Process integrity error: Cannot move interview round backward from ${formatRound(selectedApp.currentRound || '')} to ${formatRound(targetRound)}`);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    const toastId = toast.loading(`Updating recruitment stage...`);
    try {
      const result = await dispatch(updateJobApplicationStatus({
        id: selectedApp.id,
        status: targetStatus,
        currentRound: targetStatus === 'SHORTLISTED' ? targetRound : undefined,
        reason: reasonText.trim() || undefined
      })).unwrap();
      
      toast.success("Candidate recruitment stage updated!", { id: toastId });
      setIsUpdateModalOpen(false);
      
      // Update selectedCandidateForDrawer state to reflect immediate updates
      if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === selectedApp.id) {
        setSelectedCandidateForDrawer((prev: any) => ({
          ...prev,
          status: targetStatus,
          currentRound: targetStatus === 'SHORTLISTED' ? targetRound : undefined,
          history: result?.data?.history || result?.history || [
            ...(prev.history || []),
            {
              id: Date.now(),
              status: targetStatus,
              round: targetStatus === 'SHORTLISTED' ? targetRound : undefined,
              reason: reasonText.trim() || undefined,
              createdAt: new Date().toISOString()
            }
          ]
        }));
      }

      // Silent background fetch to keep frontend state absolutely synced with DB
      const params: { status?: string } = {};
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      dispatch(fetchJobApplications(params));

      setSelectedApp(null);
    } catch (err: any) {
      toast.dismiss(toastId);
      const rawError = typeof err === 'string' ? err : err?.message || err?.error || "";
      
      let title = "Unable to Update Status";
      let message = "We couldn’t save the latest application status. Please retry in a few moments.";
      let icon = "AlertCircle";

      if (rawError.toLowerCase().includes("permission") || rawError.toLowerCase().includes("unauthorized") || rawError.toLowerCase().includes("forbidden") || rawError.toLowerCase().includes("access")) {
        title = "Access Restricted";
        message = "You do not have permission to modify this application lifecycle.";
        icon = "ShieldAlert";
      } else if (rawError.toLowerCase().includes("finalized") || rawError.toLowerCase().includes("terminal") || rawError.toLowerCase().includes("closed")) {
        title = "Application Already Finalized";
        message = "This candidate has already been selected or rejected and can no longer move through the pipeline.";
        icon = "ShieldAlert";
      } else if (rawError.toLowerCase().includes("eligible") || rawError.toLowerCase().includes("criteria") || rawError.toLowerCase().includes("cgpa") || rawError.toLowerCase().includes("backlog")) {
        title = "Candidate Not Eligible";
        message = "This student does not meet the CGPA or backlog requirements for this position.";
        icon = "Info";
      } else if (rawError.toLowerCase().includes("transition") || rawError.toLowerCase().includes("sequence") || rawError.toLowerCase().includes("backward")) {
        title = "Invalid Workflow Transition";
        message = "Candidates must progress sequentially through Aptitude, Technical, and HR rounds.";
        icon = "AlertCircle";
      } else if (rawError.toLowerCase().includes("placed") || rawError.toLowerCase().includes("another offer") || rawError.toLowerCase().includes("accepted")) {
        title = "Candidate Already Placed";
        message = "This student has accepted another offer and is no longer available for further processing.";
        icon = "Info";
      } else if (rawError) {
        title = "Hiring Stage Update Failed";
        message = rawError;
      }

      setSubmissionError({ title, message, type: 'error', icon });
      toast.error(title, { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const params: { status?: string } = {};
    if (selectedStatus !== 'ALL') {
      params.status = selectedStatus;
    }
    dispatch(fetchJobApplications(params));
  }, [dispatch, selectedStatus]);

  // Enhanced search to query name, email, department or university dynamically (highly optimized with useMemo)
  const filteredApplicants = React.useMemo(() => {
    return (applications || []).filter((app: any) => {
      const studentName = `${app.student?.user?.firstname || ''} ${app.student?.user?.lastname || ''}`.toLowerCase();
      const email = (app.student?.user?.email || '').toLowerCase();
      const department = (app.student?.department?.name || '').toLowerCase();
      const university = (app.jobUniversity?.university?.name || '').toLowerCase();
      
      const matchesSearch = 
        studentName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        department.includes(searchTerm.toLowerCase()) ||
        university.includes(searchTerm.toLowerCase());
        
      const matchesJob = selectedJob === 'All Jobs' || app.jobUniversity?.job?.title === selectedJob;
      const matchesDepartment = selectedDepartment === 'All Departments' || app.student?.department?.name === selectedDepartment;
      return matchesSearch && matchesJob && matchesDepartment;
    });
  }, [applications, searchTerm, selectedJob, selectedDepartment]);

  // Pre-calculate unique jobs list only when applications change
  const uniqueJobs = React.useMemo(() => {
    return Array.from(
      new Set((applications || []).map((app: any) => app.jobUniversity?.job?.title))
    ).filter(Boolean);
  }, [applications]);

  // Pre-calculate unique departments list only when applications change
  const uniqueDepartments = React.useMemo(() => {
    return Array.from(
      new Set((applications || []).map((app: any) => app.student?.department?.name))
    ).filter(Boolean);
  }, [applications]);

  // Dynamic statistics calculations
  const stats = React.useMemo(() => {
    const apps = applications || [];
    const total = apps.length;
    const shortlisted = apps.filter((a: any) => a.status === 'SHORTLISTED').length;
    const selected = apps.filter((a: any) => a.status === 'SELECTED' || a.status === 'OFFER_ACCEPTED').length;
    const pending = apps.filter((a: any) => a.status === 'APPLIED').length;
    return { total, shortlisted, selected, pending };
  }, [applications]);

  // Resume safer open link (memoized to keep reference stable)
  const openResume = React.useCallback((url: string, name: string) => {
    if (!url) {
      toast.error("No resume references uploaded by candidate.");
      return;
    }
    const absoluteUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    toast.success(`Opening resume dossier for ${name}...`);
    window.open(absoluteUrl, '_blank');
  }, []);


  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
        
        {/* Hero Header Banner */}
        <div className="company-hero-banner relative overflow-hidden group rounded-3xl shadow-xl">
          <div className="hero-mesh">
            <div className="bubble-primary" />
            <div className="bubble-secondary" />
          </div>
          <div className="hero-texture" />
          
          <div className="relative z-10 space-y-4">
            <div className="hero-badge">
              <Target size={12} className="animate-pulse text-white" />
              Talent Acquisition Drive
            </div>
            <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-black">
              Placement <br />
              <span>Applicants</span>
            </h1>
            <p className="hero-description text-sm max-w-xl text-white/80 font-medium">
              Oversee applicant pathways, review candidate academic verifications, and run structured interview rounds. Click any candidate card or row to access the full applicant details dashboard.
            </p>
          </div>
        </div>

        {/* Dynamic Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
          
          <div className="saas-card relative overflow-hidden p-6 border border-border/60 rounded-2xl bg-card/50 backdrop-blur-xs transition-all hover:-translate-y-1 hover:shadow-lg shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Applicants</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{stats.total}</h3>
              </div>
              <div className="size-12 bg-primary/5 border border-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                <User size={18} />
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Drive Candidates</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/60 rounded-2xl bg-card/50 backdrop-blur-xs transition-all hover:-translate-y-1 hover:shadow-lg shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Shortlisted</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{stats.shortlisted}</h3>
              </div>
              <div className="size-12 bg-violet-500/5 border border-violet-500/10 text-violet-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Evaluation Stage</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/60 rounded-2xl bg-card/50 backdrop-blur-xs transition-all hover:-translate-y-1 hover:shadow-lg shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Selected</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{stats.selected}</h3>
              </div>
              <div className="size-12 bg-emerald-500/5 border border-emerald-500/10 text-emerald-650 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Offers Rolled Out</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/60 rounded-2xl bg-card/50 backdrop-blur-xs transition-all hover:-translate-y-1 hover:shadow-lg shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pending Review</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{stats.pending}</h3>
              </div>
              <div className="size-12 bg-amber-500/5 border border-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Awaiting Screening</div>
          </div>
        </div>
        {/* Premium Responsive Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-border/85 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] animate-in fade-in slide-in-from-top-2 duration-500 delay-200 w-full">
          
          {/* Smart Search Field */}
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, department, university..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 h-[40px] bg-background/50 hover:bg-background/80 focus:bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-xs shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2.5 w-full lg:w-auto justify-end">
            
            {/* Job Filter Dropdown */}
            <div className="min-w-[130px] flex-1">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-full h-[40px] bg-background/50 border-border/50 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 px-3.5 hover:border-primary/20 transition-all shadow-xs cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Jobs" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-2xl p-1.5 min-w-[200px]">
                  <SelectItem value="All Jobs" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">All Jobs</span>
                  </SelectItem>
                  {uniqueJobs.map((job) => (
                    <SelectItem key={job as string} value={job as string} className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                      <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">{job as string}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter Dropdown */}
            <div className="min-w-[140px] flex-1">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full h-[40px] bg-background/50 border-border/50 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 px-3.5 hover:border-primary/20 transition-all shadow-xs cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Users className="size-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Departments" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-2xl p-1.5 min-w-[200px]">
                  <SelectItem value="All Departments" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">All Depts</span>
                  </SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept as string} value={dept as string} className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                      <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">{dept as string}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="min-w-[120px] flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-[40px] bg-background/50 border-border/50 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 px-3.5 hover:border-primary/20 transition-all shadow-xs cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="size-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-2xl p-1.5 min-w-[180px]">
                  <SelectItem value="ALL" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">All Status</span>
                  </SelectItem>
                  <SelectItem value="APPLIED" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">Applied</span>
                  </SelectItem>
                  <SelectItem value="SHORTLISTED" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">Shortlisted</span>
                  </SelectItem>
                  <SelectItem value="SELECTED" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">Selected</span>
                  </SelectItem>
                  <SelectItem value="REJECTED" className="rounded-lg py-1.5 focus:bg-primary/5 cursor-pointer">
                    <span className="font-semibold text-xs text-zinc-650 dark:text-zinc-350">Rejected</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          
          {/* Active Filters Reset Button */}
          {(searchTerm || selectedJob !== 'All Jobs' || selectedDepartment !== 'All Departments' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedJob('All Jobs');
                setSelectedDepartment('All Departments');
                setSelectedStatus('ALL');
              }}
              className="flex items-center justify-center h-[40px] px-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/10 hover:border-rose-500/20 font-bold text-xs uppercase tracking-wider gap-1.5 transition-all w-full lg:w-auto shrink-0 cursor-pointer"
            >
              <FilterX size={13} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Unified Application Table View */}
        <div className="pb-12">
          {loading ? (
            <div className="py-24 text-center">
              <Loader text="Retrieving placement applicant records..." />
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="py-32 text-center saas-card border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-full border border-zinc-200/40 dark:border-zinc-700/30">
                  <User size={36} className="text-muted-foreground/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No applicants found</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Try widening your search terms or filters.</p>
                </div>
              </div>
            </div>
          ) : (            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] animate-in fade-in duration-500">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Candidate</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Applied Job</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Academic Standing</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-left">Pipeline Progress</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recruitment Stage</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredApplicants.map((app: any) => {
                        const studentName = `${app.student?.user?.firstname || 'Candidate'} ${app.student?.user?.lastname || ''}`;
                        
                        // Compute dynamic placement eligibility
                        const reqCgpa = app.jobUniversity?.minCgpa || 0;
                        const reqBacklogs = app.jobUniversity?.maxBacklogs || 0;
                        const candCgpa = app.student?.cgpa || 0;
                        const candBacklogs = app.student?.activeBacklogs || 0;
                        const isEligible = candCgpa >= reqCgpa && candBacklogs <= reqBacklogs;

                        const dropdownValue = app.status === 'SHORTLISTED' ? (app.currentRound || 'APTITUDE') : app.status;
                        const avatarGrad = getAvatarGradient(studentName);
                        const initials = studentName
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2) || "ST";

                        return (
                          <motion.tr
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-zinc-150/40 dark:border-zinc-850/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all duration-305 group"
                          >
                            {/* Candidate Column */}
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                <div 
                                  onClick={() => setSelectedCandidateForDrawer(app)}
                                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs tracking-tight bg-gradient-to-br shrink-0 ring-2 ring-offset-1 ring-offset-background cursor-pointer hover:scale-105 active:scale-95 transition-all duration-350 shadow-sm", avatarGrad)}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0 text-left">
                                  <h4 
                                    onClick={() => setSelectedCandidateForDrawer(app)}
                                    className="text-sm font-bold text-zinc-900 dark:text-white hover:text-primary transition-colors cursor-pointer flex items-center gap-1 group/name truncate"
                                  >
                                    {studentName}
                                    <ExternalLink size={12} className="opacity-0 group-hover/name:opacity-100 transition-opacity text-primary/70 shrink-0" />
                                  </h4>
                                  <span className="text-xs text-muted-foreground block truncate max-w-[180px] lowercase mt-0.5">
                                    {app.student?.user?.email}
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mt-0.5">
                                    {app.student?.department?.name || 'Department N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Job Details Column */}
                            <td className="px-6 py-4.5">
                              <div className="min-w-0 text-left">
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                                  {app.jobUniversity?.job?.title || 'Job Title N/A'}
                                </h4>
                                <span className="text-xs text-muted-foreground block truncate max-w-[200px] mt-0.5">
                                  {app.jobUniversity?.job?.company?.name || 'Your Company'}
                                </span>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{app.jobUniversity?.job?.location || 'Remote'}</span>
                                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 select-none">•</span>
                                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-lg border border-emerald-500/10">
                                    {app.jobUniversity?.job?.salary 
                                      ? `${(app.jobUniversity.job.salary / 100000).toFixed(1)} LPA` 
                                      : 'Competitive'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Academic Standing Column */}
                            <td className="px-6 py-4.5">
                              <div className="flex flex-col gap-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold text-violet-650 bg-violet-500/5 dark:bg-violet-500/10 dark:text-violet-400 rounded-lg border border-violet-500/10">
                                    CGPA {candCgpa}
                                  </span>
                                  <span className={cn(
                                    "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-lg border",
                                    isEligible 
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10" 
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10"
                                  )}>
                                    {isEligible ? 'Eligible' : 'Ineligible'}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-xs font-semibold block mt-0.5",
                                  candBacklogs > 0 ? "text-rose-500" : "text-muted-foreground"
                                )}>
                                  {candBacklogs > 0 ? `${candBacklogs} Active Backlog${candBacklogs > 1 ? 's' : ''}` : 'No Active Backlogs'}
                                </span>
                              </div>
                            </td>

                            {/* Pipeline Progress Column (Progress Bar) */}
                            <td className="px-6 py-4.5 text-left">
                              <div className="flex flex-col gap-2 items-start justify-center min-w-[150px]">
                                <span className={cn(
                                  "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide rounded-lg border",
                                  app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' :
                                  app.status === 'REJECTED' ? 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10' :
                                  'bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/10'
                                )}>
                                  {formatStage(app.status, app.currentRound).replace('Shortlisted: ', '')}
                                </span>
                                <div className="w-full max-w-[110px] h-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden shrink-0 shadow-inner">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-500 w-full' :
                                      app.status === 'REJECTED' ? 'bg-rose-500 w-full' :
                                      app.currentRound === 'HR' ? 'bg-violet-500 w-[80%]' :
                                      app.currentRound === 'TECHNICAL' ? 'bg-violet-500 w-[60%]' :
                                      app.currentRound === 'APTITUDE' ? 'bg-violet-500 w-[40%]' :
                                      'bg-violet-500 w-[20%]'
                                    )} 
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Recruitment Stage Column */}
                            <td className="px-6 py-4.5">
                              <div className="flex flex-col gap-1 items-start justify-center">
                                <Select
                                  value={dropdownValue}
                                  onValueChange={(value) => {
                                    if (value === 'APPLIED') {
                                      openUpdateModal(app, 'APPLIED');
                                    } else if (value === 'SELECTED') {
                                      openUpdateModal(app, 'SELECTED');
                                    } else if (value === 'REJECTED') {
                                      openUpdateModal(app, 'REJECTED');
                                    } else {
                                      openUpdateModal(app, 'SHORTLISTED', value);
                                    }
                                  }}
                                >
                                  <SelectTrigger className={`h-9 w-[145px] rounded-xl border text-xs font-bold uppercase tracking-wide px-3.5 transition-all flex items-center justify-between focus:ring-0 focus:ring-offset-0 cursor-pointer shadow-xs
                                    ${app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                      app.status === 'REJECTED' ? 'bg-red-50/40 hover:bg-red-50/60 border-red-100 text-red-600 dark:bg-red-950/10 dark:border-red-950/20 dark:text-red-400' :
                                      app.status === 'SHORTLISTED' ? 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-900/30 text-blue-700 dark:text-blue-400' :
                                      'bg-zinc-50/50 hover:bg-zinc-50/80 border-zinc-200/60 dark:bg-zinc-800/40 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300'}`}
                                  >
                                    <SelectValue>
                                      {formatStage(app.status, app.currentRound)}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-1.5 bg-white dark:bg-zinc-950 min-w-[165px]">
                                    <SelectItem value="APPLIED" disabled={isBackward(app.status, 'APPLIED')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-zinc-50 dark:focus:bg-zinc-900">
                                      <div className="flex items-center gap-2 font-medium">
                                        <Clock size={13} className="text-zinc-400 shrink-0" />
                                        <span>Applied</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="APTITUDE" disabled={app.status === 'SHORTLISTED' && isRoundBackward(app.currentRound, 'APTITUDE')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-blue-50/50 dark:focus:bg-blue-950/30">
                                      <div className="flex items-center gap-2 font-medium">
                                        <FileText size={13} className="text-violet-500 shrink-0" />
                                        <span>Aptitude Round</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="TECHNICAL" disabled={app.status === 'SHORTLISTED' && isRoundBackward(app.currentRound, 'TECHNICAL')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-blue-50/50 dark:focus:bg-blue-950/30">
                                      <div className="flex items-center gap-2 font-medium">
                                        <Code2 size={13} className="text-violet-500 shrink-0" />
                                        <span>Technical Round</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="HR" disabled={app.status === 'SHORTLISTED' && isRoundBackward(app.currentRound, 'HR')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-blue-50/50 dark:focus:bg-blue-950/30">
                                      <div className="flex items-center gap-2 font-medium">
                                        <User size={13} className="text-violet-500 shrink-0" />
                                        <span>HR Round</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="SELECTED" disabled={isBackward(app.status, 'SELECTED')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30">
                                      <div className="flex items-center gap-2 font-medium">
                                        <Award size={13} className="text-emerald-500 shrink-0" />
                                        <span>Select Candidate</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="REJECTED" disabled={isBackward(app.status, 'REJECTED')} className="rounded-lg py-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-rose-50/50 dark:focus:bg-rose-950/30">
                                      <div className="flex items-center gap-2 font-medium">
                                        <XCircle size={13} className="text-rose-500 shrink-0" />
                                        <span>Reject Candidate</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                  <Clock size={12} />
                                  Updated {getRelativeTime(app.updatedAt)}
                                </span>
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {app.student?.resumeUrl && (
                                  <button
                                    onClick={() => openResume(app.student?.resumeUrl, studentName)}
                                    className="h-9 w-9 rounded-xl border border-violet-500/10 bg-violet-500/5 text-violet-600 hover:bg-violet-500/10 hover:text-violet-750 dark:text-violet-400 dark:hover:text-violet-300 dark:bg-violet-500/10 dark:hover:bg-violet-500/15 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0"
                                    title="View CV Dossier"
                                  >
                                    <FileText size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedCandidateForDrawer(app)}
                                  className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer shrink-0"
                                  title="View Details Dashboard"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      <CandidateDetailsDrawer
        isOpen={!!selectedCandidateForDrawer}
        onClose={() => setSelectedCandidateForDrawer(null)}
        selectedCandidate={selectedCandidateForDrawer}
        openUpdateModal={openUpdateModal}
        openResume={openResume}
        getAvatarGradient={getAvatarGradient}
        formatStage={formatStage}
      />

      <StatusUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedApp(null);
        }}
        selectedApp={selectedApp}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        targetRound={targetRound}
        setTargetRound={setTargetRound}
        reasonText={reasonText}
        setReasonText={setReasonText}
        isSubmitting={isSubmitting}
        submitStatusUpdate={submitStatusUpdate}
        validationError={validationError}
        submissionError={submissionError}
        formatStage={formatStage}
        getPresetReason={getPresetReason}
      />
    </div>
  </div>
  );
};

export default Applicants;

