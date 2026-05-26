import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Info, 
  AlertCircle 
} from 'lucide-react';
import { isBackward, isRoundBackward } from './Applicants';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: any;
  targetStatus: string;
  setTargetStatus: (val: string) => void;
  targetRound: string;
  setTargetRound: (val: string) => void;
  reasonText: string;
  setReasonText: (val: string) => void;
  isSubmitting: boolean;
  submitStatusUpdate: () => void;
  validationError: any;
  submissionError: any;
  formatStage: (status: string, round?: string | null) => string;
  formatRound: (round: string) => string;
  getPresetReason: (status: string, round: string) => string;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedApp,
  targetStatus,
  setTargetStatus,
  targetRound,
  setTargetRound,
  reasonText,
  setReasonText,
  isSubmitting,
  submitStatusUpdate,
  validationError,
  submissionError,
  formatStage,
  formatRound,
  getPresetReason
}) => {
  if (!isOpen || !selectedApp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Modal Ambient Mesh */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-start justify-between relative z-10 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Recruitment Stage Update</span>
            <h3 className="text-lg font-black text-foreground">
              {selectedApp.student?.user?.firstname} {selectedApp.student?.user?.lastname}
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Current: {formatStage(selectedApp.status, selectedApp.currentRound)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted/10 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contextual Error / Warning Banner */}
        {(validationError || submissionError) && (() => {
          const err = submissionError || validationError;
          if (!err) return null;
          
          const isWarning = err.type === 'warning';
          const isInfo = err.type === 'info';
          
          const bgClass = isWarning 
            ? 'bg-amber-50/80 border-amber-200/50 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300' 
            : isInfo 
              ? 'bg-blue-50/80 border-blue-200/50 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300'
              : 'bg-red-50/80 border-red-200/50 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300';
          
          const borderClass = isWarning
            ? 'border-amber-200/50'
            : isInfo
              ? 'border-blue-200/50'
              : 'border-red-200/50';

          const iconColor = isWarning 
            ? 'text-amber-600 dark:text-amber-400' 
            : isInfo
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-rose-600 dark:text-rose-400';

          const renderIcon = () => {
            switch (err.icon) {
              case 'ShieldAlert':
                return <ShieldAlert size={16} className={iconColor} />;
              case 'Info':
                return <Info size={16} className={iconColor} />;
              case 'XCircle':
                return <XCircle size={16} className={iconColor} />;
              default:
                return <AlertCircle size={16} className={iconColor} />;
            }
          };

          return (
            <div className={`p-4 rounded-xl border backdrop-blur-md shadow-xs flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2 duration-300 ${bgClass} ${borderClass}`}>
              <div className="mt-0.5 shrink-0">
                {renderIcon()}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider">{err.title}</h4>
                <p className="text-xs font-medium opacity-90 leading-relaxed">{err.message}</p>
                {submissionError && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      submitStatusUpdate();
                    }}
                    className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Retry Action
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Stage Toggle Cards */}
        <div className="space-y-2 relative z-10 text-left">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
            Target Status
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={isBackward(selectedApp.status, 'SHORTLISTED')}
              onClick={() => {
                setTargetStatus('SHORTLISTED');
                setTargetRound('APTITUDE');
                setReasonText(getPresetReason('SHORTLISTED', 'APTITUDE'));
              }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                ${targetStatus === 'SHORTLISTED' 
                  ? 'border-violet-500 bg-violet-500/5 text-violet-600 shadow-md shadow-violet-500/5' 
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
            >
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Shortlist</span>
            </button>
            <button
              type="button"
              disabled={isBackward(selectedApp.status, 'SELECTED')}
              onClick={() => {
                setTargetStatus('SELECTED');
                setTargetRound('');
                setReasonText(getPresetReason('SELECTED', ''));
              }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                ${targetStatus === 'SELECTED' 
                  ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-md shadow-emerald-500/5' 
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
            >
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Select</span>
            </button>
            <button
              type="button"
              disabled={isBackward(selectedApp.status, 'REJECTED')}
              onClick={() => {
                setTargetStatus('REJECTED');
                setTargetRound('');
                setReasonText(getPresetReason('REJECTED', ''));
              }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                ${targetStatus === 'REJECTED' 
                  ? 'border-rose-500 bg-rose-500/5 text-rose-600 shadow-md shadow-rose-500/5' 
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
            >
              <XCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Reject</span>
            </button>
          </div>
        </div>

        {/* Conditional Round Selection Grid */}
        {targetStatus === 'SHORTLISTED' && (
          <div className="space-y-2 relative z-10 text-left animate-in fade-in duration-300">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
              Interview Round
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['APTITUDE', 'GROUP_DISCUSSION', 'TECHNICAL', 'HR', 'MANAGERIAL', 'FINAL'].map((round) => {
                const isRoundDisabled = isRoundBackward(selectedApp.currentRound, round);
                return (
                  <button
                    key={round}
                    type="button"
                    disabled={isRoundDisabled}
                    onClick={() => {
                      setTargetRound(round);
                      setReasonText(getPresetReason('SHORTLISTED', round));
                    }}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center
                      ${targetRound === round 
                        ? 'border-violet-500 bg-violet-500/5 text-violet-600' 
                        : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
                  >
                    {formatRound(round)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Smart Presets Suggestions for Recruiter */}
        <div className="space-y-2 relative z-10 text-left shrink-0">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
            Quick Remarks Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const presets = targetStatus === 'SHORTLISTED'
                ? ['Cleared technical round', 'Strong technical credentials', 'Eligible for managerial interview', 'Excellent analytical skills']
                : targetStatus === 'SELECTED'
                  ? ['Offered extended post interview', 'Outstanding technical & HR performance', 'Immediate release of offer letter']
                  : ['Lacks sufficient core skills', 'Interview feedback not cleared', 'Unsatisfactory response metrics'];
              
              return presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReasonText(preset)}
                  className="px-2.5 py-1 text-[9px] font-bold text-muted-foreground hover:text-foreground bg-muted/10 hover:bg-muted/20 border border-border/50 hover:border-border rounded-lg transition-all cursor-pointer"
                >
                  + {preset}
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Reason/Remarks Input */}
        <div className="space-y-2 relative z-10 text-left">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
            Decision Notes / Feedback
          </label>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Enter a reason, interview feedback, or additional notes..."
            rows={3}
            className="w-full saas-textarea p-3.5 bg-muted/5 border border-border/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-xs shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 border border-border/80 text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-muted/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitStatusUpdate}
            disabled={isSubmitting || validationError?.type === 'error'}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/95 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Updating...</span>
              </div>
            ) : (
              'Confirm Stage Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
