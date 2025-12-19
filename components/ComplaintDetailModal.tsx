import React, { useState } from 'react';
import { Complaint, ComplaintStatus, Priority, User, UserRole } from '../types';
import { X, Clock, MapPin, User as UserIcon, Phone, AlertCircle, Bot, CheckCircle, Loader2 } from 'lucide-react';
import { analyzeComplaintWithGemini } from '../services/geminiService';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  currentUser: User;
  onClose: () => void;
  onUpdate: (updatedComplaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  onClose,
  onUpdate
}) => {
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [analyzing, setAnalyzing] = useState(false);

  const isAdminOrOfficer = [UserRole.ADMIN, UserRole.OFFICER].includes(currentUser.role);
  const canEdit = currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.OFFICER && currentUser.dsd === complaint.dsd);

  const handleSave = () => {
    const updated = { ...complaint, status: newStatus };
    if (remarks.trim()) {
      updated.remarks = [...(updated.remarks || []), `${currentUser.name} (${new Date().toLocaleTimeString()}): ${remarks}`];
    }
    onUpdate(updated);
    onClose();
  };

  const handleAIAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeComplaintWithGemini(complaint.title, complaint.description, complaint.category);
    
    // Auto-update priority and add AI analysis to remarks/field
    const updated = {
      ...complaint,
      priority: result.priority,
      aiAnalysis: `AI Suggestion: ${result.summary} (Suggested Category: ${result.categorySuggestion})`
    };
    
    onUpdate(updated);
    setAnalyzing(false);
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                #{complaint.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{complaint.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Incident Details</h3>
                <p className="text-slate-800 text-lg leading-relaxed">{complaint.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <AlertCircle size={16} />
                  <span>Category: <strong>{complaint.category}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Location Info</h3>
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="mt-1 text-red-500" size={18} />
                  <div>
                    <p className="font-medium">{complaint.location}</p>
                    <p className="text-sm text-slate-500">DSD: {complaint.dsd}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Reporter Info</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserIcon size={16} className="text-slate-400" />
                    <span>{complaint.contactName || 'Anonymous'}</span>
                  </div>
                  {complaint.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={16} className="text-slate-400" />
                      <span>{complaint.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions & History */}
            <div className="space-y-6">
              {isAdminOrOfficer && (
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-blue-900">Officer Actions</h3>
                    {canEdit && (
                       <button 
                       onClick={handleAIAnalyze}
                       disabled={analyzing}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                     >
                       {analyzing ? <Loader2 className="animate-spin h-3 w-3" /> : <Bot className="h-3 w-3" />}
                       AI Analyze Priority
                     </button>
                    )}
                  </div>

                  {complaint.aiAnalysis && (
                     <div className="bg-white/60 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                       <Bot className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                       <p>{complaint.aiAnalysis}</p>
                     </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-800 uppercase">Status Update</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      disabled={!canEdit}
                      className="w-full p-2 rounded-lg border border-blue-200 bg-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(ComplaintStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-800 uppercase">Add Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={!canEdit}
                      placeholder="Add resolution notes or updates..."
                      className="w-full p-2 rounded-lg border border-blue-200 bg-white text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Activity Log</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  <div className="flex gap-3 text-sm">
                    <div className="mt-1">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-800">Complaint submitted</p>
                      <p className="text-xs text-slate-400">{new Date(complaint.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {complaint.remarks && complaint.remarks.map((rem, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="mt-1">
                        <CheckCircle size={14} className="text-green-500" />
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 w-full">
                        <p className="text-slate-700">{rem}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {canEdit && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};