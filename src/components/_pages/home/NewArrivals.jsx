"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useHomeConfig from "@/hooks/useHomeConfig";
import { useEffect, useState, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const INITIAL_LIMIT = 4;
const NEXT_PAGE_LIMIT = 4;

export default function NewArrivals() {
  const { newArrivals, fetchNewArrivals } = useHomeConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreSentinelRef = useRef(null);

  // Initial load: 4 items
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    setHasMore(true);
    fetchNewArrivals({ limit: INITIAL_LIMIT, page: 1 })
      .then((res) => {
        if (res?.data?.length !== undefined)
          setHasMore(res.data.length >= INITIAL_LIMIT);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Load next page when sentinel is visible (user scrolled near end)
  const loadNext = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchNewArrivals({ limit: NEXT_PAGE_LIMIT, page: nextPage, append: true })
      .then((res) => {
        const count = res?.data?.length ?? 0;
        setHasMore(count >= NEXT_PAGE_LIMIT);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, fetchNewArrivals]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext();
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNext]);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-neutral-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header Skeleton */}
          <div className="mb-8 md:mb-12">
            <Skeleton className="h-10 w-64 mb-2" />
          </div>

          {/* Single horizontal row skeleton */}
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 scrollbar-thin">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-[45vw] sm:w-56 md:w-64 lg:w-72 flex flex-col">
                <Skeleton className="aspect-[3/4] w-full mb-3" />
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show active, non-deleted products
  const items = (newArrivals || []).filter((item) => {
    const p = item?.product ?? item;
    return p && p.deleted_at == null && p.is_active !== false;
  });

  if (!items.length) return null;

  return (
 <section className="py-8 md:py-16 bg-neutral-50 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 text-start">
          <div className="inline-block">
            <h2
              className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight text-black leading-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              New in: Latest Arrivals
            </h2>
            {/* <div className="mt-2 md:mt-3 h-1 w-20 md:w-24 mx-auto bg-black rounded-full animate-pulse"></div> */}
          </div>
        </div>

        {/* Single horizontal row — scroll to see all; load more when sentinel visible */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[45vw] sm:w-56 md:w-64 lg:w-72">
              <ProductCard product={item?.product || item} />
            </div>
          ))}
          {hasMore && (
            <div
              ref={loadMoreSentinelRef}
              className="flex-shrink-0 w-1 min-w-[1px] h-1 self-center"
              aria-hidden
            />
          )}
          {loadingMore &&
            [...Array(NEXT_PAGE_LIMIT)].map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="flex-shrink-0 w-[45vw] sm:w-56 md:w-64 lg:w-72 flex flex-col"
              >
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
