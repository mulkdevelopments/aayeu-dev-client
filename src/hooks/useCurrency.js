"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedCurrency,
  setExchangeRates,
  setLoading,
  setError,
  selectSelectedCurrency,
  selectSelectedLanguage,
  selectExchangeRates,
  selectCustomDuties,
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
  const selectedLanguage = useSelector(selectSelectedLanguage) || "en";
  const exchangeRates = useSelector(selectExchangeRates);
  const customDuties = useSelector(selectCustomDuties);
  const currencyInfo = useSelector(selectCurrencyInfo);
  const loading = useSelector(selectCurrencyLoading);
  const lastUpdated = useSelector(selectCurrencyLastUpdated);

  const fetchExchangeRates = async () => {
    if (ratesFetchInFlight) return;
    ratesFetchInFlight = true;
    try {
      dispatch(setLoading(true));
      const result = await request({
        url: "/currency/rates",
        method: "GET",
      });
      const body = result?.data;
      const payload = body?.data ?? body;
      if (body?.success && payload?.rates) {
        dispatch(
          setExchangeRates({
            rates: payload.rates,
            duties: payload.duties != null && typeof payload.duties === "object" ? payload.duties : {},
            updated_at: payload.updated_at,
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      dispatch(setError(error?.message));
    } finally {
      ratesFetchInFlight = false;
    }
  };

  // Fetch rates + duties on mount so frontend reflects admin duty changes (no skip when persisted lastUpdated)
  useEffect(() => {
    fetchExchangeRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  const changeCurrency = (currencyCode) => {
    dispatch(setSelectedCurrency(currencyCode));
  };

  const convert = (eurPrice) => {
    return convertPrice(eurPrice, selectedCurrency, exchangeRates, customDuties);
  };

  const format = (eurPrice) => {
    return formatPrice(eurPrice, selectedCurrency, exchangeRates, customDuties);
  };

  return {
    selectedCurrency,
    selectedLanguage,
    exchangeRates,
    currencyInfo,
    loading,
    changeCurrency,
    convert,
    format,
    fetchExchangeRates,
  };
}
