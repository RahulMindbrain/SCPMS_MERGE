import {
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, applyJob, fetchStudentProfile, fetchJobApplications, fetchJobUniversities } from '@/redux/thunks/studentThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { StudentPageLayout } from '@/components/layout/StudentPageLayout';


import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { JobApplyModal } from './components/JobApplyModal';
import { GlobalAtsModal } from './components/GlobalAtsModal';
import { analyzeJdMatch } from '@/redux/thunks/atsThunk';
import { resetAtsState, setAtsResult, setOptimizedResume } from '@/redux/slices/atsSlice';

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

const getCompanyInitials = (name?: string) => {
  if (!name) return 'CO';
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No Deadline';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'No Deadline';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'No Deadline';
  }
};

const getPostedAgo = (dateString?: string) => {
  if (!dateString) return 'Posted recently';
  try {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  } catch (e) {
    return 'Posted recently';
  }
};

const checklistItems = [
  "Parsing resume text structure",
  "Extracting key skills & experiences",
  "Matching qualifications against job description",
  "Synthesizing final ATS match report"
];



const JobListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs = [], jobUniversities = [], profile, applications = [], loading } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);
  const isApproved = user?.status === 'ACTIVE';

  // Enrich jobUniversities with full company object from show-all-jobs
  // job-universities only has companyId; show-all-jobs has the full company { name, ... }
  const normalizedJobs = useMemo(() => {
    return jobUniversities.map((ju: any) => {
      const matchedJob = jobs.find((j: any) => j.id === ju.jobId || j.id === ju.job?.id);
      return {
        ...ju,
        job: {
          ...ju.job,
          company: matchedJob?.company ?? ju.job?.company ?? null,
        },
      };
    });
  }, [jobUniversities, jobs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'eligible'>('all');
  const [selectedJob, setSelectedJob] = useState<JobUniversity | null>(null);
  
  // Custom states for separate modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Global ATS Checker state
  const [isGlobalAtsModalOpen, setIsGlobalAtsModalOpen] = useState(false);
  
  // ATS multi-state application flow
  const [applyStep, setApplyStep] = useState<'resume' | 'loading' | 'report' | 'optimize-loading' | 'optimized'>('resume');
  const [selectedResumeOption, setSelectedResumeOption] = useState<'latest' | 'fresh'>('latest');
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isApplying, setIsApplying] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchJobs({}));
    dispatch(fetchJobUniversities({}));
    dispatch(fetchJobApplications({}));
    if (!profile) {
      dispatch(fetchStudentProfile());
    }
  }, [dispatch, profile]);

  const appliedJobIds = useMemo(() => new Set(
    applications.map((app: any) => Number(app?.jobUniversityId || app?.jobUniversity?.id)).filter(Boolean)
  ), [applications]);

  const formatSalary = (salary: number) => {
    if (!salary) return 'Not disclosed';
    return (salary / 100000).toFixed(1) + ' LPA';
  };

  const checkEligibility = (job: JobUniversity | null) => {
    if (!job || !profile) return { eligible: true, reasons: [] };

    const reasons: string[] = [];
    const studentCgpa = profile.cgpa ?? 0;
    const studentBacklogs = profile.activeBacklogs ?? 0;
    const studentDeptId = profile.department?.id || profile.departmentId;

    if (job.minCgpa && studentCgpa < job.minCgpa) {
      reasons.push(`Minimum CGPA required: ${job.minCgpa} (Your CGPA: ${studentCgpa})`);
    }
    if (job.maxBacklogs !== undefined && studentBacklogs > job.maxBacklogs) {
      reasons.push(`Maximum backlogs allowed: ${job.maxBacklogs} (Your backlogs: ${studentBacklogs})`);
    }

    const eligibleDeptIds = job.job.eligibleDepartments?.map((d: any) => d.id) || [];
    if (eligibleDeptIds.length > 0 && !eligibleDeptIds.includes(studentDeptId)) {
      reasons.push(`Your department is not eligible for this role`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  const filteredJobs = useMemo(() => {
    return (normalizedJobs || []).filter((job: any) => {
      if (!job?.job) return false;

      const matchesSearch =
        job.job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.university?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const eligibility = checkEligibility(job);

      if (activeTab === 'applied') return appliedJobIds.has(Number(job.id));
      if (activeTab === 'eligible') return eligibility.eligible && !appliedJobIds.has(Number(job.id));

      // In 'all' tab, we show everything but mark them
      return true;
    });
  }, [normalizedJobs, searchQuery, activeTab, appliedJobIds, profile]);

  // Paginated data
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Reset ATS state when the modal closes
  useEffect(() => {
    if (!isApplyModalOpen) {
      setApplyStep('resume');
      setLoadingStage(0);
      setLoadingProgress(0);
      setUploadedResumeUrl('');
      dispatch(resetAtsState());
    }
  }, [isApplyModalOpen, dispatch]);

  // Handle loading stages and trigger real API call for the custom ATS resume scanner
  useEffect(() => {
    let interval: any;
    let timer1: any;
    let timer2: any;
    let timer3: any;
    let timer4: any;
    let timer5: any;
    let timer6: any;
    
    if (applyStep === 'loading') {
      setLoadingStage(0);
      setLoadingProgress(0);
      
      // Step 1 finishes at 900ms
      timer1 = setTimeout(() => setLoadingStage(1), 900);
      
      // Step 2 finishes at 1800ms
      timer2 = setTimeout(() => setLoadingStage(2), 1800);
      
      // Step 3 finishes at 2700ms
      timer3 = setTimeout(() => setLoadingStage(3), 2700);
      
      // Active loading progress bar for step 4 starts at 2700ms
      timer4 = setTimeout(() => {
        interval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 80);
      }, 2750);
      
      // Perform real API call
      const resumeUrl = selectedResumeOption === 'latest' ? (profile?.resumeUrl || '') : uploadedResumeUrl;
      const jobDescription = selectedJob?.description || '';

      if (resumeUrl && jobDescription) {
        dispatch(analyzeJdMatch({ resumeUrl, jobDescription }))
          .unwrap()
          .then(() => {
            // Succeeded! Complete progress
            setLoadingStage(4);
            setLoadingProgress(100);
            timer5 = setTimeout(() => {
              setApplyStep('report');
            }, 600);
          })
          .catch((err: any) => {
            console.error("ATS Analyzer error during apply:", err);
            toast.error(err || "Failed to analyze resume match");
            setApplyStep('resume');
          });
      } else {
        // Fallback to simulation
        timer5 = setTimeout(() => {
          setLoadingStage(4);
          setLoadingProgress(100);
          timer6 = setTimeout(() => {
            setApplyStep('report');
          }, 600);
        }, 4600);
      }
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      if (interval) clearInterval(interval);
    };
  }, [applyStep, profile, selectedJob, dispatch, selectedResumeOption, uploadedResumeUrl]);



  const handleApply = async (skipOpt: boolean | any = false) => {
    if (!selectedJob) return;

    if (!profile?.resumeUrl) {
      toast.error("Please upload your resume in your profile before applying.", {
        description: "You must have a resume uploaded to your profile to apply for jobs."
      });
      return;
    }

    setIsApplying(true);
    const toastId = toast.loading(`Submitting application for ${selectedJob.job.title}...`);

    const isExplicitSkip = typeof skipOpt === 'boolean' ? skipOpt : false;

    // Skip optimization if explicitly requested, or if the user is already on the report or optimized screen
    const shouldSkip = isExplicitSkip || applyStep === 'report' || applyStep === 'optimized';

    dispatch(applyJob({ 
      jobUniversityId: selectedJob.id, 
      skipOptimization: shouldSkip 
    }))
      .unwrap()
      .then((res: any) => {
        setIsApplying(false);
        
        if (res?.data?.requiresOptimization) {
          toast.dismiss(toastId);
          if (res.data.atsResult) {
            dispatch(setAtsResult(res.data.atsResult));
          }
          setApplyStep('report');
          setIsApplyModalOpen(true);
          setIsDetailsModalOpen(false);
        } else if (res?.data?.requiresResumeUpdate) {
          toast.dismiss(toastId);
          const optRes = res.data.optimizedResume?.optimizedResume || res.data.optimizedResume;
          if (optRes) {
            dispatch(setOptimizedResume(optRes));
          }
          setApplyStep('optimized');
          setIsApplyModalOpen(true);
          setIsDetailsModalOpen(false);
        } else {
          toast.success("Application submitted successfully!", { id: toastId });
          setIsDetailsModalOpen(false);
          setIsApplyModalOpen(false);
          dispatch(fetchJobApplications({}));
        }
      })
      .catch((error: any) => {
        setIsApplying(false);
        toast.error(error || "Failed to submit application.", { id: toastId });
      });
  };

  const selectedCompanyName = selectedJob?.job?.company?.name ?? 'Hiring Partner';

  if (loading && (jobUniversities?.length || 0) === 0) {
    return <Loader text="Syncing career opportunities..." fullScreen />;
  }

  return (
    <StudentPageLayout>
      <div className="space-y-6 student-hero-animate fade-in slide-in-from-bottom-2 duration-500">

        {/* Adaptive Hero Banner */}
        <div className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-blue"></div>
            <div className="bubble-sky"></div>
          </div>

          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>

          <div className="relative z-10 w-full">
            <div className="student-hero-badge">
              <span>Career Opportunities</span>
            </div>
            <h1 className="student-hero-title">
              Find Your <span>Dream Career</span>
            </h1>
            <p className="student-hero-description">
              Explore the latest job openings, internships, and placement opportunities from top-tier companies.
            </p>
          </div>
        </div>

        {/* ─── Compact Controls Bar ─── */}
        {(jobUniversities?.length || 0) > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-[#161b22]/30 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-white/[0.06] shadow-sm">
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0f172a]/60 p-1 rounded-xl border border-slate-200/10 dark:border-white/[0.02] overflow-x-auto no-scrollbar w-full md:w-auto">
              {[
                { id: 'all', label: 'All Jobs' },
                { id: 'eligible', label: 'Recommended' },
                { id: 'applied', label: 'Applied' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-white dark:bg-[#1e1f26] text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/40 dark:border-white/[0.05]"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4"
                />
                <Input
                  placeholder="Search role or company..."
                  className="pl-10 h-10 bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs md:text-sm font-semibold focus-visible:ring-indigo-500/20 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setIsGlobalAtsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm px-4 h-10 rounded-xl shadow-md flex flex-wrap items-center gap-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer shrink-0"
              >
                <Sparkles size={14} className="fill-white" />
                ATS Checker
              </Button>
            </div>
          </div>
        )}

        {/* ─── Jobs Grid - Compact & Beautiful Card Design ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {paginatedJobs.map((job: JobUniversity, idx) => {
              const isApplied = appliedJobIds.has(Number(job.id));
              const eligibility = checkEligibility(job);

              const companyName = job.job?.company?.name ?? 'Hiring Partner';

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={isApplied}
                  eligibility={eligibility}
                  companyName={companyName}
                  idx={idx}
                  onOpenDetails={() => {
                    setSelectedJob(job);
                    setIsDetailsModalOpen(true);
                  }}
                  onOpenApply={() => {
                    if (!profile?.resumeUrl) {
                      toast.error("Please upload your resume in your profile before applying.", {
                        description: "You must have a resume uploaded to your profile to apply for jobs."
                      });
                      return;
                    }
                    setSelectedJob(job);
                    setIsApplyModalOpen(true);
                  }}
                  formatSalary={formatSalary}
                  formatDate={formatDate}
                  getPostedAgo={getPostedAgo}
                  getCompanyInitials={getCompanyInitials}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 pb-12">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="rounded-xl border border-slate-200 dark:border-white/10 w-9 h-9 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-semibold transition-all shadow-sm",
                    currentPage === idx + 1
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white dark:bg-[#1e1f26] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="rounded-xl border border-slate-200 dark:border-white/10 w-9 h-9 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-700">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">No matching opportunities</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Try broadening your search or switching tabs.</p>
          </div>
        )}

        {/* ─── Premium Modals ─── */}
        <JobDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          job={selectedJob}
          isApproved={isApproved}
          isApplying={isApplying}
          appliedJobIds={appliedJobIds}
          profile={profile}
          checkEligibility={checkEligibility}
          formatDate={formatDate}
          formatSalary={formatSalary}
          selectedCompanyName={selectedCompanyName}
          handleApply={handleApply}
        />

        <JobApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          selectedJob={selectedJob}
          applyStep={applyStep}
          setApplyStep={setApplyStep}
          selectedResumeOption={selectedResumeOption}
          setSelectedResumeOption={setSelectedResumeOption}
          uploadedResumeUrl={uploadedResumeUrl}
          setUploadedResumeUrl={setUploadedResumeUrl}
          loadingStage={loadingStage}
          loadingProgress={loadingProgress}
          isApplying={isApplying}
          handleApply={handleApply}
          checklistItems={checklistItems}
        />

        <GlobalAtsModal
          isOpen={isGlobalAtsModalOpen}
          onClose={() => setIsGlobalAtsModalOpen(false)}
        />
      </div>
    </StudentPageLayout>
  );
};

export default JobListing;
