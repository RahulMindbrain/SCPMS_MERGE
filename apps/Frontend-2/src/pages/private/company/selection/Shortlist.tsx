import React, { useEffect, useState } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobApplications } from '@/redux/thunks/companyThunk';
import type { RootState, AppDispatch } from '@/redux/store/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Loader from '@/components/Loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamic avatar gradient generator based on candidate's name for visual aesthetic consistency
const getAvatarGradient = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-indigo-500 to-purple-500 text-indigo-50 dark:from-indigo-600 dark:to-purple-600 ring-indigo-100/80 dark:ring-indigo-950/20',
    'from-emerald-400 to-teal-650 text-emerald-50 dark:from-emerald-500 dark:to-teal-700 ring-emerald-100/80 dark:ring-emerald-950/20',
    'from-pink-500 to-rose-500 text-pink-50 dark:from-pink-600 dark:to-rose-600 ring-pink-100/80 dark:ring-pink-950/20',
    'from-amber-400 to-orange-500 text-amber-50 dark:from-amber-500 dark:to-orange-600 ring-amber-100/80 dark:ring-amber-950/20',
    'from-blue-500 to-cyan-550 text-blue-50 dark:from-blue-600 dark:to-cyan-600 ring-blue-100/80 dark:ring-blue-950/20',
    'from-violet-500 to-fuchsia-500 text-violet-50 dark:from-violet-600 dark:to-fuchsia-600 ring-violet-100/80 dark:ring-violet-950/20'
  ];
  return gradients[hash % gradients.length];
};

const Shortlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.company);
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchJobApplications({}));
  }, [dispatch]);


  // Transform and Filter Data
  const filteredData = safeApplications
    ?.filter((app: any) => app.status === "SHORTLISTED")
    ?.map((app: any) => ({
      ...app,
      name: `${app.student?.user?.firstname || ''} ${app.student?.user?.lastname || ''}`.trim() || "Candidate",
      branch: app.student?.department?.name || "Other",
      email: app.student?.user?.email || "",
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
        .map((app: any) => app.student?.department?.name)
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md border border-border/80 p-4.5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-top-2 duration-500 delay-200">
        
        {/* Department Filter Dropdown */}
        <div className="min-w-[200px] w-full md:w-auto">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full h-[46px] bg-background/50 border-border/60 rounded-2xl text-[10px] font-black uppercase tracking-wider px-4 hover:border-primary/30 transition-all shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Departments" />
              </div>
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)] min-w-[220px] rounded-2xl border-border shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
              <SelectItem value="All" className="rounded-xl py-2 focus:bg-primary/5">
                <span className="font-bold text-[10px] uppercase tracking-wider">All Departments</span>
              </SelectItem>
              {uniqueBranches.map((branch: any) => (
                <SelectItem key={branch} value={branch} className="rounded-xl py-2 focus:bg-primary/5">
                  <span className="font-bold text-[10px] uppercase tracking-wider">{branch}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-[350px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background/50 hover:bg-background/80 focus:bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm shadow-xs"
          />
        </div>
      </div>      {/* Candidate Table Container */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center bg-card rounded-[3rem] border border-dashed border-border">
          <div className="relative mb-6">
            <Loader text="Analyzing Profiles..." />
          </div>
        </div>
      ) : filteredData?.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center bg-card rounded-[3rem] border-4 border-dashed border-border/50 text-center group">
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
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Verified CGPA</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hiring Status</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Round</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((item: any) => {
                  const gradClasses = getAvatarGradient(item.name);
                  const initials = item.name
                    .split(" ")
                    .map((n: any) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2) || "ST";

                  return (
                    <tr 
                      key={item.applicationId} 
                      className="border-b border-zinc-150/40 dark:border-zinc-850/40 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-all duration-200 group"
                    >
                      {/* Candidate Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs tracking-tight bg-gradient-to-br shrink-0 ring-2 ring-offset-2 ring-offset-background", gradClasses)}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-primary transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground lowercase truncate block">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {item.branch}
                        </span>
                      </td>

                      {/* Verified CGPA */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-black text-violet-650 bg-violet-500/5 dark:bg-violet-500/10 dark:text-violet-400 rounded-lg border border-violet-500/10">
                          {item.student?.cgpa || 'N/A'}
                        </span>
                      </td>

                      {/* Hiring Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/10">
                          {item.status}
                        </span>
                      </td>

                      {/* Current Round */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg border border-violet-500/10">
                          {item.currentRound || 'Aptitude'}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border",
                          item.student?.isPlaced 
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10" 
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                        )}>
                          {item.student?.isPlaced ? "Placed" : "Available"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shortlist;