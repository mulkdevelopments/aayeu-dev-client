"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useHomeConfig from "@/hooks/useHomeConfig";
import { useEffect } from "react";

export default function NewArrivals() {
  const { newArrivals, fetchNewArrivals } = useHomeConfig();

  useEffect(() => {
   const data = fetchNewArrivals();
  }, []);

  if (!newArrivals?.length) return null;

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-white via-amber-50/20 to-emerald-50/30 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="inline-block">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black">
              New Arrivals
            </h2>
            {/* <div className="mt-2 md:mt-3 h-1 w-20 md:w-24 mx-auto bg-black rounded-full animate-pulse"></div> */}
          </div>
        </div>

        {/* Products Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-3 pb-4">
            {newArrivals.slice(0, 4).map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[240px]">
                <ProductCard product={item?.product || item} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid - Hidden on Mobile */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item?.product || item} />
          ))}
        </div>
      </div>
    </section>
  );
}
