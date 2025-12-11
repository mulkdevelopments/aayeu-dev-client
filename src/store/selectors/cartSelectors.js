// src/store/selectors/cartSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotals = (state) => state.cart.totals;

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, i) => sum + (i.qty || 0), 0)
);

export const selectCartSubtotal = createSelector(
  [selectCartTotals],
  (totals) => totals.subtotal ?? 0
);
