"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/_cards/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getRecentlyViewed,
  entryToProductCardShape,
  RECENTLY_VIEWED_EVENT,
} from "@/utils/recentlyViewed";

const MAX_PRODUCTS = 12;
const ITEMS_PER_PAGE = 4;

function ChevronNavButton({ direction, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      {direction === "prev" ? (
        <ChevronLeft className="h-5 w-5" aria-hidden />
      ) : (
        <ChevronRight className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}

export default function RecentlyViewedSection({ excludeProductId = null }) {
  const [entries, setEntries] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

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

  const cappedItems = useMemo(
    () => products.slice(0, MAX_PRODUCTS),
    [products]
  );

  const pageCount = useMemo(() => {
    const n = cappedItems.length;
    if (n <= 0) return 1;
    return Math.max(1, Math.ceil(n / ITEMS_PER_PAGE));
  }, [cappedItems.length]);

  useEffect(() => {
    setSlideIndex((i) => Math.min(i, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const visibleItems = useMemo(() => {
    const start = slideIndex * ITEMS_PER_PAGE;
    return cappedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [cappedItems, slideIndex]);

  const goNext = () => {
    setSlideIndex((prev) => (prev + 1) % pageCount);
  };

  const goPrev = () => {
    setSlideIndex((prev) => (prev - 1 + pageCount) % pageCount);
  };

  const goToPage = (index) => {
    if (index < 0 || index >= pageCount) return;
    setSlideIndex(index);
  };

  const showCarouselNav = pageCount > 1;

  if (!mounted || !cappedItems.length) return null;

  return (
    <section
      className="w-full bg-white py-12 md:py-16 border-t border-gray-100"
      aria-label="Recently viewed products"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-row items-start justify-between gap-3 sm:gap-6 sm:items-end">
          <h2
            className="min-w-0 flex-1 pr-1 text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-light text-black text-left leading-[1.15] sm:leading-tight tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Recently viewed
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-stretch gap-3 md:gap-4">
            {showCarouselNav && (
              <div className="hidden sm:flex items-center">
                <ChevronNavButton
                  direction="prev"
                  onClick={goPrev}
                  label="Previous products"
                />
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                role="list"
              >
                {visibleItems.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0"
                    role="listitem"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {showCarouselNav && (
              <div className="hidden sm:flex items-center">
                <ChevronNavButton
                  direction="next"
                  onClick={goNext}
                  label="Next products"
                />
              </div>
            )}
          </div>

          {showCarouselNav && (
            <div className="flex sm:hidden items-center justify-between gap-3">
              <ChevronNavButton
                direction="prev"
                onClick={goPrev}
                label="Previous products"
              />
              <ChevronNavButton
                direction="next"
                onClick={goNext}
                label="Next products"
              />
            </div>
          )}

          {showCarouselNav && (
            <div className="flex justify-center">
              <div
                className="flex gap-2"
                role="tablist"
                aria-label="Recently viewed pages"
              >
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === slideIndex}
                    aria-label={`Page ${index + 1} of ${pageCount}`}
                    onClick={() => goToPage(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === slideIndex
                        ? "w-8 bg-black"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
