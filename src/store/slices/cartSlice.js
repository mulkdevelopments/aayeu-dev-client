// src/store/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // array of cart items (backend-shaped)
  totals: {
    subtotal: 0,
    discount_total: 0,
    total_items: 0,
    total_payable: 0,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
    },
    setCartTotals(state, action) {
      state.totals = action.payload;
    },

    // Local mutations used by the hook for optimistic updates
    addItemLocal(state, action) {
      const incoming = action.payload;
      const variantId = incoming.variant_id?.id || incoming.variant_id;
      const existing = state.items.find((it) => {
        const id = it.variant_id?.id || it.variant_id;
        return id && id === variantId;
      });
      if (existing) {
        existing.qty = (Number(existing.qty) || 0) + (Number(incoming.qty) || 1);
        existing.line_total =
          existing.qty * (existing.sale_price || existing.variant_price || 0);
      } else {
        state.items.push(incoming);
      }
    },
    updateItemLocal(state, action) {
      const { cart_item_id, changes } = action.payload;
      state.items = state.items.map((it) =>
        it.cart_item_id === cart_item_id ? { ...it, ...changes } : it
      );
    },
    removeItemLocal(state, action) {
      state.items = state.items.filter(
        (it) => it.cart_item_id !== action.payload
      );
    },
    clearCart(state) {
      state.items = [];
      state.totals = initialState.totals;
    },
  },
});

export const {
  setCartItems,
  setCartTotals,
  addItemLocal,
  updateItemLocal,
  removeItemLocal,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
