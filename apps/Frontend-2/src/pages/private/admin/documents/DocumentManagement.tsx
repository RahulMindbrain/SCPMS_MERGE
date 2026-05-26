import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Eye,
  ChevronDown,
  FileDown,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Document {
  id: string;
  student: string;
  department: string;
  file: string;
  uploaded: string;
  size: string;
  status: 'Verified' | 'Pending';
}

const DocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Student Resumes' | 'Offer Letters'>('Student Resumes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Depts');
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', student: 'Priya Sharma', department: 'CSE', file: 'priya_sharma_resume.pdf', uploaded: 'Apr 2, 2026', size: '245 KB', status: 'Verified' },
    { id: '2', student: 'Rahul Verma', department: 'IT', file: 'rahul_verma_resume.pdf', uploaded: 'Apr 1, 2026', size: '312 KB', status: 'Verified' },
    { id: '3', student: 'Ananya Patel', department: 'ECE', file: 'ananya_patel_resume.pdf', uploaded: 'Mar 28, 2026', size: '198 KB', status: 'Pending' },
    { id: '4', student: 'Vikram Singh', department: 'CSE', file: 'vikram_singh_resume.pdf', uploaded: 'Mar 25, 2026', size: '278 KB', status: 'Verified' },
    { id: '5', student: 'Sneha Gupta', department: 'ME', file: 'sneha_gupta_resume.pdf', uploaded: 'Mar 20, 2026', size: '356 KB', status: 'Pending' },
    { id: '6', student: 'Neha Reddy', department: 'EE', file: 'neha_reddy_resume.pdf', uploaded: 'Mar 18, 2026', size: '220 KB', status: 'Verified' },
  ]);

  const departments = ['All Depts', 'CSE', 'IT', 'ECE', 'ME', 'EE', 'CE'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.file.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All Depts' || doc.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [documents, searchTerm, selectedDept]);

  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const pendingCount = documents.filter(d => d.status === 'Pending').length;

  const stats = [
    { label: 'Resumes', value: documents.length.toString(), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Verified', value: verifiedCount.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pending Review', value: pendingCount.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Offer Letters', value: '3', icon: FileDown, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const handleVerify = async (id: string) => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
    setPreviewDoc(null);
    setIsVerifying(false);
    toast.success("Document verified successfully!");
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Preparing ${doc.file} for download...`);
  };

  const handleDownloadAll = () => {
    toast.success(`Starting bulk download of ${filteredDocs.length} documents...`);
  };

  return (
    <div className="p-1  animate-in fade-in duration-700">
      

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-20">
        {/* Tabs and Actions */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {['Student Resumes', 'Offer Letters'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group w-full lg:w-auto lg:flex-none lg:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student or file..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                  <span>{selectedDept}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDeptMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDeptMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2"
                    >
                      {departments.map(dept => (
                        <button
                          key={dept}
                          onClick={() => {
                            setSelectedDept(dept);
                            setIsDeptMenuOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm font-bold transition-colors ${selectedDept === dept ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {dept}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">File Reference</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date Uploaded</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Size</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Review Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc, i) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={doc.id}
                  className="hover:bg-indigo-50/20 transition-colors group cursor-default"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-800">{doc.student}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{doc.department}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-rose-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{doc.file}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">
                    {doc.uploaded}
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400">
                    {doc.size}
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={doc.status === 'Verified' ? 'success' : 'warning'} className="uppercase tracking-widest text-[9px] px-3 font-black">
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-sm transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title="Document Inspection"
        subtitle={`${previewDoc?.student} — ${previewDoc?.file}`}
      >
        <div className="space-y-8">
          <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] border-4 border-slate-100 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-rose-500 mb-6">
              <FileText size={40} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{previewDoc?.file}</h4>
            <p className="text-slate-500 font-medium mb-8">PDF Viewing is restricted in preview mode. Please download to view full document.</p>
            <Button
              onClick={() => handleDownload(previewDoc!)}
              variant="outline"
              className="rounded-2xl border-slate-200 font-bold px-8"
            >
              <Download className="w-4 h-4 mr-2" /> Download Original
            </Button>
          </div>

          {previewDoc?.status === 'Pending' ? (
            <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-amber-900 font-bold mb-1">Awaiting Verification</p>
                <p className="text-amber-700 text-sm font-medium leading-relaxed mb-4">
                  This document needs to be reviewed for authenticity before the student can proceed with applications.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVerify(previewDoc.id)}
                    disabled={isVerifying}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 font-bold"
                  >
                    {isVerifying ? "Verifying..." : "Approve & Verify"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-amber-200 text-amber-700 bg-white font-bold"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-emerald-900 font-bold">Verified Document</p>
                <p className="text-emerald-700/70 text-sm font-medium">This document was verified on {previewDoc?.uploaded}.</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentManagement;
