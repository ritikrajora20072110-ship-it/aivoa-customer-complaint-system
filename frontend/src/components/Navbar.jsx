import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView } from '../store/complaintsListSlice';
import { FileText, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { activeView, items } = useSelector((state) => state.complaintsList);
  const pendingCount = items.filter(c => c.status === 'Pending Triage').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Module Identification */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <span className="text-xl tracking-wider">A</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">AIVOA</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                QMS ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Customer Complaint Management • API & FDF Module</p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => dispatch(setActiveView('form'))}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'form'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Log Customer Complaint</span>
          </button>
          
          <button
            onClick={() => dispatch(setActiveView('dashboard'))}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeView === 'dashboard'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Complaints Dashboard</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* System Health / Engine Status */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LangGraph Agent Active</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium border-l border-slate-200 pl-4">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>21 CFR Part 211 / ICH Q9</span>
          </div>
        </div>

      </div>
    </header>
  );
}
