"use client";

import { useState } from "react";
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

  const { toggleWishlist, isWishlisted } = useWishlist();

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
        {/* Card Container - Minimal Farfetch Style */}
        <div className="flex-1 flex flex-col bg-white">

          {/* Image Section */}
          <div className="relative w-full overflow-hidden bg-gray-50 aspect-[3/4]">
            {/* Wishlist Button - Top Right */}
            <button
              className="absolute top-3 right-3 z-30 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
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
                size={18}
                className="transition-colors"
                fill={isWishlisted(id) ? "black" : "none"}
                stroke={isWishlisted(id) ? "black" : "#666"}
                strokeWidth={1.5}
              />
            </button>

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
                    className={`object-cover transition-opacity duration-300 ${
                      showImage ? "opacity-100" : "opacity-0"
                    }`}
                    unoptimized
                  />
                ) : (
                  <img
                    key={index}
                    src={src}
                    alt={title}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                      showImage ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Product Info Section - Clean & Minimal */}
          <div className="flex flex-col pt-3 pb-2">
            {/* Category Label */}
            {category && (
              <span className="text-xs text-gray-500 mb-1">
                {category}
              </span>
            )}

            {/* Brand Name */}
            <h3 className="text-sm font-semibold text-black mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              {brand}
            </h3>

            {/* Product Title */}
            <p className="text-sm text-gray-700 mb-2 line-clamp-1">
              {title}
            </p>

            {/* Price Section - Simple & Clean */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold text-black">
                {displayPrice ? format(displayPrice) : "N/A"}
              </span>
              {mrp && displayPrice && mrp > displayPrice && (
                <>
                  <span className="text-sm line-through text-gray-400">
                    {format(mrp)}
                  </span>
                  <span className="text-xs text-red-600 font-medium">
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
