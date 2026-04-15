"use client";

import { useSearchParams } from "next/navigation";
import ProductsListGrid from "@/components/_pages/product/ProductsListGrid";

export default function SearchPage() {
  const searchParams = useSearchParams();

  // Extract "query" param: /search?query=hoodie
  const query = searchParams.get("query") || "";

  // normalize param key if someone uses "?q="
  const q = query.trim() || searchParams.get("q")?.trim() || "";

  return (
    <ProductsListGrid
      key={q}
      searchQuery={q}
      showCategoryFilters={false}
      categoryId={null}
      categorySlug={null}
    />
  );
}
