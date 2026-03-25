"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/_cards/ProductCard";
import useAxios from "@/hooks/useAxios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const PAGE_LIMIT = 24;

function normalizeItems(payload) {
  const raw = Array.isArray(payload) ? payload : payload?.items ?? [];
  return raw.filter((item) => {
    const p = item?.product ?? item;
    return p && p.deleted_at == null && p.is_active !== false;
  });
}

export default function NewArrivalsAllPage() {
  const { request, loading } = useAxios();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialDone, setInitialDone] = useState(false);

  const fetchPage = useCallback(
    async (nextPage, append) => {
      const { data, error } = await request({
        method: "GET",
        url: "/users/get-active-new-arrivals",
        params: { limit: PAGE_LIMIT, page: nextPage },
      });
      if (error) {
        if (!append) setItems([]);
        return;
      }
      const batch = normalizeItems(data?.data);
      if (append) {
        setItems((prev) => [...prev, ...batch]);
      } else {
        setItems(batch);
      }
      setHasMore(batch.length >= PAGE_LIMIT);
    },
    [request]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPage(1);
      await fetchPage(1, false);
      if (!cancelled) setInitialDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    await fetchPage(next, true);
    setPage(next);
    setLoadingMore(false);
  };

  const showEmpty = initialDone && items.length === 0;

  if (!initialDone && items.length === 0) {
    return (
      <div className="w-full bg-neutral-50 py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mb-6 sm:mb-8 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 sm:h-10 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-[3/4] w-full mb-3 rounded-md" />
                <Skeleton className="h-3 w-20 mb-1 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-50 py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-3 sm:mb-4 -ml-0.5"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="leading-none pt-0.5">Back to shop</span>
          </Link>
          <h1
            className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-light text-black text-left leading-[1.15] sm:leading-tight tracking-tight max-w-[min(100%,42rem)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            New in: Latest Arrivals
          </h1>
        </div>

        {showEmpty ? (
          <p className="text-gray-600 text-center py-16">No new arrivals right now.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {items.map((item) => (
                <div
                  key={item.id ?? item?.product?.id}
                  className="min-w-0"
                >
                  <ProductCard product={item?.product ?? item} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 sm:mt-10 flex justify-center px-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full max-w-sm sm:w-auto sm:min-w-[160px] border-2 border-black text-black hover:bg-black hover:text-white"
                  disabled={loadingMore || loading}
                  onClick={loadMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
