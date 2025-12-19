import React, { useMemo, useState } from 'react';
import { Complaint, ComplaintStatus, User, UserRole, Priority } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, AlertTriangle, MapPin, Download, FileSpreadsheet } from 'lucide-react';
import { IncidentMap } from './IncidentMap';
import { exportToPDF, exportToExcel } from '../services/exportUtils';

interface DashboardProps {
  complaints: Complaint[];
  user: User;
  onSelectComplaint: (c: Complaint) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ complaints, user, onSelectComplaint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter complaints based on Role
  const accessibleComplaints = useMemo(() => {
    console.log('User role:', user.role, 'User DSD:', user.dsd);
    console.log('Total complaints:', complaints.length);
    
    if (user.role === UserRole.ADMIN) {
      console.log('Admin user - showing all complaints');
      return complaints;
    }
    
    const filtered = complaints.filter(c => c.dsd === user.dsd);
    console.log('Officer user - filtered to', filtered.length, 'complaints for DSD:', user.dsd);
    filtered.forEach(c => console.log('  -', c.id, c.title, 'DSD:', c.dsd, 'Coords:', c.latitude, c.longitude));
    
    return filtered;
  }, [complaints, user]);

  // Apply UI Filters
  const filteredComplaints = useMemo(() => {
    return accessibleComplaints.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accessibleComplaints, searchTerm, statusFilter]);

  // Stats Logic
  const stats = useMemo(() => {
    const total = accessibleComplaints.length;
    const pending = accessibleComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.REJECTED).length;
    const critical = accessibleComplaints.filter(c => c.priority === Priority.CRITICAL && c.status !== ComplaintStatus.RESOLVED).length;
    
    // Data for charts
    const categoryDataMap: Record<string, number> = {};
    accessibleComplaints.forEach(c => {
      categoryDataMap[c.category] = (categoryDataMap[c.category] || 0) + 1;
    });
    const categoryData = Object.keys(categoryDataMap).map(name => ({ name, value: categoryDataMap[name] }));

    return { total, pending, critical, categoryData };
  }, [accessibleComplaints]);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Complaints</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Active / Pending</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
          <div className="flex items-center gap-2">
             <AlertTriangle className="text-red-600 h-5 w-5" />
             <p className="text-sm font-medium text-red-600">Critical Issues</p>
          </div>
          <p className="text-3xl font-bold text-red-700 mt-2">{stats.critical}</p>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">
            {user.role === UserRole.ADMIN ? 'All Incident Locations' : `Incident Locations - ${user.dsd} Division`}
          </h3>
        </div>
        <div className="h-96">
          <IncidentMap 
            complaints={accessibleComplaints} 
            onSelectComplaint={onSelectComplaint}
          />
        </div>
      </div>

      {/* Charts Area */}
      {user.role === UserRole.ADMIN && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Complaints by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex items-center justify-center text-slate-400">
            {/* Placeholder for future Trend Analysis Chart */}
             <div className="text-center">
               <p className="font-semibold">Trend Analysis</p>
               <p className="text-sm">Complaint volume over last 7 days</p>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">
            {user.role === UserRole.ADMIN ? 'All Complaints' : `Complaints - ${user.dsd} Division`}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search ID or Title..." 
                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <select 
                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[150px]"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="All">All Status</option>
                 {Object.values(ComplaintStatus).map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
             </div>
             
             <div className="flex gap-2 border-l pl-2 border-slate-200 ml-2">
               <button
                 onClick={() => exportToPDF(filteredComplaints, user)}
                 className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                 title="Export to PDF"
               >
                 <Download size={16} />
                 <span className="hidden lg:inline">PDF</span>
               </button>
               <button
                 onClick={() => exportToExcel(filteredComplaints, user)}
                 className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
                 title="Export to Excel"
               >
                 <FileSpreadsheet size={16} />
                 <span className="hidden lg:inline">Excel</span>
               </button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No complaints found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{c.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${c.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' : 
                          c.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' : 
                          c.priority === Priority.MEDIUM ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${c.status === ComplaintStatus.NEW ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' : 
                          c.status === ComplaintStatus.IN_PROGRESS ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' : 
                          c.status === ComplaintStatus.RESOLVED ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-slate-100 text-slate-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelectComplaint(c)}
                        className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};