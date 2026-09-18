import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldAlert, AlertOctagon, AlertTriangle, CheckCircle2, Activity, Scale } from 'lucide-react';

export default function RiskAssessmentCard() {
  const form = useSelector((state) => state.complaint);
  const risk = form.risk_assessment;

  const riskLevel = risk?.risk_level || (form.initial_severity === 'Critical' ? 'Critical' : form.initial_severity === 'Minor' ? 'Minor' : 'Major');
  const score = risk?.ich_q9_score || (riskLevel === 'Critical' ? 92 : riskLevel === 'Minor' ? 28 : 68);

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Minor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getGaugeBarColor = (score) => {
    if (score >= 80) return 'from-red-500 to-rose-600';
    if (score <= 40) return 'from-emerald-500 to-teal-500';
    return 'from-amber-500 to-orange-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-7 space-y-5">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Copilot Risk Assessment</h3>
            <p className="text-xs text-slate-500">ICH Q9 Quality Risk Management Protocol</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(riskLevel)}`}>
          {riskLevel} Severity
        </span>
      </div>

      {/* ICH Q9 Risk Score Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>ICH Q9 Risk Score Index</span>
          </span>
          <span className="font-bold">{score} / 100</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getGaugeBarColor(score)} transition-all duration-500`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
          <span>0 (Low Impact)</span>
          <span>50 (Moderate Quality Defect)</span>
          <span>100 (Critical Sterility/Purity)</span>
        </div>
      </div>

      {/* Detailed Evaluated Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Patient Safety Hazard */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Patient Safety Impact</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {risk?.patient_safety_impact || (
              riskLevel === 'Critical'
                ? 'High risk of acute adverse events or sterility compromise. Complete inventory quarantine required.'
                : riskLevel === 'Minor'
                ? 'Negligible patient hazard. Drug stability and chemical identity unaffected.'
                : 'Potential reduced therapeutic efficacy or stability decay due to container barrier breach.'
            )}
          </p>
        </div>

        {/* Regulatory & Recall Evaluation */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>Regulatory & Recall Evaluation</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {risk?.health_hazard_evaluation || (
              riskLevel === 'Critical'
                ? 'Mandatory Health Hazard Evaluation (HHE) under FDA 21 CFR Part 7. Class I / II Recall evaluation.'
                : riskLevel === 'Minor'
                ? 'Class III packaging defect. Internal QMS CAPA remediation; no regulatory recall required.'
                : 'Class II Quality Defect. Retain sample testing and 3-day notification to QA review board.'
            )}
          </p>
        </div>

      </div>

    </div>
  );
}
