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

export default function ProductCard({
  product,
  showDesigner = true,
  useNextImage = true,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth);

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
    <div
      key={id}
      className="group relative block cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ❤️ Always Visible Wishlist Button */}
      <div
        className="
          absolute top-0 right-0 z-[50]
          h-9 w-9 flex items-center justify-center
          cursor-pointer
          transition-all active:scale-90
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
        onMouseDown={(e) => e.preventDefault()} // Prevent triggering the link
      >
        <HeartIcon
          size={20}
          className={isWishlisted(id) ? "text-red-600" : "text-gray-700"}
          fill={isWishlisted(id) ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      </div>

      {/* Image Section */}
      <Link href={link}>
        <div className="relative w-full overflow-hidden bg-white rounded h-[400px]">
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-30 bg-red-600 text-white text-xs px-2 py-1 font-semibold">
              -{discountPercent}%
            </div>
          )}

          {[primaryImage, hoverImage].map((src, index) => {
            const isHoverImage = index === 1;
            const showImage = hovered ? isHoverImage : !isHoverImage;

            return useNextImage ? (
              <Image
                key={index}
                src={src}
                alt={title}
                fill
                className={`object-cover transition-opacity duration-500 ease-in-out ${
                  showImage ? "opacity-100 z-20" : "opacity-0 z-10"
                }`}
                unoptimized
              />
            ) : (
              <img
                key={index}
                src={src}
                alt={title}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                  showImage ? "opacity-100 z-20" : "opacity-0 z-10"
                }`}
              />
            );
          })}
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="uppercase text-gray-600 text-xs">{brand}</span>
          <span className="text-xs text-gray-600">{category}</span>
        </div>

        <Link href={link}>
          <h3 className="block font-medium text-sm line-clamp-2 hover:underline">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-1">
          {mrp && mrp > displayPrice ? (
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-600 text-xs">
                AED {mrp || "N/A"}
              </span>
              <span className="text-red-600 font-semibold text-sm">
                AED {displayPrice || "N/A"}
              </span>
            </div>
          ) : (
            <div className="text-base font-medium">
              AED {displayPrice || "N/A"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
