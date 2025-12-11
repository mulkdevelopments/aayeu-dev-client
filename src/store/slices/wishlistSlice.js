import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
  },
  reducers: {
    setWishlist(state, action) {
      state.items = action.payload;
    },
    addWish(state, action) {
      state.items.push(action.payload);
    },
    removeWish(state, action) {
      state.items = state.items.filter(
        (i) => i.product_id !== action.payload
      );
    },
  },
});

export const { setWishlist, addWish, removeWish } = wishlistSlice.actions;
export default wishlistSlice.reducer;
