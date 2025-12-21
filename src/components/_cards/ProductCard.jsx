"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart as HeartIcon } from "lucide-react";
import { slugifyProductName } from "@/utils/seoHelpers";
import STATIC from "@/utils/constants";
import useWishlist from "@/hooks/useWishlist";
import { useSelector } from "react-redux";
import { showToast } from "@/providers/ToastProvider";

export default function ProductCard({
  product,
  showDesigner = true,
  useNextImage = true,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [hovered, setHovered] = useState(false);
  const [showPrice, setShowPrice] = useState(false);

  const { toggleWishlist, isWishlisted } = useWishlist();

  // Price animation effect - cycles every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPrice((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!product) return null;

  // ---------------- Product Data ----------------
  const id = product.id ?? product._id;
  const title = product.title ?? product.name ?? "Product";
  const brand = product.brand_name ?? product.brand ?? "";
  const category = product.categories?.[0]?.name ?? "";
  const minPrice = product.min_price ?? product.variants?.[0]?.price ?? null;

  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;

  const imagesFromVariant = Array.isArray(firstVariant?.images)
    ? firstVariant.images
    : [];

  const primaryImage =
    imagesFromVariant[0] ??
    product.product_img ??
    STATIC.IMAGES.IMAGE_NOT_AVAILABLE;

  const hoverImage = imagesFromVariant[1] ?? primaryImage;

  const mrp = firstVariant?.mrp ?? null;
  const salePrice =
    firstVariant?.sale_price ?? firstVariant?.price ?? minPrice ?? null;
  const displayPrice = salePrice ?? minPrice ?? null;

  let discountPercent = 0;
  if (mrp && displayPrice && mrp > displayPrice) {
    discountPercent = Math.round(((mrp - displayPrice) / mrp) * 100);
  }

  const link =
    (product.categories?.[0]?.slug &&
      `/shop/product/${slugifyProductName(product.name)}/${product.id}?cat=${
        product.categories[0].slug
      }`) ||
    `/shop/product/${slugifyProductName(product.name)}/${product.id}`;

  const toggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <Link href={link}>
      <div
        key={id}
        className="group relative flex flex-col h-full cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card Container - Responsive Border & Shadow */}
        <div className="flex-1 flex flex-col bg-white rounded-xl md:rounded-2xl border-2 border-amber-400/60 overflow-hidden transition-all duration-500 hover:border-amber-500 hover:shadow-[0_10px_40px_rgba(217,119,6,0.25)] hover:-translate-y-1 md:hover:-translate-y-2">

          {/* Image Section - Responsive Sizing */}
          <div className="relative w-full overflow-hidden bg-gradient-to-br from-amber-50/30 via-white to-emerald-50/20 aspect-[4/5]">
            {/* Wishlist Button */}
            <div
              className="
                absolute top-2 right-2 md:top-3 md:right-3 z-[50]
                h-8 w-8 md:h-10 md:w-10 flex items-center justify-center
                bg-white/95 backdrop-blur-md rounded-full
                shadow-lg border border-amber-200/50
                cursor-pointer
                transition-all duration-300
                hover:scale-110 hover:bg-gradient-to-br hover:from-white hover:to-amber-50
                hover:border-emerald-400/50
                active:scale-95
              "
              onClick={
                isAuthenticated
                  ? toggleWish
                  : (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showToast("info", "Please login to manage your wishlist");
                    }
              }
              onMouseDown={(e) => e.preventDefault()}
            >
              <HeartIcon
                size={16}
                className={`md:w-[18px] md:h-[18px] transition-all duration-300 ${
                  isWishlisted(id)
                    ? "text-red-600 drop-shadow-sm"
                    : "text-gray-600 group-hover:text-emerald-600"
                }`}
                fill={isWishlisted(id) ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </div>

            {/* Discount Badge - Gold Color */}
            {discountPercent > 0 && (
              <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30">
                <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg border border-amber-400/50">
                  -{discountPercent}% OFF
                </div>
              </div>
            )}

            {/* New Badge */}
            <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-30">
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white text-[10px] md:text-xs font-semibold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md border border-emerald-400/30 backdrop-blur-sm">
                NEW
              </div>
            </div>

            {/* Product Images */}
            <div className="relative w-full h-full">
              {[primaryImage, hoverImage].map((src, index) => {
                const isHoverImage = index === 1;
                const showImage = hovered ? isHoverImage : !isHoverImage;

                return useNextImage ? (
                  <Image
                    key={index}
                    src={src}
                    alt={title}
                    fill
                    className={`object-cover transition-all duration-700 ease-in-out ${
                      showImage ? "opacity-100 z-20 scale-100" : "opacity-0 z-10 scale-105"
                    }`}
                    unoptimized
                  />
                ) : (
                  <img
                    key={index}
                    src={src}
                    alt={title}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                      showImage ? "opacity-100 z-20 scale-100" : "opacity-0 z-10 scale-105"
                    }`}
                  />
                );
              })}
            </div>

            {/* Hover Overlay with Brand Color */}
            <div className={`absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent z-[25] transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>

          {/* Product Info Section - Compact Layout */}
          <div className="flex-1 flex flex-col p-2.5 md:p-3 bg-white">
            {/* Brand and Category */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="uppercase text-amber-700 text-[10px] md:text-xs font-bold tracking-wider">
                {brand}
              </span>
              {category && (
                <span className="text-[10px] md:text-xs text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md font-medium">
                  {category}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 hover:text-emerald-700 transition-colors duration-300 leading-snug">
              {title}
            </h3>

            {/* Price Section with Animation */}
            <div className="mt-auto pt-1.5 border-t border-amber-100/50">
              {mrp && mrp > displayPrice ? (
                <div className="relative h-8 md:h-10 overflow-hidden">
                  {/* Original Price (Strikethrough) - Slides in/out */}
                  <div
                    className={`absolute inset-0 flex items-center gap-2 transition-all duration-700 ease-in-out ${
                      showPrice
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-full opacity-0"
                    }`}
                  >
                    <span className="text-xs md:text-sm line-through text-gray-400 font-medium relative">
                      AED {mrp}
                      <span className="absolute inset-0 border-t-2 border-red-500 transform rotate-[-8deg] animate-[drawLine_0.6s_ease-out]"></span>
                    </span>
                    <span className="text-[10px] md:text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      SAVE {discountPercent}%
                    </span>
                  </div>

                  {/* Sale Price - Slides in/out */}
                  <div
                    className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${
                      !showPrice
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    }`}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 font-medium">AED</span>
                      <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {displayPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1 h-8 md:h-10">
                  <span className="text-xs text-gray-500 font-medium">AED</span>
                  <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
                    {displayPrice || "N/A"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
