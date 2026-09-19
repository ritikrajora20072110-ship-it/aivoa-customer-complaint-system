import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setField, resetForm, clearHighlightedField, clearAllHighlightedFields } from '../store/complaintSlice';
import { saveComplaint } from '../store/complaintsListSlice';
import { 
  RotateCcw, 
  Save, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Package, 
  Sparkles, 
  ShieldCheck,
  Database,
  X
} from 'lucide-react';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (field, value) => {
    dispatch(setField({ field, value }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all fields?")) {
      dispatch(resetForm());
      setSaveStatus(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product_name && !form.batch_number) {
      alert("Please provide or extract at least the Product Name or Batch Number before saving.");
      return;
    }

    const payload = {
      complaint_source: form.complaint_source,
      customer_name: form.customer_name,
      qms_ledger: form.qms_ledger || 'LEDGER-2026-QA',
      product_name: form.product_name,
      product_strength_grade: form.product_strength_grade,
      batch_number: form.batch_number,
      mfg_date: form.mfg_date,
      expiry_date: form.expiry_date,
      quantity_affected: form.quantity_affected,
      site_block: form.site_block,
      impacted_npm: form.impacted_npm,
      complaint_type: form.complaint_type,
      complaint_date: form.complaint_date,
      defect_summary: form.defect_summary,
      description: form.description,
      initial_severity: form.initial_severity || 'Major',
      priority: form.priority || 'High',
      status: 'Committed to QMS Ledger',
      risk_level: form.initial_severity || form.risk_level || 'Major',
      risk_assessment_json: JSON.stringify({
        ...(form.risk_assessment || {}),
        suggested_severity: form.initial_severity,
        suggested_next_action: form.suggested_next_action,
        initial_risk_assessment: form.initial_risk_assessment
      }),
      capa_json: form.capa_recommendations ? JSON.stringify(form.capa_recommendations) : '{}',
      completeness_score: form.completeness?.completeness_score || 90
    };

    const res = await dispatch(saveComplaint(payload));
    if (!res.error) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus('error');
    }
  };

  const renderHighlightBadge = (field) => {
    const hl = form.highlightedFields?.[field];
    if (!hl) return null;
    return (
      <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs animate-fadeIn">
        <span className="flex items-center space-x-1.5 truncate">
          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate">
            Updated: Was <span className="line-through text-slate-400 font-mono text-[10px]">"{hl.previousValue || '(empty)'}"</span> → <strong className="text-emerald-950 font-mono text-[10px]">"{hl.newValue || '(cleared)'}"</strong>
          </span>
        </span>
        <button
          type="button"
          onClick={() => dispatch(clearHighlightedField(field))}
          className="text-emerald-600 hover:text-emerald-900 ml-1.5 font-bold shrink-0 cursor-pointer"
          title="Dismiss highlight"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const getFieldClassName = (field, extraClass = '') => {
    const isHighlighted = !!form.highlightedFields?.[field];
    return `w-full text-sm px-3.5 py-2.5 rounded-xl border transition ${
      isHighlighted
        ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20 shadow-xs'
        : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 hover:bg-white'
    } ${extraClass}`;
  };

  const totalHighlighted = Object.keys(form.highlightedFields || {}).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 transition-all">
      
      {/* Header matching Reference Screenshot */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h1>
            {totalHighlighted > 0 && (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-800 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalHighlighted} Field{totalHighlighted > 1 ? 's' : ''} Modified</span>
                <button
                  type="button"
                  onClick={() => dispatch(clearAllHighlightedFields())}
                  className="text-emerald-600 hover:text-emerald-900 ml-1 underline cursor-pointer text-[10px]"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">API & FDF Quality Assurance Module • QMS Record Management</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Complaint</span>
          </button>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
            {form.status || 'Pending Triage'}
          </span>
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Complaint record successfully saved and registered to the QMS Ledger database!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>Failed to save complaint record. Please verify server connection and try again.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-7">
        
        {/* SECTION 1: ORIGIN, CUSTOMER & QMS LEDGER DETAILS */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1. Origin, Customer & QMS Ledger</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Source</label>
              <input
                type="text"
                value={form.complaint_source}
                onChange={(e) => handleChange('complaint_source', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('complaint_source')}
              />
              {renderHighlightBadge('complaint_source')}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('customer_name')}
              />
              {renderHighlightBadge('customer_name')}
            </div>

            {/* QMS LEDGER FIELD (FUNCTIONAL, EDITABLE, HIGHLIGHTABLE, SAVABLE) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
                  <span>QMS Ledger</span>
                </span>
                <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                  Ledger Ref
                </span>
              </label>
              <input
                type="text"
                value={form.qms_ledger || ''}
                onChange={(e) => handleChange('qms_ledger', e.target.value)}
                placeholder="e.g. LEDGER-2026-QA"
                className={getFieldClassName('qms_ledger', 'font-mono text-indigo-900 font-medium')}
              />
              {renderHighlightBadge('qms_ledger')}
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT & BATCH IDENTIFICATION */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2. Product & Batch Identification</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Name (API/FDF)</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('product_name', 'font-medium')}
              />
              {renderHighlightBadge('product_name')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Strength / Grade</label>
              <input
                type="text"
                value={form.product_strength_grade}
                onChange={(e) => handleChange('product_strength_grade', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('product_strength_grade')}
              />
              {renderHighlightBadge('product_strength_grade')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Batch / Lot Number</label>
              <input
                type="text"
                value={form.batch_number}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('batch_number', 'font-mono')}
              />
              {renderHighlightBadge('batch_number')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Manufacturing Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.mfg_date}
                  onChange={(e) => handleChange('mfg_date', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className={getFieldClassName('mfg_date', 'pr-10')}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
              {renderHighlightBadge('mfg_date')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.expiry_date}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className={getFieldClassName('expiry_date', 'pr-10')}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
              {renderHighlightBadge('expiry_date')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity Affected</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={form.quantity_affected}
                  onChange={(e) => handleChange('quantity_affected', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className={getFieldClassName('quantity_affected', 'pr-12')}
                />
                <span className="absolute right-3.5 text-xs text-slate-400 font-semibold uppercase">kg / u</span>
              </div>
              {renderHighlightBadge('quantity_affected')}
            </div>

            {/* Originating Site Block & Impacted NPM */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Originating Site Block</label>
              <input
                type="text"
                value={form.site_block}
                onChange={(e) => handleChange('site_block', e.target.value)}
                placeholder="Awaiting AI classification..."
                className={getFieldClassName('site_block')}
              />
              {renderHighlightBadge('site_block')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Impacted Non-Product Materials (NPM)</label>
              <input
                type="text"
                value={form.impacted_npm}
                onChange={(e) => handleChange('impacted_npm', e.target.value)}
                placeholder="e.g., Primary packaging, Rubber stopper..."
                className={getFieldClassName('impacted_npm')}
              />
              {renderHighlightBadge('impacted_npm')}
            </div>
          </div>
        </div>

        {/* SECTION 3: COMPLAINT DETAILS & DEFECT ANALYSIS */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3. Complaint Details & Defect Analysis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Type</label>
              <input
                type="text"
                value={form.complaint_type}
                onChange={(e) => handleChange('complaint_type', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('complaint_type')}
              />
              {renderHighlightBadge('complaint_type')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.complaint_date}
                  onChange={(e) => handleChange('complaint_date', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className={getFieldClassName('complaint_date', 'pr-10')}
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
              {renderHighlightBadge('complaint_date')}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Structured Defect Summary</label>
              <input
                type="text"
                value={form.defect_summary}
                onChange={(e) => handleChange('defect_summary', e.target.value)}
                placeholder="AI will synthesize the complaint into a formal QMS description..."
                className={getFieldClassName('defect_summary', 'font-medium')}
              />
              {renderHighlightBadge('defect_summary')}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Detailed Complaint Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className={getFieldClassName('description', 'resize-y')}
              />
              {renderHighlightBadge('description')}
            </div>
          </div>
        </div>

        {/* SECTION 4: AI COPILOT RISK ASSESSMENT (MATCHING REFERENCE UI) */}
        <div className="rounded-2xl border border-indigo-100/90 bg-[#F7F9FE] p-6 space-y-4 shadow-xs">
          
          {/* Card Header with Shield Icon */}
          <div className="flex items-center space-x-2.5 text-[#3730A3] font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="tracking-tight">AI copilot risk assessment</span>
          </div>

          {/* Row 1: Severity (Suggested) & Suggested Next Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4338CA] mb-1.5">
                Severity (Suggested)
              </label>
              <input
                type="text"
                value={form.initial_severity || 'Major'}
                onChange={(e) => handleChange('initial_severity', e.target.value)}
                placeholder="Major / Critical / Minor"
                className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition shadow-2xs ${
                  form.highlightedFields?.initial_severity
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                    : 'border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {renderHighlightBadge('initial_severity')}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4338CA] mb-1.5">
                Suggested Next Action
              </label>
              <input
                type="text"
                value={form.suggested_next_action || 'Route to QA Investigation & Issue Replacement'}
                onChange={(e) => handleChange('suggested_next_action', e.target.value)}
                placeholder="Route to QA Investigation & Issue Replacement"
                className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition shadow-2xs ${
                  form.highlightedFields?.suggested_next_action
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                    : 'border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {renderHighlightBadge('suggested_next_action')}
            </div>
          </div>

          {/* Row 2: Initial Risk Assessment */}
          <div>
            <label className="block text-xs font-semibold text-[#4338CA] mb-1.5">
              Initial Risk Assessment
            </label>
            <textarea
              rows={3}
              value={form.initial_risk_assessment || 'Potential moisture ingress or primary packaging seal failure leading to capsule discoloration. Quarantine affected batch and initiate analytical stability testing.'}
              onChange={(e) => handleChange('initial_risk_assessment', e.target.value)}
              placeholder="Potential moisture ingress or primary packaging seal failure leading to capsule discoloration..."
              className={`w-full text-sm font-medium p-3.5 rounded-xl border bg-white text-slate-800 transition shadow-2xs resize-y ${
                form.highlightedFields?.initial_risk_assessment
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                  : 'border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {renderHighlightBadge('initial_risk_assessment')}
          </div>

          {/* PRIMARY ACTION BUTTON: COMMIT TO QMS LEDGER (MATCHING REFERENCE UI) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm transition shadow-md shadow-indigo-500/25 flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Commit to QMS Ledger</span>
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Form</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
