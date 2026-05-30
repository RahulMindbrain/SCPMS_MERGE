import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Calendar } from "lucide-react";

type ExperienceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddExperience: (experience: any) => void;
};

const ExperienceModal = ({ isOpen, onClose, onAddExperience }: ExperienceModalProps) => {
  const [experience, setExperience] = useState({
    companyName: "",
    role: "",
    description: "",
    startDate: "",
    endDate: ""
  });

  const handleSubmit = () => {
    if (!experience.companyName.trim() || !experience.role.trim()) return;

    onAddExperience(experience);
    onClose();
    setExperience({
      companyName: "",
      role: "",
      description: "",
      startDate: "",
      endDate: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl flex flex-col">
        <DialogHeader className="p-8 pb-4 bg-[#fbfdff] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">Add Experience</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Professional roles, internships, or volunteering</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Company Name</Label>
              <Input
                id="company"
                placeholder="e.g. Google, Startup Inc."
                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
                value={experience.companyName}
                onChange={(e) => setExperience({ ...experience, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Role</Label>
              <Input
                id="role"
                placeholder="e.g. SDE Intern"
                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
                value={experience.role}
                onChange={(e) => setExperience({ ...experience, role: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
                  value={experience.startDate}
                  onChange={(e) => setExperience({ ...experience, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">End Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
                  value={experience.endDate}
                  onChange={(e) => setExperience({ ...experience, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Key Responsibilities</Label>
            <Textarea
              id="description"
              placeholder="What were your main achievements and contributions?"
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500 min-h-[120px] resize-none"
              value={experience.description}
              onChange={(e) => setExperience({ ...experience, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 rounded-xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            Record Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceModal;
