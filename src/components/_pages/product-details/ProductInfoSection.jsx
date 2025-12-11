"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import useAxios from "@/hooks/useAxios";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { showToast } from "@/providers/ToastProvider";
import AppAlertDialog from "./AppAlertDialog";
import CTAButton from "@/components/_common/CTAButton";
import ProductVideoSection from "./ProductVideoSection";
import ProductImagesSection from "./ProductImagesSection";
import ProductInfoDetailsSection from "./ProductInfoDetailsSection";
import { Skeleton } from "@/components/ui/skeleton";
import useCart from "@/hooks/useCart";

export default function ProductInfoSection() {
  const { productId } = useParams();
  const router = useRouter();
  const textColRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const { addToCart } = useCart();

  const {
    request: getProductDetails,
    loading: productLoading,
    error: productError,
  } = useAxios();

  // ✅ Fetch product details
  useEffect(() => {
    (async () => {
      const { data, error } = await getProductDetails({
        url: `/users/get-product-by-id`,
        method: "GET",
        params: { productId },
      });
      if (error) return setProduct(null);
      setProduct(data?.data ?? data ?? null);
    })();
  }, [productId]);

  const onVideoWheel = (e) => {
    if (!textColRef.current) return;
    e.preventDefault();
    textColRef.current.scrollTop += e.deltaY;
  };

  // ✅ Extract video from media list
  const productVideo = useMemo(() => {
    if (!product) return null;
    const mediaList =
      product.media || product.variants?.flatMap((v) => v.media || []) || [];
    const video = mediaList.find((m) =>
      typeof m === "string"
        ? m.endsWith(".mp4") || m.endsWith(".webm")
        : m.type?.includes("video")
    );
    return video?.url || video || null;
  }, [product]);

  // ✅ Images array
  const images = useMemo(() => {
    if (!product)
      return [
        "/assets/images/product-tshirt.webp",
        "/assets/images/scroll-2.webp",
        "/assets/images/scroll-3.webp",
        "/assets/images/scroll-4.webp",
      ];
    const variantImages =
      product.variants?.flatMap((v) => v.images || [])?.filter(Boolean) || [];
    if (variantImages.length) return variantImages;
    if (product.product_img) return [product.product_img];
    return [
      "/assets/images/product-tshirt.webp",
      "/assets/images/scroll-2.webp",
      "/assets/images/scroll-3.webp",
      "/assets/images/scroll-4.webp",
    ];
  }, [product]);

  // ✅ Handle Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;

    const matchedVariant =
      product.variants?.find(
        (v) =>
          (!selectedColor || v.variant_color === selectedColor) &&
          (!selectedSize || v.variant_size === selectedSize)
      ) || product.variants?.[0];

    if (!matchedVariant)
      return showToast("error", "Please select a valid variant.");

    const res = await addToCart({
      product,
      variant: matchedVariant,
      qty: 1,
      isAuthenticated,
    });

    if (!res.error) {
      setDialogMessage("Product added to cart successfully!");
      setShowSuccessDialog(true);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex flex-col lg:flex-row lg:h-[80vh]">
        {productLoading ? (
          <>
            <div className="flex-1 box-border p-4 min-h-0">
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
            <div className="flex-[1.2] box-border p-4 min-h-0">
              <div className="no-scrollbar h-auto lg:h-full w-full overflow-y-auto rounded-2xl flex flex-col gap-2">
                <Skeleton className="w-full h-40 rounded" />
                <Skeleton className="w-full h-40 rounded" />
                <Skeleton className="w-full h-40 rounded" />
              </div>
            </div>
            <div className="flex-[1.5] box-border p-4 overflow-y-auto min-h-0">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-10 w-full rounded" />
                <Skeleton className="h-10 w-full rounded" />
                <Skeleton className="h-10 w-1/2 rounded" />
              </div>
            </div>
          </>
        ) : (
          <>
            <ProductVideoSection
              productVideo={productVideo}
              onVideoWheel={onVideoWheel}
            />
            <ProductImagesSection images={images} product={product} />
            <ProductInfoDetailsSection
              ref={textColRef}
              product={product}
              productLoading={productLoading}
              productError={productError}
              isAuthenticated={isAuthenticated}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              handleAddToCart={handleAddToCart}
              // addingToCart={addingToCart}
              router={router}
            />
          </>
        )}
      </div>

      <AppAlertDialog
        visible={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        customHeader={
          <div className="text-2xl text-center">{dialogMessage}</div>
        }
        customFooter={
          <div className="flex justify-center gap-3 mt-4">
            <CTAButton
              onClick={() => {
                router.back();
                setShowSuccessDialog(false);
              }}
            >
              Continue Shopping
            </CTAButton>
            <CTAButton
              color="gold"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/cart");
              }}
            >
              Go to Cart
            </CTAButton>
          </div>
        }
      />
    </section>
  );
}
