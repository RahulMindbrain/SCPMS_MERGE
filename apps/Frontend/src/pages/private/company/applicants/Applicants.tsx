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
  Check, 
  Trophy,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { CandidateDetailsDrawer } from './CandidateDetailsDrawer';
import { StatusUpdateModal } from './StatusUpdateModal';

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

// Map current applicant state to the 5 pipeline rounds
const getPipelineStages = (status: string, currentRound: string | null) => {
  const roundsOrder = ['APPLIED', 'APTITUDE', 'TECHNICAL', 'HR', 'SELECTED'];
  
  // Map internal sub-rounds to standard steps
  let mappedRound = 'APPLIED';
  if (status === 'SHORTLISTED') {
    if (!currentRound || currentRound === 'APTITUDE' || currentRound === 'GROUP_DISCUSSION') {
      mappedRound = 'APTITUDE';
    } else if (currentRound === 'TECHNICAL' || currentRound === 'MANAGERIAL') {
      mappedRound = 'TECHNICAL';
    } else if (currentRound === 'HR' || currentRound === 'FINAL') {
      mappedRound = 'HR';
    } else {
      mappedRound = 'APTITUDE';
    }
  } else if (status === 'SELECTED' || status === 'OFFER_ACCEPTED') {
    mappedRound = 'SELECTED';
  } else if (status === 'REJECTED') {
    if (!currentRound) {
      mappedRound = 'APPLIED';
    } else if (currentRound === 'APTITUDE' || currentRound === 'GROUP_DISCUSSION') {
      mappedRound = 'APTITUDE';
    } else if (currentRound === 'TECHNICAL' || currentRound === 'MANAGERIAL') {
      mappedRound = 'TECHNICAL';
    } else if (currentRound === 'HR' || currentRound === 'FINAL') {
      mappedRound = 'HR';
    } else {
      mappedRound = 'APPLIED';
    }
  }

  const failedIndex = status === 'REJECTED' ? roundsOrder.indexOf(mappedRound) : -1;
  const activeIndex = status !== 'REJECTED' ? roundsOrder.indexOf(mappedRound) : -1;

  return [
    { id: 'APPLIED', label: 'Application Received' },
    { id: 'APTITUDE', label: 'Assessment' },
    { id: 'TECHNICAL', label: 'Technical Interview' },
    { id: 'HR', label: 'HR Discussion' },
    { id: 'SELECTED', label: 'Final Decision' }
  ].map((stage, idx) => {
    let state: 'completed' | 'active' | 'upcoming' | 'failed' | 'disabled' = 'upcoming';

    if (status === 'SELECTED' || status === 'OFFER_ACCEPTED') {
      state = 'completed';
    } else if (status === 'REJECTED') {
      if (idx < failedIndex) {
        state = 'completed';
      } else if (idx === failedIndex) {
        state = 'failed';
      } else {
        state = 'disabled';
      }
    } else {
      // Shortlisted or Applied
      if (idx < activeIndex) {
        state = 'completed';
      } else if (idx === activeIndex) {
        state = 'active';
      } else {
        state = 'upcoming';
      }
    }

    return { ...stage, state };
  });
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
  const ROUNDS_ORDER = ['APTITUDE', 'GROUP_DISCUSSION', 'HR', 'TECHNICAL', 'MANAGERIAL', 'FINAL'];
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
      case 'MANAGERIAL':
        return 'HR round cleared';
      case 'FINAL':
        return 'Managerial round cleared';
      default:
        return 'Process progressed to next round';
    }
  }
  if (status === 'SELECTED') {
    return 'Excellent overall performance';
  }
  if (status === 'REJECTED') {
    return 'Did not clear the interview round';
  }
  return '';
};

const Applicants: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.company);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [selectedJob, setSelectedJob] = React.useState('All Jobs');

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
        title: 'Application Closed',
        message: 'Rejected applications cannot be moved to another hiring stage.',
        type: 'error',
        icon: 'XCircle'
      };
    }

    // 2. Finalized application
    if (['OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(selectedApp.status)) {
      return {
        title: 'Application Already Finalized',
        message: 'This candidate has already been selected or rejected and can no longer move through the pipeline.',
        type: 'error',
        icon: 'ShieldAlert'
      };
    }

    // 3. Offer Accepted Elsewhere
    if (selectedApp.student?.isPlaced && selectedApp.status !== 'OFFER_ACCEPTED') {
      return {
        title: 'Candidate Already Placed',
        message: 'This student has accepted another offer and is no longer available for further processing.',
        type: 'warning',
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

  const openUpdateModal = React.useCallback((app: any, newStatus: string) => {
    setSubmissionError(null);
    if (newStatus === app.status) return;

    if (isBackward(app.status, newStatus)) {
      toast.error("Invalid Workflow Transition", {
        description: "Candidates must progress sequentially through Aptitude, Technical, and HR rounds."
      });
      return;
    }

    if (['REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)) {
      toast.error("Application Already Finalized", {
        description: "This candidate has already been selected or rejected and can no longer move through the pipeline."
      });
      return;
    }

    setSelectedApp(app);
    setTargetStatus(newStatus);
    
    // Set intelligent defaults for rounds and reasons based on the new status
    if (newStatus === 'SHORTLISTED') {
      let nextRound = 'APTITUDE';
      if (app.currentRound === 'APTITUDE') nextRound = 'TECHNICAL';
      else if (app.currentRound === 'TECHNICAL') nextRound = 'HR';
      else if (app.currentRound === 'HR') nextRound = 'MANAGERIAL';
      else if (app.currentRound === 'MANAGERIAL') nextRound = 'FINAL';
      
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
      return matchesSearch && matchesJob;
    });
  }, [applications, searchTerm, selectedJob]);

  // Pre-calculate unique jobs list only when applications change
  const uniqueJobs = React.useMemo(() => {
    return Array.from(
      new Set((applications || []).map((app: any) => app.jobUniversity?.job?.title))
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

  // Renders premium Initials-based avatar with custom gradient index mapping
  const renderCandidateAvatar = (app: any, size: "sm" | "lg" = "sm") => {
    const name = `${app.student?.user?.firstname || 'Candidate'} ${app.student?.user?.lastname || ''}`;
    const initials = `${app.student?.user?.firstname?.charAt(0) || 'C'}${app.student?.user?.lastname?.charAt(0) || ''}`.toUpperCase();
    
    // Custom gradient palettes to ensure absolute visual stunningness
    const gradients = [
      "from-orange-400 to-amber-500 ring-orange-100/80 dark:ring-orange-950/20",
      "from-blue-400 to-indigo-500 ring-blue-100/80 dark:ring-blue-950/20",
      "from-emerald-400 to-teal-500 ring-emerald-100/80 dark:ring-emerald-950/20",
      "from-violet-400 to-purple-500 ring-violet-100/80 dark:ring-violet-950/20",
      "from-rose-400 to-pink-500 ring-rose-100/80 dark:ring-rose-950/20"
    ];
    
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    const grad = gradients[sum % gradients.length];
    const [gradientClasses, ringClasses] = grad.split(" ring-");

    if (size === "lg") {
      return (
        <Avatar size="lg" className={`size-14 border border-white/20 ring-4 ring-${ringClasses} shadow-md transition-all duration-300 group-hover/avatar:scale-105 shrink-0`}>
          <AvatarFallback className={`bg-gradient-to-br ${gradientClasses} font-black text-sm text-white tracking-tight`}>
            {initials}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar size="sm" className="shadow-xs border border-border/10 ring-2 ring-background transition-transform duration-300 group-hover:scale-105 shrink-0">
        <AvatarFallback className={`bg-gradient-to-tr ${gradientClasses} font-extrabold text-[10px] tracking-wide text-white`}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-700">
      
      {/* Hero Header Banner */}
      <div className="p-4 md:p-8">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Dynamic Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
          
          <div className="saas-card relative overflow-hidden p-6 border border-border/80 rounded-3xl bg-card transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Applicants</span>
                <h3 className="text-3xl font-black tracking-tight text-foreground">{stats.total}</h3>
              </div>
              <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/5 shadow-sm">
                <User size={20} />
              </div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Drive Candidates</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/80 rounded-3xl bg-card transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shortlisted</span>
                <h3 className="text-3xl font-black tracking-tight text-foreground">{stats.shortlisted}</h3>
              </div>
              <div className="size-12 bg-violet-500/10 text-violet-600 rounded-2xl flex items-center justify-center border border-violet-500/5 shadow-sm">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In Evaluation Stage</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/80 rounded-3xl bg-card transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selected</span>
                <h3 className="text-3xl font-black tracking-tight text-foreground">{stats.selected}</h3>
              </div>
              <div className="size-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/5 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Offers Rolled Out</div>
          </div>

          <div className="saas-card relative overflow-hidden p-6 border border-border/80 rounded-3xl bg-card transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending Review</span>
                <h3 className="text-3xl font-black tracking-tight text-foreground">{stats.pending}</h3>
              </div>
              <div className="size-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-500/5 shadow-sm">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting Screening</div>
          </div>
        </div>

        {/* Premium Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border/80 p-4 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 delay-200">
          
          {/* Smart Search Field */}
          <div className="relative w-full md:flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search candidate name, email, department, university..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Job Filter Dropdown */}
            <div className="min-w-[160px] flex-1 md:flex-none">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="h-[46px] bg-background border-border/60 rounded-2xl text-xs font-bold uppercase tracking-wider px-4 hover:border-primary/30 transition-all shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="size-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Jobs" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border shadow-2xl p-2 min-w-[200px]">
                  <SelectItem value="All Jobs" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">All Jobs</span>
                  </SelectItem>
                  {uniqueJobs.map((job) => (
                    <SelectItem key={job as string} value={job as string} className="rounded-xl py-2 focus:bg-primary/5">
                      <span className="font-bold text-[10px] uppercase tracking-wider">{job as string}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="min-w-[160px] flex-1 md:flex-none">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-[46px] bg-background border-border/60 rounded-2xl text-xs font-bold uppercase tracking-wider px-4 hover:border-primary/30 transition-all shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="size-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border shadow-2xl p-2 min-w-[180px]">
                  <SelectItem value="ALL" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">All Status</span>
                  </SelectItem>
                  <SelectItem value="APPLIED" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Applied</span>
                  </SelectItem>
                  <SelectItem value="SHORTLISTED" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Shortlisted</span>
                  </SelectItem>
                  <SelectItem value="SELECTED" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Selected</span>
                  </SelectItem>
                  <SelectItem value="REJECTED" className="rounded-xl py-2 focus:bg-primary/5">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Rejected</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Reset Button */}
            {(searchTerm || selectedJob !== 'All Jobs' || selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedJob('All Jobs');
                  setSelectedStatus('ALL');
                }}
                className="flex items-center justify-center h-[46px] px-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/10 hover:border-rose-500/20 font-black text-[10px] uppercase tracking-wider gap-1.5 transition-all w-full sm:w-auto shrink-0 cursor-pointer"
              >
                <FilterX size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Unified Application Cards List */}
        <div className="space-y-6 pb-12">
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
          ) : (
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {filteredApplicants.map((app: any) => {
                  const studentName = `${app.student?.user?.firstname || 'Candidate'} ${app.student?.user?.lastname || ''}`;
                  
                  // Compute dynamic placement eligibility
                  const reqCgpa = app.jobUniversity?.minCgpa || 0;
                  const reqBacklogs = app.jobUniversity?.maxBacklogs || 0;
                  const candCgpa = app.student?.cgpa || 0;
                  const candBacklogs = app.student?.activeBacklogs || 0;
                  const isEligible = candCgpa >= reqCgpa && candBacklogs <= reqBacklogs;

                  const stages = getPipelineStages(app.status, app.currentRound);

                  return (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-[1.5rem] p-6 gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-none dark:hover:border-zinc-700/50 transition-all flex flex-col justify-between"
                    >
                      {/* Top Row: Candidate Info, Job, and Actions in fluid flex rows */}
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
                        
                        {/* LEFT SECTION: Candidate Info (Sleek minimalist layout with no stacked badges, eye button removed) */}
                        <div className="flex items-center gap-4 min-w-0 flex-1 max-w-sm">
                          <div 
                            onClick={() => setSelectedCandidateForDrawer(app)}
                            className="cursor-pointer shrink-0 transition-transform active:scale-95 duration-200"
                          >
                            {renderCandidateAvatar(app, "lg")}
                          </div>

                          <div className="space-y-0.5 min-w-0 text-left">
                            <h3 
                              onClick={() => setSelectedCandidateForDrawer(app)}
                              className="text-base font-black text-zinc-900 dark:text-white hover:text-primary transition-colors cursor-pointer flex items-center gap-1 group/name truncate"
                            >
                              {studentName}
                              <ExternalLink size={12} className="opacity-0 group-hover/name:opacity-100 transition-opacity text-primary/70 shrink-0" />
                            </h3>
                            
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 truncate">
                              {app.student?.department?.name || 'Department N/A'}
                            </p>

                            {/* Ultra-clean inline metadata row with subtle dot separators */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                              <span>CGPA {candCgpa}</span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className={candBacklogs > 0 ? "text-rose-500 font-bold" : "text-zinc-500 dark:text-zinc-400 font-medium"}>
                                {candBacklogs > 0 ? `${candBacklogs} Backlog${candBacklogs > 1 ? 's' : ''}` : 'No Backlogs'}
                              </span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className={isEligible ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                {isEligible ? 'Eligible' : 'Ineligible'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CENTER SECTION: Job Info (Beautiful plain typographic structure, no noisy icons) */}
                        <div className="space-y-0.5 text-left flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {app.jobUniversity?.job?.title || 'Job Title N/A'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            <span className="truncate">{app.jobUniversity?.job?.company?.name || 'Your Company'}</span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="truncate">{app.jobUniversity?.job?.location || 'Remote'}</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {app.jobUniversity?.job?.salary 
                              ? `${(app.jobUniversity.job.salary / 100000).toFixed(1)} LPA` 
                              : 'Competitive Package'}
                          </div>
                        </div>

                        {/* RIGHT SECTION: Application lifecycle actions (No duplicate status badges, selector dropdown acts as badge) */}
                        <div className="flex flex-col gap-1 items-start lg:items-end justify-center text-left lg:text-right shrink-0 w-full lg:w-auto">
                          <div className="flex items-center gap-2 w-full lg:justify-end">
                            {/* Less Saturated Dropdown Trigger acting as Status indicator */}
                            <Select
                              value={app.status}
                              onValueChange={(value) => openUpdateModal(app, value)}
                            >
                              <SelectTrigger className={`h-9 w-[130px] rounded-xl border text-[10px] font-black uppercase tracking-wider px-3 transition-all flex items-center justify-between focus:ring-0 focus:ring-offset-0 cursor-pointer shadow-xs
                                ${app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                  app.status === 'REJECTED' ? 'bg-red-50/40 hover:bg-red-50/60 border-red-100 text-red-600 dark:bg-red-950/10 dark:border-red-950/20 dark:text-red-400' :
                                  app.status === 'SHORTLISTED' ? 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-900/30 text-blue-700 dark:text-blue-400' :
                                  'bg-zinc-50/50 hover:bg-zinc-50/80 border-zinc-200/60 dark:bg-zinc-800/40 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300'}`}
                            >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-1 bg-white dark:bg-zinc-950 min-w-[140px]">
                                <SelectItem value="APPLIED" disabled={isBackward(app.status, 'APPLIED')} className="rounded-lg py-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-zinc-50 dark:focus:bg-zinc-900">
                                  <div className="flex items-center gap-2">
                                    <Clock size={13} className="text-zinc-400 shrink-0" />
                                    <span>Applied</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="SHORTLISTED" disabled={isBackward(app.status, 'SHORTLISTED')} className="rounded-lg py-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-blue-50/50 dark:focus:bg-blue-950/30">
                                  <div className="flex items-center gap-2">
                                    <Check size={13} className="text-blue-500 shrink-0" />
                                    <span>Shortlist</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="SELECTED" disabled={isBackward(app.status, 'SELECTED')} className="rounded-lg py-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-emerald-50/50 dark:focus:bg-emerald-950/30">
                                  <div className="flex items-center gap-2">
                                    <Award size={13} className="text-emerald-500 shrink-0" />
                                    <span>Select</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="REJECTED" disabled={isBackward(app.status, 'REJECTED')} className="rounded-lg py-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer focus:bg-rose-50/50 dark:focus:bg-rose-950/30">
                                  <div className="flex items-center gap-2">
                                    <XCircle size={13} className="text-rose-500 shrink-0" />
                                    <span>Reject</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* CV Drawer Trigger */}
                            {app.student?.resumeUrl && (
                              <button
                                onClick={() => openResume(app.student?.resumeUrl, studentName)}
                                className="p-2 h-9 w-9 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/20 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/80 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl transition-all cursor-pointer shrink-0"
                                title="View CV Dossier"
                              >
                                <FileText size={14} />
                              </button>
                            )}
                          </div>

                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} />
                            Updated {getRelativeTime(app.updatedAt)}
                          </p>
                        </div>

                      </div>

                      {/* BOTTOM SECTION: Horizontal Pipeline Progress Tracker (Integrated tighter: pt-6 pb-4, soft divider) */}
                      <div className="border-t border-zinc-100 dark:border-zinc-800/30 pt-6 pb-4">
                        <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                          <div className="flex items-center justify-between w-full min-w-[550px] relative px-4 py-2">
                            {stages.map((stage, idx) => {
                              const isCompleted = stage.state === 'completed';
                              const isActive = stage.state === 'active';
                              const isFailed = stage.state === 'failed';
                              const isDisabled = stage.state === 'disabled';

                              return (
                                <React.Fragment key={stage.id}>
                                  {/* Connector Line (Thicker h-[3px] flow line with gradients) */}
                                  {idx > 0 && (
                                    <div className="flex-1 h-[3px] relative mx-3 bg-zinc-100 dark:bg-zinc-800/40 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ 
                                          width: (isCompleted || isActive) ? '100%' : '0%' 
                                        }}
                                        transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                                        className={`absolute left-0 top-0 h-full rounded-full
                                          ${isCompleted 
                                            ? 'bg-emerald-500 dark:bg-emerald-600' 
                                            : isFailed 
                                              ? 'bg-red-200 dark:bg-red-950/40' 
                                              : isActive
                                                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 animate-pulse'
                                                : 'bg-zinc-100 dark:bg-zinc-800/40'}`} 
                                      />
                                    </div>
                                  )}

                                  {/* Pipeline Node Circle (Stage numbers replaced with high-personality workflow icons) */}
                                  <div className="flex flex-col items-center relative z-10 shrink-0">
                                    <div className="relative">
                                      {/* Animated Glowing Ring for Active stage (Pulse motion) */}
                                      {isActive && (
                                        <span className="absolute -inset-1 rounded-full animate-ping bg-blue-400/30 opacity-75 pointer-events-none" />
                                      )}

                                      {/* Node circle wrapper */}
                                      <motion.div 
                                        whileHover={{ scale: isDisabled ? 1 : 1.15 }}
                                        className={`size-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm relative z-10
                                          ${isCompleted 
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                            : isActive 
                                              ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10' 
                                              : isFailed 
                                                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' 
                                                : 'border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900'}`}
                                      >
                                        {isCompleted ? (
                                          stage.id === 'SELECTED' ? (
                                            <Trophy size={13} className="text-emerald-600 dark:text-emerald-400" />
                                          ) : (
                                            <Check size={13} className="stroke-[3px]" />
                                          )
                                        ) : isFailed ? (
                                          <X size={13} className="stroke-[3px] text-red-600 dark:text-red-400" />
                                        ) : (
                                          stage.id === 'APPLIED' ? <Check size={13} /> :
                                          stage.id === 'APTITUDE' ? <FileText size={13} /> :
                                          stage.id === 'TECHNICAL' ? <Code2 size={13} /> :
                                          stage.id === 'HR' ? <Users size={13} /> :
                                          <Trophy size={13} />
                                        )}
                                      </motion.div>
                                    </div>

                                    {/* Label text */}
                                    <span className={`text-[10px] font-black uppercase tracking-wider mt-2 transition-colors duration-300
                                      ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-semibold' :
                                        isActive ? 'text-primary font-black' :
                                        isFailed ? 'text-red-600 dark:text-red-400 font-semibold' :
                                        'text-zinc-400 dark:text-zinc-500 font-medium'}`}>
                                      {stage.label}
                                    </span>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
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
        formatRound={formatRound}
        getPresetReason={getPresetReason}
      />
    </div>
  </div>
  );
};

export default Applicants;

