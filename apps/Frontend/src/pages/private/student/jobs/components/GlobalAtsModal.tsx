import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Brain, CheckCircle2, Loader2, Sparkles, AlertCircle,
  Copy, Check, Briefcase, GraduationCap, Phone, Mail, Link, Code, 
  Award, ChevronLeft, ListChecks, User, MapPin, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/reducers/rootReducer';
import type { AppDispatch } from '@/redux/store/store';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { analyzeJdMatch, optimizeResume } from '@/redux/thunks/atsThunk';
import { resetAtsState } from '@/redux/slices/atsSlice';
import { updateStudentProfile } from '@/redux/thunks/studentThunk';

import { toast } from 'sonner';

interface GlobalAtsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHECKLIST_ITEMS = [
  "Reading resume file metadata & formatting",
  "Extracting work experience & technical skills",
  "Measuring keyword density & semantic richness",
  "Synthesizing final ATS score and actionable tips"
];
export const GlobalAtsModal: React.FC<GlobalAtsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useSelector((state: RootState) => state.student);
  const { optimizedResume } = useSelector((state: RootState) => state.ats);
  const dispatch = useDispatch<AppDispatch>();
  const { upload, isUploading } = useCloudinaryUpload();

  const [step, setStep] = useState<'upload' | 'scanning' | 'report' | 'optimize-loading' | 'optimized'>('upload');
  const [resumeOption, setResumeOption] = useState<'latest' | 'fresh'>('latest');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Scanning progress state
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // API Result state
  const [result, setResult] = useState<{
    atsScore: number;
    suggestions: string[];
    missingSkills: string[];
    topStrengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Optimization local states
  const [analyzedResumeUrl, setAnalyzedResumeUrl] = useState('');
  const [optStage, setOptStage] = useState(0);
  const [optProgress, setOptProgress] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const OPTIMIZE_CHECKLIST = [
    "Analyzing job description semantic context",
    "Tailoring professional summary and target role",
    "Re-writing projects & enhancing achievements",
    "Generating final print-ready layout"
  ];

  // References for timers
  const timerRefs = useRef<any[]>([]);
  const intervalRef = useRef<any>(null);
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
  // Set default option to fresh if no profile resume exists
  useEffect(() => {
    if (isOpen) {
      if (profile?.resumeUrl) {
        setResumeOption('latest');
      } else {
        setResumeOption('fresh');
      }
    }
  }, [isOpen, profile]);

  // Reset modal on close
  useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setSelectedFile(null);
      setFileName('');
      setProgress(0);
      setStage(0);
      setErrorMsg(null);
      clearTimers();
      setAnalyzedResumeUrl('');
      setOptStage(0);
      setOptProgress(0);
      setCopiedField(null);
      dispatch(resetAtsState());
    }
  }, [isOpen, dispatch]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStartAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    let resumeUrl = '';

    if (resumeOption === 'latest') {
      if (!profile?.resumeUrl) {
        toast.error("No profile resume found. Please upload a new one.");
        return;
      }
      resumeUrl = profile.resumeUrl;
      setFileName(profile.name ? `${profile.name}_Resume.pdf` : "Profile_Resume.pdf");
    } else {
      if (!selectedFile) {
        toast.error("Please select a resume file");
        return;
      }
      setFileName(selectedFile.name);
    }

    // Enter scanning step
    setStep('scanning');
    setStage(0);
    setProgress(0);
    setErrorMsg(null);

    // Setup visual scanning timers
    clearTimers();
    
    // Simulate checklist progression
    timerRefs.current.push(setTimeout(() => setStage(1), 1000));
    timerRefs.current.push(setTimeout(() => setStage(2), 2000));
    timerRefs.current.push(setTimeout(() => setStage(3), 3000));
    
    // Increment progress bar when stage 3 starts
    timerRefs.current.push(setTimeout(() => {
      let currentProgress = 0;
      intervalRef.current = setInterval(() => {
        currentProgress += 4;
        if (currentProgress >= 96) {
          // Hold at 96% until API request resolves
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setProgress(96);
        } else {
          setProgress(currentProgress);
        }
      }, 80);
    }, 3050));

    try {
      // 1. Upload file if fresh option is selected
      if (resumeOption === 'fresh' && selectedFile) {
        const uploadedUrl = await upload(selectedFile, "resumes");
        if (!uploadedUrl) {
          throw new Error("Failed to upload resume to Cloudinary. Ensure it's a PDF under 10MB.");
        }
        resumeUrl = uploadedUrl;

        // Sync with student profile on the backend
        try {
          await dispatch(updateStudentProfile({ resumeUrl: uploadedUrl })).unwrap();
          toast.success("Resume synced to profile successfully!");
          localStorage.removeItem('ai_tailored_resume');
        } catch (profileError) {
          console.error("Failed to sync resume to student profile:", profileError);
          toast.warning("Analysis will proceed, but failed to set as default profile resume.");
        }
      }

      setAnalyzedResumeUrl(resumeUrl);

      // 2. Perform the JD matching request
      const response = await dispatch(analyzeJdMatch({
        resumeUrl,
        jobDescription
      })).unwrap();

      // Complete the animation
      clearTimers();
      setStage(4);
      setProgress(100);

      // Brief delay for satisfying progress bar fill before showing report
      setTimeout(() => {
        setResult(response);
        setStep('report');
      }, 600);
    } catch (err: any) {
      clearTimers();
      console.error("ATS Analyzer error:", err);
      const errText = err.response?.data?.error || err.message || "An unexpected error occurred during ATS scanning.";
      setErrorMsg(errText);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

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
${resume.skills?.join(', ')}

${resume.frameworks?.length ? `### Frameworks & Libraries\n${resume.frameworks.join(', ')}\n` : ''}
${resume.cloud?.length ? `### Cloud & DevOps\n${resume.cloud.join(', ')}\n` : ''}
${resume.languages ? `### Languages\n${resume.languages}\n` : ''}

## Projects
${resume.projects?.map((p: any) => `### ${p.name}
*Tech Stack: ${p.techStack || 'N/A'}*
${p.highlights?.map((h: any) => `- ${h}`).join('\n')}
`).join('\n')}

## Education
${resume.education?.map((e: any) => `### ${e.degree} in ${e.field}
*${e.university} (${e.year})*
`).join('\n')}

${resume.certifications ? `## Certifications\n${resume.certifications}\n` : ''}

## Key Achievements
${resume.achievements?.map((a: any) => `- **${a.label}**: ${a.value || 'Yes'}`).join('\n')}
`;
  };

  const handleOptimizeResume = async () => {
    const resumeUrl = analyzedResumeUrl || profile?.resumeUrl || '';
    
    if (!resumeUrl) {
      toast.error("No resume found to optimize.");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Job description is missing.");
      return;
    }

    setStep('optimize-loading');
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
      const response = await dispatch(optimizeResume({ resumeUrl, jobDescription })).unwrap();
      
      // Stop timers
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      if (progressInterval) clearInterval(progressInterval);

      setOptStage(4);
      setOptProgress(100);

      if (response) {
        localStorage.setItem('ai_tailored_resume', JSON.stringify(response));
      }

      setTimeout(() => {
        setStep('optimized');
      }, 600);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      if (progressInterval) clearInterval(progressInterval);
      
      console.error("Global Optimize Resume error:", err);
      toast.error(err || "Failed to optimize resume");
      setStep('report');
    }
  };

  // Helper styling methods
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 75) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  };

  const getScoreText = (score: number) => {
    if (score >= 75) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    return 'Weak Match';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (step !== 'scanning' && step !== 'optimize-loading') {
          onClose();
        }
      }}
      showCloseButton={step !== 'scanning' && step !== 'optimize-loading'}
      maxWidth={(step === 'report' || step === 'optimized') ? "sm:max-w-2xl" : "sm:max-w-lg"}
      preventOutsideClick={step === 'scanning' || step === 'optimize-loading'}
    >
      <div className="relative py-2 px-1">
        
        {/* ─── State 1: Upload & Input ─── */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em]">
                AI Powerhouse
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Global ATS Optimizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Upload your resume, paste any job description, and get instant tailoring recommendations.
              </p>
            </div>

            {/* Resume Selection Section */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Select Resume Source
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Profile Resume */}
                <div
                  onClick={() => profile?.resumeUrl && setResumeOption('latest')}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all duration-300",
                    !profile?.resumeUrl && "opacity-50 cursor-not-allowed",
                    resumeOption === 'latest'
                      ? "border-blue-600 bg-blue-500/[0.03] dark:bg-blue-500/[0.01]"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    resumeOption === 'latest' ? "border-blue-600 bg-blue-600" : "border-slate-350 dark:border-white/20"
                  )}>
                    {resumeOption === 'latest' && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0 text-left">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white truncate leading-tight">
                      Profile Resume
                    </h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate max-w-[110px]">
                      {profile?.resumeUrl ? (profile.name ? `${profile.name}_Resume.pdf` : "Profile_Resume.pdf") : "No Resume Found"}
                    </p>
                  </div>
                </div>

                {/* Upload Fresh */}
                <div
                  onClick={() => setResumeOption('fresh')}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all duration-300",
                    resumeOption === 'fresh'
                      ? "border-blue-600 bg-blue-500/[0.03] dark:bg-blue-500/[0.01]"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    resumeOption === 'fresh' ? "border-blue-600 bg-blue-600" : "border-slate-350 dark:border-white/20"
                  )}>
                    {resumeOption === 'fresh' && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0 text-left">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white leading-tight">
                      Upload New
                    </h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate max-w-[110px]">
                      {selectedFile ? fileName : "PDF format only"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Zone (Visible if 'fresh' is selected) */}
            {resumeOption === 'fresh' && (
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

            {/* Paste JD Section */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                rows={5}
                className="w-full text-xs md:text-sm font-semibold rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent p-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none placeholder-slate-400 resize-none transition-all"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/[0.04] pt-4">
              <button
                onClick={onClose}
                className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <Button
                onClick={handleStartAnalysis}
                disabled={isUploading}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl px-6 h-11 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all border-none cursor-pointer"
              >
                {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} className="fill-current" />}
                {isUploading ? "Uploading..." : "Analyze Match"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── State 2: Scanning / Loading ─── */}
        {step === 'scanning' && (
          <div className="space-y-8 py-4 flex flex-col items-center">
            {/* Spinning track loader with glowing brain */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
              
              <motion.div 
                className="absolute w-16 h-16 rounded-full bg-blue-500/10 filter blur-md"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              
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
              <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider leading-snug">
                AI is compiling ATS feedback...
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                Analyzing resume structure...
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-4 w-full max-w-xs mt-2 border-t border-slate-100 dark:border-white/[0.04] pt-6">
              {CHECKLIST_ITEMS.map((text, idx) => {
                const isCompleted = stage > idx;
                const isActive = stage === idx;
                
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
                        "text-xs font-semibold transition-all duration-300 text-left",
                        isCompleted && "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-800",
                        isActive && "text-blue-600 dark:text-blue-400 font-extrabold tracking-wide",
                        !isCompleted && !isActive && "text-slate-400 dark:text-slate-655"
                      )}>
                        {text}
                      </span>
                    </div>
                    
                    {/* Active progress tracking for 4th step */}
                    {isActive && idx === 3 && (
                      <div className="pl-8.5 w-full space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-blue-500">
                          <span>SYNTHESIZING ATS METRICS...</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error Message & Reset */}
            {errorMsg && (
              <div className="w-full max-w-sm p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-3 mt-4 text-left">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h6 className="text-[10px] font-black text-rose-600 uppercase tracking-wider leading-none">
                    Scanning Stopped
                  </h6>
                  <p className="text-xs text-rose-550 dark:text-rose-400/90 font-semibold leading-relaxed">
                    {errorMsg}
                  </p>
                  <button
                    onClick={() => {
                      setStep('upload');
                      setErrorMsg(null);
                      clearTimers();
                    }}
                    className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700 mt-2 tracking-widest inline-flex items-center gap-1.5"
                  >
                    Try Again
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── State 3: ATS Report View ─── */}
        {step === 'report' && result && (
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em]">
                ATS Feedback Engine
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Scan Report: {fileName.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                AI Match Score details
              </p>
            </div>

            {/* Score Circular progress chart */}
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full filter blur-xl animate-pulse" />
                
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
                    stroke="currentColor"
                    className={getScoreColor(result.atsScore)}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={326.7}
                    initial={{ strokeDashoffset: 326.7 }}
                    animate={{ strokeDashoffset: 326.7 - (326.7 * result.atsScore) / 100 }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-955 dark:text-white tracking-tighter leading-none">
                    {result.atsScore}%
                  </span>
                  <span className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mt-1.5">
                    MATCH SCORE
                  </span>
                </div>
              </div>

              <div className={cn(
                "mt-4 font-black text-[9px] uppercase tracking-[0.2em] px-4.5 py-1.5 rounded-full border shadow-sm",
                getScoreBgClass(result.atsScore)
              )}>
                {getScoreText(result.atsScore)}
              </div>
            </div>

            {/* Side-by-side metric containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="p-4.5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border border-emerald-500/20 rounded-2xl flex flex-col h-full min-h-[140px]">
                <h5 className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  Identified Strengths
                </h5>
                <div className="flex flex-wrap gap-1.5 content-start">
                  {result.topStrengths.length > 0 ? (
                    result.topStrengths.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No strengths found.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="p-4.5 bg-rose-500/[0.03] dark:bg-rose-500/[0.01] border border-rose-500/20 rounded-2xl flex flex-col h-full min-h-[140px]">
                <h5 className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" />
                  Missing Keywords
                </h5>
                <div className="flex flex-wrap gap-1.5 content-start">
                  {result.missingSkills.length > 0 ? (
                    result.missingSkills.map((keyword, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400/80 border border-rose-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-500/5"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No missing keywords!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Suggestions alert box */}
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
                    Optimization Recommendations
                  </h6>
                  {result.suggestions.length > 0 ? (
                    <ul className="space-y-1.5 text-slate-655 dark:text-slate-400 font-medium text-[11px] md:text-xs text-left">
                      {result.suggestions.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No suggestions needed. Resume fits the job description perfectly!</p>
                  )}
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
                    setStep('upload');
                    setFileName('');
                    setResult(null);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-6 h-11 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Scan Another Resume
                </Button>
                <Button
                  onClick={onClose}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl px-6 h-11 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all border-none cursor-pointer"
                >
                  Close Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── State 4: AI Resume Tailoring / Optimization Loading State ─── */}
        {step === 'optimize-loading' && (
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
                        "text-xs font-semibold transition-all duration-300 text-left",
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

        {/* ─── State 5: Tailored/Optimized Resume Preview ─── */}
        {step === 'optimized' && optimizedResume && (
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
                  We've optimized your achievements and summary specifically for this job description!
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
                  {optimizedResume.frameworks?.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Frameworks & Libraries</span>
                      <div className="flex flex-wrap gap-1.5">
                        {optimizedResume.frameworks.map((f, idx) => (
                          <Badge key={idx} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cloud & DevOps */}
                  {optimizedResume.cloud?.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cloud & DevOps</span>
                      <div className="flex flex-wrap gap-1.5">
                        {optimizedResume.cloud.map((c, idx) => (
                          <Badge key={idx} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Core skills list */}
                {optimizedResume.skills?.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">All Technical Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {optimizedResume.skills.map((s, idx) => (
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
              {optimizedResume.projects?.length > 0 && (
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
                              const projText = `Project: ${proj.name}\nTech Stack: ${proj.techStack || 'N/A'}\nHighlights:\n${proj.highlights.map(h => `- ${h}`).join('\n')}`;
                              handleCopyText(projText, `proj-${pIdx}`);
                            }}
                            className="opacity-0 group-hover/proj:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-250 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-455 dark:hover:text-white shrink-0 cursor-pointer"
                          >
                            {copiedField === `proj-${pIdx}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>

                        <ul className="space-y-1.5 pl-4 text-slate-655 dark:text-slate-350 text-[11px] md:text-xs leading-relaxed font-semibold list-disc marker:text-indigo-500">
                          {proj.highlights?.map((highlight, hIdx) => (
                            <li key={hIdx}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {optimizedResume.education?.length > 0 && (
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
              {optimizedResume.achievements?.length > 0 && (
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
                onClick={() => setStep('report')}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
