import React, { forwardRef, useEffect, useMemo, useState } from "react";
import CTAButton from "@/components/_common/CTAButton";
import Marquee from "react-fast-marquee";

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

    // ✅ Extract unique sizes
    const sizes = useMemo(() => {
      if (!product?.variants?.length) return [];
      const allSizes = product.variants
        .map((v) => v.variant_size)
        .filter(Boolean);
      return [...new Set(allSizes)];
    }, [product]);

    // ✅ Extract unique colors (hide if only one)
    const colors = useMemo(() => {
      if (!product?.variants?.length) return [];
      const allColors = product.variants
        .map((v) => v.variant_color)
        .filter(Boolean);
      const uniqueColors = [...new Set(allColors)];
      return uniqueColors.length > 1 ? uniqueColors : [];
    }, [product]);

    // ✅ Auto-select first AVAILABLE variant (skip out of stock)
    useEffect(() => {
      if (!product?.variants?.length) return;

      // Try to find first variant with stock > 0
      const availableVariant =
        product.variants.find((v) => Number(v.stock) > 0) ??
        product.variants[0];

      if (availableVariant) {
        if (availableVariant.variant_color && !selectedColor)
          setSelectedColor(availableVariant.variant_color);

        if (availableVariant.variant_size && !selectedSize)
          setSelectedSize(availableVariant.variant_size);
      }
    }, [
      product,
      selectedColor,
      selectedSize,
      setSelectedColor,
      setSelectedSize,
    ]);

    // ✅ Find selected variant for stock logic
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
      const price = variant?.sale_price ?? variant?.price ?? product.min_price;
      const mrp = variant?.mrp ?? variant?.price ?? product.max_price;
      const discountPct =
        price && mrp ? Math.round(((mrp - price) / mrp) * 100) : null;
      return { price, mrp, discountPct };
    }, [product]);

    return (
      <div
        id="textCol"
        className="flex-[1.5] box-border p-4 overflow-y-auto min-h-0"
        ref={ref}
      >
        <div className="p-2">
          {/* Offer banner */}
          <div className="mb-3 rounded py-1 bg-[#d9b554]">
            <Marquee gradient={false} speed={50} className="text-white">
              Place your order before 8:17 a.m. and receive it by tomorrow!
            </Marquee>
          </div>

          {productLoading ? (
            <div className="py-6 text-center text-gray-600">Loading...</div>
          ) : productError || !product ? (
            <div className="py-6 text-center text-red-600">
              {productError ?? "Product not found."}
            </div>
          ) : (
            <>
              {/* Brand + title */}
              <h4 className="mb-2 font-light uppercase">
                {product.brand_name ? `${product.brand_name} — ` : ""}
                {product.title ?? product.name}
              </h4>

              {/* Description */}
              <p
                className="mb-3 text-[16px] font-light ml-4"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ?? product.short_description ?? "",
                }}
              />

              {/* Price */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">
                  {displayPrice.price != null
                    ? `AED ${displayPrice.price}`
                    : "—"}
                </span>
                {displayPrice.mrp && (
                  <span className="text-gray-500 line-through">
                    AED {displayPrice.mrp}
                  </span>
                )}
                {displayPrice.discountPct != null && (
                  <span className="rounded bg-[#d9b554] px-2 py-0.5 text-black font-extralight">
                    -{displayPrice.discountPct}%
                  </span>
                )}
              </div>

              {/* ✅ Color selector (only when >1) */}
              {colors.length > 1 && (
                <div className="mb-3">
                  <p className="mb-1">Color/Material</p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c) => (
                      <div
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`h-10 w-10 rounded flex items-center justify-center text-xs cursor-pointer border ${
                          selectedColor === c
                            ? "border-black scale-110"
                            : "border-gray-600"
                        } transition-transform`}
                        style={{ backgroundColor: "#f3f3f3" }}
                      >
                        <span className="text-[11px]">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ Size selector */}
              {sizes.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1">Size</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const variant = product.variants.find(
                        (v) =>
                          v.variant_size === s &&
                          (!selectedColor || v.variant_color === selectedColor)
                      );
                      const outOfStock = !variant || variant.stock <= 0;

                      if (outOfStock) return null;

                      return (
                        <CTAButton
                          shape="pill"
                          key={s}
                          variant={selectedSize === s ? "solid" : "outline"}
                          onClick={() => !outOfStock && setSelectedSize(s)}
                          disabled={outOfStock}
                          className={`relative ${
                            outOfStock
                              ? "opacity-50 cursor-not-allowed line-through"
                              : ""
                          }`}
                        >
                          {s}
                        </CTAButton>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-sm text-gray-600">
                      {isOutOfStock ? "Out of stock" : "In stock"}
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Add to Cart */}
              <div className="mb-3 flex gap-3">
                <CTAButton
                  color="gold"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                </CTAButton>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

export default ProductInfoDetailsSection;
