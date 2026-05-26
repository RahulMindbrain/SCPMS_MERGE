import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Mail, 
  Send, 
  Eye, 
  ChevronDown, 
  CheckSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies, fetchJobsByCompanyId, sendBulkMail } from '@/redux/thunks/companyThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import Loader from '@/components/Loader';

const BulkEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux State
  const { companies: reduxCompanies, jobs: reduxJobs, loading: reduxLoading } = useSelector((state: RootState) => state.company);
  
  // Selection State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // UI State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 1. Fetch Companies on Mount
  useEffect(() => {
    dispatch(fetchCompanies({}));
  }, [dispatch]);

  // 2. Fetch Jobs when Company changes
  useEffect(() => {
    if (!selectedCompanyId) {
      setSelectedJobIds([]);
      return;
    }

    dispatch(fetchJobsByCompanyId({ 
      id: Number(selectedCompanyId), 
      params: { status: 'APPROVED' } 
    }));
    setSelectedJobIds([]); // Reset selection
  }, [selectedCompanyId, dispatch]);

  const toggleJob = (id: number) => {
    setSelectedJobIds(prev => 
      prev.includes(id) ? prev.filter(jId => jId !== id) : [...prev, id]
    );
  };

  const handleSendMail = async () => {
    if (!selectedCompanyId || selectedJobIds.length === 0) {
      toast.error("Please select a company and at least one job");
      return;
    }

    const loadingToast = toast.loading("Dispatching bulk emails...");

    try {
      await dispatch(sendBulkMail({
        companyId: Number(selectedCompanyId),
        jobIds: selectedJobIds,
        subject: subject || undefined,
        message: message || undefined
      })).unwrap();
      
      toast.success("Bulk mail sent successfully!", { id: loadingToast });
      setSubject('');
      setMessage('');
      setSelectedJobIds([]);
    } catch (error: any) {
      toast.error(error || "Failed to send mail", { id: loadingToast });
    }
  };

  return (
    <AdminPageLayout>
      <PageHeader
        title="Tactical Broadcast"
        description="Precision communication engine for targeting elite talent pools."
        badge="Direct Outreach"
        icon={Mail}
        variant="indigo"
      >
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Reach</span>
             <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs uppercase">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Hub Active
             </div>
          </div>
          <Button 
             variant="outline"
             onClick={() => setIsPreviewOpen(true)}
             className="h-11 rounded-2xl border-border/50 bg-card font-black uppercase text-[10px] tracking-widest px-6 shadow-sm hover:border-primary transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 mr-2" /> Preview Engine
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-10">
         {/* Config Panel */}
         <div className="xl:col-span-8 space-y-8">
            {/* Step 1: Company Selection */}
            <div className="saas-card relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                 <div className="size-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-500/20">01</div>
                 <h3 className="text-lg font-black text-foreground tracking-tight">Enterprise Source</h3>
              </div>
              <div className="relative">
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full pl-6 pr-12 py-5 bg-muted/30 border border-border/50 rounded-2xl appearance-none font-black text-foreground focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none"
                >
                  <option value="">Choose partner organization...</option>
                  {reduxCompanies.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>

            {/* Step 2: Job Selection */}
            <div className={`saas-card relative overflow-hidden transition-all duration-500 ${!selectedCompanyId ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'opacity-100 grayscale-0 scale-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="size-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">02</div>
                 <h3 className="text-lg font-black text-foreground tracking-tight">Opportunity Targeting</h3>
              </div>
              
              {reduxLoading && selectedCompanyId ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <Loader size="lg" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Active Roles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(reduxJobs || []).map((job: any) => {
                    const isSelected = selectedJobIds.includes(job.id);
                    return (
                      <div 
                        key={job.id}
                        onClick={() => toggleJob(job.id)}
                        className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all group ${isSelected ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-border/50 bg-card hover:border-indigo-400 hover:bg-indigo-50/20'}`}
                      >
                        <div className="flex items-center gap-4">
                           <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-muted text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                              <Briefcase className="size-5" />
                           </div>
                           <div className="flex flex-col">
                              <span className={`text-sm font-black transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-foreground'}`}>{job.title}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Recruitment</span>
                           </div>
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-border'}`}>
                           {isSelected && <CheckSquare className="size-3" />}
                        </div>
                      </div>
                    );
                  })}
                  {(!reduxJobs || reduxJobs.length === 0) && selectedCompanyId && !reduxLoading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 rounded-3xl border border-dashed border-border/50 bg-muted/10">
                       <Zap className="size-8 text-muted-foreground/30 mb-3" />
                       <p className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">No approved campaigns found for this entity.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Content */}
            <div className={`saas-card relative overflow-hidden transition-all duration-500 ${selectedJobIds.length === 0 ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'opacity-100 grayscale-0 scale-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-amber-500/20">03</div>
                 <h3 className="text-lg font-black text-foreground tracking-tight">Campaign Intelligence</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject Protocol</label>
                  <input
                    type="text"
                    placeholder="Defaults to: New Opportunities Available"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-6 py-5 bg-muted/30 border border-border/50 rounded-2xl font-black text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Broadcast Payload (HTML Optimized)</label>
                  <textarea
                    rows={8}
                    placeholder="Leave blank to deploy standardized system template..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-6 py-6 bg-muted/30 border border-border/50 rounded-[2rem] text-sm font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
         </div>

         {/* Meta & Execution */}
         <div className="xl:col-span-4 space-y-8">
            <div className="saas-card bg-indigo-600 dark:bg-indigo-700 text-white border-none p-8 overflow-hidden relative">
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-8">
                     <ShieldCheck className="size-5 text-indigo-200" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Execution Hub</span>
                  </div>
                  
                  <div className="space-y-6 mb-10">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-indigo-100">Selected Roles</span>
                        <span className="text-2xl font-black">{selectedJobIds.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-indigo-100">Broadcast Priority</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase">Standard</span>
                     </div>
                  </div>

                  <Button
                    onClick={handleSendMail}
                    disabled={reduxLoading || !selectedCompanyId || selectedJobIds.length === 0}
                    className="w-full h-16 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-[0.97]"
                  >
                    {reduxLoading ? <Loader size="sm" /> : <Send className="w-4 h-4 mr-2" />}
                    Initiate Deployment
                  </Button>
                  <p className="text-[9px] text-indigo-200/60 font-medium mt-4 text-center">Proceeding will dispatch communications to all eligible student profiles.</p>
               </div>
               <div className="absolute top-0 right-0 size-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
               <div className="absolute bottom-0 left-0 size-40 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
            </div>

            <div className="saas-card border-dashed border-2">
               <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">Transmission Policy</h3>
               <ul className="space-y-4">
                  {[
                    "Emails are dispatched asynchronously via core hub.",
                    "System templates are automatically personalized.",
                    "Analytics will be available in the Reports section."
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 items-start">
                       <div className="size-4 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckSquare className="size-2 text-indigo-600" />
                       </div>
                       <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">{text}</span>
                    </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>

      {/* Modernized Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none rounded-3xl">
          <div className="bg-slate-900 p-10 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">Transmission Preview</DialogTitle>
              <div className="flex items-center gap-3 mt-4">
                 <div className="px-3 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest">External Deployment</div>
                 <div className="text-white/40 text-xs font-bold flex items-center gap-1.5"><Eye className="size-3" /> WYSIWYG View</div>
              </div>
            </DialogHeader>
            <div className="absolute top-0 right-0 size-48 bg-indigo-600/20 rounded-full -mr-24 -mt-24 blur-3xl" />
          </div>
          <div className="p-10 bg-card space-y-8">
             <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Subject Header</p>
                   <div className="p-4 rounded-xl bg-muted/50 border border-border/50 font-bold text-foreground">{subject || "New Opportunities Available"}</div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Message Payload</p>
                   <div 
                     className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 text-sm font-medium text-foreground prose prose-indigo max-w-none min-h-[200px]"
                     dangerouslySetInnerHTML={{ __html: message || "<p class='italic opacity-50'>Standard placement invitation template will be utilized for this deployment...</p>" }}
                   />
                </div>
             </div>
             <DialogFooter>
                <Button className="h-14 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20" onClick={() => setIsPreviewOpen(false)}>Close Inspector</Button>
             </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default BulkEmail;
