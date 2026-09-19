import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Load Amoxicillin 500mg Email Sample',
        'Load Metformin Bulk API Sample',
        'Load Atorvastatin Packaging Sample',
        'Load Ciprofloxacin Sterile Injection Sample'
      ]
    }
  ],
  isExtracting: false,
  extractionProgress: 0,
  currentStatusText: 'Awaiting complaint input...',
  workflowSteps: [],
  isChatLoading: false,
  chatStatusText: 'Processing Copilot request...',
  error: null
};

export const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...action.payload
      });
    },
    startExtraction: (state) => {
      state.isExtracting = true;
      state.extractionProgress = 10;
      state.currentStatusText = 'Ingesting document content...';
      state.workflowSteps = [];
      state.error = null;
    },
    updateProgress: (state, action) => {
      const { progress, statusText, step } = action.payload;
      if (progress !== undefined) state.extractionProgress = progress;
      if (statusText) state.currentStatusText = statusText;
      if (step) state.workflowSteps.push(step);
    },
    finishExtraction: (state, action) => {
      state.isExtracting = false;
      state.extractionProgress = 100;
      state.currentStatusText = 'Extraction and ICH Q9 Risk Assessment complete.';
      if (action.payload?.steps) {
        state.workflowSteps = action.payload.steps;
      }
    },
    setExtractionError: (state, action) => {
      state.isExtracting = false;
      state.error = action.payload;
      state.currentStatusText = 'Extraction failed. Check document format.';
    },
    setChatLoading: (state, action) => {
      if (typeof action.payload === 'object' && action.payload !== null) {
        state.isChatLoading = !!action.payload.loading;
        if (action.payload.statusText) state.chatStatusText = action.payload.statusText;
      } else {
        state.isChatLoading = !!action.payload;
        if (!action.payload) state.chatStatusText = 'Ready';
      }
    },
    resetCopilot: (state) => {
      return {
        ...initialState,
        messages: [
          {
            id: 'welcome-' + Date.now(),
            sender: 'bot',
            text: 'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              'Load Amoxicillin 500mg Email Sample',
              'Load Metformin Bulk API Sample',
              'Load Atorvastatin Packaging Sample',
              'Load Ciprofloxacin Sterile Injection Sample'
            ]
          }
        ]
      };
    }
  }
});

export const {
  addMessage,
  startExtraction,
  updateProgress,
  finishExtraction,
  setExtractionError,
  setChatLoading,
  resetCopilot
} = copilotSlice.actions;

export default copilotSlice.reducer;
