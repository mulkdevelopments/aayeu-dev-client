"use client";

import { createSlice } from "@reduxjs/toolkit";

// All supported currencies: GCC (6) + Asia (2)
const CURRENCIES = {
  // GCC
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham" },
  SAR: { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
  QAR: { code: "QAR", symbol: "QAR", name: "Qatari Riyal" },
  KWD: { code: "KWD", symbol: "KWD", name: "Kuwaiti Dinar" },
  OMR: { code: "OMR", symbol: "OMR", name: "Omani Rial" },
  BHD: { code: "BHD", symbol: "BHD", name: "Bahraini Dinar" },
  // Asia
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  PKR: { code: "PKR", symbol: "Rs", name: "Pakistani Rupee" },
};

// Region → list of currency codes (for region-first selection)
export const REGIONS = {
  GCC: [
    { code: "AED", country: "United Arab Emirates" },
    { code: "SAR", country: "Saudi Arabia" },
    { code: "QAR", country: "Qatar" },
    { code: "KWD", country: "Kuwait" },
    { code: "OMR", country: "Oman" },
    { code: "BHD", country: "Bahrain" },
  ],
  Asia: [
    { code: "INR", country: "India" },
    { code: "PKR", country: "Pakistan" },
  ],
};

// All countries flat (for searchable list, no flags)
export const ALL_COUNTRIES = [
  ...REGIONS.GCC,
  ...REGIONS.Asia,
];

// Languages per country (currency code) — text only, no flags
export const COUNTRY_LANGUAGES = {
  AED: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  SAR: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  QAR: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  KWD: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  OMR: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  BHD: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربي" },
  ],
  INR: [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
  ],
  PKR: [
    { code: "en", label: "English" },
    { code: "ur", label: "اردو" },
  ],
};

// Default fallback exchange rates (used if API fails or cache is cleared). Base: EUR.
const DEFAULT_EXCHANGE_RATES = {
  EUR: 1,
  AED: 4.27,
  SAR: 4.0,
  QAR: 3.9,
  KWD: 0.33,
  OMR: 0.38,
  BHD: 0.38,
  INR: 106.89,
  PKR: 324.68,
};

const initialState = {
  selectedCurrency: "AED",
  selectedLanguage: "en",
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  customDuties: {}, // e.g. { INR: 42, PKR: 30 } — duty % per currency for display
  lastUpdated: null,
  loading: false,
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setPreferences: (state, action) => {
      const { currency, language } = action.payload || {};
      if (currency !== undefined) state.selectedCurrency = currency;
      if (language !== undefined) state.selectedLanguage = language;
    },
    setExchangeRates: (state, action) => {
      // Merge with default rates to ensure we always have fallback values
      state.exchangeRates = {
        ...DEFAULT_EXCHANGE_RATES,
        ...(action.payload.rates || {}),
      };
      if (action.payload.duties && typeof action.payload.duties === "object") {
        state.customDuties = action.payload.duties;
      }
      state.lastUpdated = action.payload.updated_at;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setSelectedCurrency, setSelectedLanguage, setPreferences, setExchangeRates, setLoading, setError } =
  currencySlice.actions;

export default currencySlice.reducer;

// Selectors
export const selectSelectedCurrency = (state) => state.currency.selectedCurrency;
export const selectSelectedLanguage = (state) => state.currency.selectedLanguage;
export const selectExchangeRates = (state) => state.currency.exchangeRates;
export const selectCustomDuties = (state) => state.currency.customDuties || {};
export const selectCurrencyInfo = (state) =>
  CURRENCIES[state.currency.selectedCurrency] || CURRENCIES.AED;
export const selectCurrencyLoading = (state) => state.currency.loading;
export const selectCurrencyLastUpdated = (state) => state.currency.lastUpdated;

// Helper function to convert EUR price to selected currency (includes custom duty if set)
export const convertPrice = (eurPrice, selectedCurrency, exchangeRates, customDuties = {}) => {
  if (!eurPrice || eurPrice === 0) return 0;

  const rates = exchangeRates || DEFAULT_EXCHANGE_RATES;
  const rate = rates[selectedCurrency] || DEFAULT_EXCHANGE_RATES[selectedCurrency] || 1;
  let amount = eurPrice * rate;

  const dutyPercent = customDuties[selectedCurrency];
  if (dutyPercent != null && Number(dutyPercent) > 0) {
    amount = amount * (1 + Number(dutyPercent) / 100);
  }

  return Math.round(amount);
};

// Helper function to format price with currency symbol (includes duty when set)
export const formatPrice = (eurPrice, selectedCurrency, exchangeRates, customDuties = {}) => {
  const convertedPrice = convertPrice(eurPrice, selectedCurrency, exchangeRates, customDuties);

  const currencyInfo = CURRENCIES[selectedCurrency] || CURRENCIES.AED;

  return `${currencyInfo.symbol}${convertedPrice}`;
};

export { CURRENCIES };
