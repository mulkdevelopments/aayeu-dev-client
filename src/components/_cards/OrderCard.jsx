"use client";

import Link from "next/link";
import React from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectCustomDuties } from "@/store/slices/currencySlice";
import { slugifyProductName } from "@/utils/seoHelpers";
import CTAButton from "../_common/CTAButton";
import _ from "lodash";

function OrderCard({ order }) {
  const customDuties = useSelector(selectCustomDuties) || {};
  if (!order) return null;

  // Use order's original currency with duty-inclusive display
  const orderCurrency = order.currency_symbol || order.currency || "€";
  const orderCurrencyCode = order.currency || "AED";
  const dutyPercent = customDuties[orderCurrencyCode] || 0;
  const formatOrderPrice = (eurAmount) => {
    if (eurAmount == null) return `${orderCurrency}0.00`;
    const rate = Number(order.exchange_rate) || 1;
    let display = Number(eurAmount) * rate;
    if (dutyPercent > 0) display = display * (1 + dutyPercent / 100);
    return `${orderCurrency}${display.toFixed(2)}`;
  };

  const items = order?.items || [];
  const itemCount = items.length;
  const firstItem = items[0];
  const product = firstItem?.product;
  const variant = firstItem?.variant;

  const productImg =
    product?.product_img ||
    variant?.images?.[0] ||
    "/assets/images/product-placeholder.webp";

  const productName = product?.name ?? "Unnamed Product";
  const formattedDate = order?.created_at
    ? dayjs(order.created_at).format("DD MMMM YYYY")
    : "—";

  // Calculate order total (considering discount if applied)
  const orderTotal = (order?.total_amount || 0) - (order?.discount || 0);

  const os = order.order_status?.toLowerCase() || "";
  const ps = order.payment_status?.toLowerCase() || "";
  const isReturned =
    os === "cancelled" ||
    ps === "refund_completed" ||
    ps === "refund_initiated" ||
    ps === "refunded";
  const statusClass = isReturned
    ? "text-amber-800 bg-amber-100"
    : os === "delivered"
    ? "text-green-700 bg-green-100"
    : os === "processing"
    ? "text-gray-700 bg-gray-100"
    : "text-gray-700 bg-gray-100";

  const statusLabel = isReturned
    ? "Returned / refunded"
    : order.order_status || "—";

  return (
    <div className="order-card flex flex-col sm:flex-row items-start mb-4 p-6 border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-full sm:w-1/5 mb-4 sm:mb-0 flex justify-center sm:justify-start">
        <div className="order-img w-full h-40 sm:h-36 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
          <img
            src={productImg}
            alt={productName}
            className="object-contain h-full max-h-40 sm:max-h-36"
          />
          {itemCount > 1 && (
            <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-medium">
              +{itemCount - 1} more
            </div>
          )}
        </div>
      </div>

      {/* Info + Pricing */}
      <div className="w-full sm:w-4/5 sm:pl-6">
        {/* Product Name + Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <Link
              href={`/shop/product/${slugifyProductName(productName)}/${
                product.id
              }`}
            >
              <h5 className="text-lg font-semibold hover:text-[#c38e1e] transition-colors mb-1">
                {productName}
              </h5>
            </Link>
            {itemCount > 1 && (
              <p className="text-xs text-gray-500">
                and {itemCount - 1} other item{itemCount > 2 ? "s" : ""}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${statusClass} mt-2 sm:mt-0`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
          {/* Order ID */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Order ID</span>
            <span className="text-gray-900 font-medium">
              #{order.order_no || order.id}
            </span>
          </div>

          {/* Order Date */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Order Date</span>
            <span className="text-gray-900 font-medium">{formattedDate}</span>
          </div>

          {/* Total Items */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Total Items</span>
            <span className="text-gray-900 font-medium">
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </span>
          </div>

          {/* Subtotal */}
          {/* <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Subtotal</span>
            <span className="text-gray-900 font-medium">
              {formatOrderPrice(order.total_amount)}
            </span>
          </div> */}

   
          {/* {order.discount && order.discount > 0 ? (
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">
                Discount {order.coupon_code && `(${order.coupon_code})`}
              </span>
              <span className="text-green-600 font-medium">
                -{formatOrderPrice(order.discount)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1">Payment</span>
              <span className={`text-gray-900 font-medium capitalize ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'
              }`}>
                {order.payment_status || 'Pending'}
              </span>
            </div>
          )} */}

          {/* Total Amount */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">Total Paid</span>
            <span className="text-[#c38e1e] font-semibold text-base">
              {formatOrderPrice(orderTotal)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <CTAButton
            as="link"
            href={`/orders/${order.id}`}
            color="black"
            size="sm"
            className="w-full sm:w-auto"
          >
            View Order Details
          </CTAButton>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
