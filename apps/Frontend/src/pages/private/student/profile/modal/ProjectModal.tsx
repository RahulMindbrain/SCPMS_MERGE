import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Code2 } from "lucide-react";

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: any) => void;
};

const ProjectModal = ({ isOpen, onClose, onAddProject }: ProjectModalProps) => {
  const [project, setProject] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: ""
  });

  const handleSubmit = async () => {
    if (!project.title.trim()) return;

    onAddProject({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl
    });

    onClose();

    setProject({
      title: "",
      description: "",
      techStack: "",
      githubUrl: "",
      liveUrl: ""
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-2xl flex flex-col">
        <DialogHeader className="p-6 pb-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Add Project</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Showcase your technical builds and innovations</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Project Title</Label>
            <Input
              id="title"
              placeholder="What did you build?"
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500 font-semibold"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief overview of your project's features and goals..."
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500 min-h-[100px] resize-none font-semibold text-sm"
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Tech Stack</Label>
            <Input
              id="techStack"
              placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500 font-semibold"
              value={project.techStack}
              onChange={(e) => setProject({ ...project, techStack: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Source Code URL</Label>
              <div className="relative">
                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="githubUrl"
                  placeholder="GitHub link"
                  className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500 font-semibold"
                  value={project.githubUrl}
                  onChange={(e) => setProject({ ...project, githubUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Live Demo URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="liveUrl"
                  placeholder="Deployment link"
                  className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500 font-semibold"
                  value={project.liveUrl}
                  onChange={(e) => setProject({ ...project, liveUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 shrink-0 gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-xl h-11 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 active:scale-95 transition-all border-none"
          >
            Ship Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
