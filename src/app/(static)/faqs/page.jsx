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

/** Render answer text with newlines and bullet lines preserved */
function AnswerText({ text }) {
  if (!text || typeof text !== "string") return null;
  return (
    <div className="text-sm text-gray-600 whitespace-pre-line">
      {text}
    </div>
  );
}

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
  const sections = Array.isArray(content?.sections) && content.sections.length > 0
    ? content.sections.filter((s) => s && (s.title?.trim() || (Array.isArray(s.items) && s.items.length)))
    : null;
  const legacyItems = Array.isArray(content?.items) && content.items.length
    ? content.items.filter((i) => i.question?.trim() || i.answer?.trim())
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">Frequently Asked Questions (FAQs)</h1>
      <p className="text-base md:text-lg text-gray-700 mb-8">
        {introText}
        {contactEmail && !introText.includes(contactEmail) ? ` Email us at ${contactEmail}.` : ""}
      </p>

      {sections ? (
        <div className="space-y-10">
          {sections.map((section, sectionIdx) => {
            const sectionNum = sectionIdx + 1;
            const items = Array.isArray(section.items) ? section.items.filter((i) => i.question?.trim() || i.answer?.trim()) : [];
            if (!section.title?.trim() && !items.length) return null;
            return (
              <section key={sectionIdx} className="border-b border-gray-200 pb-8 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {sectionNum}. {section.title || "FAQ"}
                </h2>
                <div className="space-y-4">
                  {items.map((faq, itemIdx) => (
                    <div key={itemIdx} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {sectionNum}.{itemIdx + 1} {faq.question}
                      </h3>
                      <AnswerText text={faq.answer} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {(legacyItems || DEFAULT_ITEMS).map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h2>
              <AnswerText text={faq.answer} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
