import React from 'react';
import { Calendar, IndianRupee, Building2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import Loader from '@/components/Loader';
import { cn } from '@/lib/utils';

interface JobUniversity {
  id: number;
  salary: number;
  description?: string;
  minCgpa?: number;
  maxBacklogs?: number;
  openings?: number;
  deadline?: string;
  postedAt?: string;
  sentAt: string;
  status: string;
  job: {
    id: number;
    title: string;
    location: string;
    companyId?: number;
    company?: {
      id: number;
      name: string;
    };
    skills?: { id: number; name: string }[];
    eligibleDepartments?: { id: number; name: string }[];
  };
  university?: {
    id: number;
    name: string;
  };
}

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobUniversity | null;
  isApproved: boolean;
  isApplying: boolean;
  appliedJobIds: Set<number>;
  profile: any;
  checkEligibility: (job: JobUniversity | null) => { eligible: boolean; reasons: string[] };
  formatDate: (dateString?: string) => string;
  formatSalary: (salary: number) => string;
  selectedCompanyName: string;
  handleApply: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job,
  isApproved,
  isApplying,
  appliedJobIds,
  profile,
  checkEligibility,
  formatDate,
  formatSalary,
  selectedCompanyName,
  handleApply,
}) => {
  if (!job) return null;

  const eligibility = checkEligibility(job);
  const isApplied = appliedJobIds.has(Number(job.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.job.title}
      subtitle={`${selectedCompanyName} • ${job.job.location || 'Remote'}`}
      maxWidth="sm:max-w-lg"
    >
      <div className="space-y-5 py-1">
        
        {/* Quick Specs Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-white/[0.04] flex flex-col items-center justify-center text-center">
            <Calendar className="w-4 h-4 text-indigo-500 mb-1" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Deadline</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDate(job.deadline)}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-white/[0.04] flex flex-col items-center justify-center text-center">
            <IndianRupee className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Expected CTC</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{job.salary ? formatSalary(job.salary) : 'Competitive'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-white/[0.04] flex flex-col items-center justify-center text-center">
            <Building2 className="w-4 h-4 text-indigo-500 mb-1" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Openings</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{job.openings ? `${job.openings} Seats` : 'Multiple'}</span>
          </div>
        </div>

        {/* Eligibility Report Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Eligibility Status</h4>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-none border",
              eligibility.eligible 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            )}>
              {eligibility.eligible ? (
                <>
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  Eligible to Apply
                </>
              ) : (
                <>
                  <XCircle size={10} className="text-rose-500" />
                  Ineligible
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Academic CGPA</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile?.cgpa ?? '0.0'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Req: {job.minCgpa || '0.0'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    (profile?.cgpa || 0) >= (job.minCgpa || 0) ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${Math.min(100, ((profile?.cgpa || 0) / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-slate-100 dark:border-white/[0.03] flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Active Backlogs</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile?.activeBacklogs ?? '0'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Max: {job.maxBacklogs ?? 'None'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    (profile?.activeBacklogs ?? 0) <= (job.maxBacklogs ?? 99) ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${(profile?.activeBacklogs ?? 0) === 0 ? 100 : Math.max(0, 100 - ((profile?.activeBacklogs ?? 0) * 20))}%` }}
                />
              </div>
            </div>
          </div>

          {!eligibility.eligible && (
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle size={11} className="text-rose-500" /> Ineligibility Reasons
              </p>
              <ul className="space-y-1">
                {eligibility.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Required Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {job.job?.skills?.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-none px-2.5 py-1 text-xs font-semibold rounded-lg shadow-none">
                {skill.name}
              </Badge>
            ))}
            {(!job.job?.skills || job.job.skills.length === 0) && (
              <span className="text-xs text-slate-400 italic">No specific skills listed</span>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Job Description</h4>
          <div className="bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-slate-100 dark:border-white/5 max-h-36 overflow-y-auto custom-scrollbar">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm whitespace-pre-wrap font-medium">
              {job.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            className={cn(
              "w-full h-11 md:h-12 text-xs md:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 border shadow-md",
              isApplied
                ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-not-allowed shadow-none"
                : !isApproved 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 cursor-not-allowed shadow-none"
                : !eligibility.eligible
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
            )}
            onClick={handleApply}
            disabled={isApplying || isApplied || !eligibility.eligible || !isApproved}
          >
            {isApplying ? (
              <Loader size="sm" />
            ) : isApplied ? (
              <span className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                Already Applied
              </span>
            ) : !isApproved ? (
              'Account Pending Approval'
            ) : !eligibility.eligible ? (
              'Not Eligible to Apply'
            ) : (
              'Confirm Application'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
