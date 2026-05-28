import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Globe, User, FileText, X, Mail, Link as LinkIcon, GraduationCap, Code2, CheckCircle2, Building2 } from "lucide-react";
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import Loader from "@/components/Loader";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAPI } from "@/apis/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").or(z.literal("")).nullable(),
  githubUrl: z.string().url("Invalid GitHub URL").or(z.literal("")).nullable(),
  portfolioUrl: z.string().url("Invalid Portfolio URL").or(z.literal("")).nullable(),
  stats: z.object({
    cgpa: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "CGPA cannot be negative").max(10, "CGPA must be 10 or less").optional()),
    year: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1, "Year must be at least 1").max(5, "Year must be 5 or less")),
    passingYear: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(2000, "Invalid year").max(2100, "Invalid year")),
    activeBacklogs: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(0, "Cannot be negative").default(0)),
    university: z.string().optional(),
  }),
  resumeUrl: z.string("Please upload your resume first").url("Please upload your resume first"),
});

type SkillOption = {
  id: number;
  name: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const ProfileEditDialog = ({ isOpen, onClose, profile, onSave, isLoading, isApproved }: any) => {
  const [formData, setFormData] = useState<any>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [allSkillsList, setAllSkillsList] = useState<SkillOption[]>([]);

  const { upload } = useCloudinaryUpload();

  useEffect(() => {
    if (isOpen && profile) {
      const newFormData = {
        name: profile.name || "",
        email: profile.email || "",
        stats: {
          activeBacklogs: profile.stats?.activeBacklogs ?? profile.activeBacklogs ?? '',
          cgpa: profile.stats?.cgpa ?? profile.cgpa ?? '',
          year: profile.stats?.year ?? profile.year ?? '',
          passingYear: profile.stats?.passingYear ?? profile.passingYear ?? '',
          university: profile.stats?.university ?? (profile.university?.name || ''),
        },
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        resumeUrl: profile.resumeUrl || "",
        skills: profile.skills || [],
        experiences: profile.experiences || [],
        certificates: profile.certificates || [],
        projects: profile.projects || [],
      };
      setFormData(newFormData);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsRes = await getAPI<ApiResponse<SkillOption[]>>("/skills/get-all").catch(() => null);
        if (skillsRes) {
          setAllSkillsList(Array.isArray(skillsRes.data) ? skillsRes.data : []);
        }
      } catch (error) {
        setAllSkillsList([]);
      }
    };
    if (isOpen) {
      void fetchData();
    }
  }, [isOpen]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const updateStat = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      stats: { ...prev.stats, [field]: value }
    }));
    if (errors[`stats.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`stats.${field}`];
      setErrors(newErrors);
    }
  };

  const addSkill = (skill: string | SkillOption) => {
    const skillName = typeof skill === 'string' ? skill.trim() : skill.name;
    const skillId = typeof skill === 'string' ? undefined : skill.id;
    if (!skillName) return;
    if (formData.skills?.some((s: any) => s.name.toLowerCase() === skillName.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      skills: [...(prev.skills || []), { id: skillId, name: skillName }]
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      profileSchema.parse(formData);
      const res = await onSave(formData);
      if (res?.success) onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        const issues = err.issues || (err as any).errors || [];
        issues.forEach((e: any) => {
          const path = e.path.join(".");
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
        toast.error("Please check the form for errors");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden p-0 bg-background dark:bg-slate-950 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-none rounded-[2rem] flex flex-col">
        <DialogHeader className="p-10 pb-6 bg-gradient-to-br from-[#f8faff] to-[#ffffff] dark:from-slate-900 dark:to-slate-950 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Identity & Profile</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm font-medium">Configure your professional and academic presence.</DialogDescription>
              </div>
            </div>
            <div className="hidden md:flex px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 items-center gap-2">
               <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Self-Editing Mode</span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="flex gap-6 border-b mb-6 bg-transparent p-0">
                {[
                  { value: "personal", label: "Identity", icon: User },
                  { value: "academic", label: "Records", icon: GraduationCap },
                  { value: "social", label: "Networks", icon: Globe },
                  { value: "skills", label: "Abilities", icon: Code2 }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="pb-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground rounded-none bg-transparent shadow-nonetransition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:shadow-primary/10 font-bold text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* PERSONAL CONTENT */}
              <TabsContent value="personal" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Legal Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        className={`pl-12 h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-semibold ${errors.name ? 'border-rose-500 bg-rose-500/5' : ''}`}
                        value={formData.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors.name}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Institutional Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        className={`pl-12 h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-semibold ${errors.email ? 'border-rose-500 bg-rose-500/5' : ''}`}
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors.email}</p>}
                  </div>
                </div>
              </TabsContent>

              {/* ACADEMIC CONTENT */}
              <TabsContent value="academic" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="university" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Affiliated University (Read Only)</Label>
                    <div className="relative group opacity-80">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                      <Input
                        id="university"
                        className="pl-12 h-13 rounded-2xl border-border/50 bg-muted/40 dark:bg-slate-900/50 focus:ring-0 focus:border-border/50 font-bold"
                        value={formData.stats?.university || "Not Affiliated"}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="cgpa" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Current Cumulative GPA</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="0.00"
                      className={`h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-black tabular-nums ${errors['stats.cgpa'] ? 'border-rose-500 bg-rose-500/5' : ''}`}
                      value={formData.stats?.cgpa || ""}
                      onChange={(e) => updateStat("cgpa", e.target.value)}
                    />
                    {errors['stats.cgpa'] && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors['stats.cgpa']}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="year" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Current Year of Study</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1"
                      max="5"
                      className={`h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-black tabular-nums ${errors['stats.year'] ? 'border-rose-500 bg-rose-500/5' : ''}`}
                      value={formData.stats?.year || ""}
                      onChange={(e) => updateStat("year", e.target.value)}
                    />
                    {errors['stats.year'] && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors['stats.year']}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="passingYear" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Graduation Batch (Year)</Label>
                    <Input
                      id="passingYear"
                      type="number"
                      min="2000"
                      className={`h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-black tabular-nums ${errors['stats.passingYear'] ? 'border-rose-500 bg-rose-500/5' : ''}`}
                      value={formData.stats?.passingYear || ""}
                      onChange={(e) => updateStat("passingYear", e.target.value)}
                    />
                    {errors['stats.passingYear'] && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors['stats.passingYear']}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="activeBacklogs" className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Active Backlogs Count</Label>
                    <Input
                      id="activeBacklogs"
                      type="number"
                      min="0"
                      placeholder="0"
                      className={`h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-black tabular-nums ${errors['stats.activeBacklogs'] ? 'border-rose-500 bg-rose-500/5' : ''}`}
                      value={formData.stats?.activeBacklogs ?? ""}
                      onChange={(e) => updateStat("activeBacklogs", e.target.value)}
                    />
                    {errors['stats.activeBacklogs'] && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors['stats.activeBacklogs']}</p>}
                  </div>
                </div>
              </TabsContent>

              {/* SOCIAL CONTENT */}
              <TabsContent value="social" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 gap-8">
                  {[
                    { id: "linkedinUrl", label: "LinkedIn Profile URL", icon: LinkIcon, placeholder: "https://linkedin.com/in/username" },
                    { id: "githubUrl", label: "GitHub Portfolio URL", icon: Code2, placeholder: "https://github.com/username" },
                    { id: "portfolioUrl", label: "Personal Website URL", icon: Globe, placeholder: "https://yourportfolio.com" }
                  ].map((social) => (
                    <div key={social.id} className="space-y-3">
                      <Label htmlFor={social.id} className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">{social.label}</Label>
                      <div className="relative group">
                        <social.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id={social.id}
                          placeholder={social.placeholder}
                          className={`pl-12 h-13 rounded-2xl border-border/50 bg-background focus:ring-primary/20 focus:border-primary transition-all font-semibold ${errors[social.id] ? 'border-rose-500 bg-rose-500/5' : ''}`}
                          value={formData[social.id] || ""}
                          onChange={(e) => updateField(social.id, e.target.value)}
                        />
                      </div>
                      {errors[social.id] && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors[social.id]}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* SKILLS CONTENT */}
              <TabsContent value="skills" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Stack Expansion</Label>
                    <select
                      className="flex h-13 w-full rounded-2xl border border-border/50 bg-background px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm hover:border-primary/30"
                      value=""
                      onChange={(e) => {
                        const selectedSkill = allSkillsList.find(s => s.id === parseInt(e.target.value));
                        if (selectedSkill) addSkill(selectedSkill);
                      }}
                    >
                      <option value="" disabled>Select technical credentials to add...</option>
                      {allSkillsList.map(skill => (
                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border/50 min-h-[160px] flex flex-wrap gap-3 items-start content-start">
                    {formData.skills?.length > 0 ? (
                      formData.skills.map((skill: any, i: number) => (
                        <Badge key={i} className="pl-4 pr-1.5 py-2 rounded-xl bg-background border border-border shadow-sm text-foreground flex items-center gap-2 group/skill hover:border-primary transition-all">
                          <span className="text-xs font-black uppercase tracking-tight">{skill.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="size-6 rounded-lg hover:bg-rose-500 hover:text-white transition-all" 
                            onClick={() => removeSkill(i)}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      ))
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-6 opacity-40">
                         <Code2 className="size-10 mb-2" />
                         <p className="text-xs font-semibold text-muted-foreground">No abilities indexed yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="bg-border/50" />

            {/* RESUME SECTION */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-muted-foreground text-muted-foreground ml-1">Carrier-Grade Resume (PDF Only, Max 10MB)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-3xl bg-primary/[0.03] border border-primary/10">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const url = await upload(file, "resumes");
                      if (url) {
                        updateField("resumeUrl", url);
                        toast.success("Identity verified with document");
                      }
                    } catch (error) {
                      toast.error("Handshake failed during upload");
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
                
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${formData.resumeUrl ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                   {formData.resumeUrl ? <CheckCircle2 className="size-6" /> : <FileText className="size-6" />}
                </div>

                <div className="flex-1">
                   <p className="text-sm font-black text-foreground mb-0.5">{formData.resumeUrl ? 'PDF Synced' : 'Awaiting Document'}</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formData.resumeUrl ? 'Cloud reference active' : 'PDF format required (Max 10MB)'}</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl bg-background border-border hover:bg-muted font-bold text-xs uppercase tracking-widest gap-2 shadow-sm"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader size="sm" /> : <Upload className="size-3.5" />}
                  {formData.resumeUrl ? "Replace PDF" : "Push PDF"}
                </Button>
              </div>
              {errors.resumeUrl && <p className="text-[10px] text-rose-500 font-black uppercase ml-1 tracking-wider">{errors.resumeUrl}</p>}
            </div>
          </div>
        </form>

        <DialogFooter className="p-10 bg-gradient-to-t from-muted/30 to-transparent border-t border-border/50 shrink-0 gap-4">
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted transition-all">Discard</Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="rounded-2xl bg-primary hover:bg-primary/90 h-14 px-12 font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/30 active:scale-95 transition-all flex-1 md:flex-none"
            disabled={isLoading || isUploading || !isApproved}
          >
            {isLoading ? <Loader size="sm" /> : "Commit Profile Updates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;