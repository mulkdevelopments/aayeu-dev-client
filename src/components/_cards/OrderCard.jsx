"use client";

import Link from "next/link";
import React from "react";
import dayjs from "dayjs";
import { slugifyProductName } from "@/utils/seoHelpers";
import CTAButton from "../_common/CTAButton";
import _ from "lodash";

function OrderCard({ order }) {
  if (!order) return null;

  const firstItem = order?.items?.[0];
  const product = firstItem?.product;
  const variant = firstItem?.variant;

  const productImg =
    product?.product_img ||
    variant?.images?.[0] ||
    "/assets/images/product-placeholder.webp";

  const productName = product?.name ?? "Unnamed Product";
  const price = variant?.price ?? firstItem?.price ?? order?.total_amount ?? 0;
  const qty = firstItem?.qty ?? 1;
  const total = order?.total_amount ?? price * qty;
  const formattedDate = order?.created_at
    ? dayjs(order.created_at).format("DD MMMM YYYY")
    : "—";

  const statusClass =
    order.order_status?.toLowerCase() === "delivered"
      ? "text-green-700 bg-green-100"
      : order.order_status?.toLowerCase() === "processing"
      ? "text-yellow-700 bg-yellow-100"
      : "text-gray-700 bg-gray-100";

  return (
    <div className="order-card flex flex-col sm:flex-row items-center mb-4 p-5 border bg-white">
      {/* Image */}
      <div className="w-full sm:w-1/6 mb-4 sm:mb-0 flex justify-center">
        <div className="order-img w-full h-40 flex items-center justify-center bg-gray-50">
          <img
            src={productImg}
            alt={productName}
            className="object-contain h-full max-h-40"
          />
        </div>
      </div>

      {/* Info + Pricing */}
      <div className="w-full sm:w-5/6 px-4">
        {/* Product Name */}
        <Link
          href={`/shop/product/${slugifyProductName(productName)}/${
            product.id
          }`}
        >
          <h5 className="text-lg font-medium hover:text-[#c38e1e] transition-colors truncate mb-3">
            {productName}
          </h5>
        </Link>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 text-sm text-gray-700 gap-y-2 sm:gap-y-1">
          {/* Row 1 */}
          <p>
            <span className="font-medium text-gray-600">Order ID:</span>{" "}
            <span className="text-gray-900">#{order.order_no || order.id}</span>
          </p>
          <p className="sm:text-right">
            <span className="font-medium text-gray-600">Price:</span>{" "}
            <span className="text-gray-900">AED {price.toFixed(2)}</span>
          </p>

          {/* Row 2 */}
          <p>
            {variant?.sku && (
              <>
                <span className="font-medium text-gray-600">Size:</span>{" "}
                <span className="text-gray-900 mr-4">{variant.sku}</span>
              </>
            )}
            <span className="font-medium text-gray-600">Qty:</span>{" "}
            <span className="text-gray-900">{qty}</span>
          </p>
          <p className="sm:text-right">
            <span className="font-medium text-gray-600">Total:</span>{" "}
            <span className="text-gray-900 font-semibold">
              AED {total.toFixed(2)}
            </span>
          </p>

          {/* Row 3 */}
          <p>
            <span className="font-medium text-gray-600">Ordered on:</span>{" "}
            <span className="text-gray-900">{formattedDate}</span>
          </p>
          <div className="sm:text-right">
            <CTAButton as="link" href={`/orders/${order.id}`} color="gold" size="sm">
              View Order
            </CTAButton>
          </div>

          {/* Row 4 (Status below ordered on) */}
          <p>
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-semibold capitalize`}
            >
              {_.upperCase(order.order_status)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
