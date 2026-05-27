import React, { useEffect, useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Search,
  Clock,
  Filter,
  FileText,
  Target,
  Building,
  UserCheck,
  ExternalLink,
  Users,
  ArrowUpDown
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '@/redux/thunks/driveThunk';
import { fetchCompanies } from '@/redux/thunks/companyThunk';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const UniversityJobs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.drive);
  const { companies: reduxCompanies } = useSelector((state: RootState) => state.company);
  const [page] = useState();
  const PAGE_LIMIT = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterCompany] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const handleShowDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchCompanies({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const params: any = { status: 'APPROVED', page, limit: PAGE_LIMIT };
    if (filterCompany !== 'all') {
      params.companyId = Number(filterCompany);
    }
    dispatch(fetchJobs(params));
  }, [dispatch, page, filterCompany]);

  const departments = useMemo(() => {
    const allDepartments = (Array.isArray(jobs) ? jobs : []).flatMap((j) =>
      Array.isArray(j.job?.eligibleDepartments) ? j.job.eligibleDepartments : [],
    );
    const names = allDepartments.map((dept: any) => dept?.name || `Dept #${dept.id}`).filter(Boolean);
    return Array.from(new Set(names));
  }, [jobs]);

  const locations = useMemo(() => {
    const allLocations = (Array.isArray(jobs) ? jobs : []).map((j) => j.job?.location).filter(Boolean);
    return Array.from(new Set(allLocations));
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let result = (Array.isArray(jobs) ? jobs : []).filter((row) => {
      const j = row.job;
      const title = j?.title ?? "";
      const uniName = row.university?.name ?? "";
      
      const companyId = j?.companyId ?? row.companyId;
      const foundCompany = reduxCompanies.find(c => c.id === companyId);
      const companyName = j?.company?.name ?? foundCompany?.name ?? "";
      
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uniName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterDepartment !== 'all') {
      result = result.filter((row) =>
        (Array.isArray(row.job?.eligibleDepartments) ? row.job.eligibleDepartments : []).some(
          (dept: any) =>
            (dept?.name?.toLowerCase() === filterDepartment.toLowerCase()) || 
            (dept?.id?.toString() === filterDepartment)
        ),
      );
    }

    if (filterLocation !== 'all') {
      result = result.filter((row) =>
        (row.job?.location ?? "").toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    return [...result].map(row => {
      const companyId = row.job?.companyId ?? row.companyId;
      const foundCompany = reduxCompanies.find(c => c.id === companyId);
      return {
        ...row,
        displayCompany: row.job?.company || foundCompany
      };
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.sentAt || b.id).getTime() - new Date(a.sentAt || a.id).getTime();
      if (sortBy === 'oldest') return new Date(a.sentAt || a.id).getTime() - new Date(b.sentAt || b.id).getTime();
      return 0;
    });
  }, [jobs, searchTerm, sortBy, filterDepartment, filterLocation, reduxCompanies]);

  if (loading && jobs.length === 0) return <Loader text="Loading university jobs..." fullScreen />;

  return (
    <AdminPageLayout>
      <PageHeader
        title="University Jobs"
        description="View all approved job opportunities for your institution"
        icon={Briefcase}
        variant="blue"
      />

      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 pb-10">
        <div className="relative w-full xl:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by title or company..."
            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-medium focus-visible:ring-primary/20 shadow-sm text-slate-900 dark:text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-full xl:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 sm:w-[140px] h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
              <ArrowUpDown className="size-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <SelectItem value="newest" className="text-[10px] font-bold uppercase tracking-widest">Newest First</SelectItem>
              <SelectItem value="oldest" className="text-[10px] font-bold uppercase tracking-widest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="flex-1 sm:w-[140px] h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
              <Filter className="size-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Dept" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Depts</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept} className="text-[10px] font-bold uppercase tracking-widest">{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="flex-1 sm:w-[140px] h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all text-slate-900 dark:text-slate-100">
              <MapPin className="size-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Loc" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc || 'Remote'} className="text-[10px] font-bold uppercase tracking-widest">{loc || 'Remote'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredAndSortedJobs.map((row) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] dark:hover:shadow-[0_20px_50px_rgba(37,99,235,0.05)] p-7 flex flex-col transition-all duration-300 overflow-hidden h-full cursor-pointer"
              onClick={() => handleShowDetails(row)}
            >
              {/* Top Section */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-primary/5 dark:bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary dark:text-primary/70 font-black text-lg border border-primary/10 group-hover:scale-105 transition-transform">
                    {row.job?.title?.[0] || 'J'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate tracking-tight leading-tight">
                      {row.job?.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                      <Building2 size={10} className="text-primary/60 dark:text-primary/40" />
                      {(row as any).displayCompany?.name || 'Unknown Company'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-md">
                  Active
                </Badge>
              </div>

              {/* Sleek Middle Section: Details with visual consistency */}
              <div className="flex items-center flex-wrap gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-4 px-1">
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{row.job?.location || 'Remote'}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1">
                  <IndianRupee size={12} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{(row.salary / 100000).toFixed(1)} LPA</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-amber-500" />
                  <span>{row.openings} Open</span>
                </div>
              </div>

              {/* Dynamic Compact Specs Banner */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850/80 mb-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex-1 flex items-center justify-center gap-1.5 border-r border-slate-200/80 dark:border-slate-800">
                  <Target size={12} className="text-blue-500" />
                  <span>Min. CGPA: <strong className="text-blue-600 dark:text-blue-400 font-black">{row.minCgpa}</strong></span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <Clock size={12} className="text-amber-500" />
                  <span>Backlogs: <strong className="text-amber-600 dark:text-amber-400 font-black">{row.maxBacklogs} Max</strong></span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 font-medium px-1">
                {row.description || "Premium job listing with high growth potential and competitive benefits package."}
              </p>

              {/* Footer Section: Departments & Sleek CTA Link */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                {/* Dept Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(row.job?.eligibleDepartments || []).slice(0, 1).map((d: any, idx: number) => {
                    const deptName = typeof d === 'object' ? (d.name || `Dept #${d.id}`) : d;
                    return (
                      <Badge 
                        key={d.id || idx} 
                        variant="outline" 
                        className="bg-primary/5 dark:bg-primary/10 border-transparent text-primary/70 dark:text-primary/50 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md whitespace-normal h-auto text-left leading-tight break-words max-w-full"
                      >
                        {deptName}
                      </Badge>
                    );
                  })}
                  {(row.job?.eligibleDepartments || []).length > 1 && (
                     <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-505 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                       +{(row.job?.eligibleDepartments || []).length - 1} More
                     </Badge>
                  )}
                </div>

                {/* Sleek CTA Text Link */}
                <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-primary/80 transition-colors flex items-center gap-1">
                  Details
                  <ExternalLink size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-350" />
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAndSortedJobs.length === 0 && !loading && (
        <div className="text-center py-20 bg-card/30 rounded-[3rem] border border-dashed border-border mt-8">
          <Briefcase className="size-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground truncate px-4">No approved jobs found</h3>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search terms.</p>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-indigo-600 dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden text-white text-left">
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
                   <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">
                     {selectedJob.displayCompany?.name} • {selectedJob.university?.name}
                   </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 relative z-10">
                <Badge className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-500 text-white">
                  {selectedJob.status}
                </Badge>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {[
                { icon: MapPin, label: "Location", value: selectedJob.job?.location || 'Remote', color: 'slate' },
                { icon: IndianRupee, label: "Salary Package", value: `${(selectedJob.salary/100000).toFixed(1)} LPA`, color: 'emerald' },
                { icon: UserCheck, label: "Min. CGPA", value: selectedJob.minCgpa, color: 'blue' },
                { icon: Clock, label: "Max Backlogs", value: selectedJob.maxBacklogs, color: 'amber' }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                  <div className={`size-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-${item.color}-600 shadow-sm`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Description</h4>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedJob.job?.description || selectedJob.description || "No job description provided."}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Target size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Skills & Expertise</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.job?.skills || []).map((skill: any) => (
                      <Badge key={skill.id} className="bg-white border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Building size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Target Depts</h4>
                  </div>
                  <div className="space-y-2">
                    {(selectedJob.job?.eligibleDepartments || selectedJob.eligibleDepartments || []).map((dept: any, idx: number) => {
                      const deptName = typeof dept === 'string' ? dept : (dept?.name || `Dept #${dept?.id || idx}`);
                      return (
                        <div key={dept?.id || idx} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{deptName}</span>
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-primary/[0.03] border border-primary/10 space-y-4 text-center">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Listing Status</h4>
                  <div className="py-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved on</p>
                     <p className="text-xs font-black text-slate-900 mt-1">
                        {selectedJob.approvedAt || selectedJob.updatedAt || selectedJob.sentAt 
                          ? new Date(selectedJob.approvedAt || selectedJob.updatedAt || selectedJob.sentAt).toLocaleDateString() 
                          : 'N/A'}
                     </p>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Close Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminPageLayout>
  );
};

export default UniversityJobs;
