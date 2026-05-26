import React from 'react';
import { 
  Award, 
  X, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CandidateDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidate: any;
  openUpdateModal: (app: any, newStatus: string) => void;
  openResume: (url: string, name: string) => void;
  getAvatarGradient: (name: string) => string;
  formatStage: (status: string, round?: string | null) => string;
}

export const CandidateDetailsDrawer: React.FC<CandidateDetailsDrawerProps> = ({
  isOpen,
  onClose,
  selectedCandidate,
  openUpdateModal,
  openResume,
  getAvatarGradient,
  formatStage,
}) => {
  if (!selectedCandidate) return null;
  
  const app = selectedCandidate;
  const studentName = `${app.student?.user?.firstname || 'Candidate'} ${app.student?.user?.lastname || ''}`;
  const gradient = getAvatarGradient(studentName);
  const initials = `${app.student?.user?.firstname?.charAt(0) || 'C'}${app.student?.user?.lastname?.charAt(0) || ''}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
<DialogContent className="w-full max-w-3xl p-0 overflow-hidden flex flex-col h-[90vh] rounded-2xl [&>button]:hidden">
        <div className="flex flex-col h-full relative">
          
          {/* Top Ambient mesh glow */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          {/* Header title */}
          <div className="flex items-center justify-between p-6 border-b border-border/40 relative z-10 bg-background/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Candidate Dossier</span>
            </div>
          
  <button onClick={onClose} className="p-1.5 hover:bg-muted/10 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer">
    <X size={18} />
  </button>
          </div>
 
          {/* Scrollable Dossier Contents */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 text-left">
            
            {/* Visual ID Badge Card */}
            <div className="text-center flex flex-col items-center p-6 bg-card border border-border/80 rounded-3xl shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative mb-4">
                <Avatar size="lg" className="size-20 border-4 border-background shadow-xl">
                  <AvatarFallback className={`bg-gradient-to-tr ${gradient} text-2xl font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h3 className="text-xl font-extrabold text-foreground tracking-tight">{studentName}</h3>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">
                {app.student?.department?.name || 'Department N/A'}
              </p>

              {/* Contact Details */}
              <div className="flex flex-col gap-2 mt-5 w-full">
                <div className="flex items-center justify-between bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                    <Mail size={14} className="text-primary/70 shrink-0" />
                    <span className="truncate">{app.student?.user?.email || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(app.student?.user?.email || '');
                      toast.success("Email copied successfully!");
                    }}
                    className="text-xs font-bold text-primary uppercase tracking-wider hover:underline shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                {app.student?.user?.phone && (
                  <div className="flex items-center justify-between bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <Phone size={14} className="text-primary/70 shrink-0" />
                      <span className="truncate">{app.student?.user?.phone}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(app.student?.user?.phone || '');
                        toast.success("Phone copied successfully!");
                      }}
                      className="text-xs font-bold text-primary uppercase tracking-wider hover:underline shrink-0 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Stats Dashboard */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Academic Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified CGPA</span>
                  <span className="text-2xl font-extrabold text-violet-650 mt-2">{app.student?.cgpa || 'N/A'} <span className="text-xs font-semibold text-muted-foreground">/ 10</span></span>
                </div>
                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Backlogs</span>
                  <span className={`text-2xl font-extrabold mt-2 ${app.student?.activeBacklogs > 0 ? 'text-rose-605' : 'text-emerald-650'}`}>
                    {app.student?.activeBacklogs ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Drive Placement Context */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Drive Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl mt-0.5 shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider">Job Applied For</p>
                    <p className="text-sm font-bold text-foreground">{app.jobUniversity?.job?.title || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-border/40 pt-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl mt-0.5 shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wider">Hiring Campus Location</p>
                    <p className="text-sm font-bold text-foreground">{app.jobUniversity?.university?.name || 'Global Drive Platform'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume dossier */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Documents & Verification</h4>
              <div className="bg-card border border-border/80 rounded-3xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl">
                    <FileText size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground tracking-tight">Candidate Resume dossier</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Verified PDF Attachment</p>
                  </div>
                </div>
                <button
                  onClick={() => openResume(app.student?.resumeUrl, studentName)}
                  className="p-3 bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground rounded-2xl transition-all cursor-pointer border border-border/45"
                  title="Open Resume"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>

            {/* Process Timeline History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1 flex-wrap gap-2">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Recruitment Pipeline History</h4>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-muted px-2.5 py-1 rounded-lg border border-border/30">
                  Stage: {formatStage(app.status, app.currentRound)}
                </span>
              </div>
              
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="relative pl-6 text-left space-y-6">
                  {/* Perfect, smooth absolute timeline line */}
                  <div className="absolute left-[11px] top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-primary/30 via-violet-500/25 to-zinc-100 dark:to-zinc-800/40" />

                  {app.history && app.history.length > 0 ? (
                    app.history.map((hist: any, idx: number) => {
                      const isSelect = hist.status === 'SELECTED' || hist.status === 'OFFER_ACCEPTED';
                      const isReject = hist.status === 'REJECTED';
                      const isShortlist = hist.status === 'SHORTLISTED';
                      return (
                        <div key={hist.id || idx} className="relative">
                          <div className={`absolute left-[11px] -translate-x-1/2 top-1.5 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center shadow-xs transition-all duration-300
                            ${isSelect ? 'border-emerald-500 text-emerald-500 ring-4 ring-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                              isReject ? 'border-rose-500 text-rose-500 ring-4 ring-rose-500/10 shadow-[0_0_8px_rgba(244,63,94,0.15)]' :
                              isShortlist ? 'border-violet-500 text-violet-500 ring-4 ring-violet-500/10 shadow-[0_0_8px_rgba(139,92,246,0.15)]' :
                              'border-primary text-primary ring-4 ring-primary/10 shadow-[0_0_8px_rgba(var(--primary),0.15)]'}`}
                          >
                            <div className={`w-2 h-2 rounded-full 
                              ${isSelect ? 'bg-emerald-500' :
                                isReject ? 'bg-rose-500' :
                                isShortlist ? 'bg-violet-500' :
                                'bg-primary'}`} 
                            />
                          </div>

                          <div className="pl-8 space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`text-xs font-bold uppercase tracking-wider
                                ${isSelect ? 'text-emerald-600 dark:text-emerald-400' :
                                  isReject ? 'text-rose-600 dark:text-rose-400' :
                                  isShortlist ? 'text-violet-600 dark:text-violet-400' :
                                  'text-primary'}`}
                              >
                                {formatStage(hist.status, hist.round)}
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold">
                                {new Date(hist.createdAt).toLocaleDateString()} at {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {hist.reason && (
                              <p className="text-xs font-medium text-zinc-650 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-900/60 py-1.5 px-3 rounded-xl border border-border/30 max-w-md inline-block">
                                "{hist.reason}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative">
                      <div className="absolute left-[11px] -translate-x-1/2 top-1.5 w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-xs ring-4 ring-primary/10 shadow-[0_0_8px_rgba(var(--primary),0.15)]">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="pl-8 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Application Locked
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold block">
                          {new Date(app.createdAt).toLocaleDateString()} at {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <p className="text-xs font-medium text-zinc-650 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-900/60 py-1.5 px-3 rounded-xl border border-border/30 max-w-md inline-block">
                          Initial application submitted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dossier Float Action Controls Bar */}
          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border/40 p-4 flex items-center gap-3 relative z-20 shrink-0">
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'SHORTLISTED');
              }}
              disabled={['SHORTLISTED', 'SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Sparkles size={14} /> Shortlist
            </button>
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'SELECTED');
              }}
              disabled={['SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 size={14} /> Select
            </button>
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'REJECTED');
              }}
              disabled={['REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="h-11 px-5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-rose-500/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
