import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  GraduationCap,
  ChevronDown,
  Building2,
  Search,
  Filter,
  IndianRupee,
  ChevronRight,
  Target,
  Clock,
  Info,
  Calendar,
  Trophy,
} from 'lucide-react';
import Loader from '@/components/Loader';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '@/redux/thunks/driveThunk';
import { fetchCompanies } from '@/redux/thunks/companyThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import { cn } from '@/lib/utils';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DriveStatus {
  label: string;
  color: string;
  bg: string;
  dot: string;
}

interface Department {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  location?: string;
}

interface Job {
  id: number;
  title: string;
  description?: string;
  salary?: number | string | null;
  salaryRange?: number | string | null;
  location?: string | null;
  status?: string;
  minCgpa?: number | null;
  maxCgpa?: number | null;
  maxBacklogs?: number | null;
  interviewScheduleId?: number | null;
  createdAt?: string;
  sentAt?: string;
  companyId?: number;
  company?: Company;
  eligibleDepartments?: Department[];
}

const statusConfig: Record<string, DriveStatus> = {
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  upcoming: { label: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500' },
  completed: { label: 'Closed', color: 'text-muted-foreground', bg: 'bg-muted/30 border-border', dot: 'bg-muted-foreground' },
};

const PlacementDriveManagement: React.FC = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState('All Drives');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<number, boolean>>({});

  const dispatch = useDispatch<AppDispatch>();
  const { jobs: reduxJobs, loading } = useSelector((state: RootState) => state.drive);
  const { companies } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchJobs({ status: 'APPROVED' }));
    dispatch(fetchCompanies({ limit: 500 }));
  }, [dispatch]);

  const toggleCompany = (companyId: number) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  const processedDrives = useMemo(() => {
    const now = new Date();

    const enrichedJobs = reduxJobs.map((row: Job & Record<string, unknown>) => {
      const j = (row as { job?: Job }).job;
      const title = j?.title ?? row.title;
      
      const companyIdFromJob = j?.companyId ?? row.companyId;
      const foundCompany = companies.find(c => c.id === companyIdFromJob);
      const company = j?.company ?? row.company ?? foundCompany;
      const scheduleDate = row.sentAt
        ? new Date(row.sentAt)
        : row.createdAt
          ? new Date(row.createdAt)
          : null;

      const rowStatus = (row as { status?: string }).status;
      let status: 'active' | 'completed' | 'upcoming' = 'active';
      if (rowStatus === 'CLOSED' || rowStatus === 'REJECTED') {
        status = 'completed';
      } else if (scheduleDate && scheduleDate.getTime() - now.getTime() > 14 * 24 * 60 * 60 * 1000) {
        status = 'upcoming';
      }

      const salaryValue = row.salary || row.salaryRange;
      const formattedSalary = salaryValue
        ? `${Number(salaryValue).toLocaleString('en-IN')}`
        : 'N/A';

      const depts = j?.eligibleDepartments ?? row.eligibleDepartments;

      return {
        ...row,
        title,
        company,
        eligibleDepartments: depts,
        createdAt: (row as { sentAt?: string }).sentAt ?? row.createdAt,
        salary: row.salary,
        status,
        formattedSalary,
        formattedDate: scheduleDate
          ? scheduleDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'TBD',
        departments:
          Array.isArray(depts) ? depts.map((d: Department) => d.name).filter(Boolean) : [],
      };
    });

    const filteredJobs = enrichedJobs.filter(job => {
      const matchesFilter = activeFilter === 'All Drives' || job.status.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    const groups: Record<number, { company: Company, jobs: any[] }> = {};
    filteredJobs.forEach(job => {
      const companyId = job.company?.id || (job as any).job?.companyId || (job as any).companyId;
      if (!companyId) return;

      if (!groups[companyId]) {
        groups[companyId] = {
          company: job.company || { id: companyId, name: `Company #${companyId}` } as Company,
          jobs: []
        };
      }
      groups[companyId].jobs.push(job);
    });

    return Object.values(groups);
  }, [reduxJobs, companies, activeFilter, searchQuery]);

  return (
    <AdminPageLayout>
      <PageHeader
        title="Placement Drives"
        description="Oversee and facilitate the complete lifecycle of corporate recruitment drives."
        badge="Campaign Engine"
        icon={Trophy}
        variant="amber"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-9 bg-background/50 border-border rounded-xl h-10 text-sm focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-auto overflow-visible">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full lg:w-auto flex items-center justify-between gap-3 h-10 rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest px-4"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-primary" />
                    {activeFilter}
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 bg-popover border border-border rounded-2xl shadow-2xl p-1.5 z-[9999]">
                {['All Drives', 'Active', 'Upcoming', 'Completed'].map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => {
                      setActiveFilter(opt);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer focus:bg-primary focus:text-primary-foreground",
                      activeFilter === opt
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {opt}
                    {activeFilter === opt && <div className="size-1.5 bg-current rounded-full" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </PageHeader>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Drives', value: reduxJobs.length, icon: Trophy, color: 'primary', bg: 'bg-primary/10', text: 'text-primary' },
          { label: 'Active Brands', value: processedDrives.length, icon: Building2, color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
          { label: 'Interviews', value: reduxJobs.filter((job: Job) => !!job.interviewScheduleId).length, icon: Calendar, color: 'indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="saas-card flex items-center gap-4 p-4 md:p-6">
            <div className={cn("size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center border shrink-0", stat.bg, stat.text, `border-${stat.color}-500/20`)}>
              <stat.icon className="size-5 md:size-6" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && reduxJobs.length === 0 ? (
        <div className="py-32 flex justify-center">
          <Loader text="Gathering placement drive details..." />
        </div>
      ) : (
        <div className="space-y-8">
          {processedDrives.length > 0 ? (
            processedDrives.map((group) => {
              const isExpanded = expandedCompanies[group.company.id] ?? true;

              return (
                <div key={group.company.id} className="space-y-4">
                  {/* Company Row */}
                  <button
                    onClick={() => toggleCompany(group.company.id)}
                    className={cn(
                      "w-full flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-3xl md:rounded-[2rem] text-left transition-all duration-300",
                      "bg-card border border-border hover:border-primary/20 shadow-sm group",
                      !isExpanded && "opacity-80 grayscale-[0.2]"
                    )}
                  >
                    <div className="size-12 md:size-16 bg-muted/50 rounded-xl md:rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/30 transition-all shadow-sm shrink-0">
                      <Building2 className="size-6 md:size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                        <h2 className="text-base md:text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                          {group.company.name}
                        </h2>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2 py-0.5">
                          {group.jobs.length} {group.jobs.length === 1 ? 'Job' : 'Jobs'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 text-muted-foreground overflow-hidden">
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium shrink-0">
                          <MapPin className="size-3 md:size-3.5" />
                          {group.company.location || 'PAN India'}
                        </div>
                        <div className="hidden sm:block size-1 bg-border rounded-full shrink-0" />
                        <p className="hidden sm:block text-[10px] md:text-xs font-medium truncate text-muted-foreground/70">
                          {group.company.description || "Corporate recruitment partner."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <div className={cn(
                        "size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center border transition-all",
                        isExpanded ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/50 border-border text-muted-foreground"
                      )}>
                        <ChevronDown className={cn("size-4 md:size-5 transition-transform duration-500", !isExpanded && "-rotate-90")} />
                      </div>
                    </div>
                  </button>

                  {/* Jobs Grid */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 pl-3 md:pl-4 border-l-2 border-border ml-4 md:ml-8 py-2">
                          {group.jobs.map((job) => {
                            const config = statusConfig[job.status];
                            return (
                              <motion.div
                                key={job.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="saas-card relative group/job p-4 md:p-6"
                              >
                                <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4">
                                      <div className="space-y-1">
                                        <h3 className="text-base md:text-lg font-bold text-foreground group-hover/job:text-primary transition-colors tracking-tight">
                                          {job.title}
                                        </h3>
                                        <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border shadow-sm", config.bg, config.color)}>
                                          <div className={cn("size-1 rounded-full animate-pulse", config.dot)} />
                                          {config.label}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                                        {(job.departments?.length ? job.departments : ['All Depts']).slice(0, 2).map((dept: string) => (
                                          <Badge key={dept} variant="outline" className="bg-muted/30 border-border text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-2.5 whitespace-normal h-auto text-center leading-tight break-words max-w-full">
                                            {dept}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 md:mb-6 font-medium">
                                      {job.description || "No description provided."}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-9">
                                      <div className="space-y-2">
                                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2.5">
                                          <IndianRupee className="size-2.5 md:size-3 text-emerald-500" /> Package
                                        </p>
                                        <p className="text-xs md:text-sm font-bold text-foreground">{job.formattedSalary} LPA</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                          <Target className="size-2.5 md:size-3 text-indigo-500" /> Eligibility
                                        </p>
                                        <p className="text-xs md:text-sm font-bold text-foreground">{job.minCgpa ?? 'No'} CGPA</p>
                                      </div>
                                      {/* <div className="space-y-1">
                                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                          <Users className="size-2.5 md:size-3 text-violet-500" /> Applicants
                                        </p>
                                        <p className="text-xs md:text-sm font-bold text-foreground">{job._count?.applications || 0} Applied</p>
                                      </div> */}
                                      <div className="space-y-1">
                                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                          <Calendar className="size-2.5 md:size-3 text-amber-500" /> Posted
                                        </p>
                                        <p className="text-xs md:text-sm font-bold text-foreground">{job.formattedDate}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex xl:flex-col items-stretch xl:justify-center gap-3 md:gap-4 xl:pl-8 xl:border-l border-border min-w-full md:min-w-[160px]">
                                    <Button
                                      onClick={() => { setSelectedJob(job); setIsDetailsOpen(true); }}
                                      className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                    >
                                      Review Drive
                                      <ChevronRight className="size-3 md:size-3.5 ml-1.5" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-32 text-center saas-card border-dashed bg-muted/5 border-2">
              <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <Search className="size-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                Try adjusting your filters or search keywords to find the drive.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSearchQuery(''); setActiveFilter('All Drives'); }}
                className="rounded-xl px-8 border-border font-bold text-xs uppercase tracking-widest h-11"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Drive Specification"
        maxWidth="sm:max-w-3xl"
      >
        {selectedJob && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                  <Building2 className="size-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-foreground tracking-tight uppercase leading-none truncate">
                    {selectedJob.company?.name}
                  </h2>
                  <p className="text-[10px] font-black text-primary pt-2 tracking-[0.2em] uppercase truncate">
                    {selectedJob.title}
                  </p>
                </div>
              </div>
              <div className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm shrink-0", statusConfig[selectedJob.status].bg, statusConfig[selectedJob.status].color)}>
                {statusConfig[selectedJob.status].label}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Package', value: `${selectedJob.formattedSalary} LPA`, icon: IndianRupee, color: 'emerald', bg: 'bg-emerald-500/10' },
                { label: 'Location', value: selectedJob.location || 'Remote', icon: MapPin, color: 'rose', bg: 'bg-rose-500/10' },
                { label: 'CGPA Limit', value: `${selectedJob.minCgpa ?? 'N/A'}`, icon: GraduationCap, color: 'indigo', bg: 'bg-indigo-500/10' },
                { label: 'Backlogs', value: selectedJob.maxBacklogs ?? 'None', icon: Clock, color: 'amber', bg: 'bg-amber-500/10' }
              ].map((item, idx) => (
                <div key={idx} className="p-5 bg-muted/30 rounded-2xl border border-border group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    <item.icon className={cn("size-3.5", `text-${item.color}-500`)} /> {item.label}
                  </div>
                  <p className="text-lg font-black text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                <Info className="size-4 text-primary" /> Comprehensive Description
              </div>
              <div className="p-8 bg-muted/20 border border-border rounded-[2.5rem]">
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line font-medium">
                  {selectedJob.description || "No detailed description provided for this placement drive."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                <Target className="size-4 text-indigo-500" /> Target Departments
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedJob.departments?.length ? selectedJob.departments : ['All Specializations']).map((dept: string) => (
                  <Badge key={dept} variant="outline" className="px-5 py-2.5 rounded-xl border-border bg-background text-[10px] font-black uppercase tracking-widest text-primary">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={() => setIsDetailsOpen(false)}
                className="px-12 h-12 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Close Specification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminPageLayout>
  );
};

export default PlacementDriveManagement;