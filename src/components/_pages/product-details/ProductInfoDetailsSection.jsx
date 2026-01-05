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
    },
    ref
  ) => {
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { format } = useCurrency();

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

    // ✅ Stock logic
    useEffect(() => {
      if (!product?.variants?.length) return;

      const variant = product.variants.find(
        (v) =>
          (!selectedColor || v.variant_color === selectedColor) &&
          (!selectedSize || v.variant_size === selectedSize)
      );

      setIsOutOfStock(!variant || variant.stock <= 0);
    }, [product, selectedColor, selectedSize]);

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
              <div className="text-amber-600 text-sm font-semibold uppercase tracking-wider">
                {product.brand_name}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.title ?? product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {displayPrice.price ? format(displayPrice.price) : "—"}
                </span>
              </div>
              {displayPrice.mrp && displayPrice.mrp > displayPrice.price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {format(displayPrice.mrp)}
                  </span>
                  {displayPrice.discountPct && (
                    <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      SAVE {displayPrice.discountPct}%
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
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Color{selectedColor && `: ${selectedColor}`}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        selectedColor === c
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md scale-105"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
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
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Size{selectedSize && `: ${selectedSize}`}
                  </h3>
                  <button className="text-xs text-amber-600 hover:text-amber-700 font-medium underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => {
                    const variant = product.variants.find(
                      (v) =>
                        v.variant_size === s &&
                        (!selectedColor || v.variant_color === selectedColor)
                    );
                    const outOfStock = !variant || variant.stock <= 0;

                    return (
                      <button
                        key={s}
                        onClick={() => !outOfStock && setSelectedSize(s)}
                        disabled={outOfStock}
                        className={`min-w-[60px] px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${
                          outOfStock
                            ? "border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                            : selectedSize === s
                            ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md scale-105"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isOutOfStock ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  ></div>
                  <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-emerald-600"}`}>
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <CTAButton
                color="gold"
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={isOutOfStock}
                className="flex-1 h-14 text-base font-semibold"
              >
                {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
              </CTAButton>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isWishlisted(product.id)
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 bg-white text-gray-600 hover:border-red-400 hover:text-red-500"
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
