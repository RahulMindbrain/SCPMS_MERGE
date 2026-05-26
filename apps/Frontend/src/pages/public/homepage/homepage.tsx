import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Zap,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Calendar,
  FileText,
  Mail,
  CheckCircle2,
  Building2,
  LogOut,
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import type { LucideIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/redux/thunks/logoutThunk';
import type { RootState } from '@/redux/reducers/rootReducer';
import { toast } from 'sonner';
import heroImg from '@/assets/hero.png';
import dashboardImg from '@/assets/dashboard.png';
import partnersImg from '@/assets/partners.png';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, userType } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser() as any);
    toast.success("Logged out successfully", { id: "logout-toast" });
    navigate('/', { replace: true });
  };

  const getDashboardLink = () => {
    if (!userType) return '/';
    return `/${userType.toLowerCase()}/dashboard`;
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const y = section.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#02040a] font-sans selection:bg-teal-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-[#0b0f1a]/80 dark:backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-3 shadow-sm' : 'bg-transparent py-5'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 shadow-lg shadow-blue-500/20">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className={`text-xl font-extrabold tracking-tight ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-950 dark:text-white'}`}>
                Smart CPMS
              </span>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <div className="flex items-center gap-8">
                {['Features', 'Portals', 'Stats'].map((item) => (
                  <button key={item}
                    type="button"
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'}`}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-6 ml-4 border-l border-slate-200/20 dark:border-white/10 pl-6">
                <ModeToggle />
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className={`text-sm font-bold ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-950 dark:text-white'} hover:text-blue-500 transition-colors`}>
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-gradient-to-br from-blue-700 to-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      Get Started <ArrowRight size={16} />
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      to={getDashboardLink()}
                      className={`flex items-center gap-2 py-1.5 px-3 rounded-full border transition-all ${scrolled
                        ? 'bg-blue-50 border-blue-100 text-blue-700'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'}`}>
                        {user?.firstname?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-bold whitespace-nowrap">Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`p-2 rounded-lg transition-all ${scrolled ? 'text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-white/10'}`}
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <button className={`p-2 ${scrolled || isMenuOpen ? 'text-slate-900 dark:text-white' : 'text-slate-950 dark:text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden fixed inset-0 z-[60] bg-white dark:bg-[#02040a] transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="h-[100dvh] flex flex-col justify-between p-4 bg-gradient-to-b from-white dark:from-[#02040a] via-blue-50 dark:via-blue-900/10 to-white dark:to-[#02040a] relative overflow-hidden">
            {/* Dedicated Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-2xl bg-white dark:bg-[#0b0f1a] shadow-xl border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white active:scale-95 transition-all z-50"
            >
              <X size={24} />
            </button>

            {/* Top Content Area */}
            <div className="space-y-6 pt-12">
              {/* Header */}
              <div className="mt-4 space-y-3 text-center">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                  <GraduationCap size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Portal Navigation</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Smart CPMS</h1>
              </div>

              {/* Glassmorphism Card */}
              <div className="bg-white/90 dark:bg-[#0b0f1a]/90 backdrop-blur-md shadow-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-3">
                {[
                  { label: 'Features', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Core platform capabilities' },
                  { label: 'Portals', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Access stakeholder dashboards' },
                  { label: 'Stats', icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Real-time placement data' }
                ].map((item) => (
                  <button key={item.label}
                    type="button"
                    onClick={() => { scrollToSection(item.label.toLowerCase()); setIsMenuOpen(false); }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all w-full group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner group-active:scale-90 transition-transform`}>
                        <item.icon size={26} />
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200 block leading-tight">{item.label}</span>
                        <span className="text-xs text-slate-400 font-medium">{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-200 dark:text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="space-y-3 pb-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-4 text-lg font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl active:scale-95 transition-all">
                    Sign In
                  </Link>
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}
                    className="py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/25 active:scale-95 transition-all w-full">
                    Get Started Now
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-2xl group active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                        {user?.firstname?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-0.5">{userType}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{user?.firstname} {user?.lastname}</p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 py-4 text-lg font-bold text-red-600 border border-red-100 bg-red-50 rounded-2xl active:scale-95 transition-all w-full"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[100dvh] flex items-center pt-24 pb-20 sm:pt-32 sm:pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Light Mode Mesh */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 dark:bg-blue-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] dark:opacity-20 brightness-100"></div>

          {/* Light Mode Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Next-Gen Placement Platform</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white mb-6 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Bridge the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Education & Industry</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                A unified digital hub for Admins, Students, and Companies.
                Automate recruitment workflows, track real-time analytics, and secure dream careers.
              </p>

              <div className="flex flex-col xs:flex-row gap-4 items-center justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                <button
                  onClick={() => navigate(isAuthenticated ? getDashboardLink() : '/login')}
                  className="w-full xs:w-auto group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full xs:w-auto px-8 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Explore Features
                </button>
              </div>
            </div>

            <div className="flex-1 relative animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                  <img
                    src={heroImg}
                    alt="Campus Placement Success"
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 dark:from-slate-900/60 via-transparent to-transparent"></div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <CheckCircle2 className="text-green-600 dark:text-green-500" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">92%</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hiring Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section Overlay */}
      <section id="stats" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-24">
        <div className="bg-white dark:bg-[#0b0f1a]/80 dark:backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <StatItem value="570+" label="Registered Students" />
            <StatItem value="42" label="Partner Companies" border="border-l dark:border-white/5" />
            <StatItem value="340+" label="Students Placed" border="border-t lg:border-t-0 lg:border-l dark:border-white/5" />
            <StatItem value="₹8.2L" label="Avg Package" border="border-l border-t lg:border-t-0 dark:border-white/5" />
          </div>
        </div>
      </section>

      {/* "Everything You Need" Feature Grid */}
      <section id="features" className="py-12 sm:py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Everything You Need</h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              A complete suite of tools to digitize and automate your campus placement process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <FeatureCard
              icon={BarChart3}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="Real-Time Analytics"
              desc="Track placement stats, department performance, and salary trends with interactive dashboards."
            />
            <FeatureCard
              icon={ShieldCheck}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              title="Role-Based Access"
              desc="Secure JWT-based authentication with separate portals for Admins, students, and companies."
            />
            <FeatureCard
              icon={Zap}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-500"
              title="Auto Eligibility"
              desc="Automatically filter students by CGPA, branch, and backlogs — only eligible candidates can apply."
            />
            <FeatureCard
              icon={Calendar}
              iconBg="bg-blue-50"
              iconColor="text-blue-700"
              title="Interview Scheduling"
              desc="Centralized calendar for placement drives, preventing scheduling conflicts across companies."
            />
            <FeatureCard
              icon={FileText}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              title="Digital Portfolios"
              desc="Standardized student profiles and automated resume validation for easier evaluation."
            />
            <FeatureCard
              icon={Mail}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              title="Automated Alerts"
              desc="Instant email and push notifications for drive updates, shortlisting, and final offers."
            />
          </div>

          {/* Visual Showcase Section */}
          <div className="mt-24 lg:mt-32 relative">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[3rem]"></div>
            <div className="relative bg-white dark:bg-[#0b0f1a] border border-slate-100 dark:border-white/5 rounded-[3rem] p-4 sm:p-8 lg:p-12 shadow-2xl overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Powerful Analytics at Your Fingertips
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                    Monitor every aspect of your placement drive with our intuitive, real-time dashboard. From eligibility tracking to final offers, keep everyone on the same page.
                  </p>
                  <ul className="space-y-4">
                    <CheckListItem text="Dynamic filtering by CGPA & branch" />
                    <CheckListItem text="Real-time application status tracking" />
                    <CheckListItem text="Instant placement statistics & reports" />
                  </ul>
                </div>
                <div className="flex-1 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                  <img
                    src={dashboardImg}
                    alt="Analytics Dashboard"
                    className="relative rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 transform transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Built for Everyone" Portals Section */}
      <section id="portals" className="relative py-12 sm:py-20 md:py-24 bg-slate-50/50 dark:bg-[#02040a] transition-colors duration-500 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03),transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">Built for Everyone</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Dedicated portals tailored for each stakeholder in the placement ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            <PortalCard
              icon={Users}
              iconColor="bg-blue-600"
              title="Admin"
              desc="Manage drives, approve profiles, monitor analytics, and orchestrate the entire placement lifecycle."
              buttonText="Admin Portal"
              navigateTo="/login?role=admin"
            />

            <PortalCard
              icon={GraduationCap}
              iconColor="bg-gradient-to-br from-teal-500 to-emerald-500"
              title="Students"
              desc="Build your portfolio, track eligibility, apply to drives, and follow your application status in real time."
              buttonText="Student Portal"
              navigateTo="/login?role=student"
            />

            <PortalCard
              icon={Building2}
              iconColor="bg-indigo-700"
              title="Companies"
              desc="Post job descriptions, filter candidates by criteria, schedule interviews, and update selection results."
              buttonText="Company Portal"
              navigateTo="/login?role=company"
            />
          </div>
        </div>
      </section>

      {/* "Why Go Digital?" Section */}
      <section className="relative py-12 sm:py-20 md:py-24 bg-white dark:bg-[#02040a] transition-colors duration-500 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center">
            <div className="flex-1 w-full">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 sm:mb-8 leading-tight tracking-tight">Why Go Digital?</h2>
              <ul className="space-y-6">
                <CheckListItem text="Zero paperwork — from registration to offer letters" />
                <CheckListItem text="Centralized data prevents duplicate entries & fake records" />
                <CheckListItem text="Full transparency — students know their status at every stage" />
                <CheckListItem text="Mobile-first design for on-the-go access" />
                <CheckListItem text="Automated eligibility filtering saves hours of manual work" />
              </ul>
            </div>

            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-teal-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src={partnersImg}
                alt="Corporate Partnerships"
                className="relative rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 transform transition-all duration-700 group-hover:scale-105"
              />

              <div className="absolute -top-12 -right-8 hidden md:block">
                <div className="bg-[#1e293b] rounded-2xl p-6 text-center text-white shadow-2xl animate-float">
                  <div className="text-3xl font-black text-blue-400 mb-1">₹24 LPA</div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Highest Package</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-none relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white mb-6 leading-tight tracking-tight">
            Ready to Transform Your Placements?
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the smart campus revolution. Get started in minutes — no setup complexity, just pure results.
          </p>
          <Link
            to="/signup"
            className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-10 py-5 rounded-2xl font-extrabold text-lg inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/10"
          >
            Get Started Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-[#02040a] border-t border-slate-200 dark:border-white/5 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Smart CPMS</span>
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
            © 2026 Mindbrain Pvt. Ltd. Crafted with precision for the next generation.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const StatItem = ({ value, label, border }: { value: string, label: string, border?: string }) => (
  <div className={`p-6 sm:p-8 md:p-10 text-center flex flex-col justify-center items-center h-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px] border-slate-100 dark:border-white/5 ${border || ''}`}>
    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0369a1] dark:text-blue-400 mb-1 sm:mb-2 tracking-tight">{value}</div>
    <div className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, iconBg, iconColor, title, desc }: {
  icon: LucideIcon,
  iconBg: string,
  iconColor: string,
  title: string,
  desc: string
}) => (
  <div className="relative bg-white dark:bg-[#0b0f1a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:translate-y-[-8px] transition-all duration-500 group overflow-hidden">
    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-[2.5rem] pointer-events-none"></div>
    <div className={`w-14 h-14 ${iconBg} dark:bg-blue-500/10 ${iconColor} dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-700 dark:text-slate-400 leading-relaxed text-sm font-medium">
      {desc}
    </p>
  </div>
);

const CheckListItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-4">
    <div className="mt-1 flex-shrink-0">
      <CheckCircle2 className="text-blue-600 dark:text-blue-400 w-5 h-5" />
    </div>
    <span className="text-slate-600 dark:text-slate-200 font-medium">{text}</span>
  </li>
);

const PortalCard = ({
  icon: Icon,
  iconColor,
  title,
  desc,
  buttonText,
  navigateTo
}: {
  icon: LucideIcon,
  iconColor: string,
  title: string,
  desc: string,
  buttonText: string,
  navigateTo: string
}) => {

  const navigate = useNavigate();

  return (
    <div className="relative bg-white dark:bg-[#0b0f1a] p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 text-center flex flex-col items-center group">
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-[2.5rem] pointer-events-none"></div>

      <div className={`w-16 h-16 sm:w-20 sm:h-20 ${iconColor} rounded-[2rem] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
        <Icon size={32} className="text-white" />
      </div>

      <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4 tracking-tight">{title}</h3>

      <p className="text-slate-700 dark:text-slate-400 leading-relaxed mb-10 text-sm font-medium">
        {desc}
      </p>

      <button
        onClick={() => navigate(navigateTo)}
        className="mt-auto px-8 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 transition-all flex items-center gap-2 group/btn"
      >
        {buttonText}
        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>

    </div>
  );
};


export default HomePage;