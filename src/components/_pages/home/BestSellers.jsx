"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { slugifyProductName } from "@/utils/seoHelpers";
import STATIC from "@/utils/constants";
import useHomeConfig from "@/hooks/useHomeConfig";

export default function BestSellers() {
  const router = useRouter();

  const { bestSellers, fetchBestSellers } = useHomeConfig();

  useEffect(() => {
    fetchBestSellers(); // cached / loads once
  }, []);

  const goToProduct = (product) => {
    // Prefer product.id (uuid) but fallback to pid or index
    const id =
      product?.product?.id ?? product?.product?.pid ?? product?.productid;
    const name = product?.product?.name ?? product?.product?.title ?? "product";
    // Adjust this route to match your product details route
    if (id) {
      router.push(`/shop/product/${slugifyProductName(name)}/${id}`);
    }
  };

  // Helper to safely get variant, image, and prices
  const resolveVariant = (prod) => {
    const variants = prod?.variants ?? prod?.product?.variants ?? [];
    return variants[0] ?? {};
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return "";
    // If API returns string or number; make sure to show two decimals
    const num =
      typeof val === "string" ? Number(val.replace(",", ".")) : Number(val);
    if (Number.isNaN(num)) return String(val);
    // use dot decimal; change to replace('.', ',') if you prefer comma
    return num.toFixed(2);
  };

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-8" id="best-sellers">
      <div className="container mx-auto px-2">
        <h2 className="text-3xl font-light mb-6">Best Sellers Athletics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.length === 0 && !loading && (
            <div className="col-span-2 md:col-span-4 text-center text-gray-500 border p-6">
              No best sellers found.
            </div>
          )}

          {bestSellers.map((bs, idx) => {
            // bs expected shape: { best_seller_id, rank, meta, product }
            const product = bs?.product ?? bs;
            const variant = resolveVariant(product);
            const defaultImg =
              (variant?.images && variant.images[0]) ||
              product?.product_img ||
              STATIC.IMAGES.IMAGE_NOT_AVAILABLE;
            const hoverImg =
              (variant?.images && variant.images[1]) ||
              product?.product_img ||
              STATIC.IMAGES.IMAGE_NOT_AVAILABLE;

            const displayName =
              product?.name ??
              product?.title ??
              product?.product_sku ??
              "Product";
            const price = variant?.price ?? product?.price ?? null;
            const oldPrice = variant?.sale_price ?? product?.sale_price ?? null;

            // product id for route
            const productId =
              product?.id ?? product?.pid ?? product?.productid ?? idx;

            return (
              <div
                key={bs?.best_seller_id ?? productId ?? idx}
                className="relative cursor-pointer group perspective"
                onClick={() => goToProduct(bs)}
              >
                {/* Product Images */}
                <div className="w-full h-64 relative">
                  {[defaultImg, hoverImg].map((src, index) => {
                    const isHoverImage = index === 1;
                    return (
                      <img
                        key={index}
                        src={src}
                        alt={displayName}
                        className={`
          absolute inset-0 w-full h-full object-contain
          transition-opacity duration-500 ease-in-out
          ${
            isHoverImage
              ? "opacity-0 group-hover:opacity-100"
              : "opacity-100 group-hover:opacity-0"
          }
        `}
                      />
                    );
                  })}
                </div>

                {/* Product Info */}
                <div className="p-3 bg-white">
                  <div className="flex justify-between mb-2 items-center">
                    <div className="flex gap-2">
                      {/* If product has color info try to show; fallback to variant.variant_color */}
                      {Array.isArray(product?.colors) ? (
                        product.colors
                          .slice(0, 3)
                          .map((color, cIdx) => (
                            <span
                              key={cIdx}
                              className="w-5 h-5 rounded-full border border-black"
                              style={{ backgroundColor: color }}
                            />
                          ))
                      ) : product?.variants &&
                        product.variants[0]?.variant_color ? (
                        <span
                          className="w-5 h-5 rounded-full border border-black"
                          style={{
                            backgroundColor: product.variants[0].variant_color,
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="text-gray-500">
                      <ShoppingBag />
                    </div>
                  </div>

                  <p className="mb-1 text-xl">{displayName}</p>

                  <div className="flex items-center gap-2">
                    <span className="font-light">
                      AED {price !== null ? formatPrice(price) : "—"}
                    </span>
                    {oldPrice ? (
                      <span className="line-through text-gray-500 font-light">
                        AED {formatPrice(oldPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}
