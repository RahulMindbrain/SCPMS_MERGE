import {
  Mail, GraduationCap,
  Code2, Edit3, ExternalLink, Plus, Trash2,
  Briefcase, FileText, Building2,
  CheckCircle, Globe, MapPin,
  Award, Layers, Cpu, Rocket,
  Calendar, CalendarDays,
  Sparkles, Copy, Check, Link, ListChecks, User, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ProjectModal from './modal/ProjectModal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile } from '../../../../redux/thunks/studentThunk';
import { useEffect, useState } from 'react';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import ExperienceModal from './modal/ExperienceModal';
import CertificateModal from './modal/CertificateModal';
import ProfileEditDialog from './modal/ProfileEditDialog';
import Loader from '@/components/Loader';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudentPageLayout } from '@/components/layout/StudentPageLayout';

const ensureArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
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

const StudentProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile: backendProfile, loading: backendLoading } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false)
  const isApproved = user?.status === 'ACTIVE';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const [aiTailoredResume, setAiTailoredResume] = useState<any>(null);
  const [showAiResumeDialog, setShowAiResumeDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    name: user ? `${user.firstname} ${user.lastname}` : 'Student Name',
    email: user?.email || '',
    stats: {
      cgpa: '',
      activeBacklogs: '',
      department: '',
      year: '',
      passingYear: '',
      departmentId: "",
      university: ''
    },
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    skills: [],
    projects: [],
    experiences: [],
    certificates: [],
    resumeUrl: ''
  });

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  // Load AI-Tailored Resume from localStorage
  useEffect(() => {
    const savedAiResume = localStorage.getItem('ai_tailored_resume');
    if (savedAiResume) {
      try {
        setAiTailoredResume(JSON.parse(savedAiResume));
      } catch (e) {
        console.error("Failed to parse saved AI tailored resume:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (backendProfile) {
      setProfile((prev: any) => ({
        ...prev,
        ...backendProfile,
        name: user ? `${user.firstname} ${user.lastname}` : 'Student Name',
        email: user?.email || '',
        stats: {
          ...prev.stats,
          cgpa: backendProfile.cgpa?.toString() || '',
          year: backendProfile.year || '',
          passingYear: backendProfile.passingYear || '',
          departmentId: backendProfile.departmentId || "",
          activeBacklogs: backendProfile.activeBacklogs || '',
          department: backendProfile.department?.name || '',
          university: backendProfile.university?.name || ''
        },
        linkedinUrl: backendProfile.linkedinUrl || '',
        githubUrl: backendProfile.githubUrl || '',
        portfolioUrl: backendProfile.portfolioUrl || '',
        skills: backendProfile.skills?.map((s: any) => ({
          id: s.id,
          name: typeof s === 'string' ? s : s.name,
        })) || [],
        resumeUrl: backendProfile.resumeUrl || ''
      }));
    }
  }, [backendProfile, user]);

  const handleSave = async (updatedProfile: any) => {
    try {
      const cleanUrl = (url: any) => {
        const trimmed = typeof url === 'string' ? url.trim() : '';
        return trimmed || undefined;
      };

      const yearInt = parseInt(updatedProfile.stats?.year);
      const passingYearInt = parseInt(updatedProfile.stats?.passingYear);
      const cgpaFloat = parseFloat(updatedProfile.stats?.cgpa);
      const newResumeUrl = cleanUrl(updatedProfile.resumeUrl);

      // If the resume has been changed, clear the old AI-tailored resume
      if (newResumeUrl && newResumeUrl !== profile.resumeUrl) {
        localStorage.removeItem('ai_tailored_resume');
        setAiTailoredResume(null);
      }

      const commonPayload: any = {
        year: isNaN(yearInt) ? undefined : yearInt,
        passingYear: isNaN(passingYearInt) ? undefined : passingYearInt,
        cgpa: (isNaN(cgpaFloat) || yearInt === 1) ? undefined : cgpaFloat,
        activeBacklogs: isNaN(parseInt(updatedProfile.stats?.activeBacklogs)) ? 0 : parseInt(updatedProfile.stats?.activeBacklogs),
        linkedinUrl: cleanUrl(updatedProfile.linkedinUrl),
        githubUrl: cleanUrl(updatedProfile.githubUrl),
        portfolioUrl: cleanUrl(updatedProfile.portfolioUrl),
        resumeUrl: newResumeUrl,
      };

      const backendSkillIds = backendProfile?.skills?.map((s: any) => s.id) || [];
      const updatedSkillIds = updatedProfile.skills
        ?.map((s: any) => s.id)
        ?.filter((id: any) => typeof id === "number") || [];

      const addSkillIds = updatedSkillIds.filter((id: number) => !backendSkillIds.includes(id));
      const removeSkillIds = backendSkillIds.filter((id: number) => !updatedSkillIds.includes(id));

      const deptId = parseInt(updatedProfile.stats?.departmentId);

      const putPayload = {
        ...commonPayload,
        departmentId: isNaN(deptId) ? undefined : deptId,
        addSkillIds,
        removeSkillIds,
        addExperiences: updatedProfile.experiences?.filter((exp: any) => !exp.id).map((exp: any) => ({
          companyName: exp.companyName,
          role: exp.role,
          description: exp.description || undefined,
          startDate: exp.startDate,
          endDate: exp.endDate || undefined,
        })),
        updateExperiences: updatedProfile.experiences?.filter((exp: any) => exp.id).map((exp: any) => ({
          id: exp.id,
          companyName: exp.companyName,
          role: exp.role,
          description: exp.description || undefined,
          startDate: exp.startDate,
          endDate: exp.endDate || undefined,
        })),
        deleteExperienceIds: updatedProfile.deleteExperienceIds || [],
        addCertificates: updatedProfile.certificates?.filter((cert: any) => !cert.id).map((cert: any) => ({
          title: cert.title,
          issuer: cert.issuer,
          certificateUrl: cleanUrl(cert.certificateUrl),
          issuedDate: cert.issuedDate || undefined,
        })),
        updateCertificates: updatedProfile.certificates?.filter((cert: any) => cert.id).map((cert: any) => ({
          id: cert.id,
          title: cert.title,
          issuer: cert.issuer,
          certificateUrl: cleanUrl(cert.certificateUrl),
          issuedDate: cert.issuedDate || undefined,
        })),
        deleteCertificateIds: updatedProfile.deleteCertificateIds || [],
        addProjects: updatedProfile.projects?.filter((proj: any) => !proj.id).map((proj: any) => ({
          title: proj.title,
          description: proj.description || undefined,
          techStack: proj.techStack || undefined,
          githubUrl: cleanUrl(proj.githubUrl),
          liveUrl: cleanUrl(proj.liveUrl),
        })),
        updateProjects: updatedProfile.projects?.filter((proj: any) => proj.id).map((proj: any) => ({
          id: proj.id,
          title: proj.title,
          description: proj.description || undefined,
          techStack: proj.techStack || undefined,
          githubUrl: cleanUrl(proj.githubUrl),
          liveUrl: cleanUrl(proj.liveUrl),
        })),
        deleteProjectIds: updatedProfile.deleteProjectIds || [],
      };

      await dispatch(updateStudentProfile(putPayload)).unwrap();
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast.error(err?.message || "Update failed");
      return { success: false };
    }
  };

  const normalizePreviewUrl = (url: string) => {
    if (!url) return '';
    
    // Prefer HTTPS to avoid mixed content in production.
    let secureUrl = url.replace(/^http:\/\//i, 'https://');
    
    // Cloudinary specific handling to ensure PDF rendering
    if (secureUrl.includes('cloudinary.com')) {
      // Force PDF format for image uploads
      if (secureUrl.includes('/image/upload/') && !secureUrl.includes('/f_pdf')) {
        secureUrl = secureUrl.replace('/image/upload/', '/image/upload/f_pdf/');
      }
      // Ensure .pdf extension is present for raw/image uploads
      if (!secureUrl.toLowerCase().endsWith('.pdf') && (secureUrl.includes('/image/upload/') || secureUrl.includes('/raw/upload/'))) {
        // Remove existing extension if any and add .pdf
        secureUrl = secureUrl.replace(/\.[a-z0-9]+$/i, '') + '.pdf';
      }
    }

    return secureUrl;
  };

  const openFile = (url: string, name = '') => {
    if (!url) return;
    const normalizedUrl = normalizePreviewUrl(url);
    setPreviewName(name);
    setPreviewUrl(normalizedUrl);
    setIsPdfPreview(normalizedUrl.toLowerCase().includes('.pdf') || normalizedUrl.toLowerCase().includes('/f_pdf/'));
  };

  const handleAddProject = (project: any) => {
    const updatedProfile = { ...profile, projects: [...(profile.projects || []), project] };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleAddExperience = (exp: any) => {
    const updatedProfile = { ...profile, experiences: [...(profile.experiences || []), exp] };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleAddCertificate = (cert: any) => {
    const updatedProfile = { ...profile, certificates: [...(profile.certificates || []), cert] };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  if (backendLoading && !backendProfile) {
    return <Loader text="Retrieving your profile details..." fullScreen />;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 4,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <StudentPageLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative group/hero">
          {/* Adaptive Banner */}
          <div className="student-hero-banner group overflow-hidden">
            <div className="student-hero-mesh">
              <div className="bubble-indigo"></div>
              <div className="bubble-sky"></div>
            </div>
            <div className="student-hero-texture"></div>
            <div className="student-hero-overlay"></div>

            <div className="relative z-10 w-full">
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 w-full">
                {/* Initials Badge - Refined sizing and contrast */}
                <div className="h-20 w-20 md:h-32 md:w-32 rounded-[2rem] bg-indigo-600/10 dark:bg-white/20 backdrop-blur-xl border border-indigo-500/20 dark:border-white/30 flex items-center justify-center shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-3xl md:text-5xl font-black text-indigo-600 dark:text-white tracking-tighter">
                    {profile.name ? profile.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('') : 'ST'}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-4 w-full">
                  <div className="space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-4">
                      <h1 className="student-hero-title !mt-0 !text-2xl md:!text-4xl drop-shadow-sm text-slate-900 dark:text-white break-words">
                        {profile.name}
                      </h1>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest shrink-0">
                        <CheckCircle className="h-2.5 w-2.5" />
                        Verified
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full">
                      <div className="flex items-center gap-2 bg-indigo-600/5 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-600/10 dark:border-white/20 text-slate-700 dark:text-white font-bold text-[9px] md:text-xs min-w-0 max-w-full">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300 shrink-0" />
                        <span className="truncate">{profile.stats?.university || 'University Not Set'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-600/5 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-600/10 dark:border-white/20 text-slate-700 dark:text-white font-bold text-[9px] md:text-xs min-w-0 max-w-full">
                        <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-300 shrink-0" />
                        <span className="truncate">{profile.stats?.department || 'Department Not Set'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-600/5 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-600/10 dark:border-white/20 text-slate-700 dark:text-white font-bold text-[9px] md:text-xs min-w-0 max-w-full">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-200 shrink-0" />
                        <span className="truncate">Batch {profile.stats?.passingYear || '20xx'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-600/5 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-600/10 dark:border-white/20 text-slate-700 dark:text-white font-bold text-[9px] md:text-xs min-w-0 max-w-full">
                        <Mail className="h-3.5 w-3.5 text-indigo-600 dark:text-amber-200 shrink-0" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-2 w-full">
                    {profile.location && (
                      <div className="flex items-center gap-3 group/loc cursor-pointer min-w-0 max-w-full">
                        <div className="p-2 rounded-xl bg-indigo-600/5 dark:bg-white/10 text-indigo-600 dark:text-white border border-indigo-600/10 dark:border-white/20 group-hover/loc:bg-indigo-600/10 dark:group-hover/loc:bg-white/20 transition-all shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60">Location</p>
                          <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-wide truncate">{profile.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 md:pt-0 shrink-0 w-full md:w-auto self-center">
                  <Button
                    onClick={() => isApproved && setShowProfileEditDialog(true)}
                    disabled={!isApproved}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-xl text-white border border-indigo-500/20 dark:border-white/30 rounded-2xl px-6 h-11 md:h-12 font-bold shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group overflow-hidden border border-slate-200/60 dark:border-white/[0.08]">
            <CardContent className="p-4 sm:p-4 sm:p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">CGPA Score</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.stats?.cgpa || '0.0'} <span className="text-sm font-normal text-slate-400">/ 10</span></h3>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                  <Award className="h-6 w-6 md:h-7 md:w-7" />
                </div>
              </div>
              <div className="mt-6">
                <Progress value={(parseFloat(profile.stats?.cgpa) || 0) * 10} className="h-1.5 bg-blue-100 dark:bg-blue-900/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group border border-slate-200/60 dark:border-white/[0.08]">
            <CardContent className="p-4 sm:p-4 sm:p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Projects</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.projects?.length || 0}</h3>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                  <Cpu className="h-6 w-6 md:h-7 md:w-7" />
                </div>
              </div>
              <p className="mt-6 text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Technical Portfolio</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm bg-card dark:bg-[#161b22]/40 backdrop-blur-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group border border-border dark:border-white/[0.08]">
            <CardContent className="p-4 sm:p-4 sm:p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Verified Skills</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.skills?.length || 0}</h3>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                  <Rocket className="h-6 w-6 md:h-7 md:w-7" />
                </div>
              </div>
              <p className="mt-6 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Industry Ready</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm bg-card dark:bg-[#161b22]/40 backdrop-blur-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 group border border-border dark:border-white/[0.08]">
            <CardContent className="p-4 sm:p-4 sm:p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Active Backlogs</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.stats?.activeBacklogs || '0'}</h3>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                  <Layers className="h-6 w-6 md:h-7 md:w-7" />
                </div>
              </div>
              <Badge
                variant={parseInt(profile.stats?.activeBacklogs) > 0 ? "destructive" : "secondary"}
                className={`mt-6 rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest ${parseInt(profile.stats?.activeBacklogs) === 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-sm" : "shadow-lg shadow-rose-500/20"}`}
              >
                {parseInt(profile.stats?.activeBacklogs) === 0 ? "Perfect Record" : "Action Required"}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Academic Details */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2rem] border-none shadow-sm bg-card dark:bg-[#161b22]/40 backdrop-blur-xl overflow-hidden group border border-border dark:border-white/[0.08]">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800"></div>
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                      <GraduationCap className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Academic Details</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Education Records</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: 'University', value: profile.stats?.university || 'N/A', icon: GraduationCap, fullWidth: true },
                      { label: 'Department', value: profile.stats?.department || 'N/A', icon: Building2 },
                      { label: 'CGPA', value: `${profile.stats?.cgpa || '0.0'} / 10`, icon: Award },
                      { label: 'Academic Year', value: profile.stats?.year ? `${profile.stats.year}${profile.stats.year === 1 ? 'st' : profile.stats.year === 2 ? 'nd' : profile.stats.year === 3 ? 'rd' : 'th'} Year` : 'N/A', icon: Calendar },
                      { label: 'Passing Batch', value: profile.stats?.passingYear || 'N/A', icon: CalendarDays },
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-blue-500/30 transition-all group/item ${item.fullWidth ? 'sm:col-span-2' : ''}`}>
                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover/item:text-blue-500 transition-colors shadow-sm shrink-0">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Experience Timeline */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2rem] border-none shadow-sm bg-card dark:bg-[#161b22]/40 backdrop-blur-xl overflow-hidden group border border-border dark:border-white/[0.08]">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-blue-800"></div>
                <CardContent className="p-6 md:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Briefcase className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Work Experience</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Past Jobs & Internships</p>
                      </div>
                    </div>
                    <Button onClick={() => isApproved && setShowExperienceModal(true)} disabled={!isApproved} variant="ghost" size="sm" className="w-fit text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                      <Plus className="h-4 w-4 mr-2" /> Add Entry
                    </Button>
                  </div>

                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 dark:before:from-blue-900/50 before:via-slate-100 dark:before:via-slate-800 before:to-transparent">
                    {profile.experiences?.length > 0 ? (
                      profile.experiences.map((exp: any, i: number) => (
                        <div key={i} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group/timeline">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="w-full md:w-[calc(50%-2.5rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-[#f8fafc] dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md hover:bg-white dark:hover:bg-white/10 group-hover/timeline:border-blue-100 dark:group-hover/timeline:border-blue-500/30">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{exp.role}</h4>
                              <Button variant="ghost" size="icon" disabled={!isApproved} className="h-7 w-7 text-slate-400 hover:text-rose-500 opacity-0 group-hover/timeline:opacity-100 transition-opacity disabled:opacity-0"
                                onClick={() => {
                                  if (!isApproved) return;
                                  const expId = profile.experiences[i]?.id;
                                  const updated = profile.experiences.filter((_: any, idx: number) => idx !== i);
                                  setProfile({ ...profile, experiences: updated });
                                  handleSave({ ...profile, experiences: updated, deleteExperienceIds: expId ? [expId] : [] });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400">{exp.companyName}</p>
                            <time className="text-[10px] md:text-xs font-medium text-slate-400 mb-2 block">{exp.startDate} — {exp.endDate || 'Present'}</time>
                            {exp.description && <p className="text-[11px] md:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{exp.description}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-[#f8fafc]/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 mx-4 md:mx-0">
                        <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 italic">No professional experience listed.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Skills Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2rem] border-none shadow-sm bg-card dark:bg-[#161b22]/40 backdrop-blur-xl overflow-hidden group border border-border dark:border-white/[0.08]">
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                      <Code2 className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Technical Skills</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Core Technologies & Tools</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-2.5">
                    {profile.skills?.length > 0 ? (
                      profile.skills.map((skill: any, i: number) => {
                        const colors = [
                          'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white',
                          'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white',
                          'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white',
                          'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white',
                          'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white',
                          'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white'
                        ];
                        const colorClass = colors[i % colors.length];

                        return (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={i}
                          >
                            <Badge
                              className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold transition-all border rounded-xl cursor-default shadow-sm ${colorClass}`}
                            >
                              {skill.name}
                            </Badge>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-400 italic">No skills added yet.</p>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => isApproved && setShowProjectModal(true)}
                        disabled={!isApproved}
                        variant="outline"
                        className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all h-auto py-3 flex-col gap-2 disabled:opacity-50"
                      >
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold">Add Project</span>
                      </Button>
                      <Button
                        onClick={() => isApproved && setShowExperienceModal(true)}
                        disabled={!isApproved}
                        variant="outline"
                        className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all h-auto py-3 flex-col gap-2 disabled:opacity-50"
                      >
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold">Add Exp.</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Certifications Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl overflow-hidden group border border-slate-200/60 dark:border-white/[0.08]">
                <div className="h-2 w-full bg-gradient-to-r from-rose-500 to-orange-500"></div>
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner">
                        <Award className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Certifications</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Professional Recognition</p>
                      </div>
                    </div>
                    <Button onClick={() => isApproved && setShowCertificateModal(true)} disabled={!isApproved} variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl px-2 md:px-3 py-1.5 shrink-0 disabled:opacity-50">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {profile.certificates?.length > 0 ? (
                      profile.certificates.map((cert: any, i: number) => (
                        <div key={i} className="group/cert p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md hover:border-rose-100 dark:hover:border-rose-500/30">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover/cert:text-rose-500 transition-colors">
                                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm truncate">{cert.title}</h4>
                                <p className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{cert.issuer}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{cert.issuedDate}</span>
                                  {cert.certificateUrl && (
                                    <button
                                      className="text-[9px] md:text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter flex items-center gap-1"
                                      onClick={() => openFile(cert.certificateUrl, cert.title)}
                                    >
                                      View <ExternalLink className="h-2.5 w-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" disabled={!isApproved} className="h-8 w-8 text-slate-400 hover:text-rose-500 md:opacity-0 group-hover/cert:opacity-100 transition-opacity shrink-0 disabled:opacity-0"
                              onClick={() => {
                                if (!isApproved) return;
                                const certId = profile.certificates[i]?.id;
                                const updated = profile.certificates.filter((_: any, idx: number) => idx !== i);
                                setProfile({ ...profile, certificates: updated });
                                handleSave({ ...profile, certificates: updated, deleteCertificateIds: certId ? [certId] : [] });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-6">No certifications added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resume & AI-Tailored Resume Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <CardContent className="p-4 sm:p-4 sm:p-4 sm:p-6 md:p-8 relative z-10 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white">
                        <FileText className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold">Resume</h3>
                    </div>
                  </div>

                  {aiTailoredResume ? (
                    /* AI-Tailored Resume Row */
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm group-hover:bg-indigo-500/15 transition-all animate-in duration-300">
                      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                          <Sparkles className="h-5 w-5 text-indigo-300 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold truncate">{aiTailoredResume.fullName}_AI_Tailored.md</p>
                            <Badge className="bg-indigo-500/25 text-indigo-300 border-none text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              ATS Optimized
                            </Badge>
                          </div>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                            Optimized for: {aiTailoredResume.targetRole}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <Button
                          onClick={() => {
                            setShowAiResumeDialog(true);
                          }}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 h-9 text-xs font-black shadow-lg shadow-indigo-500/25 transition-transform active:scale-95 border-none"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            const content = getResumeMarkdown(aiTailoredResume);
                            const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${aiTailoredResume.fullName || "resume"}_optimized.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success("AI-Tailored Resume downloaded!");
                          }}
                          className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-4 h-9 text-xs font-black shadow-lg shadow-white/5 transition-transform active:scale-95 border-none"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Resume Row */
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/8 transition-all">
                      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{profile.name}_Resume.pdf</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{profile.resumeUrl ? 'PDF Resume • Uploaded' : 'No resume uploaded'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <Button
                          onClick={() => profile.resumeUrl && openFile(profile.resumeUrl, `${profile.name}_Resume`)}
                          disabled={!profile.resumeUrl}
                          className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-4 h-9 text-xs font-black shadow-lg shadow-white/5 transition-transform active:scale-95 border-none"
                        >
                          View Resume
                        </Button>
                        {profile.resumeUrl && (
                          <Button
                            onClick={async () => {
                              if (confirm("Are you sure you want to remove your resume?")) {
                                const res = await handleSave({ ...profile, resumeUrl: '' });
                                if (res?.success) {
                                  toast.success("Resume removed successfully");
                                }
                              }
                            }}
                            className="w-full sm:w-auto bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl px-4 h-9 text-xs font-black shadow-lg shadow-rose-600/20 transition-transform active:scale-95 border-none"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>


        {/* Projects Section - Full Width */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                <Rocket className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Featured Projects</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Showcasing Innovation</p>
              </div>
            </div>
            <Button
              onClick={() => isApproved && setShowProjectModal(true)}
              disabled={!isApproved}
              className="w-full sm:w-auto bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.1] text-slate-700 dark:text-white hover:bg-purple-500 hover:text-white dark:hover:bg-purple-500 transition-all rounded-[1.5rem] px-8 h-12 md:h-14 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm disabled:opacity-50"
            >
              <Plus className="h-5 w-5 mr-3" /> Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.projects?.length > 0 ? (
              profile.projects.map((project: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="rounded-[2.5rem] border-none shadow-sm bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl h-full flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] hover:border-indigo-500/30 border border-slate-200/60 dark:border-white/[0.08]">
                    <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <CardContent className="p-4 sm:p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-100 dark:bg-black/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                          <Globe className="h-6 w-6 md:h-7 md:w-7" />
                        </div>
                        <Button variant="ghost" size="icon" disabled={!isApproved} className="h-10 w-10 text-slate-400 hover:text-rose-500 md:opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
                          onClick={() => {
                            if (!isApproved) return;
                            const projId = profile.projects[i]?.id;
                            const updated = profile.projects.filter((_: any, idx: number) => idx !== i);
                            setProfile({ ...profile, projects: updated });
                            handleSave({ ...profile, projects: updated, deleteProjectIds: projId ? [projId] : [] });
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight truncate">{project.title}</h4>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-8 leading-relaxed flex-1 font-medium">{project.description || 'No description provided.'}</p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.techStack?.split(',').map((tech: string, j: number) => (
                          <Badge key={j} variant="secondary" className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white border-none px-2.5 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                        {project.liveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:flex-1 rounded-2xl h-11 md:h-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-slate-200/60 dark:border-white/10 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" /> Live Demo
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:flex-1 rounded-2xl h-11 md:h-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-slate-200/60 dark:border-white/10 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-800 transition-all shadow-sm"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                          >
                            <Code2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" /> GitHub
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white/40 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                <Rocket className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 italic">No projects showcased yet.</p>
              </div>
            )}
          </div>
        </motion.div>


        {/* Modals */}
        <ProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} onAddProject={handleAddProject} />
        <ExperienceModal isOpen={showExperienceModal} onClose={() => setShowExperienceModal(false)} onAddExperience={handleAddExperience} />
        <CertificateModal isOpen={showCertificateModal} onClose={() => setShowCertificateModal(false)} onAddCertificate={handleAddCertificate} />
        <ProfileEditDialog
          isOpen={showProfileEditDialog}
          onClose={() => setShowProfileEditDialog(false)}
          profile={profile}
          onSave={handleSave}
          isLoading={backendLoading}
          isApproved={isApproved}
        />

        {/* AI-Tailored Resume Preview Dialog */}
        <Dialog open={showAiResumeDialog} onOpenChange={setShowAiResumeDialog}>
          <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[2rem]">
            <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-[#f8faff] to-[#ffffff] dark:from-slate-900 dark:to-slate-950 border-b border-border/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                      AI-Tailored Resume Preview
                      <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        ATS Optimized
                      </Badge>
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-semibold">
                      This profile is dynamically tailored using advanced AI suggestions.
                    </p>
                  </div>
                </div>

              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
              {aiTailoredResume && (
                <div className="bg-white dark:bg-[#111217] rounded-[2rem] border border-slate-200/60 dark:border-white/[0.05] p-6 md:p-8 space-y-6 shadow-sm">
                  {/* Paper Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-6" />

                  {/* Name & Contact Info */}
                  <div className="text-center space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                        {aiTailoredResume.fullName}
                      </h2>
                      <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Briefcase size={10} className="fill-current" strokeWidth={2.5} />
                        {aiTailoredResume.targetRole}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-lg mx-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center justify-center gap-1.5">
                        <Phone size={11} className="text-indigo-500 shrink-0" />
                        {aiTailoredResume.phone}
                      </span>
                      <span className="flex items-center justify-center gap-1.5 truncate">
                        <Mail size={11} className="text-indigo-500 shrink-0" />
                        {aiTailoredResume.email}
                      </span>
                      <span className="flex items-center justify-center gap-1.5">
                        <MapPin size={11} className="text-indigo-500 shrink-0" />
                        {aiTailoredResume.location}
                      </span>
                      {aiTailoredResume.linkedin && (
                        <span className="flex items-center justify-center gap-1.5">
                          <Link size={11} className="text-indigo-500 shrink-0" />
                          LinkedIn
                        </span>
                      )}
                      {aiTailoredResume.github && (
                        <span className="flex items-center justify-center gap-1.5">
                          <Code2 size={11} className="text-indigo-500 shrink-0" />
                          GitHub
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 border-t border-slate-200/50 dark:border-white/[0.04] pt-5 relative group/summary">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                        <User size={12} className="stroke-[2.5]" />
                        Professional Summary
                      </h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiTailoredResume.summary);
                          setCopiedField('summary');
                          toast.success("Copied to clipboard!");
                          setTimeout(() => setCopiedField(null), 2000);
                        }}
                        className="opacity-0 group-hover/summary:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer"
                      >
                        {copiedField === 'summary' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-355 leading-relaxed font-medium bg-indigo-500/[0.02] border-l-2 border-indigo-500 pl-3 py-1.5 rounded-r-lg">
                      {aiTailoredResume.summary}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="space-y-4 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                    <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                      <ListChecks size={12} className="stroke-[2.5]" />
                      Tailored Skills & Technologies
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ensureArray(aiTailoredResume.frameworks).length > 0 && (
                        <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                          <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Frameworks & Libraries</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ensureArray(aiTailoredResume.frameworks).map((f: string, idx: number) => (
                              <Badge key={idx} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {ensureArray(aiTailoredResume.cloud).length > 0 && (
                        <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                          <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider">Cloud & DevOps</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ensureArray(aiTailoredResume.cloud).map((c: string, idx: number) => (
                              <Badge key={idx} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {ensureArray(aiTailoredResume.skills).length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-100/30 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.03]">
                        <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">All Technical Competencies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ensureArray(aiTailoredResume.skills).map((s: string, idx: number) => (
                            <Badge key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border-none text-[8.5px] uppercase font-bold py-0.5 px-2 rounded-md tracking-wider">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiTailoredResume.languages && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Languages & Core Competencies</span>
                        <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
                          {aiTailoredResume.languages}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  {Array.isArray(aiTailoredResume.projects) && aiTailoredResume.projects.length > 0 && (
                    <div className="space-y-5 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                        <Briefcase size={12} className="stroke-[2.5]" />
                        Optimized Projects
                      </h4>

                      <div className="space-y-5">
                        {aiTailoredResume.projects.map((proj: any, pIdx: number) => (
                          <div key={pIdx} className="space-y-2 group/proj relative p-4 rounded-2xl border border-slate-200/50 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] hover:shadow-sm transition-all duration-300">
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
                                  navigator.clipboard.writeText(projText);
                                  setCopiedField(`proj-${pIdx}`);
                                  toast.success("Copied to clipboard!");
                                  setTimeout(() => setCopiedField(null), 2000);
                                }}
                                className="opacity-0 group-hover/proj:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-200/50 dark:bg-white/10 hover:bg-slate-250 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer"
                              >
                                {copiedField === `proj-${pIdx}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                              </button>
                            </div>

                            <ul className="space-y-1.5 pl-4 text-slate-655 dark:text-slate-350 text-[11px] md:text-xs leading-relaxed font-semibold list-disc marker:text-indigo-500">
                              {ensureArray(proj.highlights)?.map((highlight: string, hIdx: number) => (
                                <li key={hIdx}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {Array.isArray(aiTailoredResume.education) && aiTailoredResume.education.length > 0 && (
                    <div className="space-y-4 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                        <GraduationCap size={12} className="stroke-[2.5]" />
                        Education
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiTailoredResume.education.map((edu: any, eIdx: number) => (
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

                  {/* Achievements */}
                  {Array.isArray(aiTailoredResume.achievements) && aiTailoredResume.achievements.length > 0 && (
                    <div className="space-y-3.5 border-t border-slate-200/50 dark:border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                        <Award size={12} className="stroke-[2.5]" />
                        Key Metrics & Impact
                      </h4>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {aiTailoredResume.achievements.map((ach: any, aIdx: number) => (
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
              )}
            </div>

            <DialogFooter className="p-8 bg-gradient-to-t from-muted/30 to-transparent border-t border-border/50 shrink-0 gap-3 justify-end flex items-center">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-muted"
                onClick={() => setShowAiResumeDialog(false)}
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  const content = getResumeMarkdown(aiTailoredResume);
                  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${aiTailoredResume.fullName || "resume"}_optimized.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success("AI-Tailored Resume downloaded!");
                }}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 font-bold text-xs uppercase tracking-wider border-none"
              >
                Download Markdown
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog
          open={!!previewUrl}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewUrl(null);
              setIsPdfPreview(false);
            }
          }}
        >
          <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-none shadow-2xl rounded-3xl">
            <DialogHeader className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold truncate flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  {previewName}
                </DialogTitle>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800" onClick={() => window.open(previewUrl!, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Open Full View
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 bg-slate-100 overflow-hidden relative">
              {isPdfPreview ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl!)}&embedded=true`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => window.open(previewUrl!, '_blank')}
                      className="rounded-xl bg-white shadow-lg border-slate-200"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Original View
                    </Button>
                  </div>
                </div>
              ) : (
                <iframe src={previewUrl!} className="w-full h-full border-none" title="Document Preview" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </StudentPageLayout>
  );
};

export default StudentProfile;