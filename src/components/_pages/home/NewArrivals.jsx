"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useHomeConfig from "@/hooks/useHomeConfig";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewArrivals() {
  const { newArrivals, fetchNewArrivals } = useHomeConfig();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchNewArrivals().finally(() => setIsLoading(false));
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-neutral-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header Skeleton */}
          <div className="mb-8 md:mb-12">
            <Skeleton className="h-10 w-64 mb-2" />
          </div>

          {/* Mobile: 2-Column Grid Skeleton */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex flex-col">
                <Skeleton className="aspect-[3/4] w-full mb-3" />
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>

          {/* Desktop: 4-Column Grid Skeleton */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex flex-col">
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

  if (!newArrivals?.length) return null;

  return (
 <section className="py-8 md:py-16 bg-neutral-50 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 text-start">
          <div className="inline-block">
            <h2 className="text-2xl md:text-3xl lg:text-4xl  tracking-tight text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
              New in: Latest Arrivals
            </h2>
            {/* <div className="mt-2 md:mt-3 h-1 w-20 md:w-24 mx-auto bg-black rounded-full animate-pulse"></div> */}
          </div>
        </div>

        {/* Mobile: 2-Column Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {newArrivals.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item?.product || item} />
          ))}
        </div>

        {/* Desktop: 4-Column Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item?.product || item} />
          ))}
        </div>
      </div>
    </section>
  );
}
