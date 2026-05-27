import { useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";
import { fetchUniversities } from "@/redux/thunks/superadmin/universityThunks";
import { fetchAdmins } from "@/redux/thunks/superadmin/adminThunks";
import { fetchCompanies } from "@/redux/thunks/superadmin/companyThunks";
import { motion } from "framer-motion";
const OnboardingFlow = ({ admins, companies, universities }: any) => {
  const steps = [
    {
      id: "admins",
      title: "Admin Approval",
      desc: "Verify institutional leads",
      icon: ShieldCheck,
      count: admins.filter((a: any) => a.user?.status === 'INACTIVE').length,
      status: admins.some((a: any) => a.user?.status === 'INACTIVE') ? 'attention' : 'completed'
    },
    {
      id: "universities",
      title: "Univ. Onboarding",
      desc: "Node activation requests",
      icon: Building2,
      count: universities.filter((u: any) => u.status === 'INACTIVE').length,
      status: universities.some((u: any) => u.status === 'INACTIVE') ? 'attention' : 'completed'
    },
    {
      id: "companies",
      title: "Company Access",
      desc: "Corporate partnership vetting",
      icon: Briefcase,
      count: companies.filter((c: any) => c.user?.status === 'INACTIVE').length,
      status: companies.some((c: any) => c.user?.status === 'INACTIVE') ? 'attention' : 'completed'
    },
    {
      id: "security",
      title: "System Integrity",
      desc: "All nodes operational",
      icon: Zap,
      count: 0,
      status: 'completed'
    }
  ];

  return (
    <div className="saas-card relative overflow-hidden bg-gradient-to-br from-card to-background border-border/40">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight">Onboarding Pipeline</h3>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">Pending registrations needing your review.</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 hidden lg:block" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative group">
              <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${step.status === 'attention'
                  ? 'bg-indigo-500/[0.03] border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                  : step.status === 'completed'
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                    : 'bg-muted/30 border-border/50'
                } group-hover:translate-y-[-4px]`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${step.status === 'attention'
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                      : step.status === 'completed'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    <step.icon className="size-6" />
                  </div>
                  {step.count > 0 && (
                    <span className="flex px-2 h-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/40 animate-pulse">
                      {step.count} PENDING
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-foreground mb-1.5 flex items-center gap-2">
                  {step.title}
                  {step.status === 'completed' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 hidden lg:flex">
                  <div className="size-7 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { universities, admins, companies } = useSelector((state: RootState) => state.superAdmin);

  useEffect(() => {
    dispatch(fetchUniversities());
    dispatch(fetchAdmins());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const stats = [
    { label: "Universities", value: universities.length.toString(), icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Global Admins", value: admins.length.toString(), icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Companies", value: companies?.length.toString() || "0", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Active Nodes", value: (universities.filter((u: any) => u.status === 'ACTIVE').length + admins.filter((a: any) => a.user?.status === 'ACTIVE').length).toString(), icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title={`Global Command Center, ${user?.firstname || "Super Admin"}`}
        description="Unified oversight and management of the entire CPMS ecosystem."
        badge="SuperAdmin Control"
        icon={LayoutDashboard}
        variant="indigo"
      />

      <div className="space-y-8 pb-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="saas-card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`size-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-foreground tabular-nums">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Onboarding Flow Visualization */}
        <OnboardingFlow admins={admins} universities={universities} companies={companies} />

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="saas-card h-full bg-gradient-to-br from-card to-background border-border/40 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Recent Registrations</h3>
                  <p className="text-xs font-medium text-muted-foreground">New institutional and corporate partners</p>
                </div>
              </div>

              <div className="relative z-10 overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      <th className="pb-2 px-4">Entity Name</th>
                      <th className="pb-2 px-4">Category</th>
                      <th className="pb-2 px-4">Joined On</th>
                      <th className="pb-2 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...universities.slice(0, 3), ...companies.slice(0, 3)]
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((entity: any, i: number) => (
                        <tr key={i} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4 bg-muted/20 border-y border-l border-border/50 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded-lg flex items-center justify-center ${entity.code ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {entity.code ? <Building2 className="size-4" /> : <Briefcase className="size-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-foreground">{entity.name}</p>
                                <p className="text-[10px] font-medium text-muted-foreground">{entity.code || entity.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 bg-muted/20 border-y border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {entity.code ? 'University' : 'Company'}
                            </span>
                          </td>
                          <td className="py-4 px-4 bg-muted/20 border-y border-border/50">
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              {new Date(entity.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="py-4 px-4 bg-muted/20 border-y border-r border-border/50 rounded-r-2xl text-right">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                              (entity.status === 'ACTIVE' || entity.user?.status === 'ACTIVE')
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {entity.status || entity.user?.status}
                            </span>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="saas-card h-full relative overflow-hidden bg-card text-card-foreground border-border/50 transition-all duration-500 hover:border-indigo-500/50">
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">System Broadcast</h3>
                </div>

                <div className="space-y-3 flex-1">
                  {[
                    { label: "Update Security Policy", icon: ShieldCheck, color: "bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/10 dark:border-indigo-500/20" },
                    { label: "Onboard University", icon: Building2, color: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 dark:border-emerald-500/20" },
                    { label: "System Maintenance", icon: Zap, color: "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10 dark:border-amber-500/20" }
                  ].map((action, i) => (
                    <button key={i} className={`w-full p-4 rounded-2xl ${action.color} border transition-all duration-300 flex items-center justify-between group`}>
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <action.icon className="size-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Protocol footer hidden */}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            </div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default SuperAdminDashboard;
