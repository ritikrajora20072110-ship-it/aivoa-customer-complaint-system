import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';
import copilotReducer from './copilotSlice';
import complaintsListReducer from './complaintsListSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    copilot: copilotReducer,
    complaintsList: complaintsListReducer
  }
});
