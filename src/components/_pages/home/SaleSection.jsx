"use client";

import CTAButton from "@/components/_common/CTAButton";
import useHomeConfig from "@/hooks/useHomeConfig";
import Link from "next/link";
import { useEffect } from "react";

export default function SaleSection() {
  const { saleSection, fetchSaleSection } = useHomeConfig();

  useEffect(() => {
    // Fetch only if RTK has no data
    if (!saleSection) {
      fetchSaleSection(); // Smart cache → only http request if needed
    }
  }, [saleSection]);

  console.log(saleSection);

  // 🔄 No items case
  if (!saleSection || saleSection.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-light mb-6">Sale</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5">
          {saleSection.map((item, idx) => (
            <Link
              key={idx}
              className="relative cursor-pointer overflow-hidden group"
              href={item.product_redirect_url || "/shop"}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                <span className="text-lg font-semibold mb-2 group-hover:-translate-y-4 transition-transform duration-300">
                  {item.discount_text || item.title}
                </span>

                <CTAButton className="bg-white text-black rounded-full px-4 py-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white">
                  Shop Now
                </CTAButton>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
