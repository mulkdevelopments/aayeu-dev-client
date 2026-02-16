"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedCurrency,
  setExchangeRates,
  setLoading,
  setError,
  selectSelectedCurrency,
  selectExchangeRates,
  selectCurrencyInfo,
  selectCurrencyLoading,
  selectCurrencyLastUpdated,
  convertPrice,
  formatPrice,
} from "@/store/slices/currencySlice";
import useAxios from "@/hooks/useAxios";

let ratesFetchInFlight = false;

export default function useCurrency() {
  const dispatch = useDispatch();
  const { request } = useAxios();
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const currencyInfo = useSelector(selectCurrencyInfo);
  const loading = useSelector(selectCurrencyLoading);
  const lastUpdated = useSelector(selectCurrencyLastUpdated);

  // Fetch exchange rates on mount
  useEffect(() => {
    if (loading || lastUpdated || ratesFetchInFlight) return;
    fetchExchangeRates();
  }, [loading, lastUpdated]);
  
  const fetchExchangeRates = async () => {
    if (ratesFetchInFlight) return;
    ratesFetchInFlight = true;
    try {
      dispatch(setLoading(true));
      const response = await request({
        url: "/currency/rates",
        method: "GET",
      });

      if (response.success && response.data) {
        dispatch(
          setExchangeRates({
            rates: response.data.rates,
            updated_at: response.data.updated_at,
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      console.warn("Using default fallback exchange rates");
      dispatch(setError(error.message));
      // Note: Default rates (EUR:1, AED:4.3, INR:105, PKR:328) are already set in Redux
      // So even if API fails, prices will still display correctly with fallback rates
    } finally {
      ratesFetchInFlight = false;
    }
  };

  const changeCurrency = (currencyCode) => {
    dispatch(setSelectedCurrency(currencyCode));
  };

  const convert = (eurPrice) => {
    return convertPrice(eurPrice, selectedCurrency, exchangeRates);
  };

  const format = (eurPrice) => {
    return formatPrice(eurPrice, selectedCurrency, exchangeRates);
  };

  return {
    selectedCurrency,
    exchangeRates,
    currencyInfo,
    loading,
    changeCurrency,
    convert,
    format,
    fetchExchangeRates,
  };
}
