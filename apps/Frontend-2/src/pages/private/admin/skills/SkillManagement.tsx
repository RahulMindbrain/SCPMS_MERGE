import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Wrench, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { deleteAPI, getAPI, postAPI, putAPI } from "@/apis/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type Skill = {
  id: number;
  name: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const SkillManagement = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newSkillName, setNewSkillName] = useState("");
  const [updateSkillName, setUpdateSkillName] = useState("");
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await getAPI<ApiResponse<Skill[]>>("/skills/get-all");
      setSkills(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSkills();
  }, []);

  const filteredSkills = useMemo(
    () =>
      skills.filter((skill) =>
        skill.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [skills, search],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = newSkillName.trim();
    if (!skillName) {
      toast.error("Skill name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postAPI<ApiResponse<Skill>>("/skills/add", {
        name: skillName,
      });
      toast.success(response?.message || "Skill created successfully.");
      setNewSkillName("");
      setIsCreateOpen(false);
      await loadSkills();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create skill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = async (skillId: number) => {
    try {
      setIsSubmitting(true);
      const response = await getAPI<ApiResponse<Skill>>(`/skills/get/${skillId}`);
      const skill = response?.data;
      if (!skill) {
        toast.error("Skill details not found.");
        return;
      }
      setEditingSkillId(skill.id);
      setUpdateSkillName(skill.name);
      setIsUpdateOpen(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch skill details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkillId) return;

    const skillName = updateSkillName.trim();
    if (!skillName) {
      toast.error("Skill name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await putAPI<ApiResponse<Skill>>(
        `/skills/update/${editingSkillId}`,
        { name: skillName },
      );
      toast.success(response?.message || "Skill updated successfully.");
      setIsUpdateOpen(false);
      setEditingSkillId(null);
      setUpdateSkillName("");
      await loadSkills();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update skill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSkillId) return;

    try {
      setIsSubmitting(true);
      const response = await deleteAPI<ApiResponse<any>>(
        `/skills/delete/${deletingSkillId}`,
      );
      toast.success(response?.message || "Skill deleted successfully.");
      setIsDeleteDialogOpen(false);
      setDeletingSkillId(null);
      await loadSkills();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete skill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout>
      <PageHeader
        title="Skill Repository"
        description="Curate and maintain the talent taxonomy and technological competencies."
        badge="Taxonomy"
        icon={Wrench}
        variant="indigo"
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Create Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">New Skill</DialogTitle>
                <DialogDescription className="text-indigo-100/70 font-medium">
                  Add a new technical or soft skill to the enterprise taxonomy.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6 bg-card">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Skill Nomenclature</label>
                <Input
                  required
                  placeholder="e.g. Distributed Systems Engineering"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
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
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus:ring-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 p-2 rounded-2xl bg-card border border-border/50 shadow-sm">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="size-8 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                    <div className="size-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                  </div>
                ))}
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Global Taxonomy</p>
                <p className="text-sm font-black text-foreground">{skills.length} Competencies</p>
             </div>
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pl-8">#</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">Skill Name</TableHead>
                  {/* <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-center">Skill ID</TableHead> */}
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-right pr-8">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <Loader text="Retrieving technical skill taxonomy..." />
                    </TableCell>
                  </TableRow>
                ) : filteredSkills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Wrench className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">No skills synchronized</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkills.map((skill, index) => (
                    <TableRow
                      key={skill.id}
                      className="border-border/50 hover:bg-muted/30 transition-all group"
                    >
                      <TableCell className="font-bold text-muted-foreground py-5 pl-8 tabular-nums">{String(index + 1).padStart(2, '0')}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                             <Wrench className="size-4" />
                          </div>
                          <span className="font-black text-foreground group-hover:text-emerald-600 transition-colors">
                            {skill.name}
                          </span>
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-center py-5">
                        <span className="px-2 py-1 rounded-md bg-muted font-bold text-[10px] text-muted-foreground border border-border/50">
                          {skill.id}
                        </span>
                      </TableCell> */}
                      <TableCell className="text-right py-5 pr-8">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                            onClick={() => void openEditDialog(skill.id)}
                            disabled={isSubmitting}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            onClick={() => {
                              setDeletingSkillId(skill.id);
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
              <DialogTitle className="text-2xl font-black">Refine Skill</DialogTitle>
              <DialogDescription className="text-indigo-100/70 font-medium">
                Adjust the parameters for the selected competency.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleUpdate} className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Skill Nomenclature</label>
              <Input
                required
                placeholder="e.g. Distributed Systems Engineering"
                value={updateSkillName}
                onChange={(e) => setUpdateSkillName(e.target.value)}
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
            <DialogTitle className="text-2xl font-black">Terminate Skill?</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2">
              You are about to decommission this skill from the global taxonomy. This action is irreversible.
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

export default SkillManagement;
