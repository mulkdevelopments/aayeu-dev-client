"use client";

import React, { useEffect, useMemo } from "react";
import { Trash, Heart, AlertCircle } from "lucide-react";
import CTAButton from "../_common/CTAButton";
import Link from "next/link";
import { slugifyProductName } from "@/utils/seoHelpers";
import useWishlist from "@/hooks/useWishlist";
import { useSelector } from "react-redux";
import SignupDialog from "../_dialogs/SignupDialog";
import useCurrency from "@/hooks/useCurrency";

export default function CartItemCard({ product, liveStockData, stockCheckLoading, onQtyChange, onRemove }) {
  if (!product) return null;

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { format } = useCurrency();

  if (process.env.NODE_ENV === "development")
    console.log("Rendering CartItemCard for product:", product);

  const {
    cart_item_id,
    variant_id,
    sku,
    product: productInfo,
    qty = 1,
    variant_price = 0,
    sale_price = 0,
    discount_percent = 0,
    line_total = 0,
    stock = "0",
    images = [],
    brand_name,
    gender,
    vendor_capabilities,
  } = product;

  const canLiveStock =
    vendor_capabilities?.has_stock_check_api ||
    vendor_capabilities?.has_individual_syncing;

  const id = productInfo?.id;
  const name = productInfo?.name ?? "Unnamed Product";
  const brand = brand_name ?? "";
  const image =
    productInfo?.image ??
    images?.[0] ??
    "/assets/images/product-placeholder.webp";

  const color = variant_id?.color ?? "—";
  const size = variant_id?.size ?? "—";
  const price = sale_price || variant_price || 0;

  // Get live stock for this variant
  const getLiveStock = () => {
    if (!liveStockData || !liveStockData.stockBySize) return null;
    const stockItem = liveStockData.stockBySize.find(
      (s) => s.size?.toLowerCase() === size?.toLowerCase()
    );
    return stockItem?.quantity ?? 0;
  };

  // Determine actual available stock
  const availableStock = canLiveStock && liveStockData
    ? getLiveStock()
    : parseInt(stock, 10) || 0;

  const isOutOfStock = availableStock === 0;
  const hasLowStock = availableStock > 0 && availableStock < qty;

  const qtyOptions = Array.from(
    { length: Math.min(availableStock || 1, 10) },
    (_, i) => i + 1
  );

  const total = useMemo(
    () => line_total || price * qty,
    [line_total, price, qty]
  );

  const handleMoveToWishlist = () => {
    if (!isAuthenticated) return;
    toggleWishlist(id);
    onRemove?.(product);
  };

  return (
    <div className="flex flex-col md:flex-row border-t py-4 gap-4">
      {/* 🖼️ Product Image */}
      <div className="cursor-pointer flex-shrink-0 flex justify-center md:justify-start">
        <Link href={`/shop/product/${slugifyProductName(name)}/${id}`}>
          <img src={image} alt={name} className="w-48 h-48 object-contain" />
        </Link>
      </div>

      {/* 📦 Product Info */}
      <div className="flex-grow flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Left: product info */}
          <div>
            <h5 className="cursor-pointer text-xl font-medium leading-tight">
              <Link
                href={`/shop/product/${slugifyProductName(name)}/${id}`}
                className="hover:text-[#c38e1e] transition-colors"
              >
                {brand && <>{brand} </>}
                {name}
              </Link>
            </h5>

            {/* ✅ SKU, Color, Size */}
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Color:</span> {color} &nbsp;|&nbsp;{" "}
              <span className="font-medium">Size:</span> {size}
            </p>
            {/* {sku && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">SKU:</span> {sku}
              </p>
            )} */}
            {gender && (
              <p className="text-sm text-gray-500 mt-1 capitalize">
                <span className="font-medium">Gender:</span> {gender}
              </p>
            )}

            {/* Stock Warning */}
            {stockCheckLoading && canLiveStock ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : isOutOfStock ? (
              <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Sold out</p>
                  <p className="text-xs">This item is currently unavailable. Please remove it to proceed.</p>
                </div>
              </div>
            ) : hasLowStock ? (
              <div className="mt-2 flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Limited Stock</p>
                  <p className="text-xs">Only {availableStock} left in stock. Please adjust quantity.</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Price */}
          <div className="text-left sm:text-right space-y-0.5">
            <p className="font-light text-gray-700">
              Price: {format(price)}
            </p>
            {discount_percent > 0 && (
              <p className="text-red-500 text-sm">
                Discount: -{discount_percent}%
              </p>
            )}
            <p className="font-medium">Total: {format(total)}</p>
          </div>
        </div>

        {/* Size + Quantity + Actions */}
        <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Quantity */}
          <div className="flex gap-3 items-center flex-wrap">
            <label className="text-sm font-medium">Quantity:</label>
            <select
              className="border px-2 py-1 text-sm rounded"
              value={qty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 1;
                onQtyChange?.(val);
              }}
            >
              {qtyOptions.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="text-gray-600 flex flex-row flex-wrap justify-center w-full sm:w-auto">
            <CTAButton
              variant="ghost"
              leftIcon={<Trash size={16} />}
              onClick={() => onRemove?.(product)}
              className="flex-1 sm:w-auto"
            >
              Remove
            </CTAButton>

            {isAuthenticated ? (
              <CTAButton
                variant="ghost"
                leftIcon={<Heart size={16} />}
                className="flex-1 sm:w-auto"
                onClick={handleMoveToWishlist}
                disabled={isWishlisted(id)}
              >
                {isWishlisted(id) ? "In Your Wishlist" : "Move to wishlist"}
              </CTAButton>
            ) : (
              <SignupDialog
                trigger={
                  <CTAButton
                    variant="ghost"
                    leftIcon={<Heart size={16} />}
                    className="flex-1 sm:w-auto"
                  >
                    Move to wishlist
                  </CTAButton>
                }
                onSuccess={() => handleMoveToWishlist()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
