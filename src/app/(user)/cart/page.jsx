"use client";

import React, { useEffect, useState } from "react";
import NeedHelpSection from "@/components/_pages/cart/NeedHelpSection";
import CartItemsSection from "@/components/_pages/cart/CartItemsSection";
import CartSummarySection from "@/components/_pages/cart/CartSummarySection";
import { ShoppingBag } from "lucide-react";
import CTAButton from "@/components/_common/CTAButton";
import { Spinner } from "@/components/ui/spinner";

import { useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartTotals,
} from "@/store/selectors/cartSelectors";
import useCart from "@/hooks/useCart";
import useAxios from "@/hooks/useAxios";

export default function CartPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redux state
  const cartItems = useSelector(selectCartItems);
  const cartTotals = useSelector(selectCartTotals);

  // All cart actions
  const {
    fetchCart, // server fetch
    loadGuestCartIntoState, // load guest cart from localStorage
  } = useCart();

  // Local loading from fetchCart API (via useAxios)
  const [loading, setLoading] = useState(false);

  // Live stock data for each cart item
  const [liveStockMap, setLiveStockMap] = useState({});
  const [stockCheckLoading, setStockCheckLoading] = useState(false);

  const { request: getLiveStock } = useAxios();

  const loadCart = async () => {
    setLoading(true);

    if (isAuthenticated) {
      await fetchCart();
    } else {
      loadGuestCartIntoState();
    }

    setLoading(false);
  };

  // Check live stock for all items with individual syncing capability
  const checkLiveStockForAllItems = async () => {
    if (!cartItems.length) return;

    const itemsToCheck = cartItems.filter(
      (item) => item.vendor_capabilities?.has_individual_syncing
    );

    if (!itemsToCheck.length) return;

    setStockCheckLoading(true);
    const stockData = {};

    try {
      // Fetch stock for all items in parallel
      const stockPromises = itemsToCheck.map(async (item) => {
        try {
          const { data, error } = await getLiveStock({
            url: `/users/check-live-stock`,
            method: "GET",
            params: { productId: item.product.id },
          });

          if (!error && data?.data) {
            stockData[item.cart_item_id] = data.data;
          } else {
            stockData[item.cart_item_id] = { stockBySize: [], totalStock: 0, error: true };
          }
        } catch (err) {
          console.warn(`Error checking stock for item ${item.cart_item_id}:`, err);
          stockData[item.cart_item_id] = { stockBySize: [], totalStock: 0, error: true };
        }
      });

      await Promise.all(stockPromises);
      setLiveStockMap(stockData);
    } finally {
      setStockCheckLoading(false);
    }
  };

  useEffect(() => {
    loadCart(); // initial load
  }, []);

  // Check live stock after cart items load
  useEffect(() => {
    if (cartItems.length > 0 && !loading) {
      checkLiveStockForAllItems();
    }
  }, [cartItems.length, loading]);

  if (process.env.NODE_ENV === "development") {
    console.log("Cart Logging:", cartItems, cartTotals);
  }

  // 🔹 Loading State
  if (loading)
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Spinner className="h-8 w-8" />
        <p className="text-xl font-light my-2">Loading your cart...</p>
        <p className="text-gray-600 mb-6">This might take a few seconds.</p>
      </section>
    );

  // 🔹 If Cart Empty — Show Empty State
  if (!cartItems.length) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingBag size={80} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven’t added anything to your cart yet.
        </p>
        <CTAButton as="link" href="/shop">
          Continue Shopping
        </CTAButton>
      </section>
    );
  }

  return (
    <section className="mt-4 container-fluid px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Cart Items */}
        <CartItemsSection
          liveStockMap={liveStockMap}
          stockCheckLoading={stockCheckLoading}
        />

        {/* RIGHT: Summary */}
        <CartSummarySection
          liveStockMap={liveStockMap}
          stockCheckLoading={stockCheckLoading}
        />
      </div>

      <NeedHelpSection />
    </section>
  );
}
