import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // banner sections
  topBanner: null,
  middleBanner: null,
  bottomTopBanner: null,
  bottomLeftBanner: null,

  // product lists
  bestSellers: [],
  newArrivals: [],

  // optional home sections
  productOverlay: null,
  saleSection: null,
  bottomBanner: null,

  // NEW → overlay grid
  productOverlayHome: null,

  // timestamps
  timestamps: {
    homeConfig: null,
    bestSellers: null,
    newArrivals: null,
    productOverlayHome: null,
    saleSection: null, // ✅ Added
  },
};

const homeConfigSlice = createSlice({
  name: "homeConfig",
  initialState,
  reducers: {
    setHomeConfig(state, action) {
      const payload = action.payload;

      state.topBanner = payload.topBanner ?? null;
      state.middleBanner = payload.middleBanner ?? null;
      state.bottomTopBanner = payload.bottomTopBanner ?? null;
      state.bottomLeftBanner = payload.bottomLeftBanner ?? null;

      if (payload.productOverlay !== undefined)
        state.productOverlay = payload.productOverlay;

      if (payload.saleSection !== undefined)
        state.saleSection = payload.saleSection;

      if (payload.bottomBanner !== undefined)
        state.bottomBanner = payload.bottomBanner;

      state.timestamps.homeConfig = Date.now();
    },

    setBestSellers(state, action) {
      state.bestSellers = Array.isArray(action.payload) ? action.payload : [];
      state.timestamps.bestSellers = Date.now();
    },

    setNewArrivals(state, action) {
      state.newArrivals = Array.isArray(action.payload) ? action.payload : [];
      state.timestamps.newArrivals = Date.now();
    },

    // NEW — overlay grid
    setProductOverlayHome(state, action) {
      state.productOverlayHome = action.payload ?? null;
      state.timestamps.productOverlayHome = Date.now();
    },

    // NEW — Sale Section Setter
    setSaleSection(state, action) {
      state.saleSection = action.payload ?? null;
      state.timestamps.saleSection = Date.now();
    },

    updateHomeSection(state, action) {
      const { section, data } = action.payload;
      if (section in state) {
        state[section] = data;
      }
    },

    clearHomeConfig() {
      return initialState;
    },
  },
});

export const {
  setHomeConfig,
  setBestSellers,
  setNewArrivals,
  setProductOverlayHome,
  setSaleSection,
  updateHomeSection,
  clearHomeConfig,
} = homeConfigSlice.actions;

export default homeConfigSlice.reducer;
