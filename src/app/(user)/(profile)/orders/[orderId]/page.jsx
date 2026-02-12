"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CTAButton from "@/components/_common/CTAButton";
import useAxios from "@/hooks/useAxios";
import dayjs from "dayjs";
import ReviewSection from "@/components/_pages/order-details/ReviewSection";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";
import { slugifyProductName } from "@/utils/seoHelpers";
import Link from "next/link";
import { Package, MapPin, CreditCard, Calendar, Truck, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { request } = useAxios();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // ✅ Fetch order details
  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error} = await request({
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
      const response = await axiosInstance.get(
        `/users/download-invoice?orderId=${orderId}`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${order.order_no || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
      <div className="col-span-9 max-w-6xl mx-auto py-20 text-center text-gray-600">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );

  if (!order)
    return (
      <div className="col-span-9 max-w-6xl mx-auto py-20 text-center text-gray-500">
        Order not found.
      </div>
    );

  // Use order's original currency
  const orderCurrency = order.currency_symbol || order.currency || "€";
  const formatPrice = (price) => {
    if (!price) return `${orderCurrency}0.00`;
    return `${orderCurrency}${Number(price).toFixed(2)}`;
  };

  const shipping = order.shipping_address || {};
  const user = order.user || {};
  const formattedDate = order.created_at
    ? dayjs(order.created_at).format("DD MMMM YYYY")
    : "—";

  const orderTotal = (order.total_amount || 0) - (order.discount || 0);

  const statusColor =
    order.order_status?.toLowerCase() === "delivered"
      ? "bg-green-100 text-green-700"
      : order.order_status?.toLowerCase() === "processing"
      ? "bg-gray-100 text-gray-700"
      : order.order_status?.toLowerCase() === "created"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  const paymentStatusColor =
    order.payment_status === "paid"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const statusAliases = {
    pending: "created",
  };
  const normalizedStatus =
    statusAliases[(order.order_status || "").toLowerCase()] ||
    (order.order_status || "created").toLowerCase();
  const baseTrackingSteps = [
    {
      key: "created",
      label: "Order Placed",
      description: "We have received your order.",
    },
    {
      key: "processing",
      label: "Processing",
      description: "We are preparing your items.",
    },
    {
      key: "shipped",
      label: "Shipped",
      description: "Your order is on the way.",
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Delivered to your address.",
    },
  ];
  const trackingSteps =
    normalizedStatus === "cancelled"
      ? [
          ...baseTrackingSteps,
          {
            key: "cancelled",
            label: "Cancelled",
            description: "This order was cancelled.",
          },
        ]
      : baseTrackingSteps;
  const currentIndex = Math.max(
    0,
    trackingSteps.findIndex((step) => step.key === normalizedStatus)
  );

  return (
    <div className="col-span-9 max-w-6xl mx-auto py-6 px-4">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h4>
            <p className="text-sm text-gray-600">
              Order #{order.order_no || order.id} • Placed on {formattedDate}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
              {order.order_status}
            </span>
            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold  uppercase tracking-wide ${paymentStatusColor}`}>
              {order.payment_status}
            </span>
            <CTAButton
              color="black"
              size="sm"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Downloading..." : ""}
            </CTAButton>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-600" />
          <h5 className="text-lg font-semibold text-gray-900">Order Items ({order.items?.length || 0})</h5>
        </div>

        <div className="space-y-4">
          {order.items?.map((item) => {
            const product = item.product || {};
            const variant = item.variant || {};

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                {/* Product Image */}
                <div className="w-full sm:w-24 h-24 flex-shrink-0">
                  <img
                    src={
                      product.product_img ||
                      variant.images?.[0] ||
                      "/assets/images/product-placeholder.webp"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    href={`/shop/product/${
                      slugifyProductName(product.name) || ""
                    }/${product.id || ""}`}
                    className="hover:text-[#c38e1e] transition-colors"
                  >
                    <h6 className="font-semibold text-gray-900 mb-2">
                      {product.name || "Unnamed Product"}
                    </h6>
                  </Link>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-500 text-xs block">SKU</span>
                      <p className="font-medium">{variant.sku || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Quantity</span>
                      <p className="font-medium">{item.qty}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Price</span>
                      <p className="font-medium">{formatPrice(item.price * order.exchange_rate || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Subtotal</span>
                      <p className="font-semibold text-[#c38e1e]">
                        {formatPrice((item.price * order.exchange_rate || 0) * (item.qty || 1))}
                      </p>
                    </div>
                  </div>

                  {/* Review Button */}
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("productId", product.id);
                      window.history.replaceState({}, "", url.toString());
                      const section = document.getElementById("review-section");
                      if (section) {
                        section.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }}
                    className="text-sm text-gray-600 hover:text-blue-800 underline"
                  >
                    Review this product
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Summary & Details Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Amount Summary */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-900">Price Summary</h5>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">{formatPrice(order.total_amount * order.exchange_rate || 0)}</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{order.coupon_code && ` (${order.coupon_code})`}:</span>
                <span className="font-medium">{formatPrice(order.discount * order.exchange_rate)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-700">
              <span>Delivery Charge:</span>
              {/* <span className="font-medium">{formatPrice(0)}</span> */}
              <span className="font-medium">Free</span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total Paid:</span>
              <span className="text-[#c38e1e]">
                {formatPrice(orderTotal * order.exchange_rate)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-900">Customer Details</h5>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Name</p>
              <p className="font-medium text-gray-900">{user.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Email</p>
              <p className="font-medium text-gray-900 break-all">{user.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Contact</p>
              <p className="font-medium text-gray-900">{shipping.mobile || "—"}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-900">Payment Info</h5>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Payment Status</p>
              <p className={`inline-flex items-center px-2 py-1 text-xs font-semibold capitalize ${paymentStatusColor}`}>
                {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Method</p>
              <p className="font-medium text-gray-900">{order.payment_method || "Online Payment"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Payment Date</p>
              <p className="font-medium text-gray-900">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-900">Shipping Address</h5>
          </div>
          <CTAButton
            color="black"
            size="sm"
            onClick={() => setIsTrackingOpen(true)}
          >
            Track Order
          </CTAButton>
        </div>

        <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold text-gray-900 mb-2">{shipping.label}</p>
          <p>{shipping.street}</p>
          <p>
            {shipping.city}, {shipping.state} {shipping.postal_code}
          </p>
          <p>{shipping.country}</p>
          {shipping.mobile && (
            <p className="mt-2">
              <span className="text-gray-500">Mobile:</span> {shipping.mobile}
            </p>
          )}
        </div>
      </div>
 
      {/* Review Section */}
      <ReviewSection order={order} />

      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
            <DialogDescription>
              Order #{order.order_no || order.id} • Current status:{" "}
              <span className="capitalize">{normalizedStatus}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-1 bottom-1 w-px bg-gray-200" />
              <div className="space-y-6">
                {trackingSteps.map((step, index) => {
                  const isCurrent = index === currentIndex;
                  const isCompleted =
                    normalizedStatus === "cancelled"
                      ? index === 0
                      : index < currentIndex;
                  const isCancelled = step.key === "cancelled";
                  const dotClass = isCancelled
                    ? "bg-red-600"
                    : isCompleted || isCurrent
                    ? "bg-black"
                    : "bg-gray-300";

                  return (
                    <div key={step.key} className="relative flex gap-4">
                      <div className="absolute left-[-1px] top-1.5">
                        <div
                          className={`h-3 w-3 rounded-full border border-white shadow ${dotClass}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              isCancelled
                                ? "text-red-700"
                                : isCurrent
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {step.key === "created"
                            ? `Placed on ${formattedDate}`
                            : step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
