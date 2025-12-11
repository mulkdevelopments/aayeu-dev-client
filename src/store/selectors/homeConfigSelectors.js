import { createSelector } from "@reduxjs/toolkit";

/* Stable empty object to avoid new {} allocation */
const EMPTY = {};

/* Base selector with safe fallback */
export const selectHomeConfig = (state) => state?.homeConfig || EMPTY;

/* Helper builder */
const selectField = (key) =>
  createSelector(selectHomeConfig, (cfg) => {
    return cfg[key] ?? null;
  });

/* Banner selectors */
export const selectTopBanner = selectField("topBanner");
export const selectMiddleBanner = selectField("middleBanner");
export const selectBottomTopBanner = selectField("bottomTopBanner");
export const selectBottomLeftBanner = selectField("bottomLeftBanner");

/* Product list selectors */
export const selectBestSellers = selectField("bestSellers");
export const selectNewArrivals = selectField("newArrivals");
