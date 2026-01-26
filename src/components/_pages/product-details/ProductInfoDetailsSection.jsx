"use client";

import React, { forwardRef, useEffect, useMemo, useState } from "react";
import CTAButton from "@/components/_common/CTAButton";
import { Heart, Truck, Shield, RefreshCcw } from "lucide-react";
import useWishlist from "@/hooks/useWishlist";
import { showToast } from "@/providers/ToastProvider";
import useCurrency from "@/hooks/useCurrency";

const SIZE_GUIDE_SOURCES = [
  {
    label: "4Partners size charts",
    href: "https://store.4partners.io/help/size-chart",
  },
  {
    label: "Mytheresa sizes table",
    href: "https://www.mytheresa.com/me/en/customer-care/sizes-table",
  },
];

const SIZE_GUIDE_TABLES = {
  women: {
    conversion: {
      title: "Women's clothing conversion",
      columns: ["XXS", "XS-S", "S-M", "M-L", "L-XL", "XL", "XXL"],
      rows: [
        { label: "Germany", values: ["32", "34", "36", "38", "40", "42", "44"] },
        { label: "Italy", values: ["38", "40", "42", "44", "46", "48", "50"] },
        { label: "France", values: ["34", "36", "38", "40", "42", "44", "46"] },
      ],
    },
    measurements: {
      title: "Women's clothing measurements (cm)",
      columns: ["XS", "S", "M", "L", "XL"],
      rows: [
        { label: "Bust", values: ["78.7–81.3", "83.8–86.4", "88.9–91.4", "94–96.5", "100.3–105.4"] },
        { label: "Waist", values: ["63.5", "66–68.6", "71.1–73.7", "76.2–80", "83.8–87.6"] },
        { label: "Hips", values: ["88.9", "91.4–94", "96.5–99.1", "101.6–105.4", "109.2–113"] },
      ],
    },
    shoes: {
      title: "Women's shoes conversion",
      columns: ["21.5", "22", "22.5", "23", "23.5", "24", "24.5", "25", "25.5", "26", "26.5", "27", "27.5", "28", "28.5"],
      rows: [
        { label: "CM (foot length)", values: ["21.5", "22", "22.5", "23", "23.5", "24", "24.5", "25", "25.5", "26", "26.5", "27", "27.5", "28", "28.5"] },
        { label: "EU", values: ["35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5", "39", "39.5", "40–41", "41", "41–42", "42", "42–43"] },
        { label: "US", values: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"] },
        { label: "UK", values: ["3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"] },
      ],
    },
  },
  men: {
    conversion: {
      title: "Men's clothing conversion",
      columns: ["S", "M", "L", "XL", "XXL", "XXXL"],
      rows: [
        { label: "RU size", values: ["44–46", "48–50", "52", "54", "56", "58"] },
      ],
    },
    measurements: {
      title: "Men's clothing measurements (cm)",
      columns: ["S", "M", "L", "XL", "XXL", "XXXL"],
      rows: [
        { label: "Chest", values: ["86.4–91.4", "96.5–101.6", "106.7–111.8", "116.8–121.9", "127–132.1", "137.2–142.2"] },
        { label: "Waist", values: ["71.1–73.7", "76.2–83.8", "86.4–91.4", "94–101.6", "104.1–109.2", "111.8–119.4"] },
      ],
    },
    shoes: {
      title: "Men's shoes conversion",
      columns: ["25", "25.5", "26", "26.5", "27", "27.5", "28", "28.5", "29", "29.5", "30", "31", "32"],
      rows: [
        { label: "CM (foot length)", values: ["25", "25.5", "26", "26.5", "27", "27.5", "28", "28.5", "29", "29.5", "30", "31", "32"] },
        { label: "EU", values: ["40", "40.5", "41", "41.5", "42", "42.5", "43", "43.5", "44", "44.5", "45", "46", "47"] },
        { label: "US", values: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"] },
        { label: "UK", values: ["6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"] },
      ],
    },
  },
};

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
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [sizeGuideTab, setSizeGuideTab] = useState("conversion");
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { format } = useCurrency();
    const canLiveStock =
      product?.vendor_capabilities?.has_stock_check_api ||
      product?.vendor_capabilities?.has_individual_syncing;

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

    const sizeGuideContext = useMemo(() => {
      if (!sizes.length) return null;
      const normalized = sizes.map((s) => String(s || "").trim().toLowerCase());
      const condensed = normalized.map((s) => s.replace(/\s+/g, ""));
      const oneSizeTokens = new Set([
        "one size",
        "onesize",
        "os",
        "o/s",
        "uni",
        "universal",
      ]);
      const allOneSize = condensed.every((s) => {
        if (oneSizeTokens.has(s)) return true;
        return oneSizeTokens.has(s.replace("/", ""));
      });
      if (allOneSize) return null;

      const alphaTokens = new Set([
        "xxs",
        "xs",
        "xs-s",
        "s",
        "s-m",
        "m",
        "m-l",
        "l",
        "l-xl",
        "xl",
        "xxl",
        "xxxl",
      ]);
      const hasAlphaSizes = condensed.some((s) => alphaTokens.has(s));
      const numericSizes = condensed
        .map((s) => s.replace(",", "."))
        .filter((s) => /^\d+(\.\d+)?$/.test(s))
        .map((s) => Number(s));
      const hasRegionSizes = condensed.some((s) => /(eu|uk|us)\d/.test(s));

      let type = null;
      if (hasAlphaSizes) {
        type = "apparel";
      } else if (hasRegionSizes) {
        type = "shoes";
      } else if (numericSizes.length && numericSizes.length === normalized.length) {
        const min = Math.min(...numericSizes);
        const max = Math.max(...numericSizes);
        if (min >= 34 && max <= 47) type = "shoes";
        else if (min >= 5 && max <= 14) type = "shoes";
        else if (min >= 28 && max <= 42) type = "apparel";
      }

      if (!type) return null;

      const genderRaw = String(product?.gender || "").toLowerCase();
      const gender =
        genderRaw.includes("female") || genderRaw.includes("women")
          ? "women"
          : genderRaw.includes("male") || genderRaw.includes("men")
          ? "men"
          : null;

      return { type, gender: gender || "women" };
    }, [sizes, product]);

    const sizeGuideTables = useMemo(() => {
      if (!sizeGuideContext) return null;
      const { gender, type } = sizeGuideContext;
      const data = SIZE_GUIDE_TABLES[gender];
      if (!data) return null;
      if (type === "shoes") return { conversion: data.shoes };
      return { conversion: data.conversion, measurements: data.measurements };
    }, [sizeGuideContext]);

    useEffect(() => {
      if (!sizeGuideTables) return;
      if (!sizeGuideTables.measurements && sizeGuideTab === "measurements") {
        setSizeGuideTab("conversion");
      }
    }, [sizeGuideTables, sizeGuideTab]);

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

      // Only use live stock for vendors that support live stock checks
      if (canLiveStock) {
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
                  {sizeGuideTables && (
                    <button
                      className="text-xs text-gray-600 hover:text-black font-medium underline"
                      onClick={() => setIsSizeGuideOpen(true)}
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {stockLoading && canLiveStock ? (
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
                      if (canLiveStock) {
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
                  {stockLoading && canLiveStock ? (
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
              {stockLoading && canLiveStock ? (
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

        {isSizeGuideOpen && sizeGuideTables && (
          <div className="fixed inset-0 z-500 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl border border-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden font-size-guide">
              <div className="flex items-start justify-between px-6 py-5 border-b border-black">
                <div>
                  <div className="text-xs text-black uppercase tracking-widest font-bold">
                    Size Guide
                  </div>
                  <div className="text-lg font-semibold text-black mt-1">
                    {product?.brand_name || "Brand"} •{" "}
                    {sizeGuideContext?.gender === "men" ? "Men" : "Women"}
                  </div>
                  <div className="text-sm text-black/70 mt-1">
                    {/* {sizeGuideContext?.type === "shoes"
                      ? ""
                      : "Clothing"} */}
                  </div>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="text-black hover:text-black text-xl leading-none"
                  aria-label="Close size guide"
                >
                  ×
                </button>
              </div>

              <div className="px-6 pt-4">
                <div className="flex gap-6 text-sm font-semibold text-black/60 border-b border-black">
                  <button
                    className={`pb-3 border-b-2 ${
                      sizeGuideTab === "conversion"
                        ? "border-black text-black"
                        : "border-transparent text-black/60"
                    }`}
                    onClick={() => setSizeGuideTab("conversion")}
                  >
                    Conversion chart
                  </button>
                  {sizeGuideTables.measurements && (
                    <button
                      className={`pb-3 border-b-2 ${
                        sizeGuideTab === "measurements"
                          ? "border-black text-black"
                          : "border-transparent text-black/60"
                      }`}
                      onClick={() => setSizeGuideTab("measurements")}
                    >
                      Measurements
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-6 max-h-[65vh] overflow-y-auto">
                {sizeGuideTab === "conversion" && sizeGuideTables.conversion && (
                  <div className="space-y-3">
                    {/* <h4 className="text-sm font-semibold text-gray-900">
                      {sizeGuideTables.conversion.title}
                    </h4> */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-black">
                        <thead className="bg-white text-black border-b border-black">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold"> </th>
                            {sizeGuideTables.conversion.columns.map((col) => (
                              <th key={col} className="px-4 py-3 font-semibold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizeGuideTables.conversion.rows.map((row) => (
                            <tr key={row.label} className="border-t border-black">
                              <td className="px-4 py-3 font-medium text-black whitespace-nowrap">
                                {row.label}
                              </td>
                              {row.values.map((val, index) => (
                                <td key={`${row.label}-${index}`} className="px-4 py-3 text-center">
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {sizeGuideTab === "measurements" &&
                  sizeGuideTables.measurements && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-black">
                        {sizeGuideTables.measurements.title}
                      </h4>
                      <div className="overflow-x-auto border border-black rounded-xl">
                        <table className="min-w-full text-sm text-black">
                          <thead className="bg-white text-black border-b border-black">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold"> </th>
                              {sizeGuideTables.measurements.columns.map((col) => (
                                <th key={col} className="px-4 py-3 font-semibold">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizeGuideTables.measurements.rows.map((row) => (
                              <tr key={row.label} className="border-t border-black">
                                <td className="px-4 py-3 font-medium text-black whitespace-nowrap">
                                  {row.label}
                                </td>
                                {row.values.map((val, index) => (
                                  <td key={`${row.label}-${index}`} className="px-4 py-3 text-center">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              <div className="px-6 pb-6 text-xs text-black/70 flex flex-wrap gap-2">
                <span>Measurements are approximate and may vary by brand.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ProductInfoDetailsSection.displayName = "ProductInfoDetailsSection";

export default ProductInfoDetailsSection;
