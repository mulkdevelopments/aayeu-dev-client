"use client";

import React, { useEffect, useRef, useState } from "react";
import CTAButton from "@/components/_common/CTAButton";
import TextField from "@/components/_fields/TextField";
import { showToast } from "@/providers/ToastProvider";
import useAxios from "@/hooks/useAxios";
import { useSelector } from "react-redux";
import useCurrency from "@/hooks/useCurrency";

export default function CartCouponSection({
  cartTotals,
  appliedCoupon,
  setAppliedCoupon,
  updatedTotals,
  setUpdatedTotals,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { request: applyCouponAPI } = useAxios();
  const { format } = useCurrency();

  const [couponCode, setCouponCode] = useState(
    appliedCoupon?.coupon?.code ||
      localStorage.getItem("cart_coupon_code") ||
      ""
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [autoRevalidating, setAutoRevalidating] = useState(false);
  const [pendingLoginReapply, setPendingLoginReapply] = useState(false);
  const prevAuthState = useRef(isAuthenticated);
  const prevSubtotal = useRef(cartTotals.subtotal);
  const debounceTimer = useRef(null);

  // ✅ Keep coupon synced with localStorage + UI
  useEffect(() => {
    if (appliedCoupon?.coupon?.code) {
      setCouponCode(appliedCoupon.coupon.code);
      localStorage.setItem("cart_coupon_code", appliedCoupon.coupon.code);
    }
  }, [appliedCoupon]);

  // ✅ Core Apply Coupon (works for both guest + logged-in)
  const handleApplyCoupon = async (
    code = couponCode,
    auth = isAuthenticated,
    isAuto = false
  ) => {
    if (!code.trim()) return;

    try {
      if (!isAuto) setCouponLoading(true);
      if (isAuto) setAutoRevalidating(true);

      const { data, error } = await applyCouponAPI({
        url: "/users/apply-coupon",
        method: "POST",
        authRequired: auth,
        payload: { code, subtotal: cartTotals.subtotal },
      });

      if (error || !data?.success) {
        console.warn("❌ Coupon not valid or failed:", error || data?.message);

        if (isAuto) {
          // AUTO REMOVE COUPON if validation fails
          if (process.env.NODE_ENV === "development") {
            console.log(
              "⚠️ Auto-removing coupon because it no longer meets conditions."
            );
          }
          handleRemoveCoupon();
        } else {
          // Manual apply
          showToast("error", error || data?.message || "Invalid coupon code.");
        }

        return;
      }

      const result = data.data;
      setAppliedCoupon(result);
      setUpdatedTotals({
        subtotal: result.subtotal,
        discount_total: result.discount,
        shipping_cost: result.free_shipping ? 0 : result.shipping_cost,
        total_payable: result.final_total,
      });

      localStorage.setItem("cart_coupon_code", code);

      if (!isAuto)
        showToast("success", data?.message || "Coupon applied successfully!");
      else if (process.env.NODE_ENV === "development") {
        console.log("✅ Coupon auto (re)validated:", code);
      }
    } catch (err) {
      console.error("Apply coupon failed:", err);
      if (!isAuto) showToast("error", "Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
      setAutoRevalidating(false);
    }
  };

  // ✅ Remove coupon manually only
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    localStorage.removeItem("cart_coupon_code");
    setUpdatedTotals(cartTotals);
  };

  // ✅ Detect login → mark pending reapply (but don’t remove coupon!)
  useEffect(() => {
    if (prevAuthState.current === false && isAuthenticated === true) {
      const storedCode = localStorage.getItem("cart_coupon_code");
      if (storedCode) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🕐 Login detected — will reapply coupon after cart sync."
          );
        }
        setPendingLoginReapply(true);
      }
    }
    prevAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  // ✅ When subtotal changes after login → reapply coupon
  useEffect(() => {
    if (
      pendingLoginReapply &&
      cartTotals.subtotal > 0 &&
      cartTotals.subtotal !== prevSubtotal.current
    ) {
      const storedCode = localStorage.getItem("cart_coupon_code");
      if (storedCode) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔁 Cart synced, reapplying coupon post-login:",
            storedCode
          );
        }
        handleApplyCoupon(storedCode, true, true);
      }
      setPendingLoginReapply(false);
    }
    prevSubtotal.current = cartTotals.subtotal;
  }, [cartTotals.subtotal, pendingLoginReapply]);

  // ✅ Auto revalidate coupon when subtotal changes (for guest or user)
  useEffect(() => {
    const storedCode =
      appliedCoupon?.coupon?.code || localStorage.getItem("cart_coupon_code");
    if (!storedCode || pendingLoginReapply) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Subtotal changed — revalidating coupon...");
      }
      await handleApplyCoupon(storedCode, isAuthenticated, true);
    }, 700);

    return () => clearTimeout(debounceTimer.current);
  }, [cartTotals.subtotal, isAuthenticated, pendingLoginReapply]);

  // ✅ On first mount (refresh), auto restore + revalidate coupon
  useEffect(() => {
    const storedCode = localStorage.getItem("cart_coupon_code");
    if (storedCode && !appliedCoupon && !couponLoading) {
      if (process.env.NODE_ENV === "development") {
        console.log("♻️ Restoring coupon after refresh:", storedCode);
      }
      handleApplyCoupon(storedCode, isAuthenticated, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="my-4 relative">
      {appliedCoupon ? (
        <div className="bg-gray-100 p-3 rounded-md text-sm relative overflow-hidden">
          {(couponLoading || autoRevalidating) && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md z-10">
              <p className="text-gray-600 text-xs animate-pulse">
                Revalidating your coupon...
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-green-700 font-medium">
              🎉 Coupon <strong>{appliedCoupon.coupon.code}</strong> applied!
            </p>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs underline text-red-500"
            >
              Remove
            </button>
          </div>

          <ul className="mt-2 text-gray-700 text-xs space-y-1">
            <li>
              <strong>Discount:</strong> {format(appliedCoupon.discount)}{" "}
              applied on {format(appliedCoupon.applied_on_amount)}
            </li>
            {appliedCoupon.free_shipping && (
              <li className="text-green-600">🚚 Free shipping enabled</li>
            )}
            {appliedCoupon.bogo && (
              <li className="text-blue-600">
                🎁 Buy One Get One: {appliedCoupon.bogo.details}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <>
          <p>Have a voucher? Apply it here</p>
          <div className="flex gap-2 mt-2">
            <TextField
              placeholder="Enter coupon code"
              className="flex-1"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponLoading || autoRevalidating}
            />
            <CTAButton
              color="gold"
              onClick={() => handleApplyCoupon()}
              loading={couponLoading}
              disabled={couponLoading || autoRevalidating || !couponCode.trim()}
            >
              Apply
            </CTAButton>
          </div>
        </>
      )}
    </div>
  );
}
