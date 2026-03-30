"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/_cards/ProductCard";
import {
  getRecentlyViewed,
  entryToProductCardShape,
  RECENTLY_VIEWED_EVENT,
} from "@/utils/recentlyViewed";

export default function RecentlyViewedSection({ excludeProductId = null }) {
  const [entries, setEntries] = useState([]);
  const [mounted, setMounted] = useState(false);

  const sync = () => {
    setEntries(getRecentlyViewed());
  };

  useEffect(() => {
    sync();
    setMounted(true);
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);
    return () => window.removeEventListener(RECENTLY_VIEWED_EVENT, sync);
  }, []);

  const products = useMemo(() => {
    const filtered = excludeProductId
      ? entries.filter((e) => String(e.id) !== String(excludeProductId))
      : entries;
    return filtered.map((e) => entryToProductCardShape(e)).filter(Boolean);
  }, [entries, excludeProductId]);

  if (!mounted || !products.length) return null;

  return (
    <section
      className="w-full bg-white py-8 md:py-14 border-t border-gray-100"
      aria-label="Recently viewed products"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-light text-black mb-6 text-left tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Recently viewed
        </h2>
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-thin">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[42vw] sm:w-56 md:w-64 lg:w-72 min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
