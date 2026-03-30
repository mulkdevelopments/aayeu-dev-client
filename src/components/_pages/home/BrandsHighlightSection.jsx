"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useAxios from "@/hooks/useAxios";
import { shopBrandListingHref } from "@/utils/brandParam";

export default function BrandsHighlightSection() {
  const { request } = useAxios();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await request({
          url: "/users/get-brand-highlights",
          method: "GET",
        });
        if (cancelled) return;
        if (!error && data?.success) {
          setItems(Array.isArray(data?.data?.items) ? data.data.items : []);
        } else {
          setItems([]);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="w-full bg-white" aria-label="Brands of the moment">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8 sm:py-10 md:py-14 lg:py-16">
        <h2
          className="text-xs sm:text-sm md:text-base font-normal text-gray-900 tracking-tight text-left mb-4 sm:mb-6 md:mb-10 pr-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Brands of the moment
        </h2>

        {/* Mobile: horizontal snap scroll (peek next card); sm+: grid */}
        <div
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scroll-pl-4 scroll-pr-4 sm:scroll-p-0 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
          role="list"
        >
          {items.map((item) => {
            const href =
              item.link_url?.trim() || shopBrandListingHref(item.brand_name);
            const label =
              (item.display_label && String(item.display_label).trim()) ||
              item.brand_name;
            return (
              <Link
                key={item.id}
                href={href}
                role="listitem"
                className="group relative flex w-[min(78vw,280px)] flex-shrink-0 snap-center sm:w-full overflow-hidden bg-neutral-100 shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98] sm:active:scale-100 aspect-[3/4] sm:aspect-[3/4] min-h-[200px] touch-manipulation"
              >
                <Image
                  src={item.image_url}
                  alt={label || "Brand"}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] group-active:scale-[1.01]"
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:from-black/65 sm:via-black/25"
                  aria-hidden
                />
                <span
                  className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-left text-white text-xs sm:text-sm md:text-base font-medium sm:font-normal leading-snug drop-shadow-md line-clamp-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
