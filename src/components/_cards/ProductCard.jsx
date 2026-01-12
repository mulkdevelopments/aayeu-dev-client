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
import useCurrency from "@/hooks/useCurrency";

export default function ProductCard({
  product,
  showDesigner = true,
  useNextImage = true,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { format } = useCurrency();

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
  const price = firstVariant?.price ?? minPrice ?? null;
  const displayPrice = price ?? minPrice ?? null;

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
        {/* Card Container - Professional Design */}
        <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:border-black hover:shadow-xl">

          {/* Image Section - Responsive Sizing */}
          <div className="relative w-full overflow-hidden bg-gray-100 aspect-[4/5]">
            {/* Wishlist Button */}
            <div
              className="
                absolute top-2 right-2 md:top-3 md:right-3 z-[50]
                h-8 w-8 md:h-10 md:w-10 flex items-center justify-center
                bg-white rounded-full
                shadow-md border border-gray-300
                cursor-pointer
                transition-all duration-200
                hover:bg-black hover:border-black
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
                className={`md:w-[18px] md:h-[18px] transition-all duration-200 ${
                  isWishlisted(id)
                    ? "text-black"
                    : "text-gray-400 group-hover:text-black"
                }`}
                fill={isWishlisted(id) ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30">
                <div className="bg-black text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded shadow-sm">
                  -{discountPercent}%
                </div>
              </div>
            )}

            {/* New Badge */}
            <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-30">
              <div className="bg-white text-black text-[10px] md:text-xs font-semibold px-2 md:px-3 py-0.5 md:py-1 rounded border border-gray-300 shadow-sm">
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
                    className={`object-cover transition-all duration-500 ease-out ${
                      showImage ? "opacity-100 z-20" : "opacity-0 z-10"
                    }`}
                    unoptimized
                  />
                ) : (
                  <img
                    key={index}
                    src={src}
                    alt={title}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                      showImage ? "opacity-100 z-20" : "opacity-0 z-10"
                    }`}
                  />
                );
              })}
            </div>

            {/* Hover Overlay */}
            <div className={`absolute inset-0 bg-black/5 z-[25] transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>

          {/* Product Info Section - Compact Layout */}
          <div className="flex-1 flex flex-col p-3 md:p-4 bg-white">
            {/* Brand and Category */}
            <div className="flex items-center justify-between mb-2">
              <span className="uppercase text-gray-500 text-[10px] md:text-xs font-bold tracking-widest">
                {brand}
              </span>
              {category && (
                <span className="text-[10px] md:text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded font-medium">
                  {category}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="font-medium text-black text-sm md:text-base line-clamp-2 mb-3 leading-tight">
              {title}
            </h3>

            {/* Price Section with Animation */}
            <div className="mt-auto pt-2 border-t border-gray-200">
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
                    <span className="text-xs md:text-sm line-through text-gray-400 font-normal">
                      {format(mrp)}
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-700 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                      {discountPercent}% OFF
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
                    <span className="text-lg md:text-2xl font-bold text-black">
                      {format(displayPrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1 h-8 md:h-10">
                  <span className="text-lg md:text-2xl font-bold text-black">
                    {displayPrice ? format(displayPrice) : "N/A"}
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
