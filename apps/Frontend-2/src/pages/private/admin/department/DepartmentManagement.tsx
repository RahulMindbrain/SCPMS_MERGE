import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';

import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/redux/thunks/departmentThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';

import Loader from '@/components/Loader';

const DepartmentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { departments, loading } = useSelector((state: RootState) => state.department);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptName, setDeptName] = useState('');
  const [updateDeptName, setUpdateDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast.error('Department name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(createDepartment({ name: deptName.trim(), isActive: true })).unwrap();
      toast.success(`Department "${deptName.trim()}" created successfully!`);
      setDeptName('');
      setIsCreateOpen(false);
      dispatch(fetchDepartments());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = departments.filter((d: any) =>
    (d.name || d.deptName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditDialog = (dept: any) => {
    setEditingDeptId(dept.id);
    setUpdateDeptName(dept.name || dept.deptName || '');
    setIsUpdateOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeptId) return;

    const name = updateDeptName.trim();
    if (!name) {
      toast.error('Department name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await dispatch(
        updateDepartment({ id: editingDeptId, name, isActive: true })
      ).unwrap();
      toast.success(response?.message || 'Department updated successfully.');
      setIsUpdateOpen(false);
      setEditingDeptId(null);
      setUpdateDeptName('');
      dispatch(fetchDepartments());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDeptId) return;
    setIsSubmitting(true);
    try {
      const response = await dispatch(deleteDepartment(deletingDeptId)).unwrap();
      toast.success(response?.message || 'Department deleted successfully.');
      setIsDeleteDialogOpen(false);
      setDeletingDeptId(null);
      dispatch(fetchDepartments());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout>
      <PageHeader
        title="Department Control"
        description="Strategize and manage the organizational hierarchy and academic divisions."
        badge="Governance"
        icon={Building2}
        variant="indigo"
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Create Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">New Department</DialogTitle>
                <DialogDescription className="text-indigo-100/70 font-medium">
                  Establish a new academic or operational unit within the institution.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6 bg-card">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Department Nomenclature</label>
                <Input
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="h-12 bg-muted/30 border-border/50 rounded-xl focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader size="sm" /> Syncing...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Initialize</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus:ring-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 p-2 rounded-2xl bg-card border border-border/50 shadow-sm">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="size-8 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                    <div className="size-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
                  </div>
                ))}
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Operational Units</p>
                <p className="text-sm font-black text-foreground">{departments.length} Active</p>
             </div>
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pl-8">#</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">Department Name</TableHead>
                  {/* <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-center">Unit ID</TableHead> */}
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-right pr-8">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-24 text-center">
                      <Loader text="Retrieving tactical department data..." />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Building2 className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">No departments synchronized</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((dept: any, index: number) => (
                    <TableRow
                      key={dept.id}
                      className="border-border/50 hover:bg-muted/30 transition-all group"
                    >
                      <TableCell className="font-bold text-muted-foreground py-5 pl-8 tabular-nums">{String(index + 1).padStart(2, '0')}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                             <Building2 className="size-4" />
                          </div>
                          <span className="font-black text-foreground group-hover:text-indigo-600 transition-colors">
                            {dept.name || dept.deptName || '—'}
                          </span>
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-center py-5">
                        <span className="px-2 py-1 rounded-md bg-muted font-bold text-[10px] text-muted-foreground border border-border/50">
                          {dept.id}
                        </span>
                      </TableCell> */}
                      <TableCell className="text-right py-5 pr-8">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                            onClick={() => openEditDialog(dept)}
                            disabled={isSubmitting}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            onClick={() => {
                              setDeletingDeptId(dept.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Refine Unit</DialogTitle>
              <DialogDescription className="text-indigo-100/70 font-medium">
                Adjust the parameters for the selected department.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleUpdate} className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Department Nomenclature</label>
              <Input
                required
                placeholder="e.g. Computer Science Engineering"
                value={updateDeptName}
                onChange={(e) => setUpdateDeptName(e.target.value)}
                className="h-12 bg-muted/30 border-border/50 rounded-xl focus:ring-primary/20 transition-all font-bold"
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => setIsUpdateOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader size="sm" /> Syncing...</>
                ) : (
                  'Apply Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-8 border-none rounded-3xl bg-card">
          <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
            <Trash2 className="size-8 text-rose-600" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black">Terminate Unit?</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2">
              You are about to decommission this department. This action is irreversible and may impact linked personnel.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Abort
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-lg shadow-rose-500/20"
              onClick={() => void handleDelete()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader size="sm" /> Deleting...</>
              ) : (
                'Terminate'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default DepartmentManagement;
