"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer, { logout } from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import cartReducer from "./slices/cartSlice";
import homeConfigReducer from "./slices/homeConfigSlice";
import policiesReducer from "./slices/policiesSlice";
import menuReducer from "./slices/menuSlice";

/* -----------------------------------------------------------
   Persist configs
----------------------------------------------------------- */
const authPersistConfig = { key: "auth", storage };
const wishlistPersistConfig = { key: "wishlist", storage };
const cartPersistConfig = { key: "cart", storage };

/* -----------------------------------------------------------
   App reducer
----------------------------------------------------------- */
const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  homeConfig: homeConfigReducer, // ❗ NOT persisted
  policies: policiesReducer, // ❗ NOT persisted
  menu: menuReducer, // ❗ NOT persisted
});

/* -----------------------------------------------------------
   Root reducer — RESET + CLEAN INVALID PERSISTED KEYS
----------------------------------------------------------- */
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    storage.removeItem("persist:auth");
    storage.removeItem("persist:wishlist");
    storage.removeItem("persist:cart");
    return appReducer(undefined, action);
  }

  // ❗ Auto-remove unexpected old keys (Fix hydration / reducer mismatch)
  if (state && typeof state === "object") {
    const allowedKeys = [
      "auth",
      "wishlist",
      "cart",
      "homeConfig",
      "policies",
      "menu",
    ];

    const cleanedState = {};
    for (const key of allowedKeys) {
      cleanedState[key] = state[key];
    }

    // This cleaned state replaces invalid persisted keys
    state = cleanedState;
  }

  return appReducer(state, action);
};

/* -----------------------------------------------------------
   Store
----------------------------------------------------------- */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
