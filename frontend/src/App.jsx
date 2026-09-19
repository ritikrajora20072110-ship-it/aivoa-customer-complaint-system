import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import ComplaintForm from './components/ComplaintForm';
import AICopilot from './components/AICopilot';
import RiskAssessmentCard from './components/RiskAssessmentCard';
import BonusToolsDrawer from './components/BonusToolsDrawer';
import ComplaintsDashboard from './components/ComplaintsDashboard';
import { fetchComplaints } from './store/complaintsListSlice';

export default function App() {
  const dispatch = useDispatch();
  const activeView = useSelector((state) => state.complaintsList.activeView);

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[1680px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-3 overflow-hidden flex flex-col min-h-0">
        {activeView === 'form' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0 items-stretch">
            
            {/* Left Column: Complaint Box & QMS Assessment (Independent Scroll) */}
            <div className="lg:col-span-7 h-full overflow-y-auto pr-2.5 space-y-5 custom-scrollbar pb-8">
              <ComplaintForm />
              <RiskAssessmentCard />
              <BonusToolsDrawer />
            </div>

            {/* Right Column: AI Copilot & Intake Assistant (Independent Scroll) */}
            <div className="lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col">
              <AICopilot />
            </div>

          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-8">
            <ComplaintsDashboard />
          </div>
        )}
      </main>

      {/* Compact Status Bar */}
      <footer className="bg-white border-t border-slate-200 py-2 px-6 shrink-0 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1 shadow-2xs">
        <span>© 2026 AIVOA.ai • AI-Powered Customer Complaint Management System</span>
        <span className="font-medium text-slate-400">
          FDA 21 CFR Part 211 / Part 11 • ICH Q9 Quality Risk Management • Dual Split-Scroll Enabled
        </span>
      </footer>
    </div>
  );
}
