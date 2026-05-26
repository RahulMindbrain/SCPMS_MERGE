import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  ShieldCheck, 
  Database, 
  Mail, 
  Save, 
  Globe 
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        <p className="text-gray-500 mb-8">Configure campus placement rules and administrative preferences.</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 space-y-1">
            {[
              { id: 'general', label: 'General Info', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'eligibility', label: 'Placement Rules', icon: ShieldCheck },
              { id: 'integrations', label: 'Email & API', icon: Mail },
              { id: 'backup', label: 'Data & Backup', icon: Database },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-white hover:text-indigo-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-4">General Configuration</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option>2025-2026</option>
                        <option>2026-2027</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portal Timezone</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input type="text" value="IST (UTC +5:30)" readOnly className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 bg-gray-50 cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placement Head Name</label>
                    <input type="text" placeholder="Dr. Sarah Jenkins" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'eligibility' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-4">Placement Eligibility Rules</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Minimum CGPA Requirement</p>
                      <p className="text-sm text-gray-500">Students below this cannot apply for Premium drives.</p>
                    </div>
                    <input type="number" step="0.1" defaultValue="7.0" className="w-20 border border-gray-300 rounded p-2 text-center" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">One-Job Policy</p>
                      <p className="text-sm text-gray-500">Block students from applying once they are placed.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-4">Notification Settings</h2>
                <div className="space-y-4">
                  {['New Drive Alert', 'Interview Shortlist', 'Document Deadline'].map((text) => (
                    <div key={text} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      <span className="text-gray-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Footer Actions */}
            <div className="mt-10 pt-6 border-t flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;