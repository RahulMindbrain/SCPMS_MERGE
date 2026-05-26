import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Check,
  ChevronLeft,
  EyeOff,
  Eye,
  FileText,
  Building2,
  CalendarClock,
  Calendar,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../redux/store/store";
import type { RootState } from "../../../redux/reducers/rootReducer";
import { registerUser } from "../../../redux/thunks/registerThunk";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDepartments } from "../../../redux/thunks/departmentThunk";
import { fetchUniversities } from "../../../redux/thunks/superadmin/universityThunks";
// Import Assets
import campBG from "@/assets/camp.jpg";

type RegisterRole = "STUDENT" | "COMPANY";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(1);
  const [activeRole, setActiveRole] = useState<RegisterRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    description: "",

    departmentId: "",
    universityId: "",
    year: "",
    passingYear: "",

  });
const { universities, loading: univLoading } = useSelector((state: RootState) => state.superAdmin);
const { departments, loading: deptLoading } = useSelector((state: RootState) => state.department);
useEffect(() => {
  dispatch(fetchUniversities());
}, [dispatch]);
  useEffect(() => {
    if (isAuthenticated) {
      const role = userType?.toLowerCase();
      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "student") navigate("/student/dashboard", { replace: true });
      else if (role === "company") navigate("/company/dashboard", { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "fullName" && value !== "" && !/^[a-zA-Z\s]*$/.test(value)) {
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleRoleSelect = (role: RegisterRole) => {
    setActiveRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    if (!form.fullName.trim()) return toast.error("Full name is required");
    if (!form.email.trim()) return toast.error("Email address is required");
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match");

    if (!passwordRegex.test(form.password)) {
      return toast.error("Password must contain uppercase and lowercase letters");
    }

    const names = form.fullName.trim().split(/\s+/);
    if (names.length < 2)
      return toast.error("Please enter first and last name");

    const firstname = names[0];
    const lastname = names.slice(1).join(" ");

    const payload: any = {
      firstname,
      lastname,
      email: form.email.toLowerCase(),
      password: form.password,
      role: activeRole,

      ...(activeRole === "COMPANY" && {
        company: {
          name: form.companyName,
          description: form.description,
        },
      }),

      ...(activeRole === "STUDENT" && {
        student: {
          departmentId: form.departmentId ? Number(form.departmentId) : null,
          universityId: form.universityId ? Number(form.universityId) : null,
          year: form.year ? Number(form.year) : null,
          passingYear: form.passingYear ? Number(form.passingYear) : null,

        },
      }),
    };

    setIsSubmitting(true);

    try {
      await dispatch(registerUser(payload)).unwrap();
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      console.log(err);
      toast.error(err?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

useEffect(() => {
  if (form.universityId) {
    dispatch(fetchDepartments(form.universityId));
  }
}, [form.universityId, dispatch]);
  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#02040a] font-sans selection:bg-blue-500/30">

      {/* Left Column: Branding & Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={campBG}
            alt="Campus Lifestyle"
            className="w-full h-full object-cover grayscale-[10%] brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/60 to-blue-950/80"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Smart CPMS</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              The Hub for <span className="text-blue-500">Future</span> Leaders.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Join thousands of professionals and organizations in a streamlined, automated career management ecosystem.
            </p>

            <div className="grid grid-cols-1 gap-8">
              {[
                { title: "Direct Pipeline", desc: "Connect directly with hiring decision makers." },
                { title: "Smart Matching", desc: "AI-driven role recommendations based on your profile." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Check className="text-blue-500" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/5">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
            Enterprise Standard Security • AES-256
          </p>
        </div>
      </div>

      {/* Right Column: Registration Flow */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-20 relative bg-white dark:bg-[#0b0f1a]">
        <div className="absolute top-12 right-12">
          <ModeToggle />
        </div>
        <div className="w-full max-w-lg space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Select your primary role to begin the registration process.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <RoleCard
                    icon={GraduationCap}
                    title="Student"
                    desc="Apply to roles and build your career."
                    active={activeRole === "STUDENT"}
                    onClick={() => handleRoleSelect("STUDENT")}
                  />
                  <RoleCard
                    icon={Briefcase}
                    title="Company"
                    desc="Post jobs and hire top talent."
                    active={activeRole === "COMPANY"}
                    onClick={() => handleRoleSelect("COMPANY")}
                  />
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Already registered?{" "}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                      Sign In to Workspace
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col gap-6">
                  <button
                    onClick={() => setStep(1)}
                    className="group flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 w-fit transition-colors"
                  >
                    <ChevronLeft size={16} /> Back to roles
                  </button>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Details for {activeRole === "STUDENT" ? "Student" : "Company"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Please provide your professional information below.
                    </p>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5">
                    {activeRole === "COMPANY" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Organization Name</label>
                          <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Microsoft" className={inputClasses(false)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Description</label>
                          <div className="relative group">
                            <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Tell us about your organization..." className={inputClasses(true)} />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="John Doe" className={inputClasses(false)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" className={inputClasses(false)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2 relative group">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
                        <Lock className="absolute left-4 top-[46px] -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required placeholder="••••••••" className={inputClasses(false)}  minLength={6} maxLength={18}/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[46px] -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="space-y-2 relative group">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm</label>
                        <Lock className="absolute left-4 top-[46px] -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} required placeholder="••••••••" className={inputClasses(false)} minLength={6} maxLength={18} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[46px] -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>


                    {activeRole === "STUDENT" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">University</label>
                          <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <select
                              name="universityId"
                              value={form.universityId}
                              onChange={handleChange}
                              required
                              className={inputClasses(false)}
                              disabled={univLoading}
                            >
                              <option value="">
                                {univLoading ? "Loading Universities..." : "Select University"}
                              </option>
                              {universities?.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Department</label>
                          <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                              <select
                                name="departmentId"
                                value={form.departmentId}
                                onChange={handleChange}
                                required
                                className={inputClasses(false)}
                                disabled={!form.universityId || deptLoading}
                              >
                                <option value="">
                                  {deptLoading ? "Loading Departments..." : "Select Department"}
                                </option>
                                {departments?.map((d: any) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                          </div>
                        </div>

                      <div className="space-y-2">
  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
    Current Year
  </label>
  <div className="relative group">
    <CalendarClock
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
      size={18}
    />
    <input
      type="number"
      name="year"
      value={form.year}
      onChange={handleChange}
      required
      min="1"
      max="10"
      placeholder="Year (e.g. 4)"
      className={inputClasses(false)}
    />
  </div>
</div>

<div className="space-y-2">
  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
    Passing Year
  </label>
  <div className="relative group">
    <Calendar
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
      size={18}
    />
    <input
      type="number"
      name="passingYear"
      value={form.passingYear}
      onChange={handleChange}
      required
      min="2000"
      max="2100"
      placeholder="2026"
      className={inputClasses(false)}
    />
  </div>
</div>
                      </>
                    )}






                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] mt-4"
                  >
                    {isSubmitting ? "Creating Account..." : "Complete Registration"}
                    {!isSubmitting && <ArrowRight size={18} />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ icon: Icon, title, desc, active, onClick }: any) => (
  <button
    onClick={onClick}
    type="button"
    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden ${active
      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 shadow-xl shadow-blue-500/10"
      : "border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-white/20 shadow-md hover:shadow-xl"
      }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 dark:bg-white/5 text-slate-500"
      }`}>
      <Icon size={20} />
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{title}</h3>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{desc || "Click to select this role"}</p>
    </div>
    {active && (
      <div className="absolute top-4 right-4 bg-blue-600 rounded-full p-1 shadow-lg">
        <Check size={12} className="text-white" strokeWidth={4} />
      </div>
    )}
  </button>
);

const inputClasses = (isTextArea: boolean) => `
  w-full pl-11 pr-4 ${isTextArea ? 'py-4 min-h-[120px] resize-none' : 'py-3.5'} 
  bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl 
  text-slate-900 dark:text-white placeholder-slate-400 outline-none 
  focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm
`;

export default SignUp;