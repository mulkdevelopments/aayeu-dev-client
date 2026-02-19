"use client";

import useAxios from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ITEMS = [
  { question: "How do I place an order?", answer: "Add items to your cart, review your selection, and complete checkout using your preferred payment method." },
  { question: "Can I change or cancel my order?", answer: "If your order has not shipped, contact us as soon as possible and we will do our best to help." },
  { question: "Do you offer international shipping?", answer: "Yes, we ship to many regions. Shipping options and costs will appear at checkout." },
  { question: "How do returns work?", answer: "Please review our Returns Policy. If eligible, our team will guide you through the return process." },
];

export default function FAQsPage() {
  const { request } = useAxios();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const { data, error } = await request({
          method: "GET",
          url: "/users/get-page-content",
          params: { key: "faq" },
        });
        if (!error && data?.data?.content) setContent(data.data.content);
      } catch (err) {
        console.error("FAQ fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const introText = content?.intro_text || "Find quick answers to common questions. Need more help? Email us at help@aayeu.com.";
  const contactEmail = content?.contact_email || "help@aayeu.com";
  const items = Array.isArray(content?.items) && content.items.length
    ? content.items.filter((i) => i.question?.trim() || i.answer?.trim())
    : DEFAULT_ITEMS;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">FAQs</h1>
      <p className="text-base md:text-lg text-gray-700 mb-8">
        {introText}
        {introText.includes(contactEmail) ? "" : ` Email us at ${contactEmail}.`}
      </p>

      <div className="space-y-4">
        {items.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h2>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
