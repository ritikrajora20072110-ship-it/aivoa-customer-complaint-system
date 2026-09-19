import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  complaint_source: '',
  customer_name: '',
  qms_ledger: 'LEDGER-2026-QA',
  product_name: '',
  product_strength_grade: '',
  batch_number: '',
  mfg_date: '',
  expiry_date: '',
  quantity_affected: '',
  site_block: '',
  impacted_npm: '',
  complaint_type: '',
  complaint_date: new Date().toISOString().split('T')[0],
  defect_summary: '',
  description: '',
  initial_severity: 'Pending Triage',
  priority: 'Pending Triage',
  status: 'Pending Triage',
  risk_level: 'Moderate',
  suggested_next_action: 'Route to QA Investigation & Issue Replacement',
  initial_risk_assessment: 'Potential moisture ingress or primary packaging seal failure leading to capsule discoloration. Quarantine affected batch and initiate analytical stability testing.',
  risk_assessment: null,
  completeness: null,
  capa_recommendations: null,
  duplicate_detection: null,
  highlightedFields: {}, // { [field]: { previousValue, newValue, timestamp } }
  isDirty: false
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
      state.isDirty = true;
    },
    setFieldWithHighlight: (state, action) => {
      const { field, value, previousValue } = action.payload;
      const prev = previousValue !== undefined ? previousValue : (state[field] || '');
      state[field] = value;
      state.highlightedFields[field] = {
        previousValue: prev,
        newValue: value,
        timestamp: Date.now()
      };
      state.isDirty = true;
    },
    clearHighlightedField: (state, action) => {
      const field = action.payload;
      delete state.highlightedFields[field];
    },
    clearAllHighlightedFields: (state) => {
      state.highlightedFields = {};
    },
    setAllFields: (state, action) => {
      return { ...state, ...action.payload, isDirty: true };
    },
    populateFromAi: (state, action) => {
      const { extracted_data, risk_assessment, completeness, capa_recommendations, duplicate_detection } = action.payload;
      
      if (extracted_data) {
        Object.keys(extracted_data).forEach(key => {
          if (extracted_data[key] !== undefined && extracted_data[key] !== null) {
            state[key] = extracted_data[key];
          }
        });
      }
      if (risk_assessment) {
        state.risk_assessment = risk_assessment;
        state.risk_level = risk_assessment.risk_level || state.risk_level;
        if (risk_assessment.suggested_severity) {
          state.initial_severity = risk_assessment.suggested_severity;
        }
        if (risk_assessment.suggested_next_action) {
          state.suggested_next_action = risk_assessment.suggested_next_action;
        }
        if (risk_assessment.initial_risk_assessment) {
          state.initial_risk_assessment = risk_assessment.initial_risk_assessment;
        }
      }
      if (completeness) {
        state.completeness = completeness;
      }
      if (capa_recommendations) {
        state.capa_recommendations = capa_recommendations;
      }
      if (duplicate_detection) {
        state.duplicate_detection = duplicate_detection;
      }
      state.isDirty = true;
    },
    resetForm: () => {
      return { 
        ...initialState, 
        complaint_date: new Date().toISOString().split('T')[0],
        highlightedFields: {}
      };
    }
  }
});

export const { 
  setField, 
  setFieldWithHighlight, 
  clearHighlightedField, 
  clearAllHighlightedFields, 
  setAllFields, 
  populateFromAi, 
  resetForm 
} = complaintSlice.actions;

export default complaintSlice.reducer;
