"use client";

import useAxios from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_STEPS = [
  { title: "1. Explore Our Curated Collections", text: "Browse our carefully selected range of luxury fashion and accessories." },
  { title: "2. Select Your Item", text: "Click on any product to view details, images, sizes, and pricing. Use our Size Guide to find the best fit." },
  { title: "3. Add to Cart", text: "Add the item to your cart and continue browsing or proceed to checkout." },
  { title: "4. Secure Checkout", text: "Review your items, enter shipping details, and complete your purchase. All prices and charges are clearly displayed." },
  { title: "5. Order Confirmation", text: "You'll receive a confirmation email with your purchase details." },
  { title: "6. Delivery", text: "Your order will be packaged and shipped. Tracking details are shared following shipment." },
  { title: "7. Need Help?", text: "Contact our support team at help@aayeu.com anytime." },
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

  const title = content?.title || "How to Shop on AAYEU";
  const subtitle = content?.subtitle || "A Simple, Seamless Luxury Shopping Experience";
  const introText = content?.intro_text;
  const steps = Array.isArray(content?.steps) && content.steps.length
    ? content.steps.filter((s) => s.title?.trim() || s.text?.trim())
    : DEFAULT_STEPS;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">{title}</h1>
      <p className="text-lg text-gray-700 mb-4">{subtitle}</p>
      {introText && (
        <p className="text-base text-gray-600 whitespace-pre-line mb-8">{introText}</p>
      )}

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h2>
            <div className="text-sm text-gray-600 whitespace-pre-line">{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
