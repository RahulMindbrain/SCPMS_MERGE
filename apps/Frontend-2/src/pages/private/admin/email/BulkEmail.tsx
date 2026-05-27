import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Mail, 
  Send, 
  Eye, 
  ChevronDown, 
  Check, 
  Search, 

  Info
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

const TEMPLATES = [
  {
    id: "placement-invite",
    name: "Placement Drive Invitation",
    description: "Invite eligible profiles to apply for active roles",
    subject: "Action Required: Invitation to Participate in Placement Drive for {companyName}",
    message: `<p>Dear Student,</p>
<p>We are pleased to invite you to participate in the upcoming campus recruitment drive for <strong>{companyName}</strong>. This drive is open to all students meeting the criteria specified by the organization.</p>
<p><strong>Available Roles:</strong> {jobTitles}</p>
<p>Please review the detailed requirements, eligibility criteria (such as minimum CGPA and active backlogs), and eligible departments under your student dashboard. Ensure your profile and resume are fully updated before applying.</p>
<p>Best regards,<br/>Training & Placement Cell</p>`
  },
  {
    id: "assessment-notify",
    name: "Assessment Schedule",
    description: "Notify shortlisted candidates about an evaluation session",
    subject: "Schedule Announcement: Technical Assessment for {companyName}",
    message: `<p>Dear Student,</p>
<p>As part of the recruitment process for <strong>{companyName}</strong>, all eligible and registered candidates are required to complete the online technical assessment.</p>
<p><strong>Details of the Drive:</strong></p>
<ul>
  <li><strong>Roles:</strong> {jobTitles}</li>
  <li><strong>Assessment Type:</strong> Coding and Technical Aptitude Evaluation</li>
</ul>
<p>Please ensure you are in a quiet environment with a stable internet connection. Further instructions and personal test credentials will be shared shortly.</p>
<p>Best regards,<br/>Training & Placement Cell</p>`
  },
  {
    id: "pre-placement-talk",
    name: "Pre-Placement Talk (PPT)",
    description: "Announce PPT session details and schedule",
    subject: "Announcement: Pre-Placement Talk by {companyName}",
    message: `<p>Dear Student,</p>
<p>This is to inform you that <strong>{companyName}</strong> will be hosting a Pre-Placement Talk (PPT) to share insights about their work culture, career paths, and specific job openings.</p>
<p><strong>Roles Highlighted:</strong> {jobTitles}</p>
<p>Attendance is highly recommended for all aspiring applicants as this session will cover the interview structure and evaluation criteria.</p>
<p>Best regards,<br/>Training & Placement Cell</p>`
  }
];

const BulkEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Redux State
  const { companies: reduxCompanies, jobs: reduxJobs, loading: reduxLoading } = useSelector((state: RootState) => state.company);
  
  // Selection State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // UI State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // 1. Fetch Companies on Mount
  useEffect(() => {
    dispatch(fetchCompanies({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const selectAllJobs = () => {
    if (reduxJobs && reduxJobs.length > 0) {
      if (selectedJobIds.length === reduxJobs.length) {
        setSelectedJobIds([]);
      } else {
        setSelectedJobIds(reduxJobs.map(j => j.id));
      }
    }
  };

  const loadTemplate = (tpl: typeof TEMPLATES[0]) => {
    if (!selectedCompanyId) {
      toast.warning("Please select a company first to load templates");
      return;
    }
    const compName = reduxCompanies.find(c => c.id.toString() === selectedCompanyId)?.name || "the company";
    const selectedJobs = reduxJobs.filter(j => selectedJobIds.includes(j.id));
    const jobTitles = selectedJobs.map(j => j.title).join(", ") || "the specified roles";
    
    setSubject(tpl.subject.replaceAll("{companyName}", compName));
    setMessage(tpl.message.replaceAll("{companyName}", compName).replaceAll("{jobTitles}", jobTitles));
    toast.success(`${tpl.name} template loaded!`);
  };

  const handleSendMail = async () => {
    if (!selectedCompanyId || selectedJobIds.length === 0) {
      toast.error("Please select a company and at least one job");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please provide a subject header for the campaign");
      return;
    }

    if (!message.trim()) {
      toast.error("Please compose an email message body");
      return;
    }

    const loadingToast = toast.loading("Dispatching placement communications...");

    try {
      await dispatch(sendBulkMail({
        companyId: Number(selectedCompanyId),
        jobUniversityIds: selectedJobIds,
        subject: subject,
        message: message
      })).unwrap();
      
      toast.success("Outreach emails dispatched successfully!", { id: loadingToast });
      setSubject('');
      setMessage('');
      setSelectedJobIds([]);
    } catch (error: any) {
      toast.error(error || "Failed to dispatch email campaign", { id: loadingToast });
    }
  };

  // Get currently selected company details
  const currentCompany = reduxCompanies.find(c => c.id.toString() === selectedCompanyId);
  const filteredCompanies = reduxCompanies.filter(c => 
    c.name.toLowerCase().includes(companySearchQuery.toLowerCase())
  );



  return (
    <AdminPageLayout>
      <PageHeader
        title="Email Outreach Manager"
        description="Deliver targeted notifications, interview schedules, and drive invitations to candidate pools."
        badge="Communications"
        icon={Mail}
        variant="indigo"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 items-start">
        {/* Composition and Settings - Left side */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card 1: Select Company */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">1</span>
              <h3 className="text-base font-bold text-slate-800">Partner Organization</h3>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center justify-between w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {currentCompany ? (
                    <>
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/5 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                        {currentCompany.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{currentCompany.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">
                        C
                      </div>
                      <span className="text-sm font-medium text-slate-400">Choose partner organization...</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isCompanyDropdownOpen && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-200">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search company database..."
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-700 outline-none border-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCompanyId(c.id.toString());
                            setIsCompanyDropdownOpen(false);
                            setCompanySearchQuery('');
                          }}
                          className={`flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer text-sm font-medium transition-colors ${selectedCompanyId === c.id.toString() ? 'bg-indigo-50/40 text-indigo-600' : 'text-slate-600'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                              {c.name[0]}
                            </div>
                            <span>{c.name}</span>
                          </div>
                          {selectedCompanyId === c.id.toString() && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-center text-xs font-semibold text-slate-400">
                        No partner entities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Select Jobs */}
          <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 space-y-6 transition-all duration-300 ${!selectedCompanyId ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">2</span>
                <h3 className="text-base font-bold text-slate-800">Recruitment Campaigns</h3>
              </div>
              
              {reduxJobs && reduxJobs.length > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={selectAllJobs}
                  className="h-8 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-xl"
                >
                  {selectedJobIds.length === reduxJobs.length ? "Deselect All" : "Select All Available"}
                </Button>
              )}
            </div>

            {reduxLoading && selectedCompanyId ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader size="md" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading job listings...</span>
              </div>
            ) : reduxJobs && reduxJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reduxJobs.map((job: any) => {
                  const isSelected = selectedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => toggleJob(job.id)}
                      className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group bg-white ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/10 shadow-sm shadow-indigo-600/5' 
                          : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/20'
                      }`}
                    >
                      {/* Job Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                            {job.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-indigo-600/80 uppercase tracking-wide mt-1 block truncate">
                            {job.university?.name || "Target Pool"}
                          </span>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-600 text-white' 
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </span>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 mb-4 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium">Salary Package</span>
                          <p className="font-bold text-slate-700 mt-0.5">₹{(job.salary / 100000).toFixed(1)} LPA</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Vacancies</span>
                          <p className="font-bold text-slate-700 mt-0.5">{job.openings} Openings</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Minimum CGPA</span>
                          <p className="font-bold text-slate-700 mt-0.5">{job.minCgpa}+ CGPA</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Location</span>
                          <p className="font-bold text-slate-700 mt-0.5 truncate">{job.job?.location || "Remote"}</p>
                        </div>
                      </div>

                      {/* Department Tags */}
                      {job.job?.eligibleDepartments && job.job.eligibleDepartments.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Departments</span>
                          <div className="flex flex-wrap gap-1">
                            {job.job.eligibleDepartments.slice(0, 2).map((d: any) => (
                              <span key={d.id} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium max-w-[120px] truncate">
                                {d.name}
                              </span>
                            ))}
                            {job.job.eligibleDepartments.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-medium">
                                +{job.job.eligibleDepartments.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Required Skills */}
                      {job.job?.skills && job.job.skills.length > 0 && (
                        <div className="space-y-1.5 mt-auto">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Key Requirements</span>
                          <div className="flex flex-wrap gap-1">
                            {job.job.skills.slice(0, 3).map((s: any) => (
                              <span key={s.id} className="px-2 py-0.5 bg-indigo-50/50 text-indigo-600 rounded text-[9px] font-medium border border-indigo-100/50">
                                {s.name}
                              </span>
                            ))}
                            {job.job.skills.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-indigo-50/50 text-indigo-500 rounded text-[9px] font-medium border border-indigo-100/50">
                                +{job.job.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : selectedCompanyId ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                <Briefcase className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No placement campaigns registered</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                <Info className="w-6 h-6 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-400">Select a company source above to list job profiles</p>
              </div>
            )}
          </div>

          {/* Card 3: Email Content */}
          <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 space-y-6 transition-all duration-300 ${selectedJobIds.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">3</span>
              <h3 className="text-base font-bold text-slate-800">Email Campaign Builder</h3>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Outreach Templates</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/30 hover:bg-indigo-50/10 cursor-pointer group transition-all"
                  >
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 block mb-1">{tpl.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-relaxed block">{tpl.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Subject Header</label>
                <input
                  type="text"
                  placeholder="e.g. Invitation to Campus Drive..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-400/80 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Broadcast Message (HTML Supported)</label>
                <textarea
                  rows={10}
                  placeholder="Draft your recruitment message or load a template above..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400/80 outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary - Right side */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Campaign Overview</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm font-medium">
                <span className="text-slate-400">Selected Roles</span>
                <span className="font-bold text-slate-800">{selectedJobIds.length} Roles</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm font-medium">
                <span className="text-slate-400">Campaign Status</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedJobIds.length > 0 && subject.trim() && message.trim()
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {selectedJobIds.length > 0 && subject.trim() && message.trim() ? "Ready to Launch" : "Draft"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleSendMail}
                disabled={reduxLoading || !selectedCompanyId || selectedJobIds.length === 0}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {reduxLoading ? <Loader size="sm" /> : <Send className="w-4.5 h-4.5" />}
                Send Emails
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(true)}
                disabled={selectedJobIds.length === 0}
                className="w-full h-12 rounded-xl border-slate-200 text-slate-500 font-semibold text-xs tracking-wide hover:bg-slate-50 transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" /> Preview Email Layout
              </Button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed text-center">
              Campaigns will be processed asynchronously in the backend core hub. Please do not close the console during transmission.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Outreach Guidelines</h4>
            <ul className="space-y-3">
              {[
                "Target pools are dynamically filtered based on approved departments.",
                "Ensure template fields (such as CGPA criteria) are fully verified before dispatch.",
                "HTML elements are fully supported to create rich recruiter templates."
              ].map((text, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[11px] font-medium text-slate-500 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modernized Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 rounded-3xl shadow-2xl bg-white">
          <div className="bg-slate-950 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">Campaign Email Preview</DialogTitle>
              <p className="text-slate-400 text-xs mt-1">This is how your outreach email will appear to target candidates</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject Header</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700">
                  {subject || "Action Required: Invitation to Participate in Placement Drive"}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outreach Message Body</span>
                <div 
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 min-h-[220px] max-h-[360px] overflow-y-auto custom-scrollbar prose prose-slate"
                  dangerouslySetInnerHTML={{ __html: message || "<p class='italic text-slate-400/80'>Write your message or load a template to preview layout...</p>" }}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button 
                className="h-12 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-slate-900/10" 
                onClick={() => setIsPreviewOpen(false)}
              >
                Close Inspector
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default BulkEmail;
