import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, FileText, Upload, Sparkles, ArrowRight, Zap, Brain, 
  CheckCircle2, Loader2, Copy, Check, Briefcase, GraduationCap, 
  Phone, Mail, Link, Code, Award, ChevronLeft, User, ListChecks
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/redux/reducers/rootReducer';
import type { AppDispatch } from '@/redux/store/store';

import { updateStudentProfile, applyJob } from '@/redux/thunks/studentThunk';
import { setOptimizedResume } from '@/redux/slices/atsSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

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

interface JobApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: JobUniversity | null;
  applyStep: 'resume' | 'loading' | 'report' | 'optimize-loading' | 'optimized';
  setApplyStep: (step: 'resume' | 'loading' | 'report' | 'optimize-loading' | 'optimized') => void;
  selectedResumeOption: 'latest' | 'fresh';
  setSelectedResumeOption: (option: 'latest' | 'fresh') => void;
  uploadedResumeUrl: string;
  setUploadedResumeUrl: (url: string) => void;
  loadingStage: number;
  loadingProgress: number;
  isApplying: boolean;
  handleApply: (skipOptimization?: boolean) => void;
  checklistItems: string[];
}

const ensureArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  applyStep,
  setApplyStep,
  selectedResumeOption,
  setSelectedResumeOption,
  uploadedResumeUrl,
  setUploadedResumeUrl,
  loadingStage,
  loadingProgress,
  isApplying,
  handleApply,
  checklistItems,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.student);
  const { result, optimizedResume } = useSelector((state: RootState) => state.ats);
  const { upload, isUploading } = useCloudinaryUpload();

  // local states for fresh upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // local states for optimize-loading checklist & copy buttons
  const [optStage, setOptStage] = useState(0);
  const [optProgress, setOptProgress] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const OPTIMIZE_CHECKLIST = [
    "Analyzing job description semantic context",
    "Tailoring professional summary and target role",
    "Re-writing projects & enhancing achievements",
    "Generating final print-ready layout"
  ];
const handleDownloadMarkdown = (resume: any) => {
  const content = getResumeMarkdown(resume);

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${resume.fullName || "resume"}_optimized.md`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
  // Reset local state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setOptStage(0);
      setOptProgress(0);
      setCopiedField(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getResumeMarkdown = (resume: any) => {
    if (!resume) return '';
    return `# ${resume.fullName}
${resume.targetRole} | ${resume.location}
Phone: ${resume.phone} | Email: ${resume.email}
${resume.linkedin ? `LinkedIn: ${resume.linkedin} | ` : ''}${resume.github ? `GitHub: ${resume.github}` : ''}

## Professional Summary
${resume.summary}

## Technical Skills
${ensureArray(resume.skills).join(', ')}

${ensureArray(resume.frameworks).length ? `### Frameworks & Libraries\n${ensureArray(resume.frameworks).join(', ')}\n` : ''}
${ensureArray(resume.cloud).length ? `### Cloud & DevOps\n${ensureArray(resume.cloud).join(', ')}\n` : ''}
${resume.languages ? `### Languages\n${Array.isArray(resume.languages) ? resume.languages.join(', ') : resume.languages}\n` : ''}

## Projects
${Array.isArray(resume.projects) ? resume.projects.map((p: any) => `### ${p.name}
*Tech Stack: ${p.techStack || 'N/A'}*
${ensureArray(p.highlights)?.map((h: any) => `- ${h}`).join('\n')}
`).join('\n') : ''}

## Education
${Array.isArray(resume.education) ? resume.education.map((e: any) => `### ${e.degree} in ${e.field}
*${e.university} (${e.year})*
`).join('\n') : ''}

${resume.certifications ? `## Certifications\n${resume.certifications}\n` : ''}

## Key Achievements
${Array.isArray(resume.achievements) ? resume.achievements.map((a: any) => `- **${a.label}**: ${a.value || 'Yes'}`).join('\n') : ''}
`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (selectedResumeOption === 'fresh') {
      if (!selectedFile) {
        toast.error("Please select a resume file");
        return;
      }
      try {
        const uploadedUrl = await upload(selectedFile, "resumes");
        if (!uploadedUrl) {
          return;
        }
        setUploadedResumeUrl(uploadedUrl);
        
        // Sync with student profile on the backend
        try {
          await dispatch(updateStudentProfile({ resumeUrl: uploadedUrl })).unwrap();
          toast.success("Resume synced to profile successfully!");
          localStorage.removeItem('ai_tailored_resume');
        } catch (profileError) {
          console.error("Failed to sync resume to student profile:", profileError);
          toast.warning("Application will proceed, but failed to set as default profile resume.");
        }

        setApplyStep('loading');
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload resume");
      }
    } else {
      if (!profile?.resumeUrl) {
        toast.error("No profile resume found. Please upload a new one.");
        return;
      }
      setApplyStep('loading');
    }
  };

  const handleOptimizeResume = async () => {
    if (!selectedJob) {
      toast.error("No job selected.");
      return;
    }
    const resumeUrl = selectedResumeOption === 'latest' ? (profile?.resumeUrl || '') : (uploadedResumeUrl || profile?.resumeUrl || '');
    const jobDescription = selectedJob.description || '';

    if (!resumeUrl) {
      toast.error("No resume found to optimize.");
      return;
    }

    if (!jobDescription) {
      toast.error("Job description is missing.");
      return;
    }

    setApplyStep('optimize-loading');
    setOptStage(0);
    setOptProgress(0);

    // Setup visual scanning timers
    const timer1 = setTimeout(() => setOptStage(1), 900);
    const timer2 = setTimeout(() => setOptStage(2), 1800);
    const timer3 = setTimeout(() => setOptStage(3), 2700);

    let progressInterval: any;
    const timer4 = setTimeout(() => {
      progressInterval = setInterval(() => {
        setOptProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 85);
    }, 2750);

    try {
      const res = await dispatch(applyJob({ jobUniversityId: selectedJob.id, optimizeResume: true })).unwrap();
      
      // Stop timers
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      if (progressInterval) clearInterval(progressInterval);

      setOptStage(4);
      setOptProgress(100);

      const optRes = res?.data?.optimizedResume?.optimizedResume || res?.data?.optimizedResume;
      if (optRes) {
        dispatch(setOptimizedResume(optRes));
        localStorage.setItem('ai_tailored_resume', JSON.stringify(optRes));
      } else {
        throw new Error("Optimized resume not returned by the server");
      }

      setTimeout(() => {
        setApplyStep('optimized');
      }, 600);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      if (progressInterval) clearInterval(progressInterval);
      
      console.error("Optimize Resume error:", err);
      toast.error(err || "Failed to optimize resume");
      setApplyStep('report');
    }
  };

  if (!selectedJob) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (applyStep !== 'loading' && applyStep !== 'optimize-loading' && !isUploading) {
          onClose();
        }
      }}
      showCloseButton={applyStep !== 'loading' && applyStep !== 'optimize-loading' && !isUploading}
      maxWidth={(applyStep === 'report' || applyStep === 'optimized') ? "sm:max-w-2xl" : "sm:max-w-lg"}
      preventOutsideClick={applyStep === 'loading' || applyStep === 'optimize-loading' || isUploading}
    >
      <div className="relative py-2 px-1">

        {/* ─── State 2: Resume Selection Modal ─── */}
        {applyStep === 'resume' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em]">
                Application Portal
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                {selectedJob.job.title ? selectedJob.job.title.toUpperCase() : "SDE INTERN"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1.5">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                {selectedJob.job.company?.name || "Google"}
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <MapPin size={13} className="text-slate-400 shrink-0" />
                {selectedJob.job.location || "Mountain View, CA"}
              </p>
            </div>

            {/* Grid selectable cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card A: Compare with Latest Resume */}
              <div
                onClick={() => setSelectedResumeOption('latest')}
                className={cn(
                  "p-5 rounded-[1.75rem] border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center justify-between gap-4 h-full",
                  selectedResumeOption === 'latest'
                    ? "border-blue-600 bg-blue-500/[0.03] dark:bg-blue-500/[0.02] shadow-lg shadow-blue-500/5 scale-[1.02]"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.01]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={cn(
                    "w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0",
                    selectedResumeOption === 'latest'
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 dark:border-white/20"
                  )}>
                    {selectedResumeOption === 'latest' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Latest
                  </Badge>
                </div>
                
                <div className="flex flex-col items-center gap-2 flex-1 justify-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <FileText size={22} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-tight">
                      Compare with Latest Resume
                    </h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate max-w-[130px]">
                      {profile?.name ? `${profile.name}_Resume.pdf` : "Resume.pdf"}
                    </p>
                  </div>
                </div>
                
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                  Profile Document
                </span>
              </div>

              {/* Card B: Upload Fresh Resume */}
              <div
                onClick={() => setSelectedResumeOption('fresh')}
                className={cn(
                  "p-5 rounded-[1.75rem] border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center text-center justify-between gap-4 h-full",
                  selectedResumeOption === 'fresh'
                    ? "border-blue-600 bg-blue-500/[0.03] dark:bg-blue-500/[0.02] shadow-lg shadow-blue-500/5 scale-[1.02]"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-[1.01]"
                )}
              >
                <div className="flex items-center justify-start w-full">
                  <div className={cn(
                    "w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0",
                    selectedResumeOption === 'fresh'
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 dark:border-white/20"
                  )}>
                    {selectedResumeOption === 'fresh' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1 justify-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Upload size={20} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-tight">
                      Upload Fresh Resume
                    </h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium max-w-[120px] mx-auto leading-tight">
                      Drag & drop or select PDF
                    </p>
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                  PDF format
                </span>
              </div>
            </div>

            {/* Upload Zone (Visible if 'fresh' is selected) */}
            {selectedResumeOption === 'fresh' && (
              <div className="relative group rounded-3xl border-2 border-dashed border-slate-250 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-5 flex flex-col items-center justify-center gap-3.5 bg-slate-50/50 dark:bg-slate-950/20">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <Upload size={22} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-[#f8fafc]">
                    {selectedFile ? selectedFile.name : "Choose file or drag here"}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "PDF format up to 10MB"}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom link and buttons */}
            <div className="flex flex-col gap-5 pt-3">
              <div className="text-center">
                <button
                  onClick={() => {
                    toast.success("Redirecting to premium Resume Maker...", {
                      icon: <Sparkles size={16} className="text-blue-500 animate-pulse" />
                    });
                  }}
                  className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 group"
                >
                  <Sparkles size={12} className="text-blue-500 group-hover:scale-110 transition-transform fill-blue-500/10" />
                  Or create tailored resume with Resume Maker
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/[0.04] pt-4">
                <button
                  onClick={onClose}
                  className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={isUploading}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl px-6 h-11 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-slate-900/10 transition-all border-none cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Zap size={11} className="fill-current" />
                  )}
                  {isUploading ? "Uploading..." : "Analyze Now"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── State 3: Loading/Analysis Modal State ─── */}
        {applyStep === 'loading' && (
          <div className="space-y-8 py-4 flex flex-col items-center">
            {/* Pulse brain animation in circularprogress track */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer progress track */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
              
              {/* Glowing backdrop */}
              <motion.div 
                className="absolute w-16 h-16 rounded-full bg-blue-500/10 filter blur-md"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              
              {/* Centered brain/AI icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.12, 1],
                  filter: [
                    "drop-shadow(0 0 4px rgba(37, 99, 235, 0.2))",
                    "drop-shadow(0 0 16px rgba(37, 99, 235, 0.6))",
                    "drop-shadow(0 0 4px rgba(37, 99, 235, 0.2))"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl"
              >
                <Brain size={30} className="stroke-[1.5]" />
              </motion.div>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider leading-snug max-w-xs mx-auto">
                AI is analyzing your resume...
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                This will only take a moment...
              </p>
            </div>

            {/* Checklist showing dynamic progress tracking */}
            <div className="space-y-4 w-full max-w-xs mt-2 border-t border-slate-100 dark:border-white/[0.04] pt-6">
              {checklistItems.map((text, idx) => {
                const isCompleted = loadingStage > idx;
                const isActive = loadingStage === idx;
                
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/10">
                          <CheckCircle2 size={14} className="stroke-[2.5]" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10 animate-spin">
                          <Loader2 size={13} className="stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-white/10">
                          <span className="text-[9px] font-black">{idx + 1}</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-xs font-semibold transition-all duration-305",
                        isCompleted && "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-800",
                        isActive && "text-blue-600 dark:text-blue-400 font-extrabold tracking-wide",
                        !isCompleted && !isActive && "text-slate-400 dark:text-slate-655"
                      )}>
                        {text}
                      </span>
                    </div>
                    
                    {/* Dynamic progress bar below the 4th checklist item when active */}
                    {isActive && idx === 3 && (
                      <div className="pl-8.5 w-full space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100 ease-out" 
                            style={{ width: `${loadingProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-blue-500">
                          <span>CALCULATING ATS...</span>
                          <span>{loadingProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── State 4: ATS Report & Suggestions Modal State ─── */}
        {applyStep === 'report' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em]">
                ATS Analysis Report
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {selectedJob.job.title ? selectedJob.job.title.toUpperCase() : "SDE INTERN"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                {selectedJob.job.company?.name || "Google"} Match Assessment
              </p>
            </div>

            {/* Score Circular Progress Chart */}
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Glowing back mesh */}
                <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-500/10 rounded-full filter blur-xl animate-pulse" />
                
                {/* SVG progress wheel */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-white/5"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="52"
                    stroke="#f59e0b" // Amber ATS color
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={326.7}
                    initial={{ strokeDashoffset: 326.7 }}
                    animate={{ strokeDashoffset: 326.7 - (326.7 * (result?.atsScore ?? 38)) / 100 }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Numeric Score */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-955 dark:text-white tracking-tighter leading-none">
                    {result?.atsScore ?? 38}%
                  </span>
                  <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mt-1.5">
                    ATS SCORE
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[9px] uppercase tracking-[0.2em] px-4.5 py-1.5 rounded-full border border-amber-500/20">
                {result ? (result.atsScore >= 75 ? "Strong Match" : result.atsScore >= 50 ? "Moderate Match" : "Weak Match") : "Moderate Match"}
              </div>
            </div>

            {/* Middle Sections: Side-by-side Metric Containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Matched Skills / Strengths */}
              <div className="p-4.5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border border-emerald-500/20 rounded-2xl flex flex-col h-full min-h-[140px]">
                <h5 className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  Matched Skills
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result?.topStrengths && result.topStrengths.length > 0 ? (
                    result.topStrengths.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    ["React", "TypeScript", "AWS", "REST APIs"].map((skill, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Missing Keywords */}
              <div className="p-4.5 bg-rose-500/[0.03] dark:bg-rose-500/[0.01] border border-rose-500/20 rounded-2xl flex flex-col h-full min-h-[140px]">
                <h5 className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" />
                  Missing Keywords
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result?.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((keyword, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold text-rose-600 dark:text-rose-400/80 border border-rose-500/25 px-2.5 py-1 rounded-lg uppercase tracking-wider bg-rose-500/5"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    ["Docker", "Kubernetes", "CI/CD"].map((keyword, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400/80 border border-rose-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-500/5"
                      >
                        {keyword}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: AI Suggestions alert box */}
            <div className="p-4.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-5 dark:opacity-10 text-indigo-500 pointer-events-none">
                <Sparkles size={64} />
              </div>
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 border border-amber-500/20">
                  <Sparkles size={14} className="fill-amber-500/20" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h6 className="text-[10px] font-black text-slate-800 dark:text-[#f8fafc] uppercase tracking-widest">
                    AI Suggestions
                  </h6>
                  <ul className="space-y-1.5 text-slate-650 dark:text-slate-400 font-medium text-[11px] md:text-xs text-left">
                    {result?.suggestions && result.suggestions.length > 0 ? (
                      result.suggestions.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                           <span className="text-amber-500 font-bold">•</span>
                           <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>Integrate keywords like <strong className="text-slate-900 dark:text-white font-extrabold">Docker</strong> and <strong className="text-slate-900 dark:text-white font-extrabold">Kubernetes</strong> into your recent projects.</span>
                        </li>
                        <li className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>Tailor your professional summary to highlight <strong className="text-slate-900 dark:text-white font-extrabold">CI/CD</strong> and cloud experience.</span>
                        </li>
                        <li className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>Quantify your achievements to showcase impact in scaling <strong className="text-slate-900 dark:text-white font-extrabold">REST APIs</strong>.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
              <Button
                variant="outline"
                onClick={handleOptimizeResume}
                className="rounded-xl border-2 border-dashed border-indigo-500 hover:border-indigo-600 px-6 h-11 text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.05] transition-all hover:scale-[1.02] flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles size={12} className="text-indigo-500 animate-pulse fill-indigo-500/10" />
                Optimize with AI
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApplyStep('resume');
                    setSelectedResumeOption('fresh');
                  }}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-6 h-11 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Improve Resume
                </Button>
                <Button
                  onClick={() => handleApply(true)}
                  disabled={isApplying}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl px-6 h-11 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all border-none cursor-pointer"
                >
                  {isApplying ? <Loader2 size={12} className="animate-spin" /> : "Apply Anyway"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── State 5: AI Resume Tailoring / Optimization Loading State ─── */}
        {applyStep === 'optimize-loading' && (
          <div className="space-y-8 py-4 flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
              
              <motion.div 
                className="absolute w-16 h-16 rounded-full bg-indigo-500/10 filter blur-md"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.12, 1],
                  filter: [
                    "drop-shadow(0 0 4px rgba(99, 102, 241, 0.2))",
                    "drop-shadow(0 0 16px rgba(99, 102, 241, 0.6))",
                    "drop-shadow(0 0 4px rgba(99, 102, 241, 0.2))"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl"
              >
                <Sparkles size={30} className="stroke-[1.5]" />
              </motion.div>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider leading-snug max-w-xs mx-auto">
                AI is tailoring your resume...
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                Optimizing keywords and achievements...
              </p>
            </div>

            <div className="space-y-4 w-full max-w-xs mt-2 border-t border-slate-100 dark:border-white/[0.04] pt-6">
              {OPTIMIZE_CHECKLIST.map((text, idx) => {
                const isCompleted = optStage > idx;
                const isActive = optStage === idx;
                
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/10">
                          <CheckCircle2 size={14} className="stroke-[2.5]" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-500/10 animate-spin">
                          <Loader2 size={13} className="stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-white/10">
                          <span className="text-[9px] font-black">{idx + 1}</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-xs font-semibold transition-all duration-300",
                        isCompleted && "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-800",
                        isActive && "text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wide",
                        !isCompleted && !isActive && "text-slate-400 dark:text-slate-655"
                      )}>
                        {text}
                      </span>
                    </div>
                    
                    {isActive && idx === 3 && (
                      <div className="pl-8.5 w-full space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-100 ease-out" 
                            style={{ width: `${optProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-indigo-500">
                          <span>SYNTHESIZING RESUME...</span>
                          <span>{optProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── State 6: Tailored/Optimized Resume Preview ─── */}
        {applyStep === 'optimized' && optimizedResume && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.04] pb-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] flex items-center gap-1.5">
                  <Sparkles size={11} className="fill-indigo-500/10 animate-pulse text-indigo-500" />
                  AI-Tailored Resume
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Tailored Professional Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  We've optimized your achievements and summary specifically for this Software Developer role!
                </p>
              </div>
              
            <Button
  onClick={() => handleDownloadMarkdown(optimizedResume)}
  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 h-10 shrink-0 shadow-md shadow-indigo-500/10 border-none transition-all cursor-pointer"
>
  Download Resume
</Button>
            </div>

            {/* Resume Sheet Preview */}
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.05] bg-slate-50/50 dark:bg-slate-950/20 p-5 md:p-6 shadow-inner custom-scrollbar font-sans text-left">
              {/* Paper Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6" />

              {/* Name & Contact Info */}
              <div className="text-center space-y-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {optimizedResume.fullName}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Briefcase size={10} className="fill-current" />
                    {optimizedResume.targetRole}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-lg mx-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center justify-center gap-1.5">
                    <Phone size={11} className="text-indigo-500 shrink-0" />
                    {optimizedResume.phone}
                  </span>
                  <span className="flex items-center justify-center gap-1.5 truncate">
                    <Mail size={11} className="text-indigo-500 shrink-0" />
                    {optimizedResume.email}
                  </span>
                  <span className="flex items-center justify-center gap-1.5">
                    <MapPin size={11} className="text-indigo-500 shrink-0" />
                    {optimizedResume.location}
                  </span>
                  {optimizedResume.linkedin && (
                    <span className="flex items-center justify-center gap-1.5">
                      <Link size={11} className="text-indigo-500 shrink-0" />
                      LinkedIn
                    </span>
                  )}
                  {optimizedResume.github && (
                    <span className="flex items-center justify-center gap-1.5">
                      <Code size={11} className="text-indigo-500 shrink-0" />
                      GitHub
                    </span>
                  )}
                </div>
              </div>

              {/* Tailored Professional Summary */}
              <div className="space-y-2 border-t border-slate-200/50 dark:border-white/[0.04] pt-5 relative group">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                    <User size={12} className="stroke-[2.5]" />
                    Professional Summary
                  </h4>
                  <button
                    onClick={() => handleCopyText(optimizedResume.summary, 'summary')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-250 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-455 dark:hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedField === 'summary' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </div>
                <p className="text-xs md:text-sm text-slate-655 dark:text-slate-350 leading-relaxed font-medium bg-indigo-500/[0.02] border-l-2 border-indigo-500 pl-3 py-1.5 rounded-r-lg">
                  {optimizedResume.summary}
                </p>
              </div>

              {/* Categorized Skills */}
              <div className="space-y-4 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                  <ListChecks size={12} className="stroke-[2.5]" />
                  Tailored Skills & Technologies
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Frameworks & Languages */}
                  {ensureArray(optimizedResume.frameworks).length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Frameworks & Libraries</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ensureArray(optimizedResume.frameworks).map((f, idx) => (
                          <Badge key={idx} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cloud & Infrastructures */}
                  {ensureArray(optimizedResume.cloud).length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cloud & DevOps</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ensureArray(optimizedResume.cloud).map((c, idx) => (
                          <Badge key={idx} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Core skills list */}
                {ensureArray(optimizedResume.skills).length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">All Technical Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {ensureArray(optimizedResume.skills).map((s, idx) => (
                        <Badge key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Languages & Core Competencies</span>
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
                    {optimizedResume.languages}
                  </p>
                </div>
              </div>

              {/* Tailored Projects */}
              {Array.isArray(optimizedResume.projects) && optimizedResume.projects.length > 0 && (
                <div className="space-y-5 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                    <Briefcase size={12} className="stroke-[2.5]" />
                    Optimized Projects
                  </h4>

                  <div className="space-y-5">
                    {optimizedResume.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="space-y-2 group/proj relative p-4 rounded-2xl border border-slate-200/50 dark:border-white/[0.03] bg-white/40 dark:bg-white/[0.01] hover:shadow-sm transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h5 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-white leading-tight">
                              {proj.name}
                            </h5>
                            {proj.techStack && (
                              <span className="text-[9px] font-black text-indigo-500/90 tracking-wider uppercase">
                                Tech Stack: {proj.techStack}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => {
                              const projHighlights = ensureArray(proj.highlights);
                              const projText = `Project: ${proj.name}\nTech Stack: ${proj.techStack || 'N/A'}\nHighlights:\n${projHighlights.map(h => `- ${h}`).join('\n')}`;
                              handleCopyText(projText, `proj-${pIdx}`);
                            }}
                            className="opacity-0 group-hover/proj:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-250 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-455 dark:hover:text-white shrink-0 cursor-pointer"
                          >
                            {copiedField === `proj-${pIdx}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>

                        <ul className="space-y-1.5 pl-4 text-slate-655 dark:text-slate-350 text-[11px] md:text-xs leading-relaxed font-semibold list-disc marker:text-indigo-500">
                          {ensureArray(proj.highlights)?.map((highlight, hIdx) => (
                            <li key={hIdx}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {Array.isArray(optimizedResume.education) && optimizedResume.education.length > 0 && (
                <div className="space-y-4 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                    <GraduationCap size={12} className="stroke-[2.5]" />
                    Education
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optimizedResume.education.map((edu, eIdx) => (
                      <div key={eIdx} className="p-3 rounded-xl border border-slate-200/30 dark:border-white/[0.02] bg-slate-100/30 dark:bg-white/[0.01] space-y-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <h6 className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight">
                            {edu.degree} - {edu.field}
                          </h6>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate tracking-wide max-w-[220px]">
                            {edu.university}
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                          {edu.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {optimizedResume.certifications && (
                <div className="space-y-2 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                    <Award size={12} className="stroke-[2.5]" />
                    Certifications & Publications
                  </h4>
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold italic bg-slate-100/40 dark:bg-white/[0.01] p-3 rounded-xl border border-slate-200/30 dark:border-white/[0.02]">
                    {optimizedResume.certifications}
                  </p>
                </div>
              )}

              {/* Achievements Stats Grid */}
              {Array.isArray(optimizedResume.achievements) && optimizedResume.achievements.length > 0 && (
                <div className="space-y-3.5 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                  <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                    <Award size={12} className="stroke-[2.5]" />
                    Key Metrics & Impact
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {optimizedResume.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] text-center space-y-1">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                          {ach.label}
                        </span>
                        <h4 className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight leading-none">
                          {ach.value || "95%+"}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
              <Button
                variant="outline"
                onClick={() => setApplyStep('report')}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4.5 h-11 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={12} />
                Back to Report
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl px-5 h-11 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleApply(true)}
                  disabled={isApplying}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 h-11 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/10 hover:scale-[1.02] transition-all border-none cursor-pointer"
                >
                  {isApplying ? <Loader2 size={12} className="animate-spin" /> : "Apply Anyway"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
