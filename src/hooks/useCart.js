// src/hooks/useCart.js
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";
import { v4 as uuidv4 } from "uuid";
import {
  setCartItems,
  setCartTotals,
  addItemLocal,
  updateItemLocal,
  removeItemLocal,
  clearCart,
} from "@/store/slices/cartSlice";
import { selectCartItems } from "@/store/selectors/cartSelectors";
import { showToast } from "@/providers/ToastProvider";

const GUEST_CART_KEY = "guest_cart";

/* ---------------- Helpers ---------------- */
const recalcTotalsFromItems = (items) => {
  const subtotal = items.reduce((s, it) => s + Number(it.line_total || 0), 0);
  const total_items = items.reduce((s, it) => s + Number(it.qty || 0), 0);

  return {
    subtotal,
    discount_total: 0,
    total_items,
    total_payable: subtotal,
  };
};

export default function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { request } = useAxios();

  let isFetchingCart = false;

  /* ---------------- Ensure guest cart exists ---------------- */
  const ensureGuestCart = useCallback(() => {
    try {
      let c = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "null");
      if (!c) {
        c = {
          cart_id: uuidv4(),
          user_id: null,
          items: [],
          subtotal: 0,
          discount_total: 0,
          total_items: 0,
          total_payable: 0,
        };
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(c));
      }
      return c;
    } catch (err) {
      const fallback = {
        cart_id: uuidv4(),
        user_id: null,
        items: [],
        subtotal: 0,
        discount_total: 0,
        total_items: 0,
        total_payable: 0,
      };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }, []);

  /* ---------------- Update guest localStorage ---------------- */
  const updateGuestCartStorage = useCallback(
    (itemsArr) => {
      const stored = ensureGuestCart();
      stored.items = itemsArr;
      Object.assign(stored, recalcTotalsFromItems(itemsArr));
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(stored));
    },
    [ensureGuestCart]
  );

  /* ---------------- Fetch cart (only used on mount/login) ---------------- */
  const fetchCart = useCallback(
    async ({ accessToken = null } = {}) => {
      if (isFetchingCart) return { skipped: true };
      isFetchingCart = true;

      try {
        let options = { url: "/users/get-cart", method: "GET" };

        if (accessToken) {
          options.authRequired = false;
          options.headers = { Authorization: `Bearer ${accessToken}` };
        } else {
          options.authRequired = true;
        }

        const { data, error } = await request(options);
        if (error) return { error };

        const payload = data?.data || {};

        dispatch(setCartItems(payload.items || []));
        dispatch(setCartTotals(payload));

        return { data: payload };
      } finally {
        isFetchingCart = false;
      }
    },
    [dispatch, request]
  );

  /* ---------------- Load guest cart into redux ---------------- */
  const loadGuestCartIntoState = useCallback(() => {
    const stored = ensureGuestCart();
    dispatch(setCartItems(stored.items || []));
    dispatch(setCartTotals(recalcTotalsFromItems(stored.items || [])));
  }, [ensureGuestCart, dispatch]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = useCallback(
    async ({ product, variant, qty = 1, isAuthenticated = false }) => {
      const salePrice = variant.sale_price ?? variant.price ?? 0;

      // Always generate local shaped item
      const cart_item_shape = {
        cart_item_id: uuidv4(),
        variant_id: {
          id: variant.id || variant.variant_id,
          size:
            variant.attributes?.size ||
            variant.variant_size ||
            variant.size ||
            null,
          color:
            variant.attributes?.color ||
            variant.variant_color ||
            variant.color ||
            null,
        },
        product: {
          id: product.id,
          name: product.name,
          image: variant.images?.[0] || product.product_img,
        },
        sku: variant.sku,
        qty,
        variant_price: variant.price ?? salePrice,
        sale_price: salePrice,
        discount_percent: variant.discount_percent || 0,
        line_total: salePrice * qty,
        stock: String(variant.stock || "0"),
        images: variant.images || [product.product_img],
        brand_name: product.brand_name || product.brand || "",
        gender: product.gender || variant.gender || "",
      };

      /** Guest user → Optimistic only */
      if (!isAuthenticated) {
        const next = [...items, cart_item_shape];
        dispatch(addItemLocal(cart_item_shape));
        updateGuestCartStorage(next);
        dispatch(setCartTotals(recalcTotalsFromItems(next)));
        return { success: true, local: true };
      }

      /** Auth user → API returns updated cart, update state directly */
      const { data, error } = await request({
        url: "/users/add-to-cart",
        method: "POST",
        authRequired: true,
        payload: { variant_id: variant.id || variant.variant_id, qty },
      });

      if (error) {
        showToast("error", "Failed to add to cart.");
        return { error };
      }

      const payload = data.data;
      dispatch(setCartItems(payload.items));
      dispatch(setCartTotals(payload));

      return { success: true };
    },
    [dispatch, items, request, updateGuestCartStorage]
  );

  /* ---------------- UPDATE QTY ---------------- */
  const updateQty = useCallback(
    async ({ cart_item_id, newQty, isAuthenticated = false }) => {
      const originalItem = items.find((i) => i.cart_item_id === cart_item_id);
      if (!originalItem) return { error: "Item not found" };

      const updatedItem = {
        ...originalItem,
        qty: newQty,
        line_total:
          newQty * (originalItem.sale_price || originalItem.variant_price || 0),
      };

      /** Guest → only local update */
      if (!isAuthenticated) {
        dispatch(updateItemLocal({ cart_item_id, changes: updatedItem }));

        const next = items.map((i) =>
          i.cart_item_id === cart_item_id ? updatedItem : i
        );

        updateGuestCartStorage(next);
        dispatch(setCartTotals(recalcTotalsFromItems(next)));

        return { success: true, local: true };
      }

      /** Auth → update-cart-item returns new cart */
      const { data, error } = await request({
        url: "/users/update-cart-item",
        method: "PUT",
        authRequired: true,
        payload: { item_id: cart_item_id, qty: newQty },
      });

      if (error) {
        showToast("error", "Failed to update quantity.");
        return { error };
      }

      const payload = data.data;
      dispatch(setCartItems(payload.items));
      dispatch(setCartTotals(payload));

      return { success: true };
    },
    [dispatch, items, request, updateGuestCartStorage]
  );

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = useCallback(
    async ({ cart_item_id, isAuthenticated = false }) => {
      const existing = items.find((i) => i.cart_item_id === cart_item_id);
      if (!existing) return { error: "Item not found" };

      /** Guest → local instant removal */
      if (!isAuthenticated) {
        const next = items.filter((i) => i.cart_item_id !== cart_item_id);
        dispatch(removeItemLocal(cart_item_id));
        updateGuestCartStorage(next);
        dispatch(setCartTotals(recalcTotalsFromItems(next)));

        return { success: true, local: true };
      }

      /** Auth → remove-cart-item returns updated cart */
      const { data, error } = await request({
        url: "/users/remove-cart-item",
        method: "PUT",
        authRequired: true,
        payload: { item_id: cart_item_id },
      });

      if (error) {
        showToast("error", "Failed to remove item.");
        return { error };
      }

      const payload = data.data;
      dispatch(setCartItems(payload.items));
      dispatch(setCartTotals(payload));

      return { success: true };
    },
    [dispatch, items, request, updateGuestCartStorage]
  );

  /* ---------------- CLEAR CART ---------------- */
  const clearCartLocal = useCallback(() => {
    dispatch(clearCart());
    localStorage.removeItem(GUEST_CART_KEY);
  }, [dispatch]);

  /* ---------------- SYNC GUEST → SERVER ON LOGIN ---------------- */
  const syncGuestCartToServer = useCallback(
    async ({ isAuthenticated = false, accessToken }) => {
      if (!isAuthenticated) return;

      const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "null");
      if (!stored || !stored.items?.length) return;

      const { data, error } = await request({
        url: "/users/sync-cart",
        method: "POST",
        payload: stored,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) {
        showToast("error", "Could not sync cart.");
        return { error };
      }

      localStorage.removeItem(GUEST_CART_KEY);

      const payload = data.data;
      dispatch(setCartItems(payload.items));
      dispatch(setCartTotals(payload));

      return { success: true };
    },
    [request, dispatch]
  );

  return {
    // read-only state (components should use selectors)
    items,
    // actions
    fetchCart,
    loadGuestCartIntoState,
    addToCart,
    updateQty,
    removeItem,
    clearCartLocal,
    syncGuestCartToServer,
    // utilities
    recalcTotalsFromItems,
  };
}
