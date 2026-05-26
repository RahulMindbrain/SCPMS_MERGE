import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ChevronLeft, ArrowRight, GraduationCap, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";

// Import Assets
import imgBG from "@/assets/img.jpg";

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex bg-white dark:bg-[#02040a] font-sans selection:bg-blue-500/30">
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white dark:bg-[#0b0f1a]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-500/5 border border-green-500/20">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restored</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your credentials have been successfully updated. Your account is now secure.
              </p>
            </div>
            <Link 
              to="/login" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            >
              Sign In to Account
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#02040a] font-sans selection:bg-blue-500/30">
      
      {/* Left Column: Branding & Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgBG} 
            alt="Campus Architecture" 
            className="w-full h-full object-cover grayscale-[20%] brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90"></div>
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
              Fortify Your <span className="text-blue-500">Security</span> Level.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Create a new, high-security password for your professional ecosystem access.
            </p>

            <div className="space-y-6">
              {[
                "Hardware-grade Encryption",
                "Strict Complexity Protocols",
                "Instant Global Sync"
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

      {/* Right Column: Form */}
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Initialize your new secure credentials for account access.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
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

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-white/10">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Complexity Guide:</p>
              <ul className="text-[11px] text-slate-600 dark:text-slate-500 space-y-1 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Minimum 8 characters length
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  One specialized character (!@#$%^&*)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? "Updating Security..." : "Confirm New Password"}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            <div className="text-center pt-4">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <ChevronLeft size={14} />
                Abort and Return
              </Link>
            </div>
          </form>
        </motion.div>

        <div className="absolute bottom-12 text-center w-full px-6">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-[0.15em]">
            Identity Verification • Encrypted Transaction
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
