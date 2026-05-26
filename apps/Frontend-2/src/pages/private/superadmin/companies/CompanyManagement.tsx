import { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { PageHeader } from "@/components/PageHeader";
import Loader from "@/components/Loader";

import { fetchCompanies, updateCompanyStatus } from "@/redux/thunks/superadmin/companyThunks";

const CompanyManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { companies, loading, isSubmitting } = useSelector(
    (state: RootState) => state.superAdmin
  );

  const [search, setSearch] = useState("");

  // ✅ FIX: API call was missing
  useEffect(() => {
    dispatch(fetchCompanies(undefined)); // or "ACTIVE" if needed
  }, [dispatch]);

  const handleStatusChange = async (ids: number[], status: boolean) => {
    try {
      await dispatch(updateCompanyStatus({ ids, status })).unwrap();
      toast.success(
        `Company ${status ? "activated" : "deactivated"} successfully.`
      );
    } catch (error: any) {
      toast.error(error || "Failed to update company status.");
    }
  };

  const filteredCompanies =
    companies?.filter((c: any) => {
      const q = search.trim().toLowerCase();

      return (
        c?.name?.toLowerCase().includes(q) ||
        c?.user?.email?.toLowerCase().includes(q)
      );
    }) || [];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Corporate Partners"
        description="Manage and activate corporate entities requesting access to the placement network."
        badge="Enterprise Access"
        icon={Briefcase}
        variant="amber"
      />

      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
           <Table>
  <TableHeader>
    <TableRow className="border-border/50 hover:bg-transparent">
      <TableHead className="w-20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pl-8">
        #
      </TableHead>

      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">
        Company
      </TableHead>

      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">
        Contact
      </TableHead>

      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-center">
        Status
      </TableHead>

      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-right pr-8">
        Actions
      </TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {loading ? (
      <TableRow>
        <TableCell colSpan={5} className="py-24 text-center">
          <Loader text="Synchronizing corporate records..." />
        </TableCell>
      </TableRow>
    ) : filteredCompanies.length === 0 ? (
      <TableRow>
        <TableCell colSpan={5} className="py-24 text-center">
          <div className="flex flex-col items-center gap-4 opacity-40">
            <Briefcase className="w-12 h-12" />
            <span className="text-xs font-black uppercase tracking-widest">
              No companies found
            </span>
          </div>
        </TableCell>
      </TableRow>
    ) : (
      filteredCompanies.map((company: any, index: number) => (
        <TableRow
          key={company.id}
          className="border-border/50 hover:bg-muted/30 transition-all group"
        >
          <TableCell className="font-bold text-muted-foreground py-5 pl-8 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </TableCell>

          {/* COMPANY */}
          <TableCell className="py-5">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <Building2 className="size-5" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-sm leading-none text-foreground group-hover:text-amber-600 transition-colors">
                  {company?.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 max-w-[280px]">
                  {company?.description || "No description available"}
                </p>
              </div>
            </div>
          </TableCell>

          {/* CONTACT */}
          <TableCell className="py-5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {company?.user?.firstname} {company?.user?.lastname}
              </span>

              <span className="text-xs text-muted-foreground">
                {company?.user?.email}
              </span>
            </div>
          </TableCell>

          {/* STATUS */}
          <TableCell className="text-center py-5">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                company?.user?.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}
            >
              {company?.user?.status}
            </span>
          </TableCell>

          {/* ACTIONS */}
          <TableCell className="text-right py-5 pr-8">
            <div className="flex justify-end gap-2">
              {company?.user?.status === "INACTIVE" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 gap-1.5 font-black text-[10px] uppercase tracking-wider"
                  onClick={() =>
                    void handleStatusChange([company.id], true)
                  }
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Activate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 gap-1.5 font-black text-[10px] uppercase tracking-wider"
                  onClick={() =>
                    void handleStatusChange([company.id], false)
                  }
                  disabled={isSubmitting}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Delete
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default CompanyManagement;