// src/store/jobSlice.js
import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    requisitionCode: null,
    requisitionId: null,
    positionId: null,
    positionTitle: null,
  },
  reducers: {
    setRequisition: (state, action) => {
      state.requisitionCode = action.payload.code;
      state.requisitionId = action.payload.id;
    },
    setPosition: (state, action) => {
      state.positionId = action.payload.id;
      state.positionTitle = action.payload.title;
    },
    clearSelections: (state) => {
      state.requisitionCode = null;
      state.requisitionId = null;
      state.positionId = null;
      state.positionTitle = null;
    },
  },
});

export const { setRequisition, setPosition, clearSelections } = jobSlice.actions;
export default jobSlice.reducer;
