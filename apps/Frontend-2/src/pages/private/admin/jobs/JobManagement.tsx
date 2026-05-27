import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  XCircle,
  MapPin,
  IndianRupee,
  Search,
  Clock,
  ExternalLink,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListChecks,
  Building,
  Target,
  FileText,
  UserCheck,
  Calendar,
  Users,
  ArrowUpRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, updateJobStatus } from '@/redux/thunks/driveThunk';
import { fetchCompanies } from '@/redux/thunks/companyThunk';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLES = {
  PENDING: {
    color: 'amber',
    icon: Clock,
  },
  APPROVED: {
    color: 'emerald',
    icon: CheckCircle2,
  },
  REJECTED: {
    color: 'rose',
    icon: XCircle,
  },
} as const;

const STATUS_FLOW = ['PENDING', 'APPROVED', 'REJECTED'];

const isBackward = (current: string, next: string) => {
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);
  if (currentIndex === -1 || nextIndex === -1) return false;
  // Cannot move back to PENDING once APPROVED or REJECTED
  if (current !== 'PENDING' && next === 'PENDING') return true;
  return false;
};

const AdminJobManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, meta, loading } = useSelector((state: RootState) => state.drive);
  const { companies: reduxCompanies } = useSelector((state: RootState) => state.company);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy ] = useState<string>('newest');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get('companyId') || 'all';
  const [filterCompany, setFilterCompany] = useState<string>(initialCompany);

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Rejection Dialog State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectJobIds, setRejectJobIds] = useState<number[]>([]);
  const [rejectReason, setRejectReason] = useState('');

  const handleInitiateReject = (ids: number[], currentStatuses?: string[]) => {
    if (currentStatuses?.some(curr => isBackward(curr, 'REJECTED'))) {
      toast.error("Process integrity: Job status cannot be moved backward to Pending");
      return;
    }
    setRejectJobIds(ids);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    const toastId = toast.loading("Processing rejection...");
    try {
      await dispatch(
        updateJobStatus({ jobIds: rejectJobIds, status: 'REJECTED', reason: rejectReason.trim() }),
      ).unwrap();
      toast.success("Job(s) rejected successfully", { id: toastId });
      setIsRejectModalOpen(false);
      setIsDetailsModalOpen(false);
      dispatch(fetchJobs({ status: activeTab, page, limit: PAGE_LIMIT }));
    } catch (error: any) {
      toast.error(error || "Failed to reject job(s)", { id: toastId });
    }
  };

  const handleShowDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchCompanies({ limit: 100 })); // Fetch companies for filter
  }, [dispatch]);

  useEffect(() => {
    const params: any = { status: activeTab, page, limit: PAGE_LIMIT };
    if (filterCompany !== 'all') {
      params.companyId = Number(filterCompany);
    }
    dispatch(fetchJobs(params));
  }, [dispatch, activeTab, page, filterCompany]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleStatusUpdate = async (jobUniversityIds: number[], status: string, currentStatuses?: string[]) => {
    if (currentStatuses?.some(curr => isBackward(curr, status))) {
      toast.error("Process integrity: Job status cannot be moved backward to Pending");
      return;
    }
    const toastId = toast.loading(`Processing ${status.toLowerCase()}...`);
    try {
      await dispatch(
        updateJobStatus({ jobIds: jobUniversityIds, status }),
      ).unwrap();
      toast.success(`Job(s) ${status.toLowerCase()} successfully`, { id: toastId });
      dispatch(fetchJobs({ status: activeTab, page, limit: PAGE_LIMIT }));
    } catch (error: any) {
      toast.error(error || "Failed to update job status", { id: toastId });
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    const getSalaryValue = (salary: unknown): number => {
      if (typeof salary === 'number') return salary;
      if (typeof salary === 'string') {
        const parsed = parseInt((salary.match(/\d+/g) || []).join(''), 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    let result = (Array.isArray(jobs) ? jobs : []).filter((row) => {
      const title = row.job?.title ?? "";
      const uniName = row.university?.name ?? "";
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uniName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterDepartment !== 'all') {
      result = result.filter((row) =>
        (Array.isArray(row.job?.eligibleDepartments) ? row.job.eligibleDepartments : []).some(
          (dept: { id: number; name?: string }) =>
            (dept?.name?.toLowerCase() === filterDepartment.toLowerCase()) ||
            (dept?.id?.toString() === filterDepartment)
        ),
      );
    }

    if (filterLocation !== 'all') {
      result = result.filter((row) =>
        (row.job?.location ?? "")
          .toLowerCase()
          .includes(filterLocation.toLowerCase()),
      );
    }

    result = [...result].map(row => {
      const companyId = row.job?.companyId ?? row.companyId;
      const foundCompany = reduxCompanies.find(c => c.id === companyId);
      return {
        ...row,
        displayCompany: row.job?.company || foundCompany
      };
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.sentAt || b.id).getTime() - new Date(a.sentAt || a.id).getTime();
      if (sortBy === 'oldest') return new Date(a.sentAt || a.id).getTime() - new Date(b.sentAt || b.id).getTime();
      if (sortBy === 'salary-high') {
        const salaryA = getSalaryValue(a.salary);
        const salaryB = getSalaryValue(b.salary);
        return salaryB - salaryA;
      }
      return 0;
    });

    return result;
  }, [jobs, searchTerm, sortBy, filterDepartment, filterLocation, reduxCompanies]);

  const locations = useMemo(() => {
    const locs = new Set(
      (Array.isArray(jobs) ? jobs : [])
        .map((j) => j.job?.location)
        .filter(Boolean),
    );
    return Array.from(locs);
  }, [jobs]);

  const departments = useMemo(() => {
    const allDepartments = (Array.isArray(jobs) ? jobs : []).flatMap((j) =>
      Array.isArray(j.job?.eligibleDepartments) ? j.job.eligibleDepartments : [],
    );
    const names = allDepartments.map((dept: { id: number; name?: string }) => dept?.name || `Dept #${dept.id}`).filter(Boolean);
    return Array.from(new Set(names));
  }, [jobs]);

  return (
    <AdminPageLayout>
      <PageHeader
        title="Job Moderation"
        description="Review and manage job listings submitted by corporate partners."
        badge="Recruitment Ops"
        icon={ListChecks}
        variant="sky"
      >
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-9 bg-background/50 border-border rounded-xl h-10 text-sm focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-8">
        <div className="flex bg-slate-100/80 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full xl:w-auto overflow-visible scrollbar-hide shadow-inner">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
            const config = STATUS_STYLES[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive
                  ? `bg-white dark:bg-slate-700 text-${config.color}-600 dark:text-${config.color}-400 shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-600`
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/30'
                  }`}
              >
                <config.icon className={`size-3.5 ${isActive ? `text-${config.color}-500` : 'text-slate-300 dark:text-slate-600'}`} />
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
<div className="relative z-40 flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-full xl:w-auto">

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[150px] h-9 rounded-xl sm:w-[130px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
                <Filter className="size-3 mr-2 text-slate-400" />
                <SelectValue placeholder="Dept" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-50 rounded-xl border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Depts</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-[10px] font-bold uppercase tracking-widest">{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[150px] h-9 rounded-xl sm:w-[130px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
                <MapPin className="size-3 mr-2 text-slate-400" />
                <SelectValue placeholder="Loc" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-50 rounded-xl border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc || 'Remote'} className="text-[10px] font-bold uppercase tracking-widest">{loc || 'Remote'}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[150px] h-9 rounded-xl sm:w-[130px] h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
                <Building2 className="size-3 mr-2 text-slate-400" />
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-50 rounded-xl border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Jobs</SelectItem>
                {reduxCompanies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id.toString()} className="text-[10px] font-bold uppercase tracking-widest">{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {loading ? (
          <div className="col-span-full py-32 flex justify-center">
            <Loader text="Retrieving job listings..." />
          </div>
        ) : filteredAndSortedJobs.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredAndSortedJobs.map((row) => (
              <motion.div
                layout
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.06)] p-4 sm:p-5 flex flex-col transition-all duration-300 overflow-hidden h-full"
              >
                {/* Status Badge & Actions Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      row.status === 'PENDING' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        row.status === 'APPROVED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450"
                    )}>
                      <span className={cn(
                        "size-1.5 rounded-full shrink-0",
                        row.status === 'PENDING' ? "bg-amber-500 animate-pulse" :
                          row.status === 'APPROVED' ? "bg-emerald-500" : "bg-rose-500"
                      )} />
                      {row.status === 'PENDING' ? 'Pending Review' : row.status}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0">
                        <MoreVertical className="size-3.5 text-slate-400 dark:text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className=" z-50 rounded-xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                      <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest text-rose-500 cursor-pointer p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10">
                        Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Job Title & Company Header */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 group-hover:text-primary transition-colors line-clamp-1 tracking-tight" title={row.job?.title ?? '—'}>
                    {row.job?.title ?? '—'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={row.displayCompany?.name}>
                      {row.displayCompany?.name ?? 'Unknown Company'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]" title={row.university?.name}>
                      {row.university?.name}
                    </span>
                  </div>
                </div>

                {/* Key Info Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-[11px] font-semibold text-slate-650 dark:text-slate-350">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/60">
                    <MapPin className="size-3 text-slate-400 shrink-0" />
                    <span>{row.job?.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <IndianRupee className="size-3 shrink-0" />
                    <span>{(row.salary / 100000).toFixed(1)} LPA</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-950/20 px-2 py-0.5 rounded border border-blue-100/50 dark:border-blue-900/30 text-blue-700 dark:text-blue-400">
                    <Users className="size-3 shrink-0" />
                    <span>{row.openings} Openings</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-450 dark:text-slate-500 ml-auto text-[10px] font-normal">
                    <Calendar className="size-3 shrink-0" />
                    <span>{new Date(row.sentAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Eligibility Indicators */}
                <div className="flex items-center gap-4 mb-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-2 px-3">
                  <div className="flex items-center gap-2">
                    <Target className="size-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">Min CGPA</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.minCgpa}</span>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/60" />
                  <div className="flex items-center gap-2">
                    <XCircle className="size-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">Max Backlogs</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.maxBacklogs}</span>
                    </div>
                  </div>
                </div>

                {/* Brief Notes / Description */}
                <div className="mb-3">
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium line-clamp-2" title={row.description}>
                    {row.description || "Exciting opportunity to join a high-growth team focused on innovation and scale. Looking for passionate candidates."}
                  </p>
                </div>

                {/* Department Tags */}
                <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                  {(Array.isArray(row.job?.eligibleDepartments) ? row.job.eligibleDepartments : []).slice(0, 2).map((dept: any, idx: number) => (
                    <Badge
                      key={dept.id || idx}
                      variant="outline"
                      className="bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 font-semibold text-[9px] tracking-wide px-2 py-0.5 rounded whitespace-normal h-auto text-left leading-tight break-words max-w-full"
                    >
                      {typeof dept === 'object' ? (dept.name || `Dept #${dept.id}`) : dept}
                    </Badge>
                  ))}
                  {(row.job?.eligibleDepartments?.length ?? 0) > 2 && (
                    <Badge variant="outline" className="bg-slate-100/30 dark:bg-slate-800/30 border-slate-200/40 dark:border-slate-700/40 text-slate-400 dark:text-slate-500 font-semibold text-[9px] tracking-wide px-2 py-0.5 rounded">
                      +{(row.job?.eligibleDepartments?.length ?? 0) - 2}
                    </Badge>
                  )}
                </div>

                {/* CTA Action Buttons */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {row.status === 'PENDING' ? (
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="link"
                        className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors h-8 p-0 flex items-center gap-0.5 shrink-0"
                        onClick={() => handleShowDetails(row)}
                      >
                        Review details
                        <ArrowUpRight size={11} className="shrink-0" />
                      </Button>
                      <div className="flex gap-1.5 ml-auto">
                        <Button
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-8 px-3.5 font-bold uppercase tracking-wider text-[9px] active:scale-95 transition-all shadow-sm shadow-emerald-500/10"
                          onClick={() => handleStatusUpdate([row.id], 'APPROVED', [row.status])}
                          disabled={isBackward(row.status, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-450 hover:bg-rose-500/5 rounded-lg h-8 px-3.5 font-bold uppercase tracking-wider text-[9px] active:scale-95 transition-all"
                          onClick={() => handleInitiateReject([row.id], [row.status])}
                          disabled={isBackward(row.status, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 h-8">
                      <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                        row.status === 'APPROVED' ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-600" : "border-rose-500/15 bg-rose-500/5 text-rose-600")}>
                        {row.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        className="text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors flex items-center gap-1 px-3 h-8 rounded-lg"
                        onClick={() => handleShowDetails(row)}
                      >
                        View Specifications
                        <ExternalLink size={11} className="opacity-60 shrink-0" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center saas-card border-dashed bg-muted/10 text-center">
            <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mb-6">
              <Briefcase className="size-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No listings found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8">
              We couldn't find any job listings matching your current criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('all');
                setFilterLocation('all');
                setFilterCompany('all');
              }}
              className="rounded-xl px-8 border-border font-bold text-xs uppercase tracking-widest h-11"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredAndSortedJobs.length > 0 && (
        <div className="flex items-center justify-between pt-12">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Showing <span className="text-foreground">{filteredAndSortedJobs.length}</span> of{' '}
            <span className="text-foreground">{meta?.total ?? filteredAndSortedJobs.length}</span> listings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl size-10 p-0 border-border"
              disabled={(meta?.page ?? page) <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20">
              {meta?.page ?? page}
            </div>
            <Button
              variant="outline"
              className="rounded-xl size-10 p-0 border-border"
              disabled={(meta?.page ?? page) >= (meta?.totalPages ?? 1)}
              onClick={() => setPage(prev => Math.min(prev + 1, meta?.totalPages ?? prev))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Job Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Job Specification Details"
        subtitle="Comprehensive breakdown of the job opportunity and institutional requirements"
        maxWidth="max-w-4xl"
      >
        {selectedJob && (
          <div className="space-y-10 py-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-indigo-600 dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Briefcase size={120} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="size-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-xl">
                  {selectedJob.displayCompany?.logo ? (
                    <img src={selectedJob.displayCompany.logo} alt="" className="size-14 object-contain" />
                  ) : (
                    <Building2 className="size-10 text-white/60" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedJob.job?.title}</h2>
                  <p className=" bg-white/10  font-bold uppercase tracking-widest text-xs mt-1">
                    {selectedJob.displayCompany?.name} • {selectedJob.university?.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 relative z-10">
                <Badge className={cn(
                  "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]",
                  selectedJob.status === 'APPROVED' ? "bg-emerald-500 text-white" :
                    selectedJob.status === 'PENDING' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {selectedJob.status}
                </Badge>

              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: MapPin, label: "Location", value: selectedJob.job?.location || 'Remote', color: 'slate' },
                { icon: IndianRupee, label: "Salary Package", value: `${(selectedJob.salary / 100000).toFixed(1)} LPA`, color: 'emerald' },
                { icon: UserCheck, label: "Min. CGPA", value: selectedJob.minCgpa, color: 'blue' },
                { icon: Clock, label: "Max Backlogs", value: selectedJob.maxBacklogs, color: 'amber' }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-3">
                  <div className={`size-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 shadow-sm`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <FileText size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Description</h4>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                    {selectedJob.job?.description || selectedJob.description || "No job description provided."}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Target size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Skills & Expertise</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.job?.skills || []).map((skill: any) => (
                      <Badge key={skill.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Building size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Target Depts</h4>
                  </div>
                  <div className="space-y-2">
                    {(selectedJob.job?.eligibleDepartments || selectedJob.eligibleDepartments || []).map((dept: any, idx: number) => {
                      const deptName = typeof dept === 'string' ? dept : (dept?.name || `Dept #${dept?.id || idx}`);
                      return (
                        <div key={dept?.id || idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{deptName}</span>
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 dark:border-primary/20 space-y-4">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Institutional Action</h4>
                  {selectedJob.status === 'PENDING' ? (
                    <div className="flex flex-col gap-3">
                      <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                        onClick={() => {
                          handleStatusUpdate([selectedJob.id], 'APPROVED', [selectedJob.status]);
                          setIsDetailsModalOpen(false);
                        }}
                        disabled={isBackward(selectedJob.status, 'APPROVED')}
                      >
                        Approve Role
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-rose-500/20 text-rose-600 hover:bg-rose-500/10 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                        onClick={() => {
                          handleStatusUpdate([selectedJob.id], 'REJECTED', [selectedJob.status]);
                          setIsDetailsModalOpen(false);
                        }}
                        disabled={isBackward(selectedJob.status, 'REJECTED')}
                      >
                        Decline Role
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status Finalized on</p>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">
                        {selectedJob.updatedAt || selectedJob.approvedAt || selectedJob.sentAt
                          ? new Date(selectedJob.updatedAt || selectedJob.approvedAt || selectedJob.sentAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Provide Rejection Reason"
        subtitle="Specify why this job listing is being rejected. This feedback will be shared with the corporate partner."
        maxWidth="sm:max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-6 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-6 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., The compensation package does not meet the university's placement benchmarks."
              className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus-visible:ring-primary/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 p-4 text-sm"
            />
          </div>
        </div>
      </Modal>
    </AdminPageLayout>
  );
};

export default AdminJobManagement;
