import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, ShieldAlert, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onHomeClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onLoginClick, onHomeClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeClick}>
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight">DCMS</h1>
              <p className="text-xs text-slate-400">Disaster Complaint Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <UserIcon size={16} />
                Officer Login
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Disaster Management Centre. All rights reserved.</p>
          <p className="mt-1">Emergency Hotline: 117</p>
        </div>
      </footer>
    </div>
  );
};