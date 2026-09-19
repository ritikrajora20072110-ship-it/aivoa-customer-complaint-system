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
  async ({ id, status, severity, priority }, { rejectWithValue }) => {
    try {
      return await safeFetchJson(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, initial_severity: severity, priority })
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
  selectedComplaint: null
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
  setSelectedComplaint
} = complaintsListSlice.actions;

export default complaintsListSlice.reducer;
