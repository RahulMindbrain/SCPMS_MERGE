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
  XCircle 
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
  getAvatarGradient,
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
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Candidate Dossier</span>
            </div>
          
  <button onClick={onClose}>
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
                  <AvatarFallback className={`bg-gradient-to-tr ${gradient} text-2xl font-black`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h3 className="text-xl font-black text-foreground tracking-tight">{studentName}</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
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
                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline shrink-0 cursor-pointer"
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
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline shrink-0 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Stats Dashboard */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Academic Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Verified CGPA</span>
                  <span className="text-2xl font-black text-violet-600 mt-2">{app.student?.cgpa || 'N/A'} <span className="text-xs font-bold text-muted-foreground">/ 10</span></span>
                </div>
                <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Active Backlogs</span>
                  <span className={`text-2xl font-black mt-2 ${app.student?.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {app.student?.activeBacklogs ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Drive Placement Context */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drive Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl mt-0.5 shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Applied For</p>
                    <p className="text-sm font-black text-foreground">{app.jobUniversity?.job?.title || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-border/40 pt-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl mt-0.5 shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiring Campus Location</p>
                    <p className="text-sm font-black text-foreground">{app.jobUniversity?.university?.name || 'Global Drive Platform'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume dossier */}
            {/* <div className="space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Documents & Verification</h4>
              <div className="bg-card border border-border/80 rounded-3xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl">
                    <Download size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-foreground tracking-tight">Candidate Resume dossier</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Verified PDF Attachment</p>
                  </div>
                </div>
                <button
                  onClick={() => openResume(app.student?.resumeUrl, studentName)}
                  className="p-3 bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground rounded-2xl transition-all cursor-pointer border border-border/45"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div> */}

            {/* Process Timeline History */}
            {/* <div className="space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">recruitment Pipeline history</h4>
              
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm relative">
                <span className="absolute top-6 right-6 text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                  Stage: {app.status}
                </span>
                
                <div className="relative pl-5 border-l border-border/60 space-y-6 text-left ml-2">
                  {app.history && app.history.length > 0 ? (
                    app.history.map((hist: any, idx: number) => {
                      const isSelect = hist.status === 'SELECTED' || hist.status === 'OFFER_ACCEPTED';
                      const isReject = hist.status === 'REJECTED';
                      const isShortlist = hist.status === 'SHORTLISTED';
                      return (
                        <div key={hist.id || idx} className="relative">
                          <div className={`absolute -left-[29px] top-0.5 w-4.5 h-4.5 rounded-full border-2 bg-background flex items-center justify-center shadow-xs
                            ${isSelect ? 'border-emerald-500 text-emerald-500 ring-4 ring-emerald-500/10' :
                              isReject ? 'border-rose-500 text-rose-500 ring-4 ring-rose-500/10' :
                              isShortlist ? 'border-violet-500 text-violet-500 ring-4 ring-violet-500/10' :
                              'border-primary text-primary ring-4 ring-primary/10'}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full 
                              ${isSelect ? 'bg-emerald-500' :
                                isReject ? 'bg-rose-500' :
                                isShortlist ? 'bg-violet-500' :
                                'bg-primary'}`} 
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black uppercase tracking-wider
                                ${isSelect ? 'text-emerald-600' :
                                  isReject ? 'text-rose-600' :
                                  isShortlist ? 'text-violet-600' :
                                  'text-primary'}`}
                              >
                                {formatStage(hist.status, hist.round)}
                              </span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest font-mono bg-muted/40 px-1.5 py-0.5 rounded">
                                {new Date(hist.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {hist.reason && (
                              <p className="text-xs font-medium text-muted-foreground/80 pl-2 border-l border-border italic bg-muted/5 py-1 px-3 rounded-lg max-w-sm">
                                "{hist.reason}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative">
                      <div className="absolute -left-[29px] top-0.5 w-4.5 h-4.5 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-xs ring-4 ring-primary/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                          Application Locked
                        </span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest font-mono block">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-xs font-medium text-muted-foreground/70 pl-2 border-l border-border italic bg-muted/5 py-1 px-3 rounded-lg">
                          Initial application submitted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div> */}
          </div>

          {/* Dossier Float Action Controls Bar */}
          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border/40 p-4 flex items-center gap-3 backdrop-blur-md border-t border-border/40 p-4 flex items-center gap-3 relative z-20 shrink-0">
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'SHORTLISTED');
              }}
              disabled={['SHORTLISTED', 'SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Sparkles size={13} /> Shortlist
            </button>
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'SELECTED');
              }}
              disabled={['SELECTED', 'REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 size={13} /> Select
            </button>
            <button
              onClick={() => {
                onClose();
                openUpdateModal(app, 'REJECTED');
              }}
              disabled={['REJECTED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'WITHDRAWN'].includes(app.status)}
              className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-black text-[9px] uppercase tracking-widest rounded-2xl border border-rose-500/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <XCircle size={13} /> Reject
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
