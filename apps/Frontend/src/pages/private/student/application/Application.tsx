import { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2, Clock, XCircle, Briefcase,
  Search, ArrowRight, Sparkles,
  Rocket, Calendar, Building2, 
  ChevronDown, 
  Activity, ShieldCheck, Target,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobApplications, updateApplicationStatus } from '@/redux/thunks/studentThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Loader from '@/components/Loader';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import {StudentPageLayout} from '@/components/layout/StudentPageLayout';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
type Status = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'WITHDRAWN' | 'NOT_ELIGIBLE';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any; shadow: string; accent: string }> = {
  APPLIED: { 
    label: 'Applied', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10', 
    icon: Clock,
    shadow: 'shadow-blue-500/20',
    accent: 'bg-blue-600'
  },
  SHORTLISTED: { 
    label: 'Shortlisted', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/10', 
    icon: CheckCircle2,
    shadow: 'shadow-purple-500/20',
    accent: 'bg-purple-500'
  },
  SELECTED: { 
    label: 'Selected', 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-500/10', 
    icon: Sparkles,
    shadow: 'shadow-emerald-500/20',
    accent: 'bg-emerald-500'
  },
  REJECTED: { 
    label: 'Rejected', 
    color: 'text-rose-400', 
    bgColor: 'bg-rose-500/10', 
    icon: XCircle,
    shadow: 'shadow-rose-500/20',
    accent: 'bg-rose-500'
  },
  OFFER_ACCEPTED: { 
    label: 'Offer Accepted', 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10', 
    icon: ShieldCheck,
    shadow: 'shadow-emerald-500/20',
    accent: 'bg-emerald-600'
  },
  OFFER_REJECTED: { 
    label: 'Offer Declined', 
    color: 'text-rose-500', 
    bgColor: 'bg-rose-500/10', 
    icon: XCircle,
    shadow: 'shadow-rose-500/20',
    accent: 'bg-rose-600'
  },
  WITHDRAWN: { 
    label: 'Withdrawn', 
    color: 'text-slate-400', 
    bgColor: 'bg-slate-500/10', 
    icon: XCircle,
    shadow: 'shadow-slate-500/20',
    accent: 'bg-slate-500'
  },
  NOT_ELIGIBLE: { 
    label: 'Not Eligible', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-500/10', 
    icon: XCircle,
    shadow: 'shadow-amber-500/20',
    accent: 'bg-amber-600'
  },
};

const STAGES: Status[] = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'OFFER_ACCEPTED'];

/* ─── Premium Company Icon ─── */
const CompanyIcon = ({ name, size = "md" }: { name: string, size?: "sm" | "md" | "lg" }) => {
  const firstLetter = name.charAt(0).toUpperCase();
  const gradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
  ];
  const gradient = gradients[name.length % gradients.length];
  
  const sizeClasses = {
    sm: "w-10 h-10 text-base rounded-xl",
    md: "w-14 h-14 text-xl rounded-2xl",
    lg: "w-20 h-20 text-3xl rounded-[2.5rem]"
  };

  return (
    <div className={cn(
      "shrink-0 flex items-center justify-center bg-gradient-to-br text-white font-black shadow-lg border border-white/10 overflow-hidden",
      gradient,
      sizeClasses[size]
    )}>
      {firstLetter}
    </div>
  );
};

/* ─── Application Card Component ─── */
const ApplicationCard = ({
  app,
  isExpanded,
  onToggle,
  onAction,
  updatingId,
  isApproved
}: {
  app: any;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: (id: number, action: "ACCEPT" | "REJECT") => void;
  updatingId: number | null;
  isApproved: boolean;
}) => {
  const status = app.status as Status;
  const isSelected = status === 'SELECTED';
  const isRejected = ['REJECTED', 'OFFER_REJECTED', 'WITHDRAWN', 'NOT_ELIGIBLE'].includes(status);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.APPLIED;

  return (
    <motion.div
      layout
      className={cn(
        "group relative bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-white/[0.08] transition-all duration-500",
        isExpanded ? "ring-2 ring-blue-500/30 shadow-2xl z-10 scale-[1.01]" : "hover:shadow-xl hover:border-blue-500/30 hover:translate-y-[-2px]"
      )}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <CompanyIcon name={app.jobUniversity?.job?.company?.name || "C"} size="sm" />
          
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
              {app.jobUniversity?.job?.title || "Unknown Role"}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Building2 size={12} className="text-blue-500" />
                {app.jobUniversity?.job?.company?.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12} className="text-purple-500" />
                {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className={cn(
              "px-3 py-1.5 rounded-xl border font-black uppercase tracking-widest text-[9px]",
              config.bgColor,
              config.color,
              "border-current/10"
            )}>
              {config.label}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 transition-all",
                isExpanded ? "bg-blue-600 text-white rotate-180 shadow-md shadow-blue-500/20" : "hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-600"
              )}
            >
              <ChevronDown size={18} strokeWidth={3} />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.05] space-y-6">
                {/* Visual Pipeline */}
                <div className="relative px-4">
                  <div className="absolute top-4 left-8 right-8 h-px bg-slate-100 dark:bg-white/5" />
                  {!isRejected && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `calc(${(Math.max(0, STAGES.indexOf(status)) / (STAGES.length - 1)) * 100}% - 20px)` }}
                      className="absolute top-4 left-8 h-px bg-blue-600 z-0"
                    />
                  )}
                  
                  <div className="relative z-10 flex justify-between">
                    {STAGES.map((stage, idx) => {
                      const stageIdx = STAGES.indexOf(status);
                      const isPassed = idx < stageIdx || isSelected;
                      const isCurrent = idx === stageIdx && !isRejected;
                      const stageConfig = STATUS_CONFIG[stage];
                      const StageIcon = stageConfig.icon;

                      return (
                        <div key={stage} className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500",
                            isPassed ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" :
                            isCurrent ? "bg-white dark:bg-[#1e1f26] border-blue-600 text-blue-600 scale-110 shadow-lg" :
                            "bg-white dark:bg-[#1e1f26] border-slate-100 dark:border-white/10 text-slate-300 dark:text-slate-700"
                          )}>
                            {isPassed ? <CheckCircle2 size={14} strokeWidth={3} /> : <StageIcon size={14} strokeWidth={2.5} />}
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-tighter text-center max-w-[60px] leading-tight",
                            isPassed || isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400"
                          )}>
                            {stageConfig.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Process Details & Status History */}
                  <div className="space-y-6">
                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity size={14} className="text-blue-600" />
                        <h4 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Application Journey</h4>
                      </div>
                      
                      <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                        {app.statusHistory && app.statusHistory.length > 0 ? (
                          app.statusHistory.map((history: any, idx: number) => {
                            const stageConfig = STATUS_CONFIG[history.status as Status] || STATUS_CONFIG.APPLIED;
                            const HistoryIcon = stageConfig.icon;
                            
                            return (
                              <div key={history.id} className="relative pl-8 group/item">
                                <div className={cn(
                                  "absolute left-0 top-0.5 w-6 h-6 rounded-lg flex items-center justify-center border shadow-sm transition-all duration-500 z-10",
                                  idx === 0 ? "bg-blue-600 border-blue-600 text-white" : "bg-white dark:bg-[#1e1f26] border-slate-200 dark:border-white/10 text-slate-400"
                                )}>
                                  <HistoryIcon size={12} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center justify-between">
                                    <span className={cn(
                                      "text-[11px] font-black uppercase tracking-tight",
                                      idx === 0 ? "text-blue-600" : "text-slate-600 dark:text-slate-400"
                                    )}>
                                      {stageConfig.label}
                                      {history.round && <span className="ml-2 text-[9px] opacity-60">({history.round})</span>}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">
                                      {new Date(history.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {history.remarks && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 font-medium italic">
                                      "{history.remarks}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="relative pl-8">
                            <div className="absolute left-0 top-0.5 w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1f26] text-slate-400">
                              <Clock size={12} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">Applied</span>
                              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting initial review</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Feedback */}
                  <div className="space-y-6">
                    {isRejected ? (
                      <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                        <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
                          <XCircle size={14} strokeWidth={3} />
                          <h4 className="text-[9px] font-black uppercase tracking-widest">Final Outcome</h4>
                        </div>
                        <p className="text-[11px] text-rose-800/80 dark:text-rose-200/60 leading-relaxed font-medium">
                          {status === 'OFFER_REJECTED' 
                            ? "You have declined the job offer for this position." 
                            : status === 'WITHDRAWN'
                            ? "This application has been withdrawn."
                            : status === 'NOT_ELIGIBLE'
                            ? `You were not eligible for this position: ${app.reason || "does not meet requirements"}.`
                            : app.reason || "The process for this role has been finalized. Your profile remains in our talent network."
                          }
                        </p>
                      </div>
                    ) : status === 'OFFER_ACCEPTED' ? (
                      <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 h-full">
                        <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Offer Accepted</h4>
                        </div>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200/60 leading-relaxed font-medium">
                          Amazing! You have accepted the job offer for this position. The hiring team at {app.jobUniversity?.job?.company?.name} has been notified and will reach out to you shortly with onboarding details.
                        </p>
                        <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1e1f26] border border-emerald-100 dark:border-white/5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Sparkles size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-slate-400">Status</span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Placed 🎉</span>
                          </div>
                        </div>
                      </div>
                    ) : isSelected ? (
                      <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                          <Sparkles size={14} />
                          <h4 className="text-[9px] font-black uppercase tracking-widest">Decision Required</h4>
                        </div>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200/60 mb-4 font-medium leading-relaxed">
                          Congratulations! You have received an offer. Please review the details and respond.
                        </p>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/10 disabled:opacity-50"
                            disabled={updatingId === app.id || !isApproved}
                            onClick={() => onAction(app.id, "ACCEPT")}
                          >
                            Accept Offer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-10 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                            disabled={updatingId === app.id || !isApproved}
                            onClick={() => onAction(app.id, "REJECT")}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 h-full">
                        <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                          <Target size={14} />
                          <h4 className="text-[9px] font-black uppercase tracking-widest">Next Steps</h4>
                        </div>
                        <p className="text-[11px] text-blue-800/80 dark:text-blue-100/60 leading-relaxed font-medium">
                          Your application is currently being evaluated. We will notify you as soon as there is an update from the {app.jobUniversity?.job?.company?.name} hiring team.
                        </p>
                        <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1e1f26] border border-blue-100 dark:border-white/5">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Activity size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-slate-400">Current Phase</span>
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">{config.label}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, color, subValue }: { title: string, value: number | string, icon: any, color: 'indigo' | 'blue' | 'purple' | 'emerald', subValue?: string }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-blue-500/10',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/10',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-purple-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10',
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group overflow-hidden border border-slate-200/50 dark:border-white/[0.05]">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{value}</h3>
            {subValue && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{subValue}</p>}
          </div>
          <div className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl",
            colorMap[color]
          )}>
            <Icon size={32} strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const enrichApplication = (app: any) => {
  if (!app) return app;
  
  const enriched = { ...app };

  if (enriched.status === "NOT_ELIGIBLE" && !enriched.reason) {
    const cgpa = enriched.student?.cgpa;
    const minCgpa = enriched.jobUniversity?.minCgpa;
    const backlogs = enriched.student?.activeBacklogs;
    const maxBacklogs = enriched.jobUniversity?.maxBacklogs;
    
    if (cgpa !== undefined && minCgpa !== undefined && cgpa < minCgpa) {
      enriched.reason = `CGPA below requirement (Required: ${minCgpa}, Actual: ${cgpa})`;
    } else if (backlogs !== undefined && maxBacklogs !== undefined && backlogs > maxBacklogs) {
      enriched.reason = `Active backlogs exceed requirement (Allowed: ${maxBacklogs}, Actual: ${backlogs})`;
    } else {
      enriched.reason = "Profile does not meet minimum academic eligibility criteria";
    }
  }

  if (!enriched.statusHistory || enriched.statusHistory.length === 0) {
    const history: any[] = [];
    const createdDate = enriched.createdAt || new Date().toISOString();
    const updatedDate = enriched.updatedAt || createdDate;

    const addHistory = (status: string, date: string, remarks?: string, round?: string) => {
      history.push({
        id: `synth-${status}-${date}`,
        status,
        round: round || null,
        remarks: remarks || null,
        createdAt: date,
      });
    };

    addHistory("APPLIED", createdDate, "Awaiting initial review");

    if (enriched.status === "SHORTLISTED") {
      addHistory(
        "SHORTLISTED",
        updatedDate,
        enriched.currentRound 
          ? `Selected for the ${enriched.currentRound} round` 
          : "Selected for interview process",
        enriched.currentRound
      );
    } else if (enriched.status === "SELECTED") {
      const intermediateDate = new Date((new Date(createdDate).getTime() + new Date(updatedDate).getTime()) / 2).toISOString();
      addHistory("SHORTLISTED", intermediateDate, "Completed all interview rounds");
      addHistory("SELECTED", updatedDate, "Congratulations! Recruiter offer sent");
    } else if (enriched.status === "OFFER_ACCEPTED") {
      const intermediateDate1 = new Date((new Date(createdDate).getTime() * 2 + new Date(updatedDate).getTime()) / 3).toISOString();
      const intermediateDate2 = new Date((new Date(createdDate).getTime() + new Date(updatedDate).getTime() * 2) / 3).toISOString();
      addHistory("SHORTLISTED", intermediateDate1, "Completed all interview rounds");
      addHistory("SELECTED", intermediateDate2, "Recruiter offer sent");
      addHistory("OFFER_ACCEPTED", updatedDate, "You have accepted the offer!");
    } else if (enriched.status === "OFFER_REJECTED") {
      const intermediateDate1 = new Date((new Date(createdDate).getTime() * 2 + new Date(updatedDate).getTime()) / 3).toISOString();
      const intermediateDate2 = new Date((new Date(createdDate).getTime() + new Date(updatedDate).getTime() * 2) / 3).toISOString();
      addHistory("SHORTLISTED", intermediateDate1, "Completed all interview rounds");
      addHistory("SELECTED", intermediateDate2, "Recruiter offer sent");
      addHistory("OFFER_REJECTED", updatedDate, "You have declined the offer");
    } else if (enriched.status === "REJECTED") {
      addHistory("REJECTED", updatedDate, enriched.reason || "The process for this role has been finalized");
    } else if (enriched.status === "WITHDRAWN") {
      addHistory("WITHDRAWN", updatedDate, "This application has been withdrawn by candidate");
    } else if (enriched.status === "NOT_ELIGIBLE") {
      addHistory("NOT_ELIGIBLE", updatedDate, enriched.reason || "Academic eligibility criteria mismatch");
    }

    enriched.statusHistory = history;
  }

  return enriched;
};

const ApplicationStatus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: routeApplicationId } = useParams<{ id?: string }>();
  const { applications = [], loading, meta, statusCounts = [] } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);
  const isApproved = user?.status === 'ACTIVE';

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Sync applications from the server based on filters and current page
  useEffect(() => {
    let statusParam: string | undefined = undefined;
    if (activeFilter === "Shortlisted") statusParam = "SHORTLISTED";
    else if (activeFilter === "Selected") statusParam = "SELECTED";
    else if (activeFilter === "Rejected") statusParam = "REJECTED";

    dispatch(fetchJobApplications({ page, limit: 10, status: statusParam }));
  }, [dispatch, page, activeFilter]);

  // Reset page when activeFilter changes to avoid overflow errors
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (routeApplicationId && applications.length > 0) {
      setExpandedId(Number(routeApplicationId));
    }
  }, [routeApplicationId, applications]);

  const enrichedApplications = useMemo(() => {
    return (applications || []).map(enrichApplication);
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return enrichedApplications.filter((app: any) => {
      const matchesSearch =
        app.jobUniversity?.job?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobUniversity?.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      if (activeFilter === "Active") return !['SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN', 'NOT_ELIGIBLE'].includes(app.status);
      if (activeFilter === "Shortlisted") return app.status === 'SHORTLISTED';
      if (activeFilter === "Rejected") return app.status === 'REJECTED' || app.status === 'OFFER_REJECTED';
      if (activeFilter === "Selected") return app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED';

      return true;
    });
  }, [enrichedApplications, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    let total = meta?.total || applications.length;
    let active = 0;
    let shortlisted = 0;
    let selected = 0;

    if (statusCounts && statusCounts.length > 0) {
      statusCounts.forEach((item: any) => {
        const count = item._count?.status || 0;
        const status = item.status;

        if (status === 'SHORTLISTED') {
          shortlisted += count;
        }
        if (status === 'SELECTED' || status === 'OFFER_ACCEPTED') {
          selected += count;
        }
        if (!['SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN', 'NOT_ELIGIBLE'].includes(status)) {
          active += count;
        }
      });
      total = statusCounts.reduce((sum: number, item: any) => sum + (item._count?.status || 0), 0);
    } else {
      total = applications.length;
      active = applications.filter((a: any) => !['SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN', 'NOT_ELIGIBLE'].includes(a.status)).length;
      shortlisted = applications.filter((a: any) => a.status === 'SHORTLISTED').length;
      selected = applications.filter((a: any) => a.status === 'SELECTED' || a.status === 'OFFER_ACCEPTED').length;
    }

    return { total, active, shortlisted, selected };
  }, [applications, statusCounts, meta]);

  const handleApplicationAction = async (id: number, action: "ACCEPT" | "REJECT") => {
    const loadingText = action === "ACCEPT" ? "Accepting offer..." : "Rejecting offer...";
    const successText = action === "ACCEPT" ? "Offer accepted successfully" : "Offer rejected successfully";
    
    // Requirement: Find existing OFFER_ACCEPTED
    const existingAccepted = applications.find((app: any) => app.status === "OFFER_ACCEPTED");
    
    if (action === "ACCEPT" && existingAccepted) {
      if (existingAccepted.id === id) {
        toast.info("You have already accepted this offer.");
        return;
      }
      console.log(`Switching offer from application ${existingAccepted.id} to ${id}`);
    }

    const toastId = toast.loading(loadingText);

    try {
      setUpdatingId(id);
      await dispatch(updateApplicationStatus({ id, action })).unwrap();
      
      let statusParam: string | undefined = undefined;
      if (activeFilter === "Shortlisted") statusParam = "SHORTLISTED";
      else if (activeFilter === "Selected") statusParam = "SELECTED";
      else if (activeFilter === "Rejected") statusParam = "REJECTED";

      await dispatch(fetchJobApplications({ page, limit: 10, status: statusParam })).unwrap();
      toast.success(successText, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update application status", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && applications.length === 0) {
    return <Loader text="Synchronizing Application Pipeline..." fullScreen />;
  }

  return (
    <StudentPageLayout>
      <div className="space-y-8 student-hero-animate fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Adaptive Hero Banner */}
        <div className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-blue"></div>
            <div className="bubble-sky"></div>
          </div>

          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="student-hero-badge">
                <Sparkles size={14} className="text-blue-400" /> 
                <span>Application Command</span>
              </div>
              <h1 className="student-hero-title">
                Track Your <span>Mission Progress</span> 🚀
              </h1>
              <p className="student-hero-description">
                Monitor your job applications, interview stages, and feedback in real-time. Your career journey, organized.
              </p>
            </div>
            <Button
              onClick={() => navigate('/student/jobs')}
              className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl shadow-2xl px-8 md:px-10 h-14 md:h-16 text-xs md:text-sm transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center gap-3 group whitespace-nowrap"
            >
              Job Explorer <ArrowRight size={20} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* ─── Streamlined Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Apps"
            value={stats.total}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={Target}
            color="purple"
          />
          <StatCard
            title="Selected"
            value={stats.selected}
            icon={ShieldCheck}
            color="emerald"
          />
        </div>

        {/* ─── Refined Controls ─── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/50 dark:bg-[#161b22]/40 p-4 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-1.5 bg-slate-200/50 dark:bg-black/40 rounded-2xl border border-slate-200/50 dark:border-white/[0.05] w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["All", "Active", "Shortlisted", "Selected", "Rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeFilter === filter
                    ? "bg-white dark:bg-[#1e1f26] text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-white/10 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Filter by company or role..."
              className="pl-14 h-12 md:h-14 bg-white dark:bg-black/20 border-slate-200/60 dark:border-white/[0.1] rounded-2xl text-sm font-bold focus-visible:ring-blue-500/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Compact Application Feed ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Live Pipeline Status</h2>
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">{filteredApplications.length} Entries</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app: any) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    isExpanded={expandedId === app.id}
                    onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    onAction={handleApplicationAction}
                    updatingId={updatingId}
                    isApproved={isApproved}
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 md:py-32 flex flex-col items-center text-center bg-white/30 dark:bg-white/[0.02] rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200/60 dark:border-white/10 px-4"
                >
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
  <Search className="w-8 h-8 md:w-10 md:h-10" />
</div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">No Matching Records</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium max-w-xs leading-relaxed">
                    We couldn't find any applications matching your current criteria. Try adjusting your filters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent className="rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-[#161b22]/40 p-1 shadow-sm backdrop-blur-xl">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    href="#"
                    className={`rounded-xl ${page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                  />
                </PaginationItem>

                {[...Array(meta.totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === meta.totalPages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={page === pageNumber}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNumber);
                          }}
                          className={`rounded-xl ${page === pageNumber ? "bg-blue-600 text-white font-bold" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10"}`}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    pageNumber === page - 2 ||
                    pageNumber === page + 2
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < meta.totalPages) setPage(page + 1);
                    }}
                    href="#"
                    className={`rounded-xl ${page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* ─── Premium Footer Banner ─── */}
        <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white/40 dark:bg-[#161b22]/40 border border-slate-200/60 dark:border-white/[0.08] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 backdrop-blur-xl shadow-sm">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
  <Rocket className="w-7 h-7 md:w-8 md:h-8 group-hover:translate-y-[-4px] group-hover:translate-x-[4px] transition-transform duration-500" />
</div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Operational Velocity</h4>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
              Data shows that candidates who respond within 24 hours increase their final interview success rate by <span className="text-blue-600 dark:text-blue-400 font-black">65%</span>. Keep your profile sharp.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/student/profile')}
            className="w-full md:w-auto rounded-2xl px-8 h-12 md:h-14 font-black text-[10px] md:text-xs uppercase tracking-widest border-slate-200 dark:border-white/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500/20 transition-all shadow-sm"
          >
            Enhance Profile
          </Button>
        </div>
      </div>
    </StudentPageLayout>
  );
};

export default ApplicationStatus;
