// /store/policiesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  policies: {}, // { terms: {...}, privacy: {...}, refund: {...} }
  timestamps: {}, // { terms: time, privacy: time, all: time }
};

const policiesSlice = createSlice({
  name: "policies",
  initialState,
  reducers: {
    setPolicies(state, action) {
      state.policies = { ...state.policies, ...action.payload };
      state.timestamps.all = Date.now();

      Object.keys(action.payload).forEach((key) => {
        state.timestamps[key] = Date.now();
      });
    },
    setPolicy(state, action) {
      const { type, data } = action.payload;
      state.policies[type] = data;
      state.timestamps[type] = Date.now();
    },
    clearPolicies() {
      return initialState;
    },
  },
});

export const { setPolicies, setPolicy, clearPolicies } = policiesSlice.actions;

export default policiesSlice.reducer;
