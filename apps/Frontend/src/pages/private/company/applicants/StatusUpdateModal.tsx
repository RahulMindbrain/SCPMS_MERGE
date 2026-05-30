import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Info,
  AlertCircle,
  Brain,
  Code2,
  UserCheck,
  Check,
  Clock
} from 'lucide-react';
const STATUS_FLOW = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'OFFER_ACCEPTED'];

const isBackward = (current: string, next: string) => {
  if (next === 'REJECTED') return false; // Can always reject unless already rejected or finalized
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);

  if (nextIndex === -1) return false;
  if (currentIndex === -1) return false;

  return nextIndex < currentIndex;
};

const isRoundBackward = (currentRound: string | null | undefined, nextRound: string) => {
  if (!currentRound) return false;
  const ROUNDS_ORDER = ['APTITUDE', 'TECHNICAL', 'HR'];
  const currentIndex = ROUNDS_ORDER.indexOf(currentRound);
  const nextIndex = ROUNDS_ORDER.indexOf(nextRound);

  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex < currentIndex;
};

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
  getPresetReason
}) => {
  const getRoundProgressState = (roundId: string, app: any) => {
    const { status, currentRound } = app;

    if (status === 'APPLIED') {
      return 'inactive';
    }

    const roundsList = ['APTITUDE', 'TECHNICAL', 'HR'];
    const activeRound = currentRound || 'APTITUDE';
    const activeIdx = roundsList.indexOf(activeRound);
    const roundIdx = roundsList.indexOf(roundId);

    if (status === 'REJECTED') {
      if (roundIdx < activeIdx) {
        return 'completed';
      } else if (roundIdx === activeIdx) {
        return 'failed';
      } else {
        return 'inactive';
      }
    }

    if (status === 'SELECTED' || status === 'OFFER_ACCEPTED') {
      return 'completed';
    }

    // SHORTLISTED
    if (roundIdx < activeIdx) {
      return 'completed';
    } else if (roundIdx === activeIdx) {
      return 'active';
    } else {
      return 'inactive';
    }
  };

  const handleStatusChange = (statusId: string) => {
    setTargetStatus(statusId);
    if (statusId === 'SHORTLISTED') {
      let defaultRound = 'APTITUDE';
      if (selectedApp.currentRound === 'APTITUDE') defaultRound = 'TECHNICAL';
      else if (selectedApp.currentRound === 'TECHNICAL') defaultRound = 'HR';

      setTargetRound(defaultRound);
      setReasonText(getPresetReason('SHORTLISTED', defaultRound));
    } else {
      setTargetRound('');
      setReasonText(getPresetReason(statusId, ''));
    }
  };

  const handleRoundChange = (roundId: string) => {
    setTargetRound(roundId);
    setReasonText(getPresetReason('SHORTLISTED', roundId));
  };

  if (!isOpen || !selectedApp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className=" w-full 
  max-w-2xl
  max-h-[90vh]
  overflow-y-auto
  bg-card 
  border 
  border-border/80 
  rounded-3xl 
  p-6 md:p-8 
  shadow-2xl 
  space-y-6 
  animate-in zoom-in-95 duration-300 
  relative animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Modal Ambient Mesh */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Recruitment Stage Update</span>
            <h3 className="text-lg font-extrabold text-foreground">
              {selectedApp.student?.user?.firstname} {selectedApp.student?.user?.lastname}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Current: {formatStage(selectedApp.status, selectedApp.currentRound)}</span>
              <span className="text-primary font-bold">➔</span>
              <span className="text-violet-650 dark:text-violet-400 font-extrabold bg-violet-500/5 px-2 py-0.5 rounded-lg border border-violet-500/10">
                Target: {formatStage(targetStatus, targetRound)}
              </span>
            </div>
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
                <h4 className="text-xs font-bold uppercase tracking-wider">{err.title}</h4>
                <p className="text-xs font-medium opacity-90 leading-relaxed">{err.message}</p>
                {submissionError && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      submitStatusUpdate();
                    }}
                    className="mt-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Retry Action
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Target Status Controller */}
        <div className="space-y-2 relative z-10 text-left">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Target Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'APPLIED', label: 'Applied', icon: <Clock size={14} />, color: 'blue' },
              { id: 'SHORTLISTED', label: 'Shortlist', icon: <Sparkles size={14} />, color: 'violet' },
              { id: 'SELECTED', label: 'Select', icon: <CheckCircle2 size={14} />, color: 'emerald' },
              { id: 'REJECTED', label: 'Reject', icon: <XCircle size={14} />, color: 'rose' }
            ].map((statusItem) => {
              const isSelected = targetStatus === statusItem.id;
              const isDisabled = isBackward(selectedApp.status, statusItem.id);

              const themeClasses = {
                blue: isSelected
                  ? 'border-blue-500 bg-blue-500/5 text-blue-600 shadow-md shadow-blue-500/5'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground',
                violet: isSelected
                  ? 'border-violet-500 bg-violet-500/5 text-violet-600 shadow-md shadow-violet-500/5'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground',
                emerald: isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-md shadow-emerald-500/5'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground',
                rose: isSelected
                  ? 'border-rose-500 bg-rose-500/5 text-rose-600 shadow-md shadow-rose-500/5'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'
              }[statusItem.color as 'blue' | 'violet' | 'emerald' | 'rose'];

              return (
                <button
                  key={statusItem.id}
                  type="button"
                  id={`target-status-${statusItem.id.toLowerCase()}`}
                  disabled={isDisabled}
                  onClick={() => handleStatusChange(statusItem.id)}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider ${themeClasses}`}
                >
                  {statusItem.icon}
                  <span>{statusItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Interview Rounds Stepper */}
        {targetStatus === 'SHORTLISTED' && (
          <div className="space-y-3 relative z-10 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Interview Round Selection
              </label>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider bg-violet-500/5 px-2.5 py-0.5 rounded-full border border-violet-500/10">
                Select Target Round
              </span>
            </div>

            <div className="w-full pb-1">
              <div className="flex flex-col items-center w-full bg-muted/5 rounded-3xl border border-border/40 p-5 gap-4">

                {/* Circles Row with solid connecting track line */}
                <div className="flex items-center justify-between w-full px-8 relative">
                  <div className="absolute left-[44px] right-[44px] top-1/2 -translate-y-1/2 h-[2px] bg-zinc-200 dark:bg-zinc-800/60 pointer-events-none" />

                  {[
                    { id: 'APTITUDE', label: 'Aptitude', icon: <Brain size={14} /> },
                    { id: 'TECHNICAL', label: 'Technical', icon: <Code2 size={14} /> },
                    { id: 'HR', label: 'HR', icon: <UserCheck size={14} /> }
                  ].map((round) => {
                    const progressState = getRoundProgressState(round.id, selectedApp);
                    const isCompleted = progressState === 'completed';
                    const isActive = progressState === 'active';
                    const isFailed = progressState === 'failed';

                    const isUISelected = targetRound === round.id;
                    const isRoundDisabled = isRoundBackward(selectedApp.currentRound, round.id);

                    return (
                      <div key={round.id} className="relative z-10">
                        {isUISelected && (
                          <span className="absolute -inset-1.5 rounded-full animate-pulse bg-violet-500/25 dark:bg-violet-500/35 blur-xs pointer-events-none" />
                        )}
                        {isActive && !isUISelected && (
                          <span className="absolute -inset-1 rounded-full animate-ping bg-blue-400/20 dark:bg-blue-500/30 opacity-75 pointer-events-none" />
                        )}

                        <button
                          type="button"
                          id={`pipeline-round-${round.id.toLowerCase()}`}
                          disabled={isRoundDisabled}
                          onClick={() => handleRoundChange(round.id)}
                          className={`size-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 cursor-pointer shadow-xs hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                            ${isUISelected
                              ? 'border-violet-500 bg-violet-600 text-white dark:bg-violet-600 shadow-md shadow-violet-500/20'
                              : isCompleted
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 animate-in fade-in'
                                : isActive
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 animate-in fade-in'
                                  : isFailed
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-405'
                                    : 'border-zinc-250 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-350 hover:text-zinc-600'}`}
                          title={isRoundDisabled ? 'Cannot select a completed or previous round' : `Click to select ${round.label} round`}
                        >
                          {isCompleted ? (
                            <Check size={14} className="stroke-[3px]" />
                          ) : isFailed ? (
                            <X size={14} className="stroke-[3px] text-rose-600" />
                          ) : (
                            round.icon
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Round Status Context Card */}
                {(() => {
                  const selectedRoundData = [
                    { id: 'APTITUDE', label: 'Aptitude Assessment', icon: <Brain size={15} /> },
                    { id: 'TECHNICAL', label: 'Technical Interview', icon: <Code2 size={15} /> },
                    { id: 'HR', label: 'HR Interview', icon: <UserCheck size={15} /> }
                  ].find(r => r.id === targetRound) || { id: 'APTITUDE', label: 'Aptitude Assessment', icon: <Brain size={15} /> };

                  return (
                    <div className="w-full bg-background border border-border/60 rounded-2xl p-3 flex items-center justify-between text-xs shadow-xs animate-in fade-in duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl shrink-0">
                          {selectedRoundData.icon}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block text-sm">{selectedRoundData.label}</span>
                          <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider block mt-0.5">
                            {targetRound === selectedApp.currentRound ? 'Current Active stage' : 'Selected Target Stage'}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border
                        ${targetRound === selectedApp.currentRound
                          ? 'bg-blue-500/5 text-blue-600 border-blue-500/10'
                          : isRoundBackward(selectedApp.currentRound, targetRound)
                            ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                            : 'bg-violet-500/5 text-violet-600 border-violet-500/10'
                        }`}
                      >
                        {targetRound === selectedApp.currentRound ? 'Active' : 'Target'}
                      </span>
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        )}

        {/* Smart Presets Suggestions for Recruiter */}
        <div className="space-y-2 relative z-10 text-left shrink-0">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Quick Remarks Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const presets = targetStatus === 'SHORTLISTED'
                ? ['Cleared technical round', 'Strong technical credentials', 'Eligible for HR interview', 'Excellent analytical skills']
                : targetStatus === 'SELECTED'
                  ? ['Offered extended post interview', 'Outstanding technical & HR performance', 'Immediate release of offer letter']
                  : ['Lacks sufficient core skills', 'Interview feedback not cleared', 'Did not clear technical interview'];

              return presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReasonText(preset)}
                  className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/10 hover:bg-muted/20 border border-border/50 hover:border-border rounded-lg transition-all cursor-pointer"
                >
                  + {preset}
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Reason/Remarks Input */}
        <div className="space-y-2 relative z-10 text-left">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
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
            className="px-5 py-3 border border-border/80 text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-muted/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitStatusUpdate}
            disabled={isSubmitting || validationError?.type === 'error'}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
