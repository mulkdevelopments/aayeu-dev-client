"use client";

import React, { forwardRef, useEffect, useMemo, useState } from "react";
import CTAButton from "@/components/_common/CTAButton";
import { Check, ChevronDown, Heart, Truck, Shield, RefreshCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useWishlist from "@/hooks/useWishlist";
import useAxios from "@/hooks/useAxios";
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
      title: "Women's Clothing Size Chart",
      columns: ["EU", "UK", "US"],
      rows: [
        { label: "XXS", values: ["32", "4", "0"] },
        { label: "XS", values: ["34", "6", "2"] },
        { label: "S", values: ["36", "8", "4"] },
        { label: "M", values: ["38", "10", "6"] },
        { label: "L", values: ["40", "12", "8"] },
        { label: "XL", values: ["42", "14", "10"] },
        { label: "XXL", values: ["44", "16", "12"] },
        { label: "XXXL", values: ["46", "18", "14"] },
      ],
    },
    measurements: {
      title: "Women's Clothing Size Chart",
      columns: ["Bust (cm)", "Waist (cm)", "Hips (cm)"],
      rows: [
        { label: "XXS", values: ["76-80", "60-64", "84-88"] },
        { label: "XS", values: ["80-84", "64-68", "88-92"] },
        { label: "S", values: ["84-88", "68-72", "92-96"] },
        { label: "M", values: ["88-92", "72-76", "96-100"] },
        { label: "L", values: ["92-98", "76-82", "100-106"] },
        { label: "XL", values: ["98-104", "82-88", "106-112"] },
        { label: "XXL", values: ["104-110", "88-94", "112-118"] },
        { label: "XXXL", values: ["110-116", "94-100", "118-124"] },
      ],
    },
    shoes: {
      title: "Women's Shoe Size Chart",
      columns: ["36", "37", "38", "39", "40", "41", "42"],
      rows: [
        { label: "US", values: ["5", "6", "7", "8", "9", "10", "11"] },
        { label: "UK", values: ["3", "4", "5", "6", "7", "8", "9"] },
      ],
    },
  },
  men: {
    conversion: {
      title: "Men's Clothing Size Chart",
      columns: ["EU", "UK", "US"],
      rows: [
        { label: "XXS", values: ["40", "32", "XS"] },
        { label: "XS", values: ["42", "34", "XS"] },
        { label: "S", values: ["44", "36", "S"] },
        { label: "M", values: ["46", "38", "M"] },
        { label: "L", values: ["48", "40", "L"] },
        { label: "XL", values: ["50", "42", "XL"] },
        { label: "XXL", values: ["52", "44", "XXL"] },
        { label: "XXXL", values: ["54", "46", "XXXL"] },
      ],
    },
    measurements: {
      title: "Men's Clothing Size Chart",
      columns: ["Chest (cm)", "Waist (cm)"],
      rows: [
        { label: "XXS", values: ["81-86", "66-71"] },
        { label: "XS", values: ["86-91", "71-76"] },
        { label: "S", values: ["91-96", "76-81"] },
        { label: "M", values: ["96-101", "81-86"] },
        { label: "L", values: ["101-106", "86-91"] },
        { label: "XL", values: ["106-111", "91-96"] },
        { label: "XXL", values: ["111-116", "96-101"] },
        { label: "XXXL", values: ["116-121", "101-106"] },
      ],
    },
    shoes: {
      title: "Men's Shoe Size Chart",
      columns: ["40", "41", "42", "43", "44", "45", "46"],
      rows: [
        { label: "US", values: ["7", "8", "9", "10", "11", "12", "13"] },
        { label: "UK", values: ["6", "7", "8", "9", "10", "11", "12"] },
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
      addSuccess = false,
      addingToCart,
      router,
      liveStockData,
      stockLoading,
    },
    ref
  ) => {
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const [notifySize, setNotifySize] = useState("");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [notifyOptIn, setNotifyOptIn] = useState(false);
    const [notifyLoading, setNotifyLoading] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [sizeGuideTab, setSizeGuideTab] = useState("conversion");
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { format } = useCurrency();
    const { request } = useAxios();
    const canLiveStock =
      product?.vendor_capabilities?.has_stock_check_api ||
      product?.vendor_capabilities?.has_individual_syncing;

    // Helper function to get live stock for a variant
    const getLiveStock = (variantSize) => {
      if (!liveStockData || !liveStockData.stockBySize) return null;
      const normalizedSize = variantSize?.toLowerCase();
      const stockItem = normalizedSize
        ? liveStockData.stockBySize.find(
            (s) => s.size?.toLowerCase() === normalizedSize
          )
        : liveStockData.stockBySize.find((s) => {
            const size = s.size?.toLowerCase();
            return size === "n/a" || size === "na";
          });
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

    const deliveryRangeText = useMemo(() => {
      const formatDate = (date) =>
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() + 7);
      const end = new Date(now);
      end.setDate(end.getDate() + 14);
      return `${formatDate(start)} - ${formatDate(end)}`;
    }, []);

    const notifyImage = useMemo(() => {
      if (!product) return "";
      const variantImage =
        product?.variants?.flatMap((v) => v.images || []).find(Boolean) || "";
      return product.product_img || variantImage || "";
    }, [product]);

    const renderSectionContent = (value, fallback) => {
      if (!value) {
        return <p className="text-sm text-gray-600">{fallback}</p>;
      }
      if (typeof value === "string") {
        return (
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );
      }
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
            {value.map((item, idx) => (
              <li key={idx}>{String(item)}</li>
            ))}
          </ul>
        );
      }
      if (typeof value === "object") {
        return (
          <div className="space-y-2 text-sm text-gray-700">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {key.replace(/_/g, " ")}
                </span>
                <span>{String(val)}</span>
              </div>
            ))}
          </div>
        );
      }
      return <p className="text-sm text-gray-600">{String(value)}</p>;
    };

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
        const dbStock = Number(variant.stock || 0);
        if (liveStockData && !liveStockData.error) {
          const liveStock = getLiveStock(variant.variant_size);
          setIsOutOfStock(liveStock <= 0);
        } else {
          // Live data missing/failed - fall back to DB stock
          setIsOutOfStock(dbStock <= 0);
        }
      } else {
        // Vendor doesn't support individual syncing - show out of stock
        setIsOutOfStock(true);
      }
    }, [product, selectedColor, selectedSize, liveStockData, stockLoading]);

    const getVariantForSize = (size) =>
      product?.variants?.find(
        (v) =>
          v.variant_size === size &&
          (!selectedColor || v.variant_color === selectedColor)
      );

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

    const handleOpenNotify = () => {
      setNotifySize(selectedSize || "");
      setNotifyEmail("");
      setNotifyOptIn(false);
      setIsNotifyOpen(true);
    };

    const handleNotifySubmit = async (e) => {
      e.preventDefault();
      if (!notifyEmail) {
        showToast("error", "Email is required.");
        return;
      }
      if (!notifySize) {
        showToast("error", "Please select a size.");
        return;
      }
      try {
        setNotifyLoading(true);
        const { data, error } = await request({
          method: "POST",
          url: "/users/notify-stock",
          payload: {
            product_id: product?.id,
            product_name: product?.name,
            brand_name: product?.brand_name,
            product_image: notifyImage,
            requested_size: notifySize,
            email: notifyEmail,
            wants_marketing: notifyOptIn,
          },
        });
        if (error || data?.success === false) {
          showToast("error", data?.message || error || "Failed to submit request.");
          return;
        }
        showToast("success", "Thanks! We will notify you when it is available.");
        setIsNotifyOpen(false);
      } catch (err) {
        showToast("error", err?.message || "Failed to submit request.");
      } finally {
        setNotifyLoading(false);
      }
    };

    return (
      <div
        className="w-full lg:w-[40%] p-4 lg:p-6 pb-4 lg:pb-8"
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
              <div className="text-sm font-medium text-black">
                {product.brand_name}
              </div>
            )}

            {/* Title */}
            <h1 className="text-base md:text-lg font-normal text-black leading-snug">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                {displayPrice.mrp && displayPrice.mrp > displayPrice.price && (
                  <span className="text-gray-400 line-through">
                    {format(displayPrice.mrp)}
                  </span>
                )}
                <span className="text-red-600 font-semibold">
                  {displayPrice.price ? format(displayPrice.price) : "—"}
                </span>
              </div>
              {displayPrice.discountPct && (
                <div className="text-xs text-red-600 font-medium">
                  -{displayPrice.discountPct}%
                </div>
              )}
            </div>

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
                    Size
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

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSizeDropdownOpen((prev) => !prev)}
                    className="w-full h-12 border border-gray-400 px-4 text-sm flex items-center justify-between bg-white"
                  >
                    <span className={selectedSize ? "text-black" : "text-gray-500"}>
                      {selectedSize || "Select size"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSizeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSizeDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full border border-gray-200 bg-white shadow-sm">
                      <div className="max-h-64 overflow-y-auto">
                        {sizes.map((s) => {
                          const variant = getVariantForSize(s);
                          const price = variant?.price ?? displayPrice.price;
                          let outOfStock = false;
                          if (canLiveStock) {
                            const dbStock = Number(variant?.stock || 0);
                            if (liveStockData && !liveStockData.error) {
                              const liveStock = getLiveStock(s);
                              outOfStock = !variant || liveStock <= 0;
                            } else {
                              outOfStock = !variant || dbStock <= 0;
                            }
                          } else {
                            outOfStock = true;
                          }

                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                if (outOfStock) return;
                                setSelectedSize(s);
                                setIsSizeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 ${
                                outOfStock
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              <span className="font-medium">{s}</span>
                              <span className="text-gray-700">
                                {price !== null && price !== undefined ? format(price) : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenNotify}
                        className="w-full px-4 py-3 text-left text-xs text-gray-700 underline"
                      >
                        Size missing?
                      </button>
                    </div>
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
                      <span
                        className={`text-sm font-medium ${
                          isOutOfStock ? "text-gray-500" : "text-black"
                        }`}
                      >
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
                  onClick={() => {
                    if (sizes.length > 0 && !selectedSize) {
                      setIsSizeDropdownOpen(true);
                      return;
                    }
                    handleAddToCart();
                  }}
                  loading={addingToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-14 text-base font-semibold bg-black hover:bg-gray-800 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {addSuccess ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Added
                    </span>
                  ) : isOutOfStock ? (
                    "OUT OF STOCK"
                  ) : (
                    "ADD TO CART"
                  )}
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

            <div className="text-xs text-gray-600 leading-tight">
              <div className="uppercase tracking-[0.2em] text-[10px] text-gray-500">
                Estimated delivery
              </div>
              <div className="text-sm text-gray-700">{deliveryRangeText}</div>
            </div>

            {/* Details Dropdowns */}
            <div className="border-t border-gray-200 pt-2">
              <Accordion type="multiple" defaultValue={["details"]} className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-[11px] uppercase tracking-[0.2em] text-gray-700 hover:no-underline">
                    The Details
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderSectionContent(
                      product.description || product.short_description,
                      "No product details available."
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-[11px] uppercase tracking-[0.2em] text-gray-700 hover:no-underline">
                    Delivery, Returns & Payments
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderSectionContent(
                      product.shipping_returns_payments,
                      "Shipping, returns, and payment details will be shared during checkout."
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="environment">
                  <AccordionTrigger className="text-[11px] uppercase tracking-[0.2em] text-gray-700 hover:no-underline">
                    Environmental Impact
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderSectionContent(
                      product.environmental_impact,
                      "We use sustainable packaging and shipping methods. Our products are crafted with eco-friendly materials. Every purchase supports global green initiatives."
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

        {isNotifyOpen && (
          <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl border border-gray-200 shadow-xl relative">
              <button
                type="button"
                onClick={() => setIsNotifyOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                aria-label="Close"
              >
                ×
              </button>
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6">
                <div className="flex items-center justify-center">
                  {notifyImage ? (
                    <img
                      src={notifyImage}
                      alt={product?.name || "Product"}
                      className="w-full max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="w-full max-w-[200px] aspect-square bg-gray-100" />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="text-lg font-medium text-gray-900">
                    Notify Me
                  </div>
                  <form onSubmit={handleNotifySubmit} className="space-y-3">
                    <div className="relative">
                      <select
                        value={notifySize}
                        onChange={(e) => setNotifySize(e.target.value)}
                        className="w-full h-11 border border-gray-300 px-3 text-sm bg-white"
                      >
                        <option value="">Select size</option>
                        {sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="email"
                      required
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full h-11 border border-gray-300 px-3 text-sm"
                    />
                    <label className="flex items-start gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={notifyOptIn}
                        onChange={(e) => setNotifyOptIn(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        Want more AAYEU in your inbox? Sign up for promotions,
                        tailored new arrivals and stock updates.
                      </span>
                    </label>
                    <div className="text-[11px] text-gray-500 leading-relaxed">
                      By signing up, you consent to receiving marketing by email
                      and/or SMS and acknowledge you have read our Privacy Policy.
                      Unsubscribe anytime at the bottom of our emails or by replying
                      STOP to any of our SMS.
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={notifyLoading}
                        className="h-10 px-5 bg-black text-white text-sm font-medium disabled:opacity-60"
                      >
                        {notifyLoading ? "Sending..." : "Email Me"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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
