"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import CTAButton from "@/components/_common/CTAButton";
import SignupDialog from "@/components/_dialogs/SignupDialog";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import CartAddressSection from "./CartAddressSection";
import CartCouponSection from "./CartCouponSection";
import useCurrency from "@/hooks/useCurrency";

import { selectCartTotals, selectCartItems } from "@/store/selectors/cartSelectors";
import { selectSelectedCurrency, selectExchangeRates, selectCurrencyInfo } from "@/store/slices/currencySlice";

export default function CartSummarySection({ liveStockMap, stockCheckLoading }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { format } = useCurrency();

  // Get currency data for payment
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const currencyInfo = useSelector(selectCurrencyInfo);

  const cartTotals = useSelector(selectCartTotals);
  const cartItems = useSelector(selectCartItems);

  const { request: createSession } = useAxios();
  const { request: addressRequest } = useAxios();

  const [addresses, setAddresses] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [updatedTotals, setUpdatedTotals] = useState(cartTotals);

  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    if (!appliedCoupon) {
      setUpdatedTotals(cartTotals);
    }
  }, [cartTotals, appliedCoupon]);

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;

    const { data, error } = await addressRequest({
      url: "/users/get-addresses",
      method: "GET",
      authRequired: true,
    });

    if (error) return;

    const list = data?.data ?? [];
    setAddresses(list);

    if (!shippingAddress && list[0]) setShippingAddress(list[0].id);
    if (!billingAddress && list[0]) setBillingAddress(list[0].id);
  }, [isAuthenticated, addressRequest, shippingAddress, billingAddress]);

  const handleAddAddress = async (values) => {
    const { data, error } = await addressRequest({
      url: "/users/add-address",
      method: "POST",
      payload: values,
      authRequired: true,
    });

    if (error) return showToast("error", "Failed to save address");
    showToast("success", data?.message || "Address added");
    fetchAddresses();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setShippingAddress(null);
      setBillingAddress(null);
    }
  }, [isAuthenticated]);

  // Check if any items are out of stock
  const hasOutOfStockItems = () => {
    if (!cartItems || !cartItems.length) return false;

    return cartItems.some((item) => {
      // Only check live stock for vendors with individual syncing
      if (item.vendor_capabilities?.has_individual_syncing) {
        const stockData = liveStockMap[item.cart_item_id];
        if (!stockData) return false; // Still loading

        const stockItem = stockData.stockBySize?.find(
          (s) => s.size?.toLowerCase() === item.variant_id?.size?.toLowerCase()
        );
        const availableStock = stockItem?.quantity ?? 0;
        return availableStock === 0;
      }
      return false;
    });
  };

  const handlePay = async () => {
    // Check for out of stock items
    if (hasOutOfStockItems()) {
      showToast("error", "Please remove out of stock items from your cart before proceeding.");
      return;
    }

    if (!shippingAddress) {
      setOpenAddDialog(true);
      return;
    }

    // PKR currency warning (Stripe doesn't support PKR)
    if (selectedCurrency === "PKR") {
      showToast(
        "info",
        "Pakistani Rupee (PKR) is not supported for payments. Checkout will process in EUR."
      );
    }

    try {
      setLoading(true);
      const { data, error } = await createSession({
        url: "/users/create-checkout-session",
        method: "POST",
        authRequired: true,
        payload: {
          mode: "cart",
          shipping_address_id: shippingAddress,
          couponCode: appliedCoupon?.coupon?.code || null,
          couponId: appliedCoupon?.coupon?.id || null,
          // Currency information for payment processing
          selectedCurrency: selectedCurrency,
          exchangeRate: exchangeRates[selectedCurrency] || 1,
          currencySymbol: currencyInfo?.symbol || "€",
        },
      });

      if (error || !data?.data?.url) {
        showToast("error", "Failed to start payment.");
        return;
      }

      window.location.href = data.data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <CTAButton color="black" onClick={() => router.push("/shop")}>
          Continue Shopping
        </CTAButton>
      </div>

      <h5 className="text-xl mb-2">Summary</h5>

      <div className="flex justify-between font-light">
        <span>Subtotal:</span>
        <span>{format(updatedTotals.subtotal || 0)}</span>
      </div>

      {appliedCoupon && (
        <div className="flex justify-between text-green-700 font-light">
          <span>Coupon ({appliedCoupon.coupon.code}):</span>
          <span>-{format(appliedCoupon.discount)}</span>
        </div>
      )}

    <div className="flex justify-between items-center font-light">
  <span>Delivery:</span>

  {appliedCoupon?.free_shipping || updatedTotals.shipping_cost === 0 ? (
    <span className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md border border-dashed border-green-400">
     🎉 You got Free Delivery!
    </span>
  ) : (
    <span>{format(updatedTotals.shipping_cost)}</span>
  )}
</div>


      <hr className="my-3" />

      <CartCouponSection
        cartTotals={cartTotals}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        updatedTotals={updatedTotals}
        setUpdatedTotals={setUpdatedTotals}
      />

      <hr className="my-3" />

      <div className="flex justify-between font-medium text-lg">
        <span>Total:</span>
        <span className="text-[#d9b554] font-semibold">
          {format(updatedTotals.total_payable || 0)}
        </span>
      </div>

      {isAuthenticated && (
        <CartAddressSection
          addresses={addresses}
          shippingAddress={shippingAddress}
          billingAddress={billingAddress}
          onAddNewAddress={handleAddAddress}
          onSelectShipping={setShippingAddress}
          onSelectBilling={setBillingAddress}
          openAddDialog={openAddDialog}
          setOpenAddDialog={setOpenAddDialog}
        />
      )}

      {/* Out of Stock Warning */}
      {hasOutOfStockItems() && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          <p className="font-semibold">Some items are Out of Stock</p>
          <p className="text-xs mt-1">Please remove unavailable items to proceed with payment.</p>
        </div>
      )}

      {/* Stock Check Loading */}
      {/* {stockCheckLoading && (
        <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm">
          <p className="text-xs">🔄 Checking live stock availability...</p>
        </div>
      )} */}

      {isAuthenticated ? (
        <CTAButton
          color="black"
          className="mt-4 w-full"
          onClick={handlePay}
          disabled={loading || stockCheckLoading || hasOutOfStockItems()}
        >
          {loading ? "Redirecting..." : stockCheckLoading ? "..." : "Pay"}
        </CTAButton>
      ) : (
        <SignupDialog
          trigger={
            <CTAButton color="black" className="mt-4 w-full">
              Pay
            </CTAButton>
          }
        />
      )}

      <div className="bg-gray-900 text-white p-3 mt-3 rounded-md">
        <p className="mt-1 text-sm">
          Use code <strong>WELCOME10</strong> for 10% off your first order.
        </p>
      </div>
    </div>
  );
}
