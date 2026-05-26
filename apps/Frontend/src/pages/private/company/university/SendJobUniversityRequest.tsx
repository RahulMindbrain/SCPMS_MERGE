import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Info,
  Target,
  BookOpen,
  AlertCircle,
  AlignLeft,
  IndianRupee,
  Plus,
  ArrowLeft,
  Rocket
} from "lucide-react";

import type { RootState } from "@/redux/reducers/rootReducer";
import type { AppDispatch } from "@/redux/store/store";
import { fetchCompanyJobs } from "@/redux/thunks/companyThunk";
import { sendJobToUniversity } from "@/redux/thunks/superadmin/companyUniversityThunk";
import { getAPI } from "@/apis/api";
import Loader from "@/components/Loader";

const SendJobUniversityRequest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryJobId = searchParams.get("jobId");

  const companyJobs = useSelector((state: RootState) => state.company.jobs) || [];
  const loading = useSelector((state: RootState) => state.companyUniversity.loading);

  const [universities, setUniversities] = useState<any[]>([]);
  const [isUniversityLoading, setIsUniversityLoading] = useState(false);

  const [formData, setFormData] = useState({
    jobId: queryJobId || "",
    universityId: "",
    salary: "",
    minCgpa: "",
    maxBacklogs: "0",
    openings: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchCompanyJobs({ page: 1, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setIsUniversityLoading(true);
        const response = await getAPI<any>("/university", { page: 1, limit: 200 });
        const rows = response?.data?.data || [];
        setUniversities(Array.isArray(rows) ? rows : []);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load universities");
        setUniversities([]);
      } finally {
        setIsUniversityLoading(false);
      }
    };

    loadUniversities();
  }, []);

  useEffect(() => {
    if (queryJobId) {
      setFormData((prev) => ({ ...prev, jobId: queryJobId }));
    }
  }, [queryJobId]);

  const selectedJob = useMemo(
    () => companyJobs.find((job: any) => String(job.id) === String(formData.jobId)),
    [companyJobs, formData.jobId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobId || !formData.universityId) {
      toast.error("Please select both job and university");
      return;
    }
    if (!formData.salary || !formData.minCgpa || !formData.openings) {
      toast.error("Please fill salary, minimum CGPA and openings");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      await dispatch(
        sendJobToUniversity({
          jobId: Number(formData.jobId),
          jobUniversities: [
            {
              universityId: Number(formData.universityId),
              salary: Number(formData.salary),
              minCgpa: Number(formData.minCgpa),
              maxBacklogs: Number(formData.maxBacklogs || 0),
              openings: Number(formData.openings),
              description: formData.description.trim(),
            },
          ],
        }),
      ).unwrap();

      toast.success("Job request sent successfully");
      navigate("/company/dashboard");
    } catch (error: any) {
      toast.error(error?.message || error || "Failed to send request");
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Hero Header matching PostJob.tsx style perfectly */}
      <div className="p-4 md:p-8">
        <div className="company-hero-banner relative overflow-hidden group rounded-3xl">
          <div className="hero-mesh">
            <div className="bubble-primary" />
            <div className="bubble-secondary" />
          </div>
          <div className="hero-texture" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div className="space-y-3">
              <div 
                className="hero-badge cursor-pointer hover:bg-white/20 transition-all duration-300" 
                onClick={() => navigate('/company/dashboard')}
              >
                <ArrowLeft size={12} className="mr-1" />
                Back to Dashboard
              </div>
              <h1 className="hero-title text-2xl md:text-3xl font-extrabold text-white">
                Send Job to University
              </h1>
              <p className="hero-description max-w-xl text-xs md:text-sm text-white/80">
                Setup your academic syndication criteria. Distribute active job postings across targeted student placement systems.
              </p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hidden lg:flex items-center gap-3">
                <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Integration</h4>
                  <p className="text-[10px] text-white/65">Optimized Campus Outreach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 1: Channel & Scope */}
            <div className="saas-card p-6 md:p-8 space-y-6 bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4 text-left">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target size={16} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground tracking-tight">Channel Target</h2>
                  <p className="text-[11px] text-muted-foreground">Select active opportunity manifest and destination campus.</p>
                </div>
              </div>

              <div className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                    Active Job Opportunity
                  </label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <select
                      className="saas-input appearance-none w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pr-10 transition-all duration-300 outline-none cursor-pointer font-bold text-xs"
                      style={{ paddingLeft: "3rem" }}
                      value={formData.jobId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, jobId: e.target.value }))}
                      required
                    >
                      <option value="">Choose a manifest...</option>
                      {companyJobs.map((job: any) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                    Destination University
                  </label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <select
                      className="saas-input appearance-none w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pr-10 transition-all duration-300 outline-none cursor-pointer font-bold text-xs"
                      style={{ paddingLeft: "3rem" }}
                      value={formData.universityId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, universityId: e.target.value }))}
                      disabled={isUniversityLoading}
                      required
                    >
                      <option value="">
                        {isUniversityLoading ? "Syncing universities..." : "Select university campus..."}
                      </option>
                      {universities.map((uni: any) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Selection Summary Callout */}
                {selectedJob && (
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 relative overflow-hidden text-left animate-in slide-in-from-top-1 duration-200">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-[9px] font-black text-primary uppercase tracking-wider">Syndicating</h4>
                      <p className="text-xs font-bold text-foreground truncate">
                        Routing active job <span className="text-primary italic">"{selectedJob.title}"</span> to targeted university.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: Eligibility & Directives */}
            <div className="saas-card p-6 md:p-8 space-y-6 bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4 text-left">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground tracking-tight">Eligibility Criteria</h2>
                  <p className="text-[11px] text-muted-foreground">Calibration thresholds and placement details.</p>
                </div>
              </div>

              <div className="space-y-5 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                      Salary (INR)
                    </label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1200000"
                        className="saas-input w-full font-bold text-xs"
                        style={{ paddingLeft: "3rem" }}
                        value={formData.salary}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setFormData((prev) => ({ ...prev, salary: "" }));
                            return;
                          }
                          const num = Number(val);
                          if (isNaN(num) || num < 0) return;
                          setFormData((prev) => ({ ...prev, salary: val }));
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                      Min CGPA
                    </label>
                    <div className="relative group">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="e.g. 7.50"
                        className="saas-input w-full font-bold text-xs"
                        style={{ paddingLeft: "3rem" }}
                        value={formData.minCgpa}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setFormData((prev) => ({ ...prev, minCgpa: "" }));
                            return;
                          }
                          const num = Number(val);
                          if (isNaN(num) || num < 0 || num > 10) return;
                          setFormData((prev) => ({ ...prev, minCgpa: val }));
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                      Max Backlogs
                    </label>
                    <div className="relative group">
                      <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="saas-input w-full font-bold text-xs"
                        style={{ paddingLeft: "3rem" }}
                        value={formData.maxBacklogs}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setFormData((prev) => ({ ...prev, maxBacklogs: "" }));
                            return;
                          }
                          const num = Number(val);
                          if (isNaN(num) || num < 0) return;
                          setFormData((prev) => ({ ...prev, maxBacklogs: val }));
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                      Openings
                    </label>
                    <div className="relative group">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="number"
                        min="0"
                        placeholder="15"
                        className="saas-input w-full font-bold text-xs"
                        style={{ paddingLeft: "3rem" }}
                        value={formData.openings}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setFormData((prev) => ({ ...prev, openings: "" }));
                            return;
                          }
                          const num = Number(val);
                          if (isNaN(num) || num < 0) return;
                          setFormData((prev) => ({ ...prev, openings: val }));
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="saas-label text-[11px] font-black uppercase tracking-wider">
                    Syndication Instructions
                  </label>
                  <div className="relative group">
                    <AlignLeft className="absolute left-4 top-3 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <textarea
                      rows={3}
                      placeholder="Articulate specific requirements or details..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="saas-input w-full py-2.5 resize-none leading-relaxed font-bold text-xs"
                      style={{ paddingLeft: "3rem" }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Guidelines info callout */}
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3.5 text-left animate-in fade-in duration-300">
            <Info size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] md:text-xs text-primary/70 font-semibold leading-relaxed">
              By confirming syndication, this job opportunity will be immediately distributed to the chosen university placement officer dashboard. Ensure all eligibility criteria match official job descriptions.
            </p>
          </div>

          {/* Form action buttons */}
          <div className="flex items-center justify-between gap-4 border-t border-border/30 pt-6">
            <button
              type="button"
              onClick={() => navigate('/company/dashboard')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs transition-all duration-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center gap-2.5 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden animate-in fade-in duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] transition-transform" />
              {loading ? (
                <><Loader size="sm" /> Sending...</>
              ) : (
                <>Job Request <Rocket size={14} /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SendJobUniversityRequest;