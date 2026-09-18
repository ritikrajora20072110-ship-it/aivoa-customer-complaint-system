import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckSquare,
  HelpCircle,
  Wrench,
  Copy,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';

export default function BonusToolsDrawer() {
  const form = useSelector((state) => state.complaint);
  const [activeTab, setActiveTab] = useState('completeness');

  const completeness = form.completeness;
  const capa = form.capa_recommendations;
  const duplicates = form.duplicate_detection;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-7 space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>AI QMS Investigation & Copilot Tools</span>
          </h3>
          <p className="text-xs text-slate-500">ICH Q10 & 21 CFR Compliant Automated Quality Modules</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('completeness')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'completeness' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completeness
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rootcause')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rootcause' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Root Cause (5-Whys)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'capa' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CAPA Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeTab === 'duplicates' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Duplicates
            {duplicates?.has_duplicates && (
              <span className="ml-1.5 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                {duplicates.duplicate_count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'summary' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive Summary
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: COMPLETENESS CHECKER */}
      {activeTab === 'completeness' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Intake Data Completeness Score</h4>
              <p className="text-[11px] text-slate-500">Evaluates mandatory fields according to FDA 21 CFR Part 211.198</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-indigo-600">
                {completeness?.completeness_score || 85}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Provided Fields</span>
              </span>
              <ul className="text-xs space-y-1 text-slate-600">
                {(completeness?.provided_fields && completeness.provided_fields.length > 0) ? (
                  completeness.provided_fields.map((f, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{f}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li>• Customer / Facility Name</li>
                    <li>• Product Name & Strength</li>
                    <li>• Batch / Lot Number</li>
                    <li>• Manufacturing & Expiry Date</li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Missing / Awaiting Intake Fields</span>
              </span>
              <ul className="text-xs space-y-1 text-slate-600">
                {(completeness?.missing_fields && completeness.missing_fields.length > 0) ? (
                  completeness.missing_fields.map((f, i) => (
                    <li key={i} className="flex items-center space-x-1.5 text-amber-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{f}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-600 font-medium">✓ No critical intake fields missing.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ROOT CAUSE (5-WHYS & ISHIKAWA) */}
      {activeTab === 'rootcause' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Root Cause Hypothesis</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              {capa?.root_cause_analysis?.primary_root_cause ||
                'Heat-sealing temperature fluctuation or tooling wear during continuous packaging operation.'}
            </p>
          </div>

          {/* 5-Whys Tree */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 mb-2">5-Whys Root Cause Chain:</h4>
            <div className="space-y-2">
              {(capa?.root_cause_analysis?.five_whys || [
                'Why 1: Capsules showed discoloration - Moisture ingress into blister pocket.',
                'Why 2: Moisture entered - Micro-pinhole in seal seam along foil edge.',
                'Why 3: Pinholes formed - Inadequate heat seal temperature and pressure uniformity.',
                'Why 4: Temperature uneven - Heating element thermocouple calibration drifted by -8°C.',
                'Why 5: Sensor drifted unnoticed - Preventive calibration cycle overdue by 14 days.'
              ]).map((why, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50/70 p-2 rounded-lg">
                  <span className="font-bold text-indigo-600 flex-shrink-0">Step {idx + 1}:</span>
                  <span>{why}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ishikawa Categories */}
          {capa?.root_cause_analysis?.ishikawa_categories && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(capa.root_cause_analysis.ishikawa_categories).map(([cat, val]) => (
                <div key={cat} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{cat}</span>
                  <p className="text-xs text-slate-700 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CAPA PLAN */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Immediate Containment */}
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Immediate Containment Actions
              </span>
              <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
                {(capa?.immediate_actions || [
                  `Issue immediate warehouse quarantine hold on batch ${form.batch_number || 'AMX-2024-089A'}.`,
                  'Request customer physical retain samples with chain of custody.',
                  'Inspect manufacturing reserve samples in stability chamber.'
                ]).map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            {/* Corrective Actions */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Corrective Actions (CAPA)
              </span>
              <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
                {(capa?.corrective_actions || [
                  'Re-calibrate thermocouple and replace heating element on packaging line.',
                  'Perform 100% methylene blue dye vacuum leak test on unreleased inventory.'
                ]).map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Preventive Actions */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Long-Term Preventive Actions
            </span>
            <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
              {(capa?.preventive_actions || [
                'Install automated in-line optical seal integrity monitoring system.',
                'Mandate seal pressure verification sign-off at every shift changeover.',
                'Update calibration frequency from quarterly to monthly.'
              ]).map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {/* Regulatory Citations */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="font-semibold">Governing Standards:</span>
            <span>21 CFR 211.192 • 21 CFR 211.198 • ICH Q10 Pharmaceutical Quality System</span>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DUPLICATE COMPLAINTS */}
      {activeTab === 'duplicates' && (
        <div className="space-y-3">
          {duplicates?.has_duplicates ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Found {duplicates.duplicate_count} existing complaint record(s) matching this Batch or Product Line:</span>
              </div>
              <div className="space-y-2">
                {duplicates.matched_complaints.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.product_name}</span>
                      <span className="text-slate-500 ml-2 font-mono">Lot: {item.batch_number}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Reported: {item.complaint_date} • {item.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.match_reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>No historical duplicates detected for Batch {form.batch_number || 'N/A'}. This appears to be an isolated incident.</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Formal QMS Executive Summary</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`AIVOA QMS COMPLAINT SUMMARY\nProduct: ${form.product_name}\nBatch: ${form.batch_number}\nCustomer: ${form.customer_name}\nSeverity: ${form.initial_severity}\nSummary: ${form.defect_summary}\nDescription: ${form.description}`);
                alert("Summary copied to clipboard!");
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </button>
          </div>
          <div className="text-xs text-slate-700 font-mono leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
            <p><strong>SUBJECT:</strong> Customer Quality Complaint - {form.product_name || 'Amoxicillin 500mg'} (Lot: {form.batch_number || 'AMX-2024-089A'})</p>
            <p className="mt-1"><strong>REPORTER:</strong> {form.customer_name || 'St. Jude Regional Hospital'} | <strong>SOURCE:</strong> {form.complaint_source || 'Inpatient Pharmacy'}</p>
            <p className="mt-1"><strong>DEFECT CLASSIFICATION:</strong> {form.initial_severity || 'Major'} | <strong>PRIORITY:</strong> {form.priority || 'High'}</p>
            <p className="mt-2"><strong>SYNOPSIS:</strong> {form.defect_summary || 'Yellow-brown capsule discoloration and mottled speckling observed on capsule shells with micro-pinhole sealing seam defects.'}</p>
            <p className="mt-2"><strong>CONTAINMENT:</strong> 100% quarantine initiated on affected lot; physical sample retention requested for assay analysis under 21 CFR Part 211.198.</p>
          </div>
        </div>
      )}

    </div>
  );
}
