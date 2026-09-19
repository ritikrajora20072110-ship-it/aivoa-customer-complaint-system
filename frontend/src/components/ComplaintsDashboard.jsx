import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchComplaints,
  updateComplaintStatus,
  setFilterStatus,
  setFilterSeverity,
  setSearchQuery,
  setActiveView,
  clearHighlightedColumn,
  clearAllHighlightedColumns
} from '../store/complaintsListSlice';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Plus,
  Sparkles,
  Database,
  X
} from 'lucide-react';

export default function ComplaintsDashboard() {
  const dispatch = useDispatch();
  const { 
    items, 
    isLoading, 
    filterStatus, 
    filterSeverity, 
    searchQuery,
    columnHeaders = {},
    highlightedColumns = {}
  } = useSelector(
    (state) => state.complaintsList
  );

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newLedger, setNewLedger] = useState('');

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  // Filter logic
  const filtered = items.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || c.initial_severity === filterSeverity;
    const matchesSearch =
      !searchQuery ||
      c.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.qms_ledger?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // KPI Metrics
  const totalCount = items.length;
  const pendingCount = items.filter((c) => c.status === 'Pending Triage').length;
  const criticalCount = items.filter((c) => c.initial_severity === 'Critical').length;
  const investigatedCount = items.filter((c) => c.status === 'Under Investigation' || c.status === 'Closed').length;

  const handleUpdateRecord = async (id) => {
    await dispatch(updateComplaintStatus({ 
      id, 
      status: newStatus,
      qms_ledger: newLedger 
    }));
    setEditingRecord(null);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Minor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Triage':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Investigation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Escalated':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Committed to QMS Ledger':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const hasHighlightedCols = Object.keys(highlightedColumns || {}).length > 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {totalCount}
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active across API & FDF lines</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Triage</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              {pendingCount}
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Requires QA Officer Review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Severity</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              {criticalCount}
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{criticalCount}</p>
          <span className="text-[11px] text-red-700/80 mt-1 block">Class I / II Hazard Protocol</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investigated / Closed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              {investigatedCount}
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{investigatedCount}</p>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">CAPA Assigned & Verified</span>
        </div>

      </div>

      {/* Column Rename Alert Banner if columns were modified */}
      {hasHighlightedCols && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Column Header Renamed:</strong>{' '}
              {Object.entries(highlightedColumns).map(([key, info]) => (
                <span key={key} className="inline-block ml-1">
                  Was <span className="line-through text-slate-500">"{info.previousName}"</span> → Now <strong className="text-emerald-950 font-bold">"{info.newName}"</strong>
                </span>
              ))}
            </span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearAllHighlightedColumns())}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline ml-3 shrink-0 cursor-pointer"
          >
            Clear Highlights
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center space-x-2.5 w-full sm:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, batch, customer, or QMS ledger..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Triage">Pending Triage</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
            <option value="Committed to QMS Ledger">Committed to QMS Ledger</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => dispatch(setFilterSeverity(e.target.value))}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => dispatch(setActiveView('form'))}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Complaint</span>
          </button>
        </div>

      </div>

      {/* Main Complaints Table with Dynamic Column Headers and QMS Ledger support */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                
                {/* ID Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.id ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.id || 'Complaint ID'}</span>
                    {highlightedColumns.id && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Product Name Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.product_name ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.product_name || 'Product Name'}</span>
                    {highlightedColumns.product_name && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Batch Number Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.batch_number ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.batch_number || 'Batch Number'}</span>
                    {highlightedColumns.batch_number && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Customer Column (Supports: Change column name Customer ID to QMS Ledger) */}
                <th className={`py-3.5 px-4 transition ${highlightedColumns.customer_name ? 'bg-emerald-100 text-emerald-950 font-black border-b-2 border-emerald-600 shadow-inner' : ''}`}>
                  <div className="flex items-center space-x-1.5">
                    <span>{columnHeaders.customer_name || 'Customer ID'}</span>
                    {highlightedColumns.customer_name && (
                      <span className="px-1.5 py-0.5 text-[9px] bg-emerald-200 text-emerald-900 rounded-md font-bold shadow-2xs">
                        Was: {highlightedColumns.customer_name.previousName}
                      </span>
                    )}
                  </div>
                </th>

                {/* QMS Ledger Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.qms_ledger ? 'bg-emerald-100 text-emerald-950 font-black border-b-2 border-emerald-600' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <Database className="w-3 h-3 text-indigo-600 inline mr-0.5" />
                    <span>{columnHeaders.qms_ledger || 'QMS Ledger'}</span>
                    {highlightedColumns.qms_ledger && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Defect Classification Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.defect_summary ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.defect_summary || 'Defect Classification'}</span>
                    {highlightedColumns.defect_summary && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Severity Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.initial_severity ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.initial_severity || 'Severity'}</span>
                    {highlightedColumns.initial_severity && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                {/* Status Column */}
                <th className={`py-3.5 px-4 ${highlightedColumns.status ? 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500' : ''}`}>
                  <div className="flex items-center space-x-1">
                    <span>{columnHeaders.status || 'Triage Status'}</span>
                    {highlightedColumns.status && (
                      <span className="px-1 text-[8px] bg-emerald-200 text-emerald-900 rounded font-bold">Updated</span>
                    )}
                  </div>
                </th>

                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #{String(c.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.product_name || 'Amoxicillin Trihydrate'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {c.batch_number || 'N/A'}
                    </td>
                    <td className={`py-3.5 px-4 text-slate-700 ${highlightedColumns.customer_name ? 'bg-emerald-50/40 font-medium' : ''}`}>
                      {c.customer_name || 'Internal'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-medium text-indigo-700 bg-indigo-50/20">
                      {c.qms_ledger || 'LEDGER-2026-QA'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={c.defect_summary}>
                      {c.defect_summary || c.complaint_type || 'General Quality Defect'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(c.initial_severity)}`}>
                        {c.initial_severity || 'Major'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status || 'Pending Triage'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedRecord(c)}
                        title="View Full QMS Record"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRecord(c);
                          setNewStatus(c.status);
                          setNewLedger(c.qms_ledger || 'LEDGER-2026-QA');
                        }}
                        title="Update Record / QMS Ledger"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No complaints matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT RECORD MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QMS Complaint Record</span>
                <h3 className="text-lg font-bold text-slate-900">
                  #{String(selectedRecord.id).padStart(4, '0')} - {selectedRecord.product_name}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(selectedRecord.initial_severity)}`}>
                {selectedRecord.initial_severity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch Number</span>
                <span className="font-mono font-semibold text-slate-800">{selectedRecord.batch_number || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                <span className="font-semibold text-slate-800">{selectedRecord.customer_name || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="text-indigo-600 block text-[10px] uppercase font-bold flex items-center">
                  <Database className="w-3 h-3 mr-1" />
                  QMS Ledger
                </span>
                <span className="font-mono font-bold text-indigo-900">{selectedRecord.qms_ledger || 'LEDGER-2026-QA'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mfg Date</span>
                <span className="text-slate-800">{selectedRecord.mfg_date || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                <span className="text-slate-800">{selectedRecord.expiry_date || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                <span className="text-slate-800">{selectedRecord.quantity_affected || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Structured Defect Summary:</span>
              <p className="text-slate-600 leading-relaxed">{selectedRecord.defect_summary || 'N/A'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Full Description:</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedRecord.description || 'N/A'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS & QMS LEDGER MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Record & QMS Ledger</h3>
            <p className="text-xs text-slate-500">
              Updating complaint #{editingRecord.id} for {editingRecord.product_name}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Triage Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none cursor-pointer"
              >
                <option value="Pending Triage">Pending Triage</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
                <option value="Committed to QMS Ledger">Committed to QMS Ledger</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>QMS Ledger Identifier</span>
                <span className="text-[9px] uppercase font-bold text-indigo-600">Editable</span>
              </label>
              <input
                type="text"
                value={newLedger}
                onChange={(e) => setNewLedger(e.target.value)}
                placeholder="e.g. LEDGER-2026-QA"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRecord(editingRecord.id)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
