import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Search,
  CheckCircle2,
  Mail,
  XCircle,
  ExternalLink,
  Globe,
  Briefcase,
  Users,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCompanies, activateCompanies } from '@/redux/thunks/companyThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface Company {
  id: number;
  userId: number;
  name: string;
  status: 'active' | 'upcoming' | 'completed' | 'inactive';
  approval: 'Approved' | 'Pending';
  logo?: string;
  email?: string;
  description?: string;
  createdAt?: string;
  userStatus?: string;
}

const CompanyManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { companies: reduxCompanies, loading, error } = useSelector((state: RootState) => state.company);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompany, setNewCompany] = useState({
    name: '',
    sector: '',
    location: '',
    email: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchCompanies({}));
  }, [dispatch]);

  const companies = useMemo<Company[]>(() => {
    const mapCompany = (c: any): Company => {
      const userStatus = c.user?.status || 'UNKNOWN';

      return {
        id: c.id,
        userId: c.user?.id,
        name: c.name || 'N/A',
        status: userStatus === 'ACTIVE' ? 'active' : 'inactive',
        approval: userStatus === 'ACTIVE' ? 'Approved' : 'Pending',
        logo: undefined,
        email: c.user?.email || 'N/A',
        description: c.description || '',
        createdAt: c.createdAt,
        userStatus
      };
    };

    return reduxCompanies.map(mapCompany);
  }, [reduxCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filter === 'All' ||
        (filter === 'Active' && c.userStatus === 'ACTIVE') ||
        (filter === 'Inactive' && c.userStatus === 'INACTIVE');

      return matchesSearch && matchesFilter;
    });
  }, [companies, searchTerm, filter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Integration for adding companies is coming soon.");
    setIsAddModalOpen(false);
    setNewCompany({ name: '', sector: '', location: '', email: '', description: '' });
  };

  const toggleApproval = async (_id: number, userId: number, currentStatus: string) => {
    if (currentStatus === 'Pending') {
      try {
        await dispatch(activateCompanies([userId])).unwrap();
        toast.success("Company activated successfully!");
        dispatch(fetchCompanies({}));
      } catch (err: any) {
        toast.error(err || "Failed to activate company");
      }
    } else {
      toast.info("Deactivation is coming soon.");
    }
  };

  const handleViewJobs = (companyId: number) => {
    navigate(`/admin/jobs?companyId=${companyId}`);
  };

  if (loading && reduxCompanies.length === 0) {
    return <Loader text="Loading partner network..." />;
  }

  return (
    <AdminPageLayout>
      <PageHeader
        title="Partner Network"
        description="Oversee corporate partnerships and monitor live recruitment activities."
        badge="Company Management"
        icon={Building2}
        variant="indigo"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-10"
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto h-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 whitespace-nowrap px-6">
            Onboard Partner
          </Button>
        </div>
      </PageHeader>

      {error ? (
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4 saas-card">
          <div className="p-4 bg-rose-500/10 rounded-full">
            <XCircle className="w-12 h-12 text-rose-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">Error Loading Data</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => dispatch(fetchCompanies({}))}
            className="rounded-xl border-border px-8"
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Total Partners", value: companies.length, icon: Building2, color: "indigo", bg: "bg-indigo-500/10", text: "text-indigo-500" },
              { label: "Verified Brands", value: companies.filter(c => c.approval === 'Approved').length, icon: CheckCircle2, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-500" },
              { label: "Pending Verification", value: companies.filter(c => c.approval === 'Pending').length, icon: Users, color: "amber", bg: "bg-amber-500/10", text: "text-amber-500" },
              { label: "Live Engagements", value: companies.filter(c => c.status === 'active').length, icon: Briefcase, color: "sky", bg: "bg-sky-500/10", text: "text-sky-500" },
            ].map((stat, idx) => (
              <div key={idx} className={cn("premium-stat-card group transition-all duration-500", `stat-glow-${stat.color}`)}>
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.bg, stat.text)}>
                    <stat.icon className="size-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{stat.label}</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight">{stat.value}</h2>
              </div>
            ))}
          </div>

          {/* Filters Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 saas-card py-4 px-6">
            <div className="flex bg-muted/30 p-1 rounded-2xl border border-border w-full sm:w-auto overflow-x-auto no-scrollbar">
              {['All', 'Active', 'Inactive'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={cn(
                    "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                    filter === opt
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              <span>{filteredCompanies.length} Entities</span>
            </div>
          </div>

          {/* Grid of Companies */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCompanies.map((company) => (
                <motion.div
                  layout
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="group saas-card flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="size-14 bg-muted/50 rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/30 transition-all duration-300 shrink-0">
                        <Building2 className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                          {company.name}
                        </h3>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-muted/30 mt-1.5 border-border/50">
                          {company.userStatus}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewJobs(company.id)}
                      className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all shrink-0 active:scale-90"
                      title="View Jobs"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-10 mb-6 font-medium">
                    {company.description || "No corporate bio provided for this entity. Strategic partner in candidate acquisition."}
                  </p>

                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 mb-6 group-hover:bg-primary/5 transition-all duration-500">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Registry ID</p>
                    </div>
                    <p className="text-sm font-black text-foreground tracking-wide">
                      REG-{company.id.toString().padStart(4, '0')}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full", company.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground')} />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{company.status}</span>
                    </div>

                    {company.approval === 'Approved' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest shadow-sm">
                        <CheckCircle2 className="size-3" /> Verified
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleApproval(company.id, company.userId, 'Pending')}
                        className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <CheckCircle2 className="size-3" /> Accept
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCompanies.length === 0 && (
            <div className="py-32 text-center saas-card border-dashed bg-muted/5 border-2">
              <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <Search className="size-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No partners found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Try adjusting your search criteria or filters to locate the corporate entity.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Onboard Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Partner"
        subtitle="Register a new corporate entity into the recruitment ecosystem"
      >
        <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="saas-label">Legal Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                  className="w-full pl-11 pr-5 py-3 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Official entity name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="saas-label">Sector</label>
              <input
                value={newCompany.sector}
                onChange={(e) => setNewCompany({ ...newCompany, sector: e.target.value })}
                className="w-full px-5 py-3 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Technology, Finance, etc."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="saas-label">Base Location</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  className="w-full pl-11 pr-5 py-3 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Headquarters base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="saas-label">HR Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  required
                  type="email"
                  className="w-full pl-11 pr-5 py-3 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="hr@brand.com"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="saas-label">Corporate Bio</label>
            <textarea
              value={newCompany.description}
              onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
              rows={3}
              className="w-full px-5 py-3 bg-muted/20 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Brief overview..."
            />
          </div>
          <Button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary/20">
            Confirm Onboarding
          </Button>
        </form>
      </Modal>
    </AdminPageLayout>
  );
};

export default CompanyManagement;
