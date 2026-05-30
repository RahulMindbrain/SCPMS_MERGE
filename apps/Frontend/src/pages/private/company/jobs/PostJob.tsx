import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  X,
  Target,
  Rocket,
  Sparkles,
  Info,
  AlertCircle,
  ArrowLeft,
  ChevronsUpDown,
} from 'lucide-react';
import { postJob, updateCompanyJob } from '@/redux/thunks/companyThunk';
import { fetchDepartments } from '@/redux/thunks/departmentThunk';
import { fetchSkills } from '@/redux/thunks/skillThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PostJob: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('jobId');

  const { loading: isSubmitting, jobs } = useSelector((state: RootState) => state.company);
  const { departments, loading: loadingDepts } = useSelector((state: RootState) => state.department);
  const { skills, loading: loadingSkills } = useSelector((state: RootState) => state.skill);
  const isApproved = useSelector((state: RootState) => state.auth.user?.status === 'ACTIVE');

  const [formData, setFormData] = useState({
    title: '',
    location: '',
  });

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState('');

  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const [branchSearch, setBranchSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const skillRef = useRef<HTMLDivElement>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSkills());

    // If editing a job, populate the state
    if (editJobId) {
      const jobToEdit = jobs?.find((j: any) => j.id === parseInt(editJobId));
      if (jobToEdit) {
        setFormData({
          title: jobToEdit.title || '',
          location: jobToEdit.location || '',
        });
        const locs = jobToEdit.location
          ? jobToEdit.location.split(',').map((l: string) => l.trim()).filter(Boolean)
          : [];
        setSelectedLocations(locs);
        setSelectedBranches(
          jobToEdit.eligibleDepartments?.map((d: any) => d.id) ||
          jobToEdit.eligibleDepartmentIds ||
          []
        );
        setSelectedSkills(
          jobToEdit.skills?.map((s: any) => s.id) ||
          jobToEdit.skillIds ||
          []
        );
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) setIsBranchOpen(false);
      if (skillRef.current && !skillRef.current.contains(event.target as Node)) setIsSkillOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch, editJobId, jobs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddCustomLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customLocation.trim();
    if (trimmed && !selectedLocations.includes(trimmed)) {
      setSelectedLocations(prev => {
        const newLocs = [...prev, trimmed];
        if (formErrors.location) {
          setFormErrors(errors => {
            const newErrors = { ...errors };
            delete newErrors.location;
            return newErrors;
          });
        }
        return newLocs;
      });
      setCustomLocation('');
    }
  };

  const removeLocation = (locToRemove: string) => {
    setSelectedLocations(prev => prev.filter(l => l !== locToRemove));
  };

  const selectLocationSuggestion = (loc: string) => {
    setSelectedLocations(prev => {
      const newLocs = prev.includes(loc)
        ? prev.filter(l => l !== loc)
        : [...prev, loc];
      
      if (newLocs.length > 0 && formErrors.location) {
        setFormErrors(errors => {
          const newErrors = { ...errors };
          delete newErrors.location;
          return newErrors;
        });
      }
      return newLocs;
    });
  };

  const toggleBranch = (branchId: number) => {
    setSelectedBranches(prev =>
      prev.includes(branchId) ? prev.filter(b => b !== branchId) : [...prev, branchId]
    );
    if (formErrors.branches) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.branches;
        return newErrors;
      });
    }
  };

  const selectAllBranches = () => {
    if (departments) {
      setSelectedBranches(departments.map((d: any) => d.id));
    }
  };

  const clearAllBranches = () => {
    setSelectedBranches([]);
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
    if (formErrors.skills) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const clearAllSkills = () => {
    setSelectedSkills([]);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "Job Title is required";
    if (selectedLocations.length === 0) errors.location = "At least one location is required";
    if (selectedBranches.length === 0) errors.branches = "At least one target branch is required";
    if (selectedSkills.length === 0) errors.skills = "At least one core skill is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields", { icon: <AlertCircle size={16} /> });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) return toast.error("Your account is pending verification.");
    if (!validateForm()) return;

    try {
      const payload = {
        title: formData.title.trim(),
        location: selectedLocations.join(', '),
        eligibleDepartmentIds: selectedBranches,
        skillIds: selectedSkills
      };

      if (editJobId) {
        await dispatch(updateCompanyJob({ id: parseInt(editJobId), data: payload })).unwrap();
        toast.success("Job Drive Updated!", {
          description: `${formData.title} details have been updated successfully.`,
          icon: <Rocket className="text-emerald-500" size={20} />,
        });
      } else {
        await dispatch(postJob(payload)).unwrap();
        toast.success("Job Drive Published!", {
          description: `${formData.title} is now active and hiring.`,
          icon: <Rocket className="text-emerald-500" size={20} />,
        });
      }
      navigate('/company/jobs');
    } catch (error: any) {
      console.error("Job Posting Error:", error);

      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        const backendErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          const path = err.path === 'eligibleDepartmentIds' ? 'branches' :
                       err.path === 'skillIds' ? 'skills' : err.path;
          backendErrors[path] = err.message;
        });
        setFormErrors(backendErrors);
        toast.error("Validation Failed", {
          description: "Please fix the highlighted errors on the fields.",
          icon: <AlertCircle className="text-destructive" size={20} />
        });
      } else {
        const errorMsg = error?.data?.message || error?.message || "An unexpected error occurred while publishing.";
        toast.error("Submission Failed", {
          description: errorMsg,
          icon: <X className="text-destructive" size={20} />
        });
      }
    }
  };

  const renderError = (field: string) => {
    if (!formErrors[field]) return null;
    return (
      <p className="text-[10px] font-black text-destructive mt-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300 uppercase tracking-wider">
        <AlertCircle size={10} strokeWidth={3} /> {formErrors[field]}
      </p>
    );
  };

  const filteredBranches = (departments || []).filter((dept: any) =>
    (dept.name || dept.deptName || '').toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredSkills = (skills || []).filter((skill: any) =>
    (skill.name || '').toLowerCase().includes(skillSearch.toLowerCase())
  );

  const locationSuggestions = ["Bangalore", "Mumbai", "Pune", "Hyderabad", "Noida", "Remote", "Hybrid"];

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="p-4 md:p-8">
        <div className="company-hero-banner relative overflow-hidden group rounded-3xl">
          <div className="hero-mesh">
            <div className="bubble-primary" />
            <div className="bubble-secondary" />
          </div>
          <div className="hero-texture" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="hero-badge cursor-pointer hover:bg-white/20 transition-all duration-300" onClick={() => navigate('/company/jobs')}>
                <ArrowLeft size={12} className="mr-1" />
                Back to Dashboard
              </div>
              <h1 className="hero-title text-2xl md:text-3xl font-extrabold text-white">
                {editJobId ? 'Refine Job Details' : 'Publish a Job Drive'}
              </h1>
              <p className="hero-description max-w-xl text-xs md:text-sm text-white/80">
                Setup your active recruitment workspace. Specify your role details, target academic branches, and tech skills to target candidates with perfect alignment.
              </p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hidden lg:flex items-center gap-3">
                <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Integration</h4>
                  <p className="text-[10px] text-white/65">Optimized 4-Field Setup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 1: Basic Role Information */}
            <div className="saas-card p-6 md:p-8 space-y-6 bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground tracking-tight">Role Identity</h2>
                  <p className="text-[11px] text-muted-foreground">Core details about the designation and workspace location.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="saas-label text-[11px] font-black uppercase tracking-wider">Job Title</label>
                  <div className="relative group">
                    <Briefcase className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formErrors.title ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} size={16} />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Manual Tester or Senior Frontend Developer"
                      className={`saas-input saas-input-with-icon w-full pl-11 ${formErrors.title ? 'border-destructive ring-4 ring-destructive/10' : ''}`}
                      required
                    />
                  </div>
                  {renderError('title')}
                </div>

                {/* Work Location */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">Work Location(s)</label>
                    <span className="text-[10px] text-muted-foreground italic font-medium">Add custom or click suggestions</span>
                  </div>
                  
                  {/* Selected Locations Container */}
                  <div className={`flex flex-wrap items-center gap-2 p-2.5 min-h-[48px] rounded-xl border transition-all bg-background ${formErrors.location ? 'border-destructive ring-4 ring-destructive/10' : 'border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10'}`}>
                    <MapPin className="text-muted-foreground ml-2" size={16} />
                    {selectedLocations.length === 0 && !customLocation && (
                      <span className="text-muted-foreground text-xs font-medium ml-2 select-none">No locations selected...</span>
                    )}
                    {selectedLocations.map(loc => (
                      <span key={loc} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-in zoom-in-95 duration-200">
                        {loc}
                        <X size={11} className="hover:bg-primary/20 rounded-full cursor-pointer transition-colors" onClick={() => removeLocation(loc)} />
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={selectedLocations.length > 0 ? "" : "Type location & press Enter..."}
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomLocation();
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-foreground font-semibold text-xs min-w-[120px] ml-2 placeholder:text-muted-foreground/50"
                    />
                    {customLocation.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddCustomLocation()}
                        className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline px-2"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  
                  {/* Location suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {locationSuggestions.map((loc) => {
                      const isSelected = selectedLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => selectLocationSuggestion(loc)}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/80 hover:text-foreground'
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                  {renderError('location')}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Academic & Technical Targeting */}
            <div className="saas-card p-6 md:p-8 space-y-6 bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl overflow-visible relative">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target size={16} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground tracking-tight">Academic & Tech Targeting</h2>
                  <p className="text-[11px] text-muted-foreground">Select candidate streams and required capabilities.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Eligible Departments / Target Branches */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">Eligible Departments</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={selectAllBranches} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Select All</button>
                      <span className="text-muted-foreground/30 text-[9px] font-bold">|</span>
                      <button type="button" onClick={clearAllBranches} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:underline">Clear</button>
                    </div>
                  </div>

                  <div className="relative" ref={branchRef}>
                    <div
                      onClick={() => setIsBranchOpen(!isBranchOpen)}
                      className={`flex flex-wrap items-center gap-2 p-2.5 min-h-[48px] rounded-xl border transition-all cursor-pointer bg-background ${isBranchOpen ? 'border-primary ring-4 ring-primary/10' : formErrors.branches ? 'border-destructive ring-4 ring-destructive/10' : 'border-border hover:border-primary/40'}`}
                    >
                      {selectedBranches.length === 0 && !branchSearch && (
                        <span className="text-muted-foreground text-xs font-medium ml-2">Choose eligible university courses...</span>
                      )}
                      {selectedBranches.map(id => {
                        const dept = departments.find((d: any) => d.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-lg text-[9px] font-bold uppercase tracking-wider animate-in zoom-in-95 duration-200">
                            {dept?.name || dept?.deptName}
                            <X size={11} className="hover:bg-black/20 rounded-full cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); toggleBranch(id); }} />
                          </span>
                        );
                      })}
                      <input
                        type="text"
                        placeholder={selectedBranches.length > 0 ? "" : "Search branches..."}
                        className="flex-1 bg-transparent border-none outline-none text-foreground font-semibold text-xs min-w-[100px] ml-2 placeholder:text-muted-foreground/50"
                        value={branchSearch}
                        onChange={(e) => { setBranchSearch(e.target.value); setIsBranchOpen(true); }}
                        onClick={(e) => { e.stopPropagation(); setIsBranchOpen(true); }}
                      />
                      <ChevronsUpDown size={14} className="text-muted-foreground ml-auto shrink-0" />
                    </div>
                    {renderError('branches')}

                    {isBranchOpen && (
                      <div
                        className="absolute z-[100] w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 custom-scrollbar overscroll-contain">
                          {loadingDepts ? (
                            <div className="p-8 text-center"><Loader size="sm" /></div>
                          ) : filteredBranches.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">No branches match query</div>
                          ) : (
                            filteredBranches.map((dept: any) => {
                              const isSelected = selectedBranches.includes(dept.id);
                              return (
                                <div
                                  key={dept.id}
                                  onClick={() => toggleBranch(dept.id)}
                                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all text-xs ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/10' : 'hover:bg-muted text-foreground font-semibold'}`}
                                >
                                  <span>{dept.name || dept.deptName}</span>
                                  {isSelected && <CheckCircle2 size={13} className="text-white" />}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="saas-label text-[11px] font-black uppercase tracking-wider">Required Skills</label>
                    {selectedSkills.length > 0 && (
                      <button type="button" onClick={clearAllSkills} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:underline">Clear All</button>
                    )}
                  </div>

                  <div className="relative" ref={skillRef}>
                    <div
                      onClick={() => setIsSkillOpen(!isSkillOpen)}
                      className={`flex flex-wrap items-center gap-2 p-2.5 min-h-[48px] rounded-xl border transition-all cursor-pointer bg-background ${isSkillOpen ? 'border-primary ring-4 ring-primary/10' : formErrors.skills ? 'border-destructive ring-4 ring-destructive/10' : 'border-border hover:border-primary/40'}`}
                    >
                      {selectedSkills.length === 0 && !skillSearch && (
                        <span className="text-muted-foreground text-xs font-medium ml-2">Choose core skills required...</span>
                      )}
                      {selectedSkills.map(id => {
                        const skill = skills.find((s: any) => s.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-in zoom-in-95 duration-200">
                            {skill?.name}
                            <X size={11} className="hover:bg-primary/20 rounded-full cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); toggleSkill(id); }} />
                          </span>
                        );
                      })}
                      <input
                        type="text"
                        placeholder={selectedSkills.length > 0 ? "" : "Search skills..."}
                        className="flex-1 bg-transparent border-none outline-none text-foreground font-semibold text-xs min-w-[100px] ml-2 placeholder:text-muted-foreground/50"
                        value={skillSearch}
                        onChange={(e) => { setSkillSearch(e.target.value); setIsSkillOpen(true); }}
                        onClick={(e) => { e.stopPropagation(); setIsSkillOpen(true); }}
                      />
                      <ChevronsUpDown size={14} className="text-muted-foreground ml-auto shrink-0" />
                    </div>
                    {renderError('skills')}

                    {isSkillOpen && (
                      <div
                        className="absolute z-[100] w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 custom-scrollbar overscroll-contain">
                          {loadingSkills ? (
                            <div className="p-8 text-center"><Loader size="sm" /></div>
                          ) : filteredSkills.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">No skills found</div>
                          ) : (
                            filteredSkills.map((skill: any) => {
                              const isSelected = selectedSkills.includes(skill.id);
                              return (
                                <div
                                  key={skill.id}
                                  onClick={() => toggleSkill(skill.id)}
                                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all text-xs ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/10' : 'hover:bg-muted text-foreground font-semibold'}`}
                                >
                                  <span>{skill.name}</span>
                                  {isSelected && <CheckCircle2 size={13} className="text-white" />}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3.5">
            <Info size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] md:text-xs text-primary/70 font-semibold leading-relaxed">
              Upon publishing, this job drive will be launched instantly across selected campus databases. Make sure designation and location configurations match the official offer criteria.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 border-t border-border/30 pt-6">
            <button
              type="button"
              onClick={() => navigate('/company/jobs')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs transition-all duration-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isApproved}
              className="group relative flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] transition-transform" />
              {isSubmitting ? (
                <><Loader size="sm" /> {editJobId ? 'Updating...' : 'Publishing...'}</>
              ) : (
                <>{editJobId ? 'Update Drive' : 'Publish Drive'} <Rocket size={14} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
