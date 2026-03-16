"use client";

import ProductsListGrid from "@/components/_pages/product/ProductsListGrid";
import { useParams } from "next/navigation";

export default function CuratedCollectionPage() {
  const params = useParams();
  const slug = params?.slug;

  if (!slug) return null;

  return (
    <ProductsListGrid
      categoryId={null}
      categorySlug="Shop"
      showCategoryFilters={true}
      curatedSlug={slug}
    />
  );
}
