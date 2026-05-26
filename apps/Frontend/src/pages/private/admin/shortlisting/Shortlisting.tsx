import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2,  
} from 'lucide-react';
import { motion } from 'framer-motion';

import { toast } from 'sonner';
import Loader from '@/components/Loader';

interface Applicant {
  id: string;
  name: string;
  dept: string;
  cgpa: number;
  currentRound: string;
  selected: boolean;
}

const Shortlisting: React.FC = () => {
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [applicants, setApplicants] = useState<Applicant[]>([
    { id: '1', name: 'Priya Sharma', dept: 'CSE', cgpa: 9.4, currentRound: 'Applied', selected: false },
    { id: '2', name: 'Rahul Verma', dept: 'IT', cgpa: 9.2, currentRound: 'Applied', selected: false },
    { id: '3', name: 'Ananya Patel', dept: 'ECE', cgpa: 9.1, currentRound: 'Applied', selected: false },
    { id: '4', name: 'Vikram Singh', dept: 'CSE', cgpa: 8.9, currentRound: 'Applied', selected: false },
    { id: '5', name: 'Sneha Gupta', dept: 'ME', cgpa: 8.5, currentRound: 'Applied', selected: false },
    { id: '6', name: 'Neha Reddy', dept: 'EE', cgpa: 8.7, currentRound: 'Applied', selected: false },
    { id: '7', name: 'Amit Kumar', dept: 'CE', cgpa: 7.8, currentRound: 'Applied', selected: false },
  ]);

  const stats = [
    { label: 'Total Applicants', value: applicants.length, color: 'text-[#c7c4d7]' },
    { label: 'Selected', value: selectedApplicants.length, color: 'text-blue-600' },
    { label: 'Shortlisted So Far', value: 3, color: 'text-emerald-600' },
    { label: 'Rejected', value: 0, color: 'text-rose-600' },
  ];

  const toggleSelect = (id: string) => {
    setSelectedApplicants(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleMoveToShortlisted = async () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant");
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApplicants(prev => prev.map(a => 
      selectedApplicants.includes(a.id) ? { ...a, currentRound: 'Shortlisted' } : a
    ));
    
    toast.success(`${selectedApplicants.length} applicants moved to Shortlisted round!`);
    setSelectedApplicants([]);
    setIsProcessing(false);
  };

  return (
    <div className="p-1">
      

      {/* Control Panel */}
      <div className="bg-[#1e1f26] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Company / Drive</label>
            <select className="w-full px-4 py-3 bg-[#111319] border border-[rgba(255,255,255,0.08)] rounded-xl focus:outline-none text-[#c7c4d7] font-bold">
              <option>Google — SDE Intern</option>
              <option>Microsoft — Full Stack</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Promote to Round</label>
            <select className="w-full px-4 py-3 bg-[#111319] border border-[rgba(255,255,255,0.08)] rounded-xl focus:outline-none text-[#c7c4d7] font-bold">
              <option>Shortlisted</option>
              <option>Technical Round 1</option>
              <option>HR Interview</option>
            </select>
          </div>
          <div className="flex-1">
             <button 
               onClick={handleMoveToShortlisted}
               disabled={isProcessing || selectedApplicants.length === 0}
               className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold border-2 border-indigo-500 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isProcessing ? (
                 <span className="flex items-center gap-2">
                   <Loader size="sm" /> Processing...
                 </span>
               ) : (
                 <>
                   <ArrowRight className="w-4 h-4" />
                   <span>Move {selectedApplicants.length} to Shortlisted</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-[#1e1f26] p-6 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-sm text-center"
          >
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Applicants Table */}
      <div className="bg-[#1e1f26] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h2 className="font-bold text-[#e2e2eb]">Applicants</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-[#111319] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm w-64 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111319] border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                   <div className="w-5 h-5 border-2 border-slate-300 rounded-md"></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#908fa0] uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-[#908fa0] uppercase">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-[#908fa0] uppercase text-center">CGPA</th>
                <th className="px-6 py-4 text-xs font-bold text-[#908fa0] uppercase text-center">Current Round</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-[#111319] transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleSelect(applicant.id)}
                      className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${selectedApplicants.includes(applicant.id) ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-200'}`}
                    >
                      {selectedApplicants.includes(applicant.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#e2e2eb]">{applicant.name}</td>
                  <td className="px-6 py-4 text-[#c7c4d7] font-medium">{applicant.dept}</td>
                  <td className="px-6 py-4 text-center text-[#c7c4d7] font-medium">{applicant.cgpa}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-[#c7c4d7]">
                      {applicant.currentRound}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shortlisting;
