"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useHomeConfig from "@/hooks/useHomeConfig";
import { useEffect } from "react";

export default function NewArrivals() {
  const { newArrivals, fetchNewArrivals } = useHomeConfig();

  useEffect(() => {
    fetchNewArrivals(); // cached / API called only once
  }, []);

  if (!newArrivals?.length) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-3xl font-light">New Arrivals</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item?.product || item} />
          ))}
        </div>
      </div>
    </section>
  );
}
