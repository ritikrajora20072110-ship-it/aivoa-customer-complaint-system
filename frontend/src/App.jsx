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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'form' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form + Risk Assessment + Bonus Modules */}
            <div className="lg:col-span-7 space-y-8">
              <ComplaintForm />
              <RiskAssessmentCard />
              <BonusToolsDrawer />
            </div>

            {/* Right Column: AI Intake Assistant / Copilot */}
            <div className="lg:col-span-5 sticky top-20">
              <AICopilot />
            </div>

          </div>
        ) : (
          <ComplaintsDashboard />
        )}
      </main>

      {/* Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AIVOA.ai • AI-Powered Quality Management System (QMS)</span>
          <span className="font-medium text-slate-400">
            Validated for FDA 21 CFR Part 211 / Part 11 & EU GMP Annex 11 • LangGraph Agent
          </span>
        </div>
      </footer>
    </div>
  );
}
