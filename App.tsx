import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ComplaintForm } from './components/ComplaintForm';
import { Dashboard } from './components/Dashboard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { INITIAL_COMPLAINTS, MOCK_USERS } from './services/mockData';
import { Complaint, User, UserRole } from './types';
import { Lock, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'HOME' | 'SUBMIT' | 'LOGIN' | 'DASHBOARD'>('HOME');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Login Form State
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.OFFICER);
  const [loginDsd, setLoginDsd] = useState<string>('Colombo');
  
  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple Mock Login Logic
    if (loginRole === UserRole.ADMIN) {
      setCurrentUser(MOCK_USERS[0]);
    } else {
      // Create officer user with selected DSD
      const officerUser: User = {
        id: `officer_${loginDsd.toLowerCase()}`,
        name: `Officer ${loginDsd}`,
        role: UserRole.OFFICER,
        dsd: loginDsd
      };
      setCurrentUser(officerUser); 
    }
    setView('DASHBOARD');
  };

  const handleComplaintSubmit = (data: Partial<Complaint>) => {
    const newId = `CMP-2023-${String(complaints.length + 1).padStart(3, '0')}`;
    const newComplaint: Complaint = {
      ...data as Complaint,
      id: newId,
      remarks: [],
    };
    setComplaints([newComplaint, ...complaints]);
    setSubmissionSuccess(newId);
    setView('HOME');
  };

  const handleUpdateComplaint = (updated: Complaint) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selectedComplaint && selectedComplaint.id === updated.id) {
      setSelectedComplaint(updated);
    }
  };

  // Render Helpers
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Disaster Response Portal
        </h1>
        <p className="text-lg text-slate-600">
          A centralized platform for citizens to report emergencies and for authorities to coordinate rapid response.
        </p>
      </div>

      {submissionSuccess && (
         <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md w-full max-w-lg mb-8" role="alert">
           <p className="font-bold">Complaint Submitted Successfully</p>
           <p>Your Reference ID: <span className="font-mono bg-green-200 px-1 rounded">{submissionSuccess}</span></p>
           <button onClick={() => setSubmissionSuccess(null)} className="text-sm underline mt-2">Dismiss</button>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div 
          onClick={() => setView('SUBMIT')}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
            <UserIcon className="h-7 w-7 text-red-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Incident</h2>
          <p className="text-slate-500">
            For citizens to report safety issues, infrastructure damage, or request assistance during disasters.
          </p>
        </div>

        <div 
          onClick={() => setView('LOGIN')}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <Lock className="h-7 w-7 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Officer Portal</h2>
          <p className="text-slate-500">
            Restricted access for Divisional Secretariat Officers and Administrators to manage complaints.
          </p>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">System Login</h2>
          <p className="text-sm text-slate-500 mt-1">Authorized Personnel Only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Select Role (Simulation)</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLoginRole(UserRole.OFFICER)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${loginRole === UserRole.OFFICER ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600'}`}
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => setLoginRole(UserRole.ADMIN)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${loginRole === UserRole.ADMIN ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-300 text-slate-600'}`}
              >
                Administrator
              </button>
            </div>
          </div>
          
          {loginRole === UserRole.OFFICER && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Division (DSD)</label>
              <select
                value={loginDsd}
                onChange={(e) => setLoginDsd(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Badulla">Badulla</option>
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input type="text" disabled value="demo_user" className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" disabled value="********" className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Login to Dashboard
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setView('HOME')} className="text-sm text-slate-500 hover:text-slate-900 underline">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      user={currentUser}
      onLogout={() => { setCurrentUser(null); setView('HOME'); }}
      onLoginClick={() => setView('LOGIN')}
      onHomeClick={() => setView('HOME')}
    >
      {view === 'HOME' && renderHome()}
      
      {view === 'SUBMIT' && (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setView('HOME')}
            className="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2"
          >
            &larr; Back to Home
          </button>
          <ComplaintForm onSubmit={handleComplaintSubmit} />
        </div>
      )}

      {view === 'LOGIN' && renderLogin()}

      {view === 'DASHBOARD' && currentUser && (
        <Dashboard
          complaints={complaints}
          user={currentUser}
          onSelectComplaint={setSelectedComplaint}
        />
      )}

      {/* Modal is global */}
      {selectedComplaint && currentUser && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={handleUpdateComplaint}
        />
      )}
    </Layout>
  );
};

export default App;