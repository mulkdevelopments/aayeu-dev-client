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

import { selectCartTotals } from "@/store/selectors/cartSelectors";

export default function CartSummarySection() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const cartTotals = useSelector(selectCartTotals);

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

  const handlePay = async () => {
    if (!shippingAddress) {
      setOpenAddDialog(true);
      return;
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
        <CTAButton color="gold" onClick={() => router.push("/shop")}>
          Continue Shopping
        </CTAButton>
      </div>

      <h5 className="text-xl mb-2">Summary</h5>

      <div className="flex justify-between font-light">
        <span>Subtotal:</span>
        <span>AED {updatedTotals.subtotal?.toFixed(2)}</span>
      </div>

      {appliedCoupon && (
        <div className="flex justify-between text-green-700 font-light">
          <span>Coupon ({appliedCoupon.coupon.code}):</span>
          <span>-AED {appliedCoupon.discount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between font-light">
        <span>Delivery:</span>
        <span>
          {appliedCoupon?.free_shipping
            ? "Free"
            : `AED ${updatedTotals.shipping_cost?.toFixed(2) || "0.00"}`}
        </span>
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
          AED {updatedTotals.total_payable?.toFixed(2)}
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

      {isAuthenticated ? (
        <CTAButton
          color="gold"
          className="mt-4 w-full"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Pay"}
        </CTAButton>
      ) : (
        <SignupDialog
          trigger={
            <CTAButton color="gold" className="mt-4 w-full">
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
