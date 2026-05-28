import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/thunks/loginThunk";
import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import Assets
import imgBG from "@/assets/img.jpg";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const role = userType?.toLowerCase();
      const from = (location.state as any)?.from?.pathname;
      
      if (from && (
        (role === "admin" && from.startsWith("/admin")) ||
        (role === "student" && from.startsWith("/student")) ||
        (role === "company" && from.startsWith("/company")) ||
        ((role === "super_admin" || role === "superadmin") && from.startsWith("/superadmin"))
      )) {
        navigate(from, { replace: true });
      } else {
        if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else if (role === "student") navigate("/student/dashboard", { replace: true });
        else if (role === "company") navigate("/company/dashboard", { replace: true });
        else if (role === "super_admin" || role === "superadmin") {
          navigate("/superadmin/dashboard", { replace: true });
        }
      }
    }
  }, [isAuthenticated, userType, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter credentials");
    
    setIsLoading(true);
    try {
      await dispatch(loginUser({ email: email.toLowerCase(), password })).unwrap();
      toast.success("Signed in successfully");
    } catch (err: any) {
      // Handle both string error (from rejectWithValue) and object error
      const errorMessage = typeof err === 'string' ? err : (err?.message || "Invalid credentials");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#02040a] font-sans selection:bg-blue-500/30">
      
      {/* Left Column: Branding & Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={imgBG} 
            alt="Campus Architecture" 
            className="w-full h-full object-cover grayscale-[20%] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 w-fit hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Smart CPMS</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              Connect with <span className="text-blue-500">Elite</span> Opportunities.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              The professional bridge between top-tier talent and world-class organizations. Manage your career trajectory with precision.
            </p>

            <div className="space-y-6">
              {[
                "Advanced Career Tracking",
                "Verified Industry Partners",
                "Automated Application Workflows"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <ShieldCheck className="text-blue-500" size={14} />
                  </div>
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/5">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
            © 2024 Smart CPMS. Global Talent Ecosystem.
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-24 relative bg-white dark:bg-[#0b0f1a]">
        <div className="absolute top-12 right-12">
          <ModeToggle />
        </div>
        <motion.div  
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Enter your credentials to access your secure dashboard.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/Forgot" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  minLength={6}
                  maxLength={18}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? "Authenticating..." : "Sign In to Account"}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            <div className="text-center pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                  Create an Account
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Subtle Bottom Link */}
        {/* <div className="absolute bottom-12 text-center w-full px-6">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-[0.15em]">
            Secure Enterprise Gateway • AES-256 Encryption
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default SignIn;
