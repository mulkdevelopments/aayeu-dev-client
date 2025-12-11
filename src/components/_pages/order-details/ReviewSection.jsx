"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, X } from "lucide-react";
import CTAButton from "@/components/_common/CTAButton";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";

/** ZOD VALIDATION */
const ReviewSchema = z.object({
  rating: z.number().min(1, "Select rating").max(5),
  reviewText: z.string().min(5, "Review too short").max(1000),
});

export default function ReviewSection({ order }) {
  const { request } = useAxios();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      reviewText: "",
    },
  });

  const [images, setImages] = useState([]);
  const MAX_IMAGES = 5;
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  /** 👉 Filter the selected product */
  const selectedItem = useMemo(() => {
    if (productId) {
      return order?.items?.find((item) => item.product?.id === productId);
    }
    return order?.items?.[0] || null;
  }, [order, productId]);

  const selectedProduct = selectedItem?.product || null;
  const selectedVariant = selectedItem?.variant || null;

  /** Image handling */
  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const next = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(next);
    clearErrors("images");
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateImages = () => {
    for (const f of images) {
      if (!f.type.startsWith("image/")) {
        setError("images", { message: "Only images allowed" });
        return false;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setError("images", { message: "Each image must be ≤ 5MB" });
        return false;
      }
    }
    clearErrors("images");
    return true;
  };

  /** Upload image */
  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const { data, error } = await request({
      url: "/upload/image",
      method: "POST",
      payload: form,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (error) return null;
    return data?.url;
  };

  /** Submit Review */
  const onSubmit = async (values) => {
    if (!validateImages()) return;

    try {
      let uploadedUrls = [];

      if (images.length > 0) {
        for (const file of images) {
          const url = await uploadImage(file);
          if (url) uploadedUrls.push(url);
        }
      }

      const payload = {
        productId,
        reviewText: values.reviewText,
        rating: values.rating,
        images: uploadedUrls,
      };

      const { data, error } = await request({
        url: "/users/add-review",
        method: "POST",
        payload: payload,
        authRequired: true,
      });

      if (error) {
        showToast("error", error || "Something went wrong");
        return;
      }

      showToast("success", data?.message || "Review submitted successfully!");
      reset({ rating: 0, reviewText: "" });
      setImages([]);
    } catch (err) {
      console.error(err);
      showToast("error", err || "Failed to submit review");
    }
  };

  // ⭐ Update URL when productId is missing so retention works
  useEffect(() => {
    if (!productId && order?.items?.length > 0) {
      const firstProductId = order.items[0].product?.id;

      if (firstProductId) {
        const url = new URL(window.location.href);
        url.searchParams.set("productId", firstProductId);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [productId, order]);

  return (
    <form
      id="review-section"
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border p-4"
    >
      <h5 className="text-lg font-medium mb-3">Write a Review</h5>

      {/* ⭐ SHOW SELECTED PRODUCT DETAILS */}
      {selectedProduct && (
        <div className="flex gap-3 p-3 mb-4 bg-gray-100">
          <div className="w-20 h-20 flex-shrink-0">
            <img
              src={
                selectedProduct.product_img ||
                selectedVariant?.images?.[0] ||
                "/assets/images/product-placeholder.webp"
              }
              className="w-full h-full object-cover rounded"
            />
          </div>

          <div className="flex-1">
            <h6 className="font-semibold text-gray-900">
              {selectedProduct.name}
            </h6>
            <p className="text-xs text-gray-500">
              SKU: {selectedVariant?.sku || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center space-x-2 mb-2">
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={24}
                  className={
                    s <= field.value
                      ? "text-yellow-500 fill-yellow-500 cursor-pointer"
                      : "text-gray-300 cursor-pointer"
                  }
                  onClick={() => field.onChange(s)}
                />
              ))}
            </div>
          )}
        />
      </div>
      {errors.rating && (
        <p className="text-red-600 text-sm mb-2">{errors.rating.message}</p>
      )}

      {/* Review text */}
      <div className="mb-3">
        <textarea
          {...register("reviewText")}
          rows={4}
          placeholder="Write your review here..."
          className={`w-full border rounded p-2 text-sm focus:outline-none ${
            errors.reviewText ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.reviewText && (
          <p className="text-red-600 text-sm">{errors.reviewText.message}</p>
        )}
      </div>

      {/* Image upload */}
      <div className="border rounded p-3 bg-gray-50 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-700">Upload Images (optional)</p>
          <p className="text-xs text-gray-500">
            {images.length}/{MAX_IMAGES}
          </p>
        </div>

        <input type="file" accept="image/*" multiple onChange={onFilesChange} />

        {errors.images && (
          <p className="text-red-600 text-sm mt-2">{errors.images.message}</p>
        )}

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  className="w-20 h-20 rounded object-cover border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <CTAButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </CTAButton>
      </div>
    </form>
  );
}
