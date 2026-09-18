import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchComplaints,
  updateComplaintStatus,
  setFilterStatus,
  setFilterSeverity,
  setSearchQuery,
  setActiveView
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
  Plus
} from 'lucide-react';

export default function ComplaintsDashboard() {
  const dispatch = useDispatch();
  const { items, isLoading, filterStatus, filterSeverity, searchQuery } = useSelector(
    (state) => state.complaintsList
  );

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');

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
      c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // KPI Metrics
  const totalCount = items.length;
  const pendingCount = items.filter((c) => c.status === 'Pending Triage').length;
  const criticalCount = items.filter((c) => c.initial_severity === 'Critical').length;
  const investigatedCount = items.filter((c) => c.status === 'Under Investigation' || c.status === 'Closed').length;

  const handleUpdateStatus = async (id, status) => {
    await dispatch(updateComplaintStatus({ id, status }));
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
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

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

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, batch, customer..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Triage">Pending Triage</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => dispatch(setFilterSeverity(e.target.value))}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
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
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Complaint</span>
          </button>
        </div>

      </div>

      {/* Main Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Batch Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Defect Classification</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Triage Status</th>
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
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.customer_name || 'Internal'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={c.defect_summary}>
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
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRecord(c);
                          setNewStatus(c.status);
                        }}
                        title="Update Triage Status"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
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
                  {selectedRecord.product_name} (Lot: {selectedRecord.batch_number})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400">Customer:</span>
                <p className="font-medium text-slate-800">{selectedRecord.customer_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Source:</span>
                <p className="font-medium text-slate-800">{selectedRecord.complaint_source || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Mfg / Expiry Date:</span>
                <p className="font-medium text-slate-800">{selectedRecord.mfg_date} / {selectedRecord.expiry_date}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Quantity Affected:</span>
                <p className="font-medium text-slate-800">{selectedRecord.quantity_affected || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Manufacturing Site Block:</span>
                <p className="font-medium text-slate-800">{selectedRecord.site_block || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Impacted Non-Product Material:</span>
                <p className="font-medium text-slate-800">{selectedRecord.impacted_npm || 'N/A'}</p>
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
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Triage Status</h3>
            <p className="text-xs text-slate-500">
              Updating complaint #{editingRecord.id} for {editingRecord.product_name}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="Pending Triage">Pending Triage</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(editingRecord.id, newStatus)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
