import React, { useEffect, useState } from 'react';
import { Search, GraduationCap, ArrowUpRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '@/redux/thunks/applicationThunk';
import type { RootState, AppDispatch } from '@/redux/store/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Loader from '@/components/Loader';

const Shortlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.application);
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchApplications(1));
  }, [dispatch]);


  // Transform and Filter Data
  const filteredData = safeApplications
    ?.filter((app: any) => app.status === "SHORTLISTED")
    ?.map((app: any) => ({
      ...app,
      branch: app.department?.name || "Other",
    }))
    ?.filter((item: any) => {
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (branchFilter === "All" || item.branch === branchFilter)
      );
    });

  // Get unique branches for filter
  const uniqueBranches = Array.from(
    new Set(
      safeApplications
        .filter((app: any) => app.status === "SHORTLISTED")
        .map((app: any) => app.department?.name)
        .filter(Boolean)
    )
  );

  if (loading) {
    return <Loader text="Loading shortlisted candidates..." />;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Shortlist Hero Section */}
      <div className="company-hero-banner group">
        <div className="hero-mesh">
          <div className="bubble-primary"></div>
          <div className="bubble-secondary"></div>
        </div>
        <div className="hero-texture"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="hero-badge">
              <GraduationCap size={12} className="text-white" /> 
              <span>Talent Pool</span>
            </div>
            <h1 className="hero-title">
              Shortlisted <span>Candidates</span> 🎯
            </h1>
            <p className="hero-description text-white/70">
              Review and manage high-potential students who have advanced to the next stages of your recruitment drive.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20">
            <div className="text-center px-4 border-r border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Total</p>
              <p className="text-3xl font-black text-white">{filteredData?.length || 0}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Disciplines</p>
              <p className="text-3xl font-black text-white">{uniqueBranches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-white/[0.08] shadow-xl shadow-primary/5">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] overflow-x-auto no-scrollbar w-full md:w-auto">
          <button
            onClick={() => setBranchFilter("All")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap",
              branchFilter === "All"
                ? "bg-white dark:bg-[#1e1f26] text-primary shadow-lg border border-slate-200/50 dark:border-white/10 scale-105"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Departments
          </button>
          {uniqueBranches.map((branch: any) => (
            <button
              key={branch}
              onClick={() => setBranchFilter(branch)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap",
                branchFilter === branch
                  ? "bg-white dark:bg-[#1e1f26] text-primary shadow-lg border border-slate-200/50 dark:border-white/10 scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {branch}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[350px] group px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 rounded-2xl transition-all font-black text-[11px] uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-card rounded-[3rem] border border-dashed border-border">
             <div className="relative mb-6">
                <Loader text="Analyzing Profiles..." />
             </div>
          </div>
        ) : filteredData?.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-card rounded-[3rem] border-4 border-dashed border-border/50 text-center group">
            <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 shadow-inner">
              <Search size={40} className="text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">No Matches Found</h3>
            <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xs mx-auto">We couldn't find any shortlisted candidates matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => { setBranchFilter('All'); setSearch(''); }}
              className="mt-8 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-12 px-8"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredData?.map((item: any) => (
            <div key={item.applicationId} className="group saas-card p-0 overflow-hidden border-2 border-border/30 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-primary/[0.02] bg-gradient-to-br from-card to-transparent">
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shadow-inner border border-primary/10 transition-transform group-hover:scale-110 group-hover:rotate-3">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 w-fit">
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-muted-foreground/40">
                    <GraduationCap size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">
                    <span>Department</span>
                    <span className="text-foreground">{item.branch}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">
                    <span>Email</span>
                    <span className="text-foreground lowercase truncate max-w-[180px]">{item.email}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-11 h-11 p-0 rounded-xl border-border/50 hover:bg-muted transition-colors">
                    <ArrowUpRight size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Shortlist;