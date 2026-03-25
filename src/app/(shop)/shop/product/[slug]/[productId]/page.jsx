"use client";

import NewArrivals from "@/components/_pages/home/NewArrivals";
import RecentlyViewedSection from "@/components/_pages/home/RecentlyViewedSection";
import ProductInfoSection from "@/components/_pages/product-details/ProductInfoSection";
import ProductReviewsSection from "@/components/_pages/product-details/ProductReviewsSection";
import SimilarProductsSection from "@/components/_pages/product-details/SimilarProductsSection";
import React from "react";
import { useParams } from "next/navigation";

function ProductDetailsPage() {
  const { productId } = useParams();

  return (
    <div className="font-[poppins]">
      <ProductInfoSection />
      {/* <BenefitsSection /> */}
      <ProductReviewsSection />
      <SimilarProductsSection />
      <NewArrivals title="New Arrivals" />
      <RecentlyViewedSection excludeProductId={productId} />
      {/* Tiny utilities to match original CSS where Tailwind lacks a utility */}
      <style>{`
        .no-scrollbar{ scrollbar-width:none; -ms-overflow-style:none; }
        .no-scrollbar::-webkit-scrollbar{ display:none; }
      `}</style>
    </div>
  );
}

export default ProductDetailsPage;
