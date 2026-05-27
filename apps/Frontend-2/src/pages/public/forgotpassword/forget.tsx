import React, { useState, useEffect } from 'react';
import { Mail, ChevronLeft, ArrowRight, GraduationCap, Lock, ShieldCheck, KeyRound, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword, verifyOTP, resetPassword } from '../../../redux/thunks/forgotPasswordThunk';
import { toast } from 'sonner';
import type { AppDispatch } from '@/redux/store/store';
import { ModeToggle } from "@/components/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";

// Import Assets
import imgBG from "@/assets/img.jpg";

type FlowStep = 'EMAIL' | 'OTP' | 'RESET';

const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [step, setStep] = useState<FlowStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      await dispatch(forgotPassword(email.toLowerCase())).unwrap();
      toast.success("OTP sent successfully to your email");
      setStep('OTP');
      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");

    setIsLoading(true);
    try {
      await dispatch(verifyOTP({ email: email.toLowerCase(), otp })).unwrap();
      toast.success("OTP verified successfully");
      setStep('RESET');
    } catch (error: any) {
      toast.error(error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await dispatch(forgotPassword(email.toLowerCase())).unwrap();
      toast.success("OTP resent successfully");
      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error || "Failed to resend OTP");
      if (error === "OTP already sent. Please wait.") {
        setTimer(300);
        setCanResend(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setIsLoading(true);
    try {
      await dispatch(resetPassword({ email: email.toLowerCase(), newpassword: newPassword })).unwrap();
      toast.success("Password reset successful. Please login.");
      navigate('/login');
    } catch (error: any) {
      toast.error(error || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'EMAIL':
        return (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">University Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? "Sending Code..." : "Send Verification Code"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </motion.div>
        );
      case 'OTP':
        return (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verification OTP</label>
                <span className={`text-[11px] font-bold font-mono tracking-wider ${timer < 60 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm tracking-[0.2em] font-mono text-center"
                />
              </div>
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? "Verifying..." : "Verify Identity"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
            <div className="pt-2">
              <button
                type="button"
                disabled={!canResend || isLoading}
                onClick={handleResendOTP}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  canResend 
                    ? "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10" 
                    : "bg-slate-50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                {canResend ? (
                  <>
                    <RotateCcw size={14} />
                    Resend Code
                  </>
                ) : (
                  <>
                    Wait {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')} to Resend
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );
      case 'RESET':
        return (
          <motion.div
            key="reset-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? "Updating..." : "Reset My Password"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </motion.div>
        );
    }
  };

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
          <Link to="/" className="flex items-center gap-3 mb-16 w-fit hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Smart CPMS</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              Secure Your <span className="text-blue-500">Access</span> Point.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Follow the automated verification process to recover your account credentials and resume your professional journey.
            </p>

            <div className="space-y-6">
              {[
                "256-bit Secure Verification",
                "Automated Credential Recovery",
                "Multi-factor Identity Validation"
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

      {/* Right Column: Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-24 relative bg-white dark:bg-[#0b0f1a]">
        <div className="absolute top-12 right-12">
          <ModeToggle />
        </div>
        
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {step === 'EMAIL' ? 'Forgot Password' : step === 'OTP' ? 'Verify OTP' : 'Set New Password'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {step === 'EMAIL'
                ? "Enter your university email to receive a secure verification code."
                : step === 'OTP'
                  ? `We've sent a 6-digit code to your registered email address.`
                  : "Create a unique, high-entropy password to secure your account."}
            </p>
          </div>

          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          <div className="text-center pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              <ChevronLeft size={14} />
              Return to Login Gateway
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 text-center w-full px-6">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-[0.15em]">
            Secure Identity Protocol • Encrypted Session
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

