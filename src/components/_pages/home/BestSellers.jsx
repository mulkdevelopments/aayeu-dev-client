"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { slugifyProductName } from "@/utils/seoHelpers";
import STATIC from "@/utils/constants";
import useHomeConfig from "@/hooks/useHomeConfig";
import useCurrency from "@/hooks/useCurrency";
import useWishlist from "@/hooks/useWishlist";
import { useSelector } from "react-redux";
import { showToast } from "@/providers/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function BestSellers() {
  const router = useRouter();
  const { bestSellers, fetchBestSellers } = useHomeConfig();
  const { format } = useCurrency();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (bestSellers.length > 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchBestSellers()
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const goToProduct = (product) => {
    const id =
      product?.product?.id ?? product?.product?.pid ?? product?.productid;
    const name = product?.product?.name ?? product?.product?.title ?? "product";
    if (id) {
      router.push(`/shop/product/${slugifyProductName(name)}/${id}`);
    }
  };

  const resolveVariant = (prod) => {
    const variants = prod?.variants ?? prod?.product?.variants ?? [];
    return variants[0] ?? {};
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 px-4 md:px-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Mobile: Horizontal Scroll Skeleton */}
          <div className="md:hidden overflow-x-auto px-4 pb-4 scrollbar-hide">
            <div className="flex gap-4">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="flex flex-col flex-shrink-0 w-[170px]">
                  <Skeleton className="aspect-[3/4] w-full mb-3" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid Skeleton */}
          <div className="hidden md:block px-8">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="flex flex-col">
                  <Skeleton className="aspect-[3/4] w-full mb-3" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!bestSellers.length) return null;

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-8 px-4 md:px-8">
          <h2
            className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-black mb-2 text-left leading-tight tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Trending: Most Loved Pieces
          </h2>
          <p className="text-sm text-gray-600 text-left" style={{ fontFamily: "'Inter', sans-serif" }}>

          </p>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto px-4 pb-4 scrollbar-hide">
          <div className="flex gap-4">
            {bestSellers.map((bs, idx) => {
            const product = bs?.product ?? bs;
            const variant = resolveVariant(product);

            const images = variant?.images ?? [];
            const primaryImage =
              images[0] ||
              product?.product_img ||
              STATIC.IMAGES.IMAGE_NOT_AVAILABLE;
            const hoverImage = images[1] || primaryImage;

            const name =
              product?.name ??
              product?.title ??
              product?.product_sku ??
              "Product";

            const brand = product?.brand_name ?? product?.brand ?? "";
            const category = product?.categories?.[0]?.name ?? "";

            const price = variant?.price ?? product?.price ?? null;
            const mrp = variant?.mrp ?? product?.mrp ?? null;

            let discountPercent = 0;
            if (mrp && price && mrp > price) {
              discountPercent = Math.round(((mrp - price) / mrp) * 100);
            }

            const productId =
              product?.id ?? product?.pid ?? product?.productid ?? idx;

            const isHovered = hoveredIndex === idx;

            const handleWishlistClick = (e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                showToast("info", "Please login to manage your wishlist");
                return;
              }
              toggleWishlist(productId);
            };

            return (
              <div
                key={productId}
                onClick={() => goToProduct(bs)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex flex-col cursor-pointer flex-shrink-0 w-[170px]"
              >
                {/* Image Section */}
                <div className="relative w-full overflow-hidden bg-gray-50 aspect-[3/4]">
                  {/* Wishlist Button */}
                  <button
                    className="absolute top-3 right-3 z-30 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    onClick={handleWishlistClick}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Heart
                      size={18}
                      className="transition-colors"
                      fill={isWishlisted(productId) ? "black" : "none"}
                      stroke={isWishlisted(productId) ? "black" : "#666"}
                      strokeWidth={1.5}
                    />
                  </button>

                  {/* Product Images */}
                  <div className="relative w-full h-full">
                    <img
                      src={primaryImage}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isHovered ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <img
                      src={hoverImage}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>

                {/* Product Info */}
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
                    {name}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-black">
                      {price !== null ? format(price) : "N/A"}
                    </span>
                    {mrp && mrp > price && (
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
            );
            })}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:block px-8">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((bs, idx) => {
              const product = bs?.product ?? bs;
              const variant = resolveVariant(product);

              const images = variant?.images ?? [];
              const primaryImage =
                images[0] ||
                product?.product_img ||
                STATIC.IMAGES.IMAGE_NOT_AVAILABLE;
              const hoverImage = images[1] || primaryImage;

              const name =
                product?.name ??
                product?.title ??
                product?.product_sku ??
                "Product";

              const brand = product?.brand_name ?? product?.brand ?? "";
              const category = product?.categories?.[0]?.name ?? "";

              const price = variant?.price ?? product?.price ?? null;
              const mrp = variant?.mrp ?? product?.mrp ?? null;

              let discountPercent = 0;
              if (mrp && price && mrp > price) {
                discountPercent = Math.round(((mrp - price) / mrp) * 100);
              }

              const productId =
                product?.id ?? product?.pid ?? product?.productid ?? idx;

              const isHovered = hoveredIndex === idx;

              const handleWishlistClick = (e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  showToast("info", "Please login to manage your wishlist");
                  return;
                }
                toggleWishlist(productId);
              };

              return (
                <div
                  key={productId}
                  onClick={() => goToProduct(bs)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative flex flex-col cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="relative w-full overflow-hidden bg-gray-50 aspect-[3/4]">
                    {/* Wishlist Button */}
                    <button
                      className="absolute top-3 right-3 z-30 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      onClick={handleWishlistClick}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Heart
                        size={18}
                        className="transition-colors"
                        fill={isWishlisted(productId) ? "black" : "none"}
                        stroke={isWishlisted(productId) ? "black" : "#666"}
                        strokeWidth={1.5}
                      />
                    </button>

                    {/* Product Images */}
                    <div className="relative w-full h-full">
                      <img
                        src={primaryImage}
                        alt={name}
                      loading="lazy"
                      decoding="async"
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                          isHovered ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      <img
                        src={hoverImage}
                        alt={name}
                      loading="lazy"
                      decoding="async"
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Product Info */}
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
                      {name}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-black">
                        {price !== null ? format(price) : "N/A"}
                      </span>
                      {mrp && mrp > price && (
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
