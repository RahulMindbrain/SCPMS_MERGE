import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, ChevronDown, 
  Send, Briefcase, X, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Result {
  id: number;
  name: string;
  branch: string;
  technical: number;
  hr: number;
  total: number;
  status: string;
}

const STATUS_FLOW = ['Pending', 'Shortlisted', 'Technical Round', 'HR Round', 'Selected', 'Rejected'];

const isBackward = (current: string, next: string) => {
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);
  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex < currentIndex;
};

const UpdateResults: React.FC = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  
  const [results, setResults] = useState<Result[]>([
    { id: 1, name: "Priya Sharma", branch: "CSE", technical: 88, hr: 82, total: 170, status: "Pending" },
    { id: 2, name: "Ananya Patel", branch: "CSE", technical: 95, hr: 90, total: 185, status: "Pending" },
    { id: 3, name: "Rahul Verma", branch: "IT", technical: 72, hr: 75, total: 147, status: "Pending" },
  ]);

  const handleUpdateStatus = (status: string) => {
    if (!selectedResult) return;
    
    if (isBackward(selectedResult.status, status)) {
      toast.error("Process integrity: Status cannot be moved backward");
      return;
    }

    setResults(results.map(r => r.id === selectedResult.id ? { ...r, status } : r));
    setIsUpdateModalOpen(false);
    toast.success(`Status updated for ${selectedResult.name}`);
  };

  // Logic to handle score updates
  const updateScore = (id: number, field: 'technical' | 'hr', value: string) => {
    const numValue = parseInt(value) || 0;
    setResults(results.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: numValue };
        updated.total = updated.technical + updated.hr;
        return updated;
      }
      return r;
    }));
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Briefcase className="text-primary" size={24} />
            Recruitment Drive
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Software Engineer Role • Final Review & Results Management</p>
        </div>
        <Button className="rounded-xl font-extrabold text-[10px] uppercase tracking-widest px-8 shadow-lg shadow-primary/20 h-11">
          <Send size={16} className="mr-2" /> Publish Results
        </Button>
      </div>

      {/* Main Table */}
      <div className="saas-card p-0 overflow-hidden shadow-sm border-border/50">
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th className="text-center">Technical</th>
                <th className="text-center">HR Round</th>
                <th className="text-center">Total Score</th>
                <th className="text-center">Result Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {results.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{row.name}</span>
                      <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-wider">{row.branch}</span>
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-2 py-1 focus-within:border-primary/50 transition-all">
                      <input 
                        type="number" 
                        value={row.technical} 
                        onChange={(e) => updateScore(row.id, 'technical', e.target.value)}
                        className="w-8 bg-transparent text-center font-bold text-foreground text-xs outline-none"
                      />
                      <span className="text-muted-foreground/40 text-[10px] font-bold">/ 100</span>
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-2 py-1 focus-within:border-primary/50 transition-all">
                      <input 
                        type="number" 
                        value={row.hr} 
                        onChange={(e) => updateScore(row.id, 'hr', e.target.value)}
                        className="w-8 bg-transparent text-center font-bold text-foreground text-xs outline-none"
                      />
                      <span className="text-muted-foreground/40 text-[10px] font-bold">/ 100</span>
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="font-extrabold text-sm text-primary">{row.total}<span className="text-muted-foreground/40 text-[10px] font-bold"> / 200</span></div>
                  </td>

                  <td className="text-center">
                    <Badge 
                      className={cn(
                        "rounded-full px-3 py-0 h-5 text-[10px] font-bold border-0 shadow-none",
                        row.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                        row.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 
                        'bg-muted text-muted-foreground'
                      )}
                    >
                      {row.status}
                    </Badge>
                  </td>

                  <td className="text-right">
                    <button 
                      onClick={() => { setSelectedResult(row); setIsUpdateModalOpen(true); }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all bg-muted/20"
                    >
                      Update <ChevronDown size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsUpdateModalOpen(false)} />
          <div className="relative bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold tracking-tight text-foreground">Set Result Status</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid gap-3">
              {[
                { id: 'Selected', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Confirm candidate for selection' },
                { id: 'Technical Round', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Promote to technical evaluation' },
                { id: 'HR Round', icon: User, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Promote to HR evaluation' },
                { id: 'Rejected', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', desc: 'Mark as not suitable' },
                { id: 'Pending', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', desc: 'Keep in evaluation phase' }
              ].map((opt) => {
                const disabled = selectedResult ? isBackward(selectedResult.status, opt.id) : false;
                return (
                  <button
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => handleUpdateStatus(opt.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border border-border/50 transition-all group text-left",
                      disabled ? "opacity-50 cursor-not-allowed grayscale" : "hover:border-primary/30 hover:bg-primary/[0.02]"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform", !disabled && "group-hover:scale-110", opt.bg, opt.color)}>
                      <opt.icon size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm leading-none mb-1">{opt.id}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateResults;