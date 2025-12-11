"use client";

import ProductsListGrid from "@/components/_pages/product/ProductsListGrid";
import { useParams } from "next/navigation";

export default function CategoryShopPage() {
  const params = useParams();
  const segments = params?.category || [];
  const last = segments[segments.length - 1];
  const secondLast = segments[segments.length - 2];
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      last
    );

  const categoryId = isUUID ? last : null;
  const slug = isUUID ? secondLast : last;

  return (
    <ProductsListGrid
      categoryId={categoryId}
      categorySlug={slug}
      showCategoryFilters
    />
  );
}
