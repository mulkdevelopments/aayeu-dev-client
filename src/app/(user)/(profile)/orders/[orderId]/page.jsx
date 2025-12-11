"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CTAButton from "@/components/_common/CTAButton";
import useAxios from "@/hooks/useAxios";
import dayjs from "dayjs";
import RefundSection from "@/components/_pages/order-details/RefundSection";
import ReviewSection from "@/components/_pages/order-details/ReviewSection";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";
import { slugifyProductName } from "@/utils/seoHelpers";
import Link from "next/link";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { request } = useAxios();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // ✅ Fetch order details
  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await request({
      url: `/users/get-order-by-id?orderId=${orderId}`,
      method: "GET",
      authRequired: true,
    });

    if (error) {
      console.error("❌ Error fetching order:", error);
      setOrder(null);
    } else {
      setOrder(data?.data || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  // ✅ Download invoice using Axios
  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    setDownloading(true);

    try {
      // ✅ Use axiosInstance directly (supports responseType)
      const response = await axiosInstance.get(
        `/users/download-invoice?orderId=${orderId}`,
        {
          responseType: "blob", // 👈 ensure binary response
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Create a PDF blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // ✅ Create a temporary object URL
      const url = window.URL.createObjectURL(blob);

      // ✅ Trigger the file download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`; // filename
      document.body.appendChild(a);
      a.click();
      a.remove();

      // ✅ Cleanup the temporary URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Invoice download failed:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-gray-600">
        Loading order details...
      </div>
    );

  if (!order)
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-gray-500">
        Order not found.
      </div>
    );

  // ✅ Extract data safely
  const firstItem = order.items?.[0];
  const product = firstItem?.product || {};
  const variant = firstItem?.variant || {};
  const shipping = order.shipping_address || {};
  const user = order.user || {};
  const formattedDate = order.created_at
    ? dayjs(order.created_at).format("DD MMMM YYYY")
    : "—";

  const statusColor =
    order.order_status?.toLowerCase() === "delivered"
      ? "text-green-600"
      : order.order_status?.toLowerCase() === "processing"
      ? "text-yellow-600"
      : "text-gray-600";

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h4 className="mb-6 text-center text-xl font-semibold">Order Summary</h4>

      {/* ✅ Product Details + Invoice */}
      <div className="bg-white border p-4 mb-4">
        <div className="grid md:grid-cols-12 gap-4 items-center">
          {/* Product Image */}
          <div className="md:col-span-2 col-span-4 text-center">
            <img
              src={
                product.product_img ||
                variant.images?.[0] ||
                "/assets/images/product-placeholder.webp"
              }
              alt={product.name || "Product"}
              className="w-full max-w-[120px] mx-auto"
            />
          </div>

          {/* Product Info */}
          <div className="md:col-span-7 col-span-8">
            <h5 className="text-lg font-medium mb-1">
              {product.name || "Unnamed Product"}
            </h5>
            <p className="text-sm text-gray-500 mb-1">
              Order ID: #{order.order_no || order.id}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Size: {variant.sku || "—"} &nbsp; | &nbsp; Quantity:{" "}
              {firstItem?.qty || 1}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Ordered on: {formattedDate}
            </p>
            <p className={`text-sm ${statusColor}`}>
              Status: {order.order_status}
            </p>
          </div>

          {/* ✅ Download Invoice Button */}
          <div className="md:col-span-3 col-span-12 md:text-right text-left">
            <CTAButton
              variant="outline"
              color="gold"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download Invoice"}
            </CTAButton>
          </div>
        </div>
      </div>

      {/* ✅ Amount / Customer / Payment Details */}
      <div className="bg-white border p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* ✅ Amount Section (Delivery + Total Only) */}
          <div>
            <h4 className="text-lg font-medium">Amount Summary</h4>
            <hr className="my-2" />

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>AED 0.00</span>
              </div>

              <div className="flex justify-between font-semibold text-gray-800">
                <span>Total Amount Paid:</span>
                <span>AED {order.total_amount?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-lg font-medium">Customer Details</h4>
            <hr className="my-2" />
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{user.full_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{user.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span>{shipping.mobile || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-right">
                  {shipping.street}, <br />
                  {shipping.city}, {shipping.state}, <br />
                  {shipping.country}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-lg font-medium">Payment Details</h4>
            <hr className="my-2" />
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{order.payment_status || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span>{order.payment_method || "Online"}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Items Breakdown */}
        <div id="items-breakdown" className="my-4">
          <h4 className="text-lg font-medium mb-3">Items in this Order</h4>
          <hr className="my-2" />

          <div className="space-y-4 mt-4">
            {order.items?.map((item) => {
              const product = item.product || {};
              const variant = item.variant || {};

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-3 w-full"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 flex-shrink-0">
                    <img
                      src={
                        product.product_img ||
                        variant.images?.[0] ||
                        "/assets/images/product-placeholder.webp"
                      }
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      href={`/shop/product/${
                        slugifyProductName(product.name) || ""
                      }/${product.id || ""}`}
                      className="hover:underline"
                    >
                      <h5 className="font-medium text-gray-900">
                        {product.name || "Unnamed Product"}
                      </h5>
                    </Link>

                    <p className="text-sm text-gray-600">
                      SKU: {variant.sku || "—"}
                    </p>

                    <p className="text-sm text-gray-600">
                      Quantity: {item.qty}
                    </p>

                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      AED {item.price?.toFixed(2) || "0.00"}
                    </p>

                    {/* ⭐ Review Button (ADDED) */}
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set("productId", product.id);
                        window.history.replaceState({}, "", url.toString());

                        // Scroll to review section
                        const section =
                          document.getElementById("review-section");
                        if (section) {
                          section.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Review this product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Shipping */}
      <div className="bg-white border p-4 mb-4">
        <h5 className="text-lg font-medium mb-2">Shipping</h5>
        <p className="text-sm text-gray-600 mb-3">
          Shipping Address: {shipping.label}, {shipping.street}, {shipping.city}
          , {shipping.state}, {shipping.country}
        </p>

        <CTAButton variant="solid" color="gold">
          Track Order
        </CTAButton>
      </div>

      {/* ✅ Refund + Review */}
      {/* <RefundSection product={product} /> */}
      <ReviewSection order={order} />
    </div>
  );
}
