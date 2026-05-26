import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Check,
  X,
  Mail,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminCompanyRequests, updateAdminCompanyRequestStatus } from '@/redux/thunks/superadmin/companyUniversityThunk';
import { fetchCompanies } from '@/redux/thunks/companyThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface CompanyUser {
  email: string;
  status?: string;
}

interface CompanyDetails {
  id: number;
  name: string;
  user: CompanyUser;
}

interface CompanyRequest {
  id: number;
  companyId: number;
  universityId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  approvedBy: number | null;
  reason: string | null;
  company: CompanyDetails;
}

const CompanyRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading } = useSelector((state: RootState) => state.companyUniversity);
  const { companies } = useSelector((state: RootState) => state.company);

  const [filter, setFilter] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAdminCompanyRequests());
    dispatch(fetchCompanies({}));
  }, [dispatch]);

  const sortedRequests = useMemo<CompanyRequest[]>(() => {
    if (!Array.isArray(requests)) return [];
    return [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return sortedRequests.filter((req) => {
      const matchesSearch = req.company?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        req.company?.user?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter = filter === 'All' || req.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [sortedRequests, searchTerm, filter]);

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      setProcessingId(id);
      await dispatch(
        updateAdminCompanyRequestStatus({ ids: [id], status, reason })
      ).unwrap();

      toast.success(
        `Affiliation request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`
      );
      if (status === 'REJECTED') {
        setIsRejectModalOpen(false);
        setRejectReason('');
        setRejectingRequestId(null);
      }
      dispatch(fetchAdminCompanyRequests());
    } catch (err: any) {
      toast.error(err || `Failed to ${status.toLowerCase()} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = sortedRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = sortedRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = sortedRequests.filter((r) => r.status === 'REJECTED').length;

  if (loading && sortedRequests.length === 0) {
    return <Loader text="Loading affiliation requests..." />;
  }

  return (
    <AdminPageLayout>
      <PageHeader
        title="Affiliation Requests"
        description="Verify and manage partnership requests sent by companies trying to recruit from your campus."
        badge="Academic Partnerships"
        icon={Building2}
        variant="indigo"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies or emails..."
              className="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-10"
              id="request-search-input"
            />
          </div>
        </div>
      </PageHeader>

      <div className="space-y-8">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Requests", value: sortedRequests.length, icon: Building2, color: "indigo", bg: "bg-indigo-500/10", text: "text-indigo-500" },
            { label: "Pending Review", value: pendingCount, icon: Clock, color: "amber", bg: "bg-amber-500/10", text: "text-amber-500", animate: pendingCount > 0 },
            { label: "Approved Partners", value: approvedCount, icon: CheckCircle2, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-500" },
            { label: "Rejected Requests", value: rejectedCount, icon: XCircle, color: "rose", bg: "bg-rose-500/10", text: "text-rose-500" },
          ].map((stat, idx) => (
            <div key={idx} className={cn("premium-stat-card group transition-all duration-500", `stat-glow-${stat.color}`)}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.bg, stat.text)}>
                  <stat.icon className={cn("size-5", stat.animate && "animate-pulse")} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{stat.label}</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight">{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 saas-card py-4 px-6">
          <div className="flex bg-muted/30 p-1 rounded-2xl border border-border w-full sm:w-auto overflow-x-auto no-scrollbar">
            {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                  filter === opt
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                id={`filter-btn-${opt.toLowerCase()}`}
              >
                {opt === 'PENDING' ? 'Pending' : opt === 'APPROVED' ? 'Approved' : opt === 'REJECTED' ? 'Rejected' : 'All'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            <span>{filteredRequests.length} Requests Found</span>
          </div>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request) => {
              const matchedCompany = companies.find((c: any) => c.id === request.companyId);
              const companyDescription = matchedCompany?.description || 'No corporate description available.';

              return (
                <motion.div
                  layout
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="group saas-card flex flex-col h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="size-14 bg-muted/50 rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/30 transition-all duration-300 shrink-0">
                        <Building2 className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                          {request.company?.name || 'Unknown Company'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{request.company?.user?.email || 'No email'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="mb-5 flex-grow">
                    <p className="text-xs text-muted-foreground/80 line-clamp-3 leading-relaxed group-hover:text-foreground/90 transition-colors">
                      {companyDescription}
                    </p>
                  </div>

                  {/* Info block */}
                  <div className="space-y-3.5 mb-6">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Received
                      </span>
                      <span className="font-bold text-foreground">
                        {new Date(request.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Status
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5",
                          request.status === 'APPROVED' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          request.status === 'PENDING' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          request.status === 'REJECTED' && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.approvedAt && (
                      <div className="flex items-center justify-between text-xs py-2">
                        <span className="text-muted-foreground font-semibold">Approved At</span>
                        <span className="font-bold text-foreground">
                          {new Date(request.approvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {request.rejectedAt && (
                      <div className="flex items-center justify-between text-xs py-2">
                        <span className="text-muted-foreground font-semibold">Rejected At</span>
                        <span className="font-bold text-foreground">
                          {new Date(request.rejectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions bottom bar */}
                  <div className="mt-auto pt-5 border-t border-border flex items-center gap-3">
                    {request.status === 'PENDING' ? (
                      <>
                        <Button
                          onClick={() => {
                            setRejectingRequestId(request.id);
                            setIsRejectModalOpen(true);
                          }}
                          disabled={processingId === request.id}
                          variant="outline"
                          className="flex-1 h-10 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-500 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-muted-foreground"
                          id={`decline-request-btn-${request.id}`}
                        >
                          <X className="size-4 text-rose-500" />
                          Rejected
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                          disabled={processingId === request.id}
                          className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 active:scale-95 transition-all"
                          id={`approve-request-btn-${request.id}`}
                        >
                          <Check className="size-4" />
                          Accept
                        </Button>
                      </>
                    ) : request.status === 'APPROVED' ? (
                      <div className="w-full flex items-center justify-center py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Active Academic Partner
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-wider gap-2">
                        <XCircle className="size-4 text-rose-500" />
                        Affiliation Rejected
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredRequests.length === 0 && (
          <div className="py-32 text-center saas-card border-dashed bg-muted/5 border-2">
            <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Search className="size-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Requests Found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              We couldn't find any affiliation requests matching your search or filters.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Affiliation Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this company's affiliation request. This will be visible to the company.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
                setRejectingRequestId(null);
              }}
              disabled={processingId === rejectingRequestId}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white shadow-md disabled:opacity-50"
              onClick={() =>
                rejectingRequestId &&
                handleUpdateStatus(rejectingRequestId, 'REJECTED', rejectReason)
              }
              disabled={!rejectReason.trim() || processingId === rejectingRequestId}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default CompanyRequests;
