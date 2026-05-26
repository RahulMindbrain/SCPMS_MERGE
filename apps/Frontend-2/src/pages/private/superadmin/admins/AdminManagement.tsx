import { useEffect, useState } from "react";
import { ShieldCheck, Search, CheckCircle, XCircle, ChevronRight, User, MapPin } from "lucide-react";
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

import { fetchAdmins, updateAdminStatus, activateAdmin } from "@/redux/thunks/superadmin/adminThunks";
import { CreateAdminModal } from "./components/CreateAdminModal";


const AdminManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admins, loading, isSubmitting } = useSelector((state: RootState) => state.superAdmin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  useEffect(() => {
    dispatch(fetchAdmins(statusFilter === "ALL" ? undefined : statusFilter));
  }, [dispatch, statusFilter]);

  const handleStatusChange = async (ids: number[], status: boolean) => {
    try {
      await dispatch(updateAdminStatus({ ids, status })).unwrap();
      toast.success(`Administrator ${status ? 'activated' : 'deactivated'} successfully.`);
    } catch (error: any) {
      toast.error(error || "Failed to update administrator status.");
    }
  };

  const handleActivate = async (ids: number[]) => {
    try {
      await dispatch(activateAdmin(ids)).unwrap();
      toast.success("Administrator activated successfully.");
    } catch (error: any) {
      toast.error(error || "Failed to activate administrator.");
    }
  };

  const filteredAdmins = admins.filter((a: any) =>
    `${a.user.firstname} ${a.user.lastname}`.toLowerCase().includes(search.trim().toLowerCase()) ||
    a.user.email.toLowerCase().includes(search.trim().toLowerCase())
  );


  return (
    <AdminPageLayout>
      <PageHeader
        title="Admin Control"
        description="Oversee and manage tactical administrators across all university nodes."
        badge="Access Control"
        icon={ShieldCheck}
        variant="indigo"
      />

      <div className="space-y-8 pb-10">
        <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search administrators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11
  h-11
  bg-background
  border-border/60
  rounded-xl
  shadow-sm
  focus-visible:ring-2
  focus-visible:ring-indigo-500/20
  transition-all"
              />
            </div>

            <Button
              className="
  h-11
  px-6
  rounded-xl
  font-semibold
  text-sm
  gap-2
  shadow-lg
  shadow-indigo-500/10
"
              onClick={() => setOpenCreateModal(true)}
            >
              <User className="size-4" /> Add Administrator
            </Button>
            <div className="
  flex
  flex-wrap
  p-1
  bg-muted/40
  rounded-2xl
  border
  border-border/50
  gap-1
">
              {[
                { id: 'ALL', label: 'All Admin' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'INACTIVE', label: 'Pending' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${statusFilter === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        </div>



        <div className=" overflow-hidden
    rounded-3xl
    border
    border-border/50
    bg-background
    shadow-xl
  ">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6 pl-8">#</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Administrator</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Institution</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Location</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6 text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6 text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-24 text-center">
                      <Loader text="Synchronizing administrator records..." />
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <ShieldCheck className="w-12 h-12 text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest">No administrators found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin: any, index: number) => (
                    <TableRow
                      key={admin.id || index}
                      className="border-border/50 hover:bg-muted/30 transition-all group"
                    >
                      <TableCell className="font-bold text-muted-foreground py-6 pl-8 tabular-nums opacity-50">{String(index + 1).padStart(2, '0')}</TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-none bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                            <User className="size-5" />
                          </div>
                          <div>
                            <span className="font-black text-foreground group-hover:text-indigo-600 transition-colors block leading-tight uppercase italic tracking-tight">
                              {admin.user?.firstname} {admin.user?.lastname}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{admin.user?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground uppercase tracking-wider">
                            {admin.university?.name || "Global Access"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Code: {admin.university?.code || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3 text-rose-500/50" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {admin.university?.city}, {admin.university?.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${admin.user?.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                          }`}>
                          {admin.user?.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-6 pr-8">
                        <div className="flex justify-end gap-2">
                          {admin.user?.status === 'INACTIVE' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-none text-emerald-600 hover:text-white hover:bg-emerald-500 gap-2 font-black text-[9px] uppercase tracking-[0.15em] transition-all shadow-lg shadow-emerald-500/10"
                                onClick={() => void handleActivate([admin.user.id])}
                                disabled={isSubmitting}
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Active
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-none text-rose-600 hover:text-white hover:bg-rose-500 gap-2 font-black text-[9px] uppercase tracking-[0.15em] transition-all"
                                onClick={() => void handleStatusChange([admin.user.id], false)}
                                disabled={isSubmitting}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-4 rounded-none text-rose-600 hover:text-white hover:bg-rose-500 gap-2 font-black text-[9px] uppercase tracking-[0.15em] transition-all"
                              onClick={() => void handleStatusChange([admin.user.id], false)}
                              disabled={isSubmitting}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Delete
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-none text-muted-foreground hover:bg-muted/50 transition-all"
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
      <CreateAdminModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => dispatch(fetchAdmins())}
      />
    </AdminPageLayout>

  );
};

export default AdminManagement;
