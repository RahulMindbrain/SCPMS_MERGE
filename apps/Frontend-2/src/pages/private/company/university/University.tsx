import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Info,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@/redux/reducers/rootReducer";
import type { AppDispatch } from "@/redux/store/store";
import {
  fetchCompanyRequests,
  reapplyUniversity,
  requestUniversity,
} from "@/redux/thunks/superadmin/companyUniversityThunk";
import { getAPI } from "@/apis/api";
import Loader from "@/components/Loader";

const UniversityRequest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [isUniversityLoading, setIsUniversityLoading] = useState(false);
  const [reapplyingUniversityId, setReapplyingUniversityId] = useState<number | null>(null);

  const companyUniversityState = useSelector(
    (state: RootState) => state.companyUniversity
  );

  const requests = companyUniversityState?.requests || [];
  const loading = companyUniversityState?.loading || false;

  useEffect(() => {
    dispatch(fetchCompanyRequests());
  }, [dispatch]);

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setIsUniversityLoading(true);
        const response = await getAPI<any>("/university", {
          page: 1,
          limit: 200,
        });
        const rows = response?.data?.data || [];
        setUniversities(Array.isArray(rows) ? rows : []);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load universities");
        setUniversities([]);
      } finally {
        setIsUniversityLoading(false);
      }
    };

    loadUniversities();
  }, []);

  const filteredUniversities = useMemo(() => {
    return universities.filter((u: any) =>
      u?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [universities, search]);

  const handleRequest = async (universityId: number) => {
    try {
      await dispatch(requestUniversity([universityId])).unwrap();
      toast.success("Request sent successfully");
      dispatch(fetchCompanyRequests());
    } catch (error: any) {
      toast.error(error?.message || error || "Failed to send request");
    }
  };

  const handleReapply = async (universityId: number) => {
    try {
      setReapplyingUniversityId(universityId);
      await dispatch(reapplyUniversity([universityId])).unwrap();
      toast.success("Reapplied successfully");
      dispatch(fetchCompanyRequests());
    } catch (error: any) {
      toast.error(error?.message || error || "Failed to reapply request");
    } finally {
      setReapplyingUniversityId(null);
    }
  };

  const getStatusBadge = (req: any) => {
    switch (req.status) {
      case "APPROVED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Approved
          </div>
        );
      case "REJECTED":
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider cursor-help hover:bg-rose-500/20 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Rejected
                  {req.reason && <Info size={12} className="ml-0.5 opacity-70" />}
                </div>
              </TooltipTrigger>
              {req.reason && (
                <TooltipContent side="top" align="center" className="max-w-[250px] bg-rose-600 text-white border-rose-500/20 shadow-xl shadow-rose-500/20 p-3">
              
                  <p className="text-xs font-medium leading-relaxed">{req.reason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
            Pending
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-1000">
      <div className=" space-y-10">

        {/* Hero Header */}
        <div className="p-4 md:p-10">
          <div className="company-hero-banner relative overflow-hidden group min-h-[320px] flex flex-col justify-center">
            <div className="hero-mesh">
              <div className="bubble-primary blur-[120px] opacity-40" />
              <div className="bubble-secondary blur-[100px] opacity-30" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
            </div>
            <div className="hero-texture opacity-10" />

            <div className="relative z-10 space-y-6 max-w-3xl">
              <div className="hero-badge backdrop-blur-md bg-white/10 border-white/20">
                <Sparkles size={14} className="text-blue-200" />
                University Network
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Academic Partners
              </h1>
              <p className="text-lg text-blue-50/80 font-medium leading-relaxed max-w-2xl">
                Manage your institutional connections and monitor placement affiliation status.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 -mt-16 relative z-20">
          <div className="saas-card p-0 overflow-hidden border-none bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/5">

            {/* Search & Actions Header */}
            <div className="p-8 border-b border-border/40 bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground tracking-tight">University Directory</h2>
                <p className="text-xs text-muted-foreground font-medium">Monitoring {universities.length} academic institutions available for syndication.</p>
              </div>

              <div className="group relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campus name..."
                  className="saas-input h-12 !pl-12 bg-background/50 border-border/50 focus:bg-background transition-all outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Institution & Campus</th>
                    <th>Geographic Location</th>
                    <th className="text-center">Affiliation Status</th>
                    <th className="text-right">Connectivity Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(loading || isUniversityLoading) ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader size="lg" />
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Academic Data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUniversities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Search size={40} className="text-muted-foreground mb-2" />
                          <span className="text-sm font-bold text-foreground">No universities found</span>
                          <span className="text-xs text-muted-foreground">Try refining your search parameters.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUniversities.map((uni, idx) => {
                      const req = requests.find((r: any) => r.universityId === uni.id);
                      return (
                        <tr key={uni.id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="w-16 text-center font-black text-[10px] text-muted-foreground/50">
                            {(idx + 1).toString().padStart(2, "0")}
                          </td>
                          <td>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                <Building2 className="h-6 w-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                  {uni.name}
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">ID: {String(uni.id).slice(-6).toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/40 text-xs font-bold text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-primary/60" />
                              {uni.city}, {uni.state}
                            </div>
                          </td>
                          <td className="text-center">
                            {req ? (
                              getStatusBadge(req)
                            ) : (
                              <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                                Not Connected
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            {!req && (
                              <button
                                onClick={() => handleRequest(uni.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary/10 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                              >
                                Request Connection <ArrowUpRight size={14} />
                              </button>
                            )}
                            {req?.status === "REJECTED" && (
                              <button
                                disabled={reapplyingUniversityId === uni.id}
                                onClick={() => handleReapply(uni.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
                              >
                                {reapplyingUniversityId === uni.id ? (
                                  <><RefreshCw size={14} className="animate-spin" /> Reapplying...</>
                                ) : (
                                  <>Retry Connection <RefreshCw size={14} /></>
                                )}
                              </button>
                            )}
                            {req && req.status !== "REJECTED" && (
                              <div className="flex justify-end pr-4 opacity-20">
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            <div className="p-6 border-t border-border/40 bg-muted/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <div className="flex items-center gap-4">
                <span>Active Network: {requests.filter((r: any) => r.status === "APPROVED").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-primary" /> University Directory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityRequest;
