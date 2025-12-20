import React, { useState } from 'react';
import { api } from '../services/api';
import { Search, ArrowLeft, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import { ComplaintStatus, Priority } from '../types';

interface TrackingPortalProps {
  onBack: () => void;
}

export const TrackingPortal: React.FC<TrackingPortalProps> = ({ onBack }) => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    const data = await api.getPublicStatus(searchId.trim());
    
    if (data) {
      setResult(data);
    } else {
      setError('Complaint ID not found. Please check and try again.');
    }
    setLoading(false);
  };

  const getStepStatus = (step: string, currentStatus: string) => {
    const steps = [ComplaintStatus.NEW, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED];
    const currentIndex = steps.indexOf(currentStatus as ComplaintStatus);
    const stepIndex = steps.indexOf(step as ComplaintStatus);

    if (currentStatus === ComplaintStatus.REJECTED) return 'rejected';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <button 
          onClick={onBack}
          className="mb-8 text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Track Your Complaint</h1>
          <p className="text-slate-600">Enter your Reference ID (e.g., CMP-2023-001) to check the current status of your report.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Reference ID..."
              className="flex-1 px-6 py-4 rounded-xl border border-slate-200 text-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </form>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500 font-mono">#{result.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                    ${result.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {result.priority} Priority
                  </span>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-500 text-sm">{new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold border
                ${result.status === ComplaintStatus.RESOLVED ? 'bg-green-100 text-green-700 border-green-200' : 
                  result.status === ComplaintStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-200' : 
                  'bg-blue-100 text-blue-700 border-blue-200'}`}>
                {result.status}
              </div>
            </div>

            <div className="p-8">
              {/* Progress Stepper */}
              <div className="relative flex justify-between mb-12">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
                
                {[ComplaintStatus.NEW, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED].map((step, idx) => {
                  const status = getStepStatus(step, result.status);
                  const isCompleted = status === 'completed';
                  const isCurrent = result.status === step;
                  
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center bg-white px-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                          isCurrent ? 'bg-white border-blue-500 text-blue-600 scale-110' : 
                          'bg-slate-100 border-slate-200 text-slate-300'}`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : 
                         isCurrent ? <Clock className="h-5 w-5 animate-pulse" /> : 
                         <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <span className={`mt-3 text-xs font-bold uppercase tracking-wider
                        ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                        {step === 'New' ? 'Submitted' : step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Public Timeline / Remarks */}
              {result.remarks && result.remarks.length > 0 && (
                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                   <h3 className="font-bold text-slate-700 mb-2">Updates</h3>
                   <div className="space-y-3">
                     {result.remarks.map((rem: string, idx: number) => (
                       <div key={idx} className="flex gap-3 text-sm text-slate-600">
                         <div className="mt-1 min-w-[4px] h-[4px] bg-blue-400 rounded-full" />
                         <p>{rem}</p>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
