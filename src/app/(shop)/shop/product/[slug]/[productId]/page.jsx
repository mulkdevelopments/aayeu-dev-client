"use client";

import BenefitsSection from "@/components/_pages/product-details/BenefitsSection";
import ProductInfoSection from "@/components/_pages/product-details/ProductInfoSection";
import ProductReviewsSection from "@/components/_pages/product-details/ProductReviewsSection";
import SimilarProductsSection from "@/components/_pages/product-details/SimilarProductsSection";
import React from "react";

function ProductDetailsPage() {
  return (
    <div className="font-[poppins]">
      <ProductInfoSection />

      <BenefitsSection />

      <SimilarProductsSection />

      <ProductReviewsSection />

      {/* Tiny utilities to match original CSS where Tailwind lacks a utility */}
      <style>{`
        .no-scrollbar{ scrollbar-width:none; -ms-overflow-style:none; }
        .no-scrollbar::-webkit-scrollbar{ display:none; }
      `}</style>
    </div>
  );
}

export default ProductDetailsPage;
