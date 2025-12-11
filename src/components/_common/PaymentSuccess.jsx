"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useAxios from "@/hooks/useAxios";
import { Spinner } from "../ui/spinner";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const { request: verifyPayment, loading } = useAxios();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const verifyStripePayment = async () => {
      const { data, error } = await verifyPayment({
        url: `/users/verify-payment`,
        method: "POST",
        authRequired: true,
        payload: { order_id: orderId },
      });

      if (data.status === 200) {
        setPaymentData(data.data || {});
        setStatus("success");
        localStorage.removeItem("cart_coupon_code");
      } else {
        setStatus("error");
      }
    };

    verifyStripePayment();
  }, [orderId]);

  // 🕓 Loading
  if (loading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-600">
        <Spinner className="h-8 w-8" />
        <p className="text-2xl mt-3">Verifying your payment, please wait...</p>
      </div>
    );
  }

  // ❌ Error / Verification failed
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-red-600">
        <h2 className="text-3xl font-semibold mb-2">
          Payment Verification Failed
        </h2>
        <p>We couldn’t verify your transaction. Please contact support.</p>
        <p className="mt-4">
          <strong>Order ID:</strong> {orderId}
        </p>
      </div>
    );
  }

  // ✅ Success UI
  const { payment_id, status: payStatus, order_no } = paymentData || {};

  return (
    <div className="container mx-auto text-center py-10 my-10">
      <img
        src="https://img.icons8.com/?size=96&id=YZHzhN7pF7Dw&format=gif"
        alt="Success"
        className="mx-auto mb-4 w-20 h-20"
      />

      <h2 className="text-4xl font-light text-green-700">Payment Successful</h2>
      <p className="text-gray-600 mt-2 text-xl">
        Your payment has been processed successfully. Thank you for your
        purchase!
      </p>

      <div className="mt-6 text-lg text-gray-800p-4 rounded-xl inline-block">
        <p className="mb-1 font-light">
          <span className="font-medium">Order No:</span> {order_no}
        </p>
        <p className="mb-1 font-light">
          <span className="font-medium">Payment ID:</span> {payment_id}
        </p>
        <p className="mb-1 font-light">
          <span className="font-medium">Status:</span>{" "}
          <span className="text-green-600 font-medium capitalize">
            {payStatus}
          </span>
        </p>
      </div>
    </div>
  );
}
