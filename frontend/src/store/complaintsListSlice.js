import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { safeFetchJson } from '../utils/api';

export const fetchComplaints = createAsyncThunk(
  'complaintsList/fetchComplaints',
  async (_, { rejectWithValue }) => {
    try {
      return await safeFetchJson('/api/complaints');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveComplaint = createAsyncThunk(
  'complaintsList/saveComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      return await safeFetchJson('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'complaintsList/updateComplaintStatus',
  async ({ id, status, severity, priority, qms_ledger }, { rejectWithValue }) => {
    try {
      const payload = {};
      if (status !== undefined) payload.status = status;
      if (severity !== undefined) payload.initial_severity = severity;
      if (priority !== undefined) payload.priority = priority;
      if (qms_ledger !== undefined) payload.qms_ledger = qms_ledger;

      return await safeFetchJson(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  activeView: 'form', // 'form' or 'dashboard'
  filterStatus: 'all',
  filterSeverity: 'all',
  searchQuery: '',
  selectedComplaint: null,
  columnHeaders: {
    id: 'Complaint ID',
    product_name: 'Product Name',
    batch_number: 'Batch Number',
    customer_name: 'Customer ID',
    qms_ledger: 'QMS Ledger',
    defect_summary: 'Defect Classification',
    initial_severity: 'Severity',
    status: 'Triage Status'
  },
  highlightedColumns: {} // { [colKey]: { previousName, newName, timestamp } }
};

export const complaintsListSlice = createSlice({
  name: 'complaintsList',
  initialState,
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterSeverity: (state, action) => {
      state.filterSeverity = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    renameColumn: (state, action) => {
      const { columnKey, newName, previousName } = action.payload;
      const prev = previousName || state.columnHeaders[columnKey] || columnKey;
      state.columnHeaders[columnKey] = newName;
      state.highlightedColumns[columnKey] = {
        previousName: prev,
        newName: newName,
        timestamp: Date.now()
      };
    },
    clearHighlightedColumn: (state, action) => {
      delete state.highlightedColumns[action.payload];
    },
    clearAllHighlightedColumns: (state) => {
      state.highlightedColumns = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchComplaints
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // saveComplaint
      .addCase(saveComplaint.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // updateComplaintStatus
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedComplaint && state.selectedComplaint.id === action.payload.id) {
          state.selectedComplaint = action.payload;
        }
      });
  }
});

export const {
  setActiveView,
  setFilterStatus,
  setFilterSeverity,
  setSearchQuery,
  setSelectedComplaint,
  renameColumn,
  clearHighlightedColumn,
  clearAllHighlightedColumns
} = complaintsListSlice.actions;

export default complaintsListSlice.reducer;
