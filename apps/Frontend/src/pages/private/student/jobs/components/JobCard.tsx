import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, Clock, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
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

interface JobCardProps {
  job: JobUniversity;
  isApplied: boolean;
  eligibility: { eligible: boolean; reasons: string[] };
  companyName: string;
  idx: number;
  onOpenDetails: () => void;
  onOpenApply: () => void;
  formatSalary: (salary: number) => string;
  formatDate: (dateString?: string) => string;
  getPostedAgo: (dateString?: string) => string;
  getCompanyInitials: (name?: string) => string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isApplied,
  eligibility,
  companyName,
  idx,
  onOpenDetails,
  onOpenApply,
  formatSalary,
  formatDate,
  getPostedAgo,
  getCompanyInitials,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="h-full border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#161b22]/30 rounded-[1.25rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-indigo-500/20">
        <CardContent className="p-6 flex flex-col h-full justify-between gap-5">
          
          {/* Top Row: Logo, Title, Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              {/* Gradient Rounded Square Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/10 shrink-0">
                {getCompanyInitials(companyName)}
              </div>
              
              {/* Title & Company */}
              <div className="pt-0.5 min-w-0">
                <h3 className="text-[17px] font-bold text-slate-800 dark:text-white leading-snug tracking-tight hover:text-indigo-600 transition-colors line-clamp-1">
                  {job.job?.title}
                </h3>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    {companyName}
                  </p>
                  {job.university?.name && (
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      {job.university.name} Drive
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Top-Right Pill Badge */}
            <div className="flex-shrink-0">
              {isApplied ? (
                <span className="bg-indigo-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                  Applied
                </span>
              ) : eligibility.eligible ? (
                <span className="bg-indigo-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                  Eligible
                </span>
              ) : (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                  Ineligible
                </span>
              )}
            </div>
          </div>

          {/* Middle row: MapPin, Rupee, Clock */}
          <div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-slate-500 dark:text-slate-400 text-[13px] font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-slate-400 shrink-0" />
              <span>{job.job?.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold shrink-0">₹</span>
              <span>{formatSalary(job.salary)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400 shrink-0" />
              <span>{formatDate(job.deadline)}</span>
            </div>
          </div>

          {/* Skills tags preview */}
          {job.job?.skills && job.job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {job.job.skills.slice(0, 3).map((skill) => (
                <span key={skill.id} className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {skill.name}
                </span>
              ))}
              {job.job.skills.length > 3 && (
                <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                  +{job.job.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Bottom Row: Posted Ago & Buttons */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {getPostedAgo(job.postedAt || job.sentAt || (job as any).createdAt)}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onOpenDetails}
                className="bg-white dark:bg-[#161b22]/30 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 h-10 rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all duration-200"
              >
                Details
              </Button>
              <Button
                disabled={isApplied}
                onClick={() => {
                  if (!isApplied) onOpenApply();
                }}
                className={cn(
                  "px-4 h-10 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-md transition-all duration-200 text-white",
                  isApplied
                    ? "bg-emerald-600/70 dark:bg-emerald-600/40 cursor-not-allowed opacity-80 shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10 hover:shadow-indigo-500/20"
                )}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 size={15} className="shrink-0" />
                    Applied
                  </>
                ) : (
                  <>
                    <Zap size={14} className="fill-white shrink-0" />
                    Apply Now
                  </>
                )}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
};
