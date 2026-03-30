"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useHomeConfig from "@/hooks/useHomeConfig";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function BestSellers() {
  const { bestSellers, fetchBestSellers } = useHomeConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSlideIndex(0);
    fetchBestSellers({ limit: MAX_PRODUCTS, page: 1 }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // fetchBestSellers is stable (useHomeConfig + useAxios); run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid refetch loops from effect churn
  }, []);

  const items = useMemo(
    () =>
      (bestSellers || []).filter((item) => {
        const p = item?.product ?? item;
        return p && p.deleted_at == null && p.is_active !== false;
      }),
    [bestSellers]
  );

  const cappedItems = useMemo(
    () => items.slice(0, MAX_PRODUCTS),
    [items]
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

  if (isLoading) {
    return (
      <section className="w-full bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mb-8 flex flex-row items-start justify-between gap-3 sm:gap-6 sm:items-end">
            <Skeleton className="h-9 sm:h-10 flex-1 max-w-[min(100%,20rem)] mb-0" />
            <Skeleton className="h-10 w-[7.25rem] shrink-0" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex flex-col">
                <Skeleton className="aspect-[3/4] w-full mb-3 rounded-md" />
                <Skeleton className="h-3 w-20 mb-1 rounded" />
                <Skeleton className="h-4 w-32 mb-1 rounded" />
                <Skeleton className="h-4 w-full mb-2 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cappedItems.length) return null;

  return (
    <section className="w-full bg-white py-12 md:py-16" aria-label="Trending products">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-row items-start justify-between gap-3 sm:gap-6 sm:items-end">
          <h2
            className="min-w-0 flex-1 pr-1 text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-light text-black text-left leading-[1.15] sm:leading-tight tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Trending: Most Loved Pieces
          </h2>
          <Link
            href="/shop/best-sellers"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            Show more
          </Link>
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
                {visibleItems.map((item) => (
                  <div
                    key={item.best_seller_id ?? item.id ?? item?.product?.id}
                    className="min-w-0"
                    role="listitem"
                  >
                    <ProductCard product={item?.product ?? item} />
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
                aria-label="Best sellers pages"
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
