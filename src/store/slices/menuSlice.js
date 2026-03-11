import { createSlice } from "@reduxjs/toolkit";

const CACHE_TIME = 1000 * 60 * 10; // 10 minutes

const initialState = {
  menu: [],
  timestamp: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu(state, action) {
      state.menu = action.payload || [];
      state.timestamp = Date.now();
    },
    clearMenu(state) {
      state.menu = [];
      state.timestamp = null;
    },
  },
});

export const { setMenu, clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
