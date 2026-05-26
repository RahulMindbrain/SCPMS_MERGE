import { 
  CheckCircle2, 
  XCircle,
  Info,
  TrendingUp,
  Search,
  User,
  ArrowUpRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import Loader from '@/components/Loader';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import { fetchJobApplications, fetchStudentProfile, fetchJobUniversities } from '@/redux/thunks/studentThunk';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { StudentPageLayout } from '@/components/layout/StudentPageLayout';

const Eligibility = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobUniversities = [], applications = [], profile, loading } = useSelector((state: RootState) => state.student);

  // jobUniversities from /job-universities already have the correct nested .job structure
  const normalizedJobs = jobUniversities;

  const [activeFilter, setActiveFilter] = useState<'all' | 'eligible' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchJobUniversities({}));
    dispatch(fetchJobApplications({}));
    if (!profile) {
      dispatch(fetchStudentProfile());
    }
  }, [dispatch, profile]);

  const studentCgpa = Number(profile?.cgpa || 0);
  const studentBranch = String(profile?.department?.name || profile?.branch || 'N/A');
  const studentBacklogs = Number(profile?.activeBacklogs || 0);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((app: any) => Number(app?.jobUniversityId || app?.jobUniversity?.id)).filter(Boolean)),
    [applications]
  );

  const companies = useMemo(
    () =>
      normalizedJobs.map((ju: any) => {
        // JobUniversity shape: { id, job: { title, company, eligibleDepartments }, minCgpa, maxBacklogs }
        const jobBranches =
          ju?.job?.eligibleDepartments?.map((d: any) => d?.name).filter(Boolean) ||
          [];
        const minCGPA = Number(ju?.minCgpa || 0);
        const maxActiveBacklogs = Number(ju?.maxBacklogs ?? Number.MAX_SAFE_INTEGER);
        
        const branchEligible =
          jobBranches.length === 0 ||
          jobBranches.some((b: string) => b.toLowerCase() === studentBranch.toLowerCase());
        const cgpaEligible = !minCGPA || studentCgpa >= minCGPA;
        const backlogEligible = studentBacklogs <= maxActiveBacklogs;
        
        const active = branchEligible && cgpaEligible && backlogEligible;

        let reason = "";
        if (!active) {
          if (!cgpaEligible) {
            reason = `Min ${minCGPA} CGPA required`;
          } else if (!branchEligible) {
            reason = "Branch not eligible";
          } else if (!backlogEligible) {
            reason = `Max ${maxActiveBacklogs} backlogs allowed`;
          }
        }

        return {
          id: ju.id,
          name: ju?.job?.company?.name || "Company",
          role: ju?.job?.title || "Role",
          minCGPA,
          branches: jobBranches,
          active,
          reason,
          applied: appliedJobIds.has(Number(ju.id)),
        };
      }),
    [normalizedJobs, appliedJobIds, studentBacklogs, studentBranch, studentCgpa]
  );

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'eligible') return matchesSearch && company.active;
    if (activeFilter === 'applied') return matchesSearch && company.applied;
    return matchesSearch;
  });

  const stats = {
    total: companies.length,
    eligible: companies.filter((c) => c.active).length,
    applied: companies.filter((c) => c.applied).length,
    ineligible: companies.filter((c) => !c.active).length
  };

  if (loading && jobUniversities.length === 0) {
    return <Loader text="Analyzing eligibility landscape..." fullScreen />;
  }

  return (
    <StudentPageLayout>
      <div className="space-y-8 student-hero-animate fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Adaptive Hero Banner */}
        <div className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-indigo"></div>
            <div className="bubble-sky"></div>
          </div>

          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="student-hero-badge">
                <Sparkles size={14} /> 
                <span>Eligibility Monitor</span>
              </div>
              <h1 className="student-hero-title">
                Placement <span>Eligibility</span> ✅
              </h1>
              <p className="student-hero-description">
                {stats.eligible > 0 
                  ? `You are eligible for ${stats.eligible} out of ${stats.total} live opportunities. Let's make them count!`
                  : "Track your academic standing and see which career paths are currently open for your profile."}
              </p>
            </div>
            
            <div className="hidden lg:block">
           
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* ─── Profile & Stats Sidebar ─── */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* Academic Card */}
            <div className="bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-slate-200/60 dark:border-white/[0.08] shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-indigo-500/20" />
              
              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-2.5 bg-indigo-500/10 rounded-xl shadow-inner">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[9px] md:text-[10px]">Profile Status</h3>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="p-5 md:p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">Verified Academic Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{studentCgpa || 0}</span>
                      <span className="text-slate-500 font-bold text-xs md:text-sm">/ 10.0</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-4 md:p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner min-w-0">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                      <p className="font-black text-slate-900 dark:text-slate-200 truncate tracking-tight text-xs md:text-sm">{studentBranch}</p>
                    </div>
                    <div className="p-4 md:p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner min-w-0">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Backlogs</p>
                      <p className={cn("font-black tracking-tight text-xs md:text-sm", studentBacklogs > 0 ? "text-rose-600" : "text-emerald-600")}>
                        {studentBacklogs} Active
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-start gap-3">
                  <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500 mt-1 shrink-0" />
                  <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                    Criteria is matched against verified academic records.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { label: 'Eligible Opportunities', value: stats.eligible, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
                { label: 'Active Applications', value: stats.applied, color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: TrendingUp },
                { label: 'Locked Status', value: stats.ineligible, color: 'text-slate-400', bg: 'bg-slate-500/10', icon: XCircle },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-slate-200/60 dark:border-white/[0.08] flex items-center gap-4 md:gap-6 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-2px] group">
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{stat.value.toString().padStart(2, '0')}</p>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Main Content Area ─── */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center gap-1.5 md:gap-2 bg-slate-100 dark:bg-white/5 p-1 md:p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] overflow-x-auto no-scrollbar w-full md:w-fit">
                {["all", "eligible", "applied"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={cn(
                      "px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap",
                      activeFilter === filter
                        ? "bg-white dark:bg-[#1e1f26] text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200/50 dark:border-white/10 scale-105"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              <div className="relative flex-1 max-w-sm group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <Input
                  placeholder="Search role or company..."
                  className="pl-12 h-11 md:h-12 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-sm font-semibold focus-visible:ring-indigo-500/30 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {filteredCompanies.map((company, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={company.id} 
                      className={cn(
                        "group relative bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-slate-200/60 dark:border-white/[0.08] transition-all duration-500 hover:shadow-2xl hover:translate-y-[-4px] overflow-hidden hover:border-indigo-500/30",
                        !company.active && "opacity-75 grayscale-[0.5]"
                      )}
                    >
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                      <div className={cn(
                        "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl text-white shadow-lg shrink-0 transition-transform group-hover:scale-110 duration-500",
                        company.active ? "bg-gradient-to-br from-indigo-500 to-blue-600" : "bg-slate-500/50 grayscale"
                      )}>
                        {company.name[0]}
                      </div>

                      <div className="flex-1 min-w-0 w-full text-center md:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2 md:gap-3 mb-2">
                          <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {company.name}
                          </h4>
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/5">
                              {company.role}
                            </span>
                            {company.applied && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                Applied
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 md:gap-x-6 gap-y-2 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-indigo-500 shrink-0 md:w-3.5 md:h-3.5" />
                            <span>Min {company.minCGPA} CGPA</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 size={12} className="text-purple-500 shrink-0 md:w-3.5 md:h-3.5" />
                            <span className="truncate max-w-[150px] md:max-w-[200px]">{company.branches.join(', ') || 'All Branches'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-2 md:gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        {company.active ? (
                          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            Eligible
                          </div>
                        ) : (
                          <div className="bg-slate-100 dark:bg-white/5 text-slate-400 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
                            Ineligible
                          </div>
                        )}
                        
                        {company.active ? (
                          <Button
                            variant="ghost"
                            onClick={() => navigate('/student/jobs')}
                            className="flex items-center gap-2 text-[10px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-transparent p-0 transition-transform hover:translate-x-1"
                          >
                            Apply Portal <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </Button>
                        ) : (
                          <span className="text-[9px] md:text-[10px] text-rose-500 dark:text-rose-400/80 font-bold italic tracking-tight text-center md:text-right">{company.reason}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredCompanies.length === 0 && (
                <div className="py-20 md:py-24 text-center bg-white/50 dark:bg-[#1e1f26]/30 rounded-[2.5rem] md:rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10 px-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                    <Search size={32} className="md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">No criteria matches found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-2 max-w-xs mx-auto">Try adjusting your filters or check your academic profile for any updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pro Tip Banner */}
        <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-8">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-xl border border-white/10">
              <Sparkles size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg md:text-xl font-black uppercase tracking-widest mb-2">Maximize your Eligibility</h4>
              <p className="text-indigo-100/80 leading-relaxed font-medium text-xs md:text-sm">
                Keep your CGPA above 8.0 and clear any active backlogs to unlock premium tier-1 opportunities from companies like Google, Microsoft, and Amazon.
              </p>
            </div>
            <Button
              onClick={() => navigate('/student/profile')}
              className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl px-8 md:px-10 h-12 md:h-14 font-black shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 text-xs md:text-sm"
            >
              Check Profile
            </Button>
          </div>
        </div>
      </div>
    </StudentPageLayout>
  );
};

export default Eligibility;
