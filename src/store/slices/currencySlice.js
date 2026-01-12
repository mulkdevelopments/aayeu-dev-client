"use client";

import { createSlice } from "@reduxjs/toolkit";

const CURRENCIES = {
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  PKR: { code: "PKR", symbol: "Rs", name: "Pakistani Rupee" },
};

// Default fallback exchange rates (used if API fails or cache is cleared)
const DEFAULT_EXCHANGE_RATES = {
  EUR: 1,
  AED: 4.3,
  INR: 105,
  PKR: 328,
};

const initialState = {
  selectedCurrency: "EUR", // Default currency
  exchangeRates: DEFAULT_EXCHANGE_RATES,
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
    setExchangeRates: (state, action) => {
      // Merge with default rates to ensure we always have fallback values
      state.exchangeRates = {
        ...DEFAULT_EXCHANGE_RATES,
        ...(action.payload.rates || {}),
      };
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

export const { setSelectedCurrency, setExchangeRates, setLoading, setError } =
  currencySlice.actions;

export default currencySlice.reducer;

// Selectors
export const selectSelectedCurrency = (state) => state.currency.selectedCurrency;
export const selectExchangeRates = (state) => state.currency.exchangeRates;
export const selectCurrencyInfo = (state) => CURRENCIES[state.currency.selectedCurrency];
export const selectCurrencyLoading = (state) => state.currency.loading;

// Helper function to convert EUR price to selected currency
export const convertPrice = (eurPrice, selectedCurrency, exchangeRates) => {
  if (!eurPrice || eurPrice === 0) return 0;

  // Fallback to default rates if exchangeRates is null/undefined
  const rates = exchangeRates || DEFAULT_EXCHANGE_RATES;

  // Get rate with fallback to default for that currency
  const rate = rates[selectedCurrency] || DEFAULT_EXCHANGE_RATES[selectedCurrency] || 1;

  // Round to nearest whole number
  return Math.round(eurPrice * rate);
};

// Helper function to format price with currency symbol
export const formatPrice = (eurPrice, selectedCurrency, exchangeRates) => {
  const convertedPrice = convertPrice(eurPrice, selectedCurrency, exchangeRates);

  // Fallback to EUR if currency is invalid
  const currencyInfo = CURRENCIES[selectedCurrency] || CURRENCIES.EUR;

  return `${currencyInfo.symbol}${convertedPrice}`;
};

export { CURRENCIES };
