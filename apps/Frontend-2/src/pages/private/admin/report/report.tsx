import React   from 'react';
import {
  BarChart3, Users, Building2, GraduationCap,
  TrendingUp, Download,  Filter,
  ArrowUpRight, ArrowDownRight, Search 
} from 'lucide-react';

// --- Types ---
interface StatCard {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
}

const AnalyticsDashboard: React.FC = () => {

  const stats: StatCard[] = [
    {
      title: 'Total Placed',
      value: '842',
      trend: 12.5,
      icon: <Users size={20} />,
      color: 'bg-indigo-600'
    },
    {
      title: 'Placement %',
      value: '88.4%',
      trend: 4.2,
      icon: <TrendingUp size={20} />,
      color: 'bg-emerald-600'
    },
    {
      title: 'Average Package',
      value: '₹8.4 LPA',
      trend: 8.1,
      icon: <Building2 size={20} />,
      color: 'bg-blue-600'
    },
    {
      title: 'Top Package',
      value: '₹44.0 LPA',
      trend: 0,
      icon: <GraduationCap size={20} />,
      color: 'bg-amber-600'
    },
  ];

  return (
    <div className="min-h-screen bg-[#111319] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className=" mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          

          <div className="flex items-center gap-3">
            <div className="flex bg-[#1e1f26] border border-[rgba(255,255,255,0.08)] p-1 rounded-xl shadow-sm">
              <button className="px-4 py-2 text-sm font-bold bg-slate-100 text-[#e2e2eb] rounded-lg">Overview</button>
              <button className="px-4 py-2 text-sm font-bold text-[#908fa0] hover:text-[#e2e2eb] transition-colors">Reports</button>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>
      </div>

      <div className=" space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#1e1f26] p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg shadow-current/20`}>
                  {stat.icon}
                </div>
                {stat.trend !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-[#908fa0] uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-[#e2e2eb] mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts Row (Placeholders) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1e1f26] p-5 sm:p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-[#e2e2eb]">Placement Distribution</h3>
              <select className="bg-[#111319] border-none text-sm font-bold text-[#c7c4d7] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500">
                <option>By Department</option>
                <option>By Sector</option>
              </select>
            </div>
            {/* Visual Placeholder for a Chart (e.g., Recharts) */}
            <div className="h-72 w-full bg-[#111319] rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.08)] flex items-center justify-center relative overflow-hidden">
              <BarChart3 size={48} className="text-slate-200" />
              <div className="absolute inset-0 flex items-end justify-around px-10 pb-4">
                {[60, 85, 45, 90, 70, 55].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="w-12 bg-indigo-100 rounded-t-lg transition-all hover:bg-indigo-500" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1e1f26] p-5 sm:p-8 rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-[#e2e2eb] mb-6">Offer Types</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-48 w-48 rounded-full border-[16px] border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-2xl font-black text-[#e2e2eb]">1.2k</span>
                  <span className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest">Offers</span>
                </div>
                {/* CSS Pie Segment Simulation */}
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-indigo-600 border-t-transparent border-l-transparent -rotate-45" />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-bold text-[#c7c4d7]">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" /> Full Time
                </span>
                <span className="font-bold text-[#e2e2eb]">72%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-bold text-[#c7c4d7]">
                  <span className="w-3 h-3 rounded-full bg-slate-200" /> Internship
                </span>
                <span className="font-bold text-[#e2e2eb]">28%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Hires Table */}
        <div className="bg-[#1e1f26] rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-sm overflow-hidden">
          <div className="p-5 sm:p-8 border-b border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-[#e2e2eb]">Latest Selections</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0]" />
                <input
                  type="text"
                  placeholder="Filter students..."
                  className="pl-10 pr-4 py-2 bg-[#111319] border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="p-2 text-[#908fa0] hover:text-[#c7c4d7] hover:bg-[#111319] rounded-lg transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111319]">
                  <th className="px-8 py-4 text-[11px] font-black text-[#908fa0] uppercase tracking-widest">Student</th>
                  <th className="px-8 py-4 text-[11px] font-black text-[#908fa0] uppercase tracking-widest">Company</th>
                  <th className="px-8 py-4 text-[11px] font-black text-[#908fa0] uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-[11px] font-black text-[#908fa0] uppercase tracking-widest">Package</th>
                  <th className="px-8 py-4 text-[11px] font-black text-[#908fa0] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Rahul Verma', company: 'Google', role: 'SDE-1', package: '₹32.0 LPA', status: 'Accepted' },
                  { name: 'Sneha Kapur', company: 'Microsoft', role: 'Data Scientist', package: '₹28.5 LPA', status: 'Accepted' },
                  { name: 'Amit Singh', company: 'Amazon', role: 'Cloud Intern', package: '₹1.2 LPM', status: 'Pending' },
                  { name: 'Isha Reddy', company: 'Zomato', role: 'Product Analyst', package: '₹18.0 LPA', status: 'Accepted' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#111319] transition-colors group cursor-pointer">
                    <td className="px-8 py-4">
                      <div className="font-bold text-[#e2e2eb]">{row.name}</div>
                      <div className="text-xs font-medium text-[#908fa0]">Computer Science</div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#908fa0]">
                          {row.company[0]}
                        </div>
                        <span className="font-bold text-[#c7c4d7]">{row.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 font-semibold text-[#c7c4d7] text-sm">{row.role}</td>
                    <td className="px-8 py-4 font-bold text-[#e2e2eb] text-sm">{row.package}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${row.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-[#111319] border-t border-[rgba(255,255,255,0.06)] text-center">
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Full Selection Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;