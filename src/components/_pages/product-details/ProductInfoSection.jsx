"use client";

import React, { useEffect, useState, useMemo } from "react";
import useAxios from "@/hooks/useAxios";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { showToast } from "@/providers/ToastProvider";
import AppAlertDialog from "./AppAlertDialog";
import CTAButton from "@/components/_common/CTAButton";
import ProductGallerySection from "./ProductGallerySection";
import ProductInfoDetailsSection from "./ProductInfoDetailsSection";
import { Skeleton } from "@/components/ui/skeleton";
import useCart from "@/hooks/useCart";

export default function ProductInfoSection() {
  const { productId } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [liveStockData, setLiveStockData] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);

  const { addToCart } = useCart();

  const {
    request: getProductDetails,
    loading: productLoading,
    error: productError,
  } = useAxios();

  const { request: getLiveStock } = useAxios();

  // ✅ Fetch product details
  useEffect(() => {
    (async () => {
      const { data, error } = await getProductDetails({
        url: `/users/get-product-by-id`,
        method: "GET",
        params: { productId },
      });
      if (error) return setProduct(null);
      const productData = data?.data ?? data ?? null;
      setProduct(productData);

      // Automatically fetch live stock if vendor supports it
      if (productData?.vendor_capabilities?.has_individual_syncing) {
        fetchLiveStock();
      }
    })();
  }, [productId]);

  // ✅ Fetch live stock from vendor API
  const fetchLiveStock = async () => {
    setStockLoading(true);
    try {
      const { data, error } = await getLiveStock({
        url: `/users/check-live-stock`,
        method: "GET",
        params: { productId },
      });

      if (error) {
        console.warn("Live stock check failed:", error);
        // Set stock to 0 on error
        setLiveStockData({ stockBySize: [], totalStock: 0, error: true });
        return;
      }

      setLiveStockData(data?.data);
    } catch (err) {
      console.warn("Error checking live stock:", err);
      setLiveStockData({ stockBySize: [], totalStock: 0, error: true });
    } finally {
      setStockLoading(false);
    }
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
  if (!product) return [];

  const variantImages =
    product.variants?.flatMap((v) => v.images || []).filter(Boolean) || [];

  if (variantImages.length) return variantImages.slice(0, 6);

  if (product.product_img) return [product.product_img].slice(0, 6);

  return [];
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
    <section className="bg-white pb-20 md:pb-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-0">
          {productLoading ? (
            <>
              {/* Loading Skeleton */}
              <div className="w-full lg:w-[60%] p-4 lg:p-6">
                <Skeleton className="w-full aspect-[3/4] md:aspect-[4/5] rounded-2xl" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <Skeleton className="w-20 h-20 rounded-lg" />
                </div>
              </div>
              <div className="w-full lg:w-[40%] p-4 lg:p-6">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-8 w-3/4 rounded" />
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-6 w-5/6 rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                  <Skeleton className="h-12 w-1/2 rounded" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Gallery Section */}
              <ProductGallerySection
                images={images}
                productVideo={productVideo}
                product={product}
              />

              {/* Product Info Section */}
              <ProductInfoDetailsSection
                product={product}
                productLoading={productLoading}
                productError={productError}
                isAuthenticated={isAuthenticated}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                handleAddToCart={handleAddToCart}
                router={router}
                liveStockData={liveStockData}
                stockLoading={stockLoading}
              />
            </>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <AppAlertDialog
        visible={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        customHeader={
          <div className="text-2xl text-center font-semibold">{dialogMessage}</div>
        }
        customFooter={
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <CTAButton
              variant="outline"
              onClick={() => {
                router.back();
                setShowSuccessDialog(false);
              }}
              className="min-w-[180px]"
            >
              Continue Shopping
            </CTAButton>
            <CTAButton
              color="black"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/cart");
              }}
              className="min-w-[180px]"
            >
              Go to Cart
            </CTAButton>
          </div>
        }
      />
    </section>
  );
}
