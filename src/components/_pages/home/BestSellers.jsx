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
    fetchBestSellers();
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

  const formatPrice = (val) => {
    if (val === undefined || val === null) return "";
    const num =
      typeof val === "string" ? Number(val.replace(",", ".")) : Number(val);
    if (Number.isNaN(num)) return String(val);
    return num.toFixed(2);
  };

  if (!bestSellers.length) return null;

  return (
    <section
      id="best-sellers"
      className="relative bg-neutral-950 text-white overflow-hidden"
    >
      {/* soft background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-widest text-neutral-400 mb-2">
            MOST LOVED
          </p>
          <h2 className="text-3xl sm:text-4xl font-light">
            Best Sellers · Athletics
          </h2>
        </div>

        {/* Products */}
        <div className="
  grid grid-cols-2 gap-4
  md:grid-cols-3 lg:grid-cols-4
  md:gap-6
">
          {bestSellers.map((bs, idx) => {
            const product = bs?.product ?? bs;
            const variant = resolveVariant(product);

            const image =
              (variant?.images && variant.images[0]) ||
              product?.product_img ||
              STATIC.IMAGES.IMAGE_NOT_AVAILABLE;

            const name =
              product?.name ??
              product?.title ??
              product?.product_sku ??
              "Product";

            const price = variant?.price ?? product?.price ?? null;
            const oldPrice = variant?.sale_price ?? product?.sale_price ?? null;

            const productId =
              product?.id ?? product?.pid ?? product?.productid ?? idx;

            return (
              <div
                key={productId}
                onClick={() => goToProduct(bs)}
                className="
                  min-w-[180px] md:min-w-0
                  bg-neutral-900 rounded-2xl
                  cursor-pointer
                  group
                  transition
                  hover:bg-neutral-800
                "
              >
                {/* Image */}
          {/* Image */}
<div className="relative overflow-hidden rounded-t-2xl">
  <img
    src={image}
    alt={name}
    className="
      w-full h-[220px] object-contain
      transition-transform duration-700
      group-hover:scale-105
    "
  />

  {/* GOLD BEST SELLER TAG */}
  <div className="
    absolute top-3 right-3
    bg-gradient-to-br from-[#E6C15A] via-[#D4AF37] to-[#B8962E]
    text-black
    text-[10px] tracking-widest
    px-3 py-1 rounded-full
    shadow-lg
    uppercase
  ">
    Best Seller
  </div>

  {/* Shopping icon */}
  <div className="
    absolute top-3 left-3
    bg-black/60 backdrop-blur
    rounded-full p-2
    opacity-0 group-hover:opacity-100
    transition
  ">
    <ShoppingBag size={16} />
  </div>
</div>


                {/* Info */}
                <div className="p-4 space-y-2">
                  <p className="text-sm font-light leading-snug">
                    {name}
                  </p>

                  {/* colors */}
                  <div className="flex gap-2">
                    {Array.isArray(product?.colors)
                      ? product.colors.slice(0, 3).map((color, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/40"
                            style={{ backgroundColor: color }}
                          />
                        ))
                      : null}
                  </div>

                  {/* price */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-light">
                      AED {price !== null ? formatPrice(price) : "—"}
                    </span>
                    {oldPrice && (
                      <span className="line-through text-neutral-400">
                        AED {formatPrice(oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
