"use client";

import useAxios from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_STEPS = [
  { title: "1. Browse Collections", text: "Explore categories, use filters, and discover brands across our curated selection." },
  { title: "2. Select Your Item", text: "Choose size, color, and quantity on the product page. Review product details and images before adding to cart." },
  { title: "3. Checkout Securely", text: "Proceed to cart, confirm your order details, and complete payment using our secure checkout." },
  { title: "4. Track Your Order", text: "After purchase, track your order status in your account and watch for delivery updates." },
];

export default function HowToShopPage() {
  const { request } = useAxios();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await request({
          method: "GET",
          url: "/users/get-page-content",
          params: { key: "how_to_shop" },
        });
        if (!error && data?.data?.content) setContent(data.data.content);
      } catch (err) {
        console.error("How to shop fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const title = content?.title || "How to Shop";
  const subtitle = content?.subtitle || "Discover curated luxury and shop with confidence. Follow these simple steps to find, select, and purchase your items.";
  const steps = Array.isArray(content?.steps) && content.steps.length
    ? content.steps.filter((s) => s.title?.trim() || s.text?.trim())
    : DEFAULT_STEPS;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">{title}</h1>
      <p className="text-base md:text-lg text-gray-700 mb-8">{subtitle}</p>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-sm text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
