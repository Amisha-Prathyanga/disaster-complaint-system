import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ComplaintForm } from './components/ComplaintForm';
import { Dashboard } from './components/Dashboard';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { api } from './services/api';
import { Complaint, User, UserRole } from './types';
import { Lock, User as UserIcon, Loader2, Search } from 'lucide-react';
import { TrackingPortal } from './components/TrackingPortal';
import toast, { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  // Global State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'HOME' | 'SUBMIT' | 'LOGIN' | 'DASHBOARD' | 'TRACK'>('HOME');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Load complaints when dashboard is viewed or user changes
  useEffect(() => {
    if (currentUser) {
      loadComplaints();
    }
  }, [currentUser]);

  const loadComplaints = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const data = await api.getComplaints(currentUser);
    setComplaints(data);
    setIsLoading(false);
  };

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const toastId = toast.loading('Authenticating...');
    
    const user = await api.login(loginUsername, loginPassword);
    
    if (user) {
      toast.success(`Welcome back, ${user.name}!`, { id: toastId });
      setCurrentUser(user);
      setView('DASHBOARD');
    } else {
      toast.error('Invalid username or password', { id: toastId });
      setLoginError('Invalid username or password');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setCurrentUser(null);
      setView('HOME');
      toast.success('Logged out successfully');
    }
  };

  const handleComplaintSubmit = async (data: Partial<Complaint>) => {
    if (!window.confirm('Are you sure you want to submit this complaint?')) return;

    const toastId = toast.loading('Submitting complaint...');
    const newId = `CMP-2023-${String(Date.now()).slice(-6)}`;
    const newComplaint = {
      ...data,
      id: newId,
      remarks: [],
    };
    
    const success = await api.createComplaint(newComplaint);
    
    if (success) {
      toast.success('Complaint submitted successfully!', { id: toastId });
      setSubmissionSuccess(newId);
      setView('HOME');
    } else {
      toast.error('Failed to submit complaint. Please try again.', { id: toastId });
    }
  };

  const handleUpdateComplaint = async (updated: Complaint) => {
    // If status is changing to RESOLVED, ask for extra confirmation
    if (updated.status === 'Resolved' && selectedComplaint?.status !== 'Resolved') {
      if (!window.confirm('You are marking this complaint as Resolved. This will close the case. Continue?')) {
        return;
      }
    }

    const toastId = toast.loading('Updating complaint...');
    const success = await api.updateComplaint(updated.id, updated);
    
    if (success) {
      toast.success('Complaint updated successfully', { id: toastId });
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (selectedComplaint && selectedComplaint.id === updated.id) {
        setSelectedComplaint(updated);
      }
    } else {
      toast.error('Failed to update complaint', { id: toastId });
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {/* Report Card */}
        <div 
          onClick={() => setView('SUBMIT')}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
            <UserIcon className="h-7 w-7 text-red-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Incident</h2>
          <p className="text-slate-500">
            For citizens to report safety issues, infrastructure damage, disaster situations.
          </p>
        </div>

        {/* Track Card */}
        <div 
          onClick={() => setView('TRACK')}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
            <Search className="h-7 w-7 text-green-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Track Status</h2>
          <p className="text-slate-500">
            Check the realtime status of a submitted complaint using your Reference ID.
          </p>
        </div>

        {/* Officer Card */}
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
        
        {loginError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input 
              type="text" 
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. admin or officer_colombo"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium flex justify-center items-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
            {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
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
      onLogout={handleLogout}
      onLoginClick={() => setView('LOGIN')}
      onHomeClick={() => setView('HOME')}
    >
      <Toaster position="top-right" />
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

      {view === 'TRACK' && (
        <TrackingPortal onBack={() => setView('HOME')} />
      )}

      {view === 'DASHBOARD' && currentUser && (
        <>
          <Dashboard 
            complaints={complaints}
            user={currentUser}
            onSelectComplaint={setSelectedComplaint}
          />
          {selectedComplaint && (
            <ComplaintDetailModal
              complaint={selectedComplaint}
              currentUser={currentUser}
              onClose={() => setSelectedComplaint(null)}
              onUpdate={handleUpdateComplaint}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;