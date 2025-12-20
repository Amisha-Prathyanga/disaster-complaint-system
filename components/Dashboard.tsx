import React, { useMemo, useState } from 'react';
import { Complaint, ComplaintStatus, User, UserRole, Priority } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Search, Filter, AlertTriangle, MapPin, Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { IncidentMap } from './IncidentMap';
import { exportToPDF, exportToExcel } from '../services/exportUtils';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface DashboardProps {
  complaints: Complaint[];
  user: User;
  onSelectComplaint: (c: Complaint) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ complaints, user, onSelectComplaint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter complaints based on Role
  const accessibleComplaints = useMemo(() => {
    if (user.role === UserRole.ADMIN) {
      return complaints;
    }
    return complaints.filter(c => c.dsd === user.dsd);
  }, [complaints, user]);

  // Apply UI Filters (Search, Status, Date)
  const filteredComplaints = useMemo(() => {
    return accessibleComplaints.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      
      let matchesDate = true;
      if (startDate && endDate) {
        const cDate = new Date(c.createdAt);
        matchesDate = isWithinInterval(cDate, {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate))
        });
      } else if (startDate) {
        matchesDate = new Date(c.createdAt) >= startOfDay(new Date(startDate));
      } else if (endDate) {
        matchesDate = new Date(c.createdAt) <= endOfDay(new Date(endDate));
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [accessibleComplaints, searchTerm, statusFilter, startDate, endDate]);

  // Stats Logic
  const stats = useMemo(() => {
    const total = accessibleComplaints.length;
    const pending = accessibleComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.REJECTED).length;
    const critical = accessibleComplaints.filter(c => c.priority === Priority.CRITICAL && c.status !== ComplaintStatus.RESOLVED).length;
    
    // Category Data
    const categoryDataMap: Record<string, number> = {};
    accessibleComplaints.forEach(c => {
      categoryDataMap[c.category] = (categoryDataMap[c.category] || 0) + 1;
    });
    const categoryData = Object.keys(categoryDataMap).map(name => ({ name, value: categoryDataMap[name] }));

    // Trend Data (Last 7 Days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStr = format(date, 'yyyy-MM-dd');
      const count = accessibleComplaints.filter(c => 
        format(new Date(c.createdAt), 'yyyy-MM-dd') === dayStr
      ).length;
      trendData.push({
        date: format(date, 'MMM dd'),
        count: count
      });
    }

    return { total, pending, critical, categoryData, trendData };
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Trend Analysis (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              {user.role === UserRole.ADMIN ? 'All Complaints' : `Complaints - ${user.dsd} Division`}
            </h3>
            <div className="flex gap-2">
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
          
          <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search ID or Title..." 
                 className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full"
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

             <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Start Date"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="End Date"
                />
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