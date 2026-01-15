"use client";

import React, { forwardRef, useEffect, useMemo, useState } from "react";
import CTAButton from "@/components/_common/CTAButton";
import { Heart, Truck, Shield, RefreshCcw } from "lucide-react";
import useWishlist from "@/hooks/useWishlist";
import { showToast } from "@/providers/ToastProvider";
import useCurrency from "@/hooks/useCurrency";

const ProductInfoDetailsSection = forwardRef(
  (
    {
      product,
      productLoading,
      productError,
      isAuthenticated,
      selectedColor,
      setSelectedColor,
      selectedSize,
      setSelectedSize,
      handleAddToCart,
      addingToCart,
      router,
      liveStockData,
      stockLoading,
    },
    ref
  ) => {
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { format } = useCurrency();

    // Helper function to get live stock for a variant
    const getLiveStock = (variantSize) => {
      if (!liveStockData || !liveStockData.stockBySize) return null;
      const stockItem = liveStockData.stockBySize.find(
        (s) => s.size?.toLowerCase() === variantSize?.toLowerCase()
      );
      return stockItem?.quantity ?? 0;
    };

    // ✅ Extract unique sizes
    const sizes = useMemo(() => {
      if (!product?.variants?.length) return [];
      const allSizes = product.variants
        .map((v) => v.variant_size)
        .filter(Boolean);
      return [...new Set(allSizes)];
    }, [product]);

    // ✅ Extract unique colors
    const colors = useMemo(() => {
      if (!product?.variants?.length) return [];
      const allColors = product.variants
        .map((v) => v.variant_color)
        .filter(Boolean);
      const uniqueColors = [...new Set(allColors)];
      return uniqueColors.length > 1 ? uniqueColors : [];
    }, [product]);

    // ✅ Auto-select first available variant
    useEffect(() => {
      if (!product?.variants?.length) return;

      const availableVariant =
        product.variants.find((v) => Number(v.stock) > 0) ??
        product.variants[0];

      if (availableVariant) {
        if (availableVariant.variant_color && !selectedColor)
          setSelectedColor(availableVariant.variant_color);

        if (availableVariant.variant_size && !selectedSize)
          setSelectedSize(availableVariant.variant_size);
      }
    }, [product, selectedColor, selectedSize, setSelectedColor, setSelectedSize]);

    // ✅ Stock logic - NO fallback to DB stock
    useEffect(() => {
      if (!product?.variants?.length) return;

      const variant = product.variants.find(
        (v) =>
          (!selectedColor || v.variant_color === selectedColor) &&
          (!selectedSize || v.variant_size === selectedSize)
      );

      if (!variant) {
        setIsOutOfStock(true);
        return;
      }

      // Only use live stock for vendors with individual syncing capability
      if (product.vendor_capabilities?.has_individual_syncing) {
        // If live stock data is available, use it
        if (liveStockData) {
          const liveStock = getLiveStock(variant.variant_size);
          setIsOutOfStock(liveStock <= 0);
        } else {
          // No live data available (loading or failed) - show out of stock
          setIsOutOfStock(true);
        }
      } else {
        // Vendor doesn't support individual syncing - show out of stock
        setIsOutOfStock(true);
      }
    }, [product, selectedColor, selectedSize, liveStockData, stockLoading]);

    // ✅ Price
    const displayPrice = useMemo(() => {
      if (!product) return { price: null, mrp: null, discountPct: null };
      const variant =
        product.variants?.find((v) => v.stock > 0) || product.variants?.[0];
      const price = variant?.price ?? product.min_price;
      const mrp = variant?.mrp ?? product.max_price;
      const discountPct =
        price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
      return { price, mrp, discountPct };
    }, [product]);

    const handleWishlistToggle = () => {
      if (!isAuthenticated) {
        showToast("info", "Please login to manage your wishlist");
        return;
      }
      if (product?.id) {
        toggleWishlist(product.id);
      }
    };

    return (
      <div
        className="w-full lg:w-[40%] p-4 lg:p-6 pb-24 lg:pb-8"
        ref={ref}
      >
        {productLoading ? (
          <div className="py-12 text-center text-gray-600">Loading...</div>
        ) : productError || !product ? (
          <div className="py-12 text-center text-red-600">
            {productError ?? "Product not found."}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand */}
            {product.brand_name && (
              <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                {product.brand_name}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight">
              {product.title ?? product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-black">
                  {displayPrice.price ? format(displayPrice.price) : "—"}
                </span>
              </div>
              {displayPrice.mrp && displayPrice.mrp > displayPrice.price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-normal">
                    {format(displayPrice.mrp)}
                  </span>
                  {displayPrice.discountPct && (
                    <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded">
                      {displayPrice.discountPct}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="text-gray-700 leading-relaxed text-sm md:text-base prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product.description ?? product.short_description ?? "",
                }}
              />
            )}

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest">
                  Color{selectedColor && `: ${selectedColor}`}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded border-2 text-sm font-medium transition-all duration-200 ${
                        selectedColor === c
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest">
                    Size{selectedSize && `: ${selectedSize}`}
                  </h3>
                  <button className="text-xs text-gray-600 hover:text-black font-medium underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {stockLoading && product.vendor_capabilities?.has_individual_syncing ? (
                    // Show skeleton loaders for size buttons while loading
                    sizes.map((s) => (
                      <div
                        key={s}
                        className="min-w-[60px] px-4 py-3 rounded border-2 border-gray-200 bg-gray-100 animate-pulse"
                      >
                        <div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
                      </div>
                    ))
                  ) : (
                    sizes.map((s) => {
                      const variant = product.variants.find(
                        (v) =>
                          v.variant_size === s &&
                          (!selectedColor || v.variant_color === selectedColor)
                      );

                      // Check stock - NO fallback to DB
                      let outOfStock;
                      if (product.vendor_capabilities?.has_individual_syncing) {
                        // Only use live stock data
                        if (liveStockData) {
                          const liveStock = getLiveStock(s);
                          outOfStock = !variant || liveStock <= 0;
                        } else {
                          // No live data - show out of stock
                          outOfStock = true;
                        }
                      } else {
                        // Vendor doesn't support individual syncing - show out of stock
                        outOfStock = true;
                      }

                      return (
                        <button
                          key={s}
                          onClick={() => !outOfStock && setSelectedSize(s)}
                          disabled={outOfStock}
                          className={`min-w-[60px] px-4 py-3 rounded border-2 text-sm font-semibold transition-all duration-200 ${
                            outOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                              : selectedSize === s
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })
                  )}
                </div>
                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {stockLoading && product.vendor_capabilities?.has_individual_syncing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isOutOfStock ? "bg-gray-400" : "bg-black"
                        }`}
                      ></div>
                      <span className={`text-sm font-medium ${isOutOfStock ? "text-gray-500" : "text-black"}`}>
                        {isOutOfStock ? "Out of Stock" : "In Stock"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {stockLoading && product.vendor_capabilities?.has_individual_syncing ? (
                // Skeleton loader for Add to Cart button
                <div className="flex-1 h-14 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <CTAButton
                  color="black"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-14 text-base font-semibold bg-black hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                </CTAButton>
              )}
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  isWishlisted(product.id)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:border-black hover:text-black"
                }`}
              >
                <Heart
                  className="w-6 h-6"
                  fill={isWishlisted(product.id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Features */}
            {/* <div className="bg-gradient-to-br from-amber-50/50 to-emerald-50/30 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Free Delivery</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    On orders above AED 200
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <RefreshCcw className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    30-day return policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    100% secure transactions
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>
    );
  }
);

ProductInfoDetailsSection.displayName = "ProductInfoDetailsSection";

export default ProductInfoDetailsSection;
