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
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-10 md:py-14 lg:py-16">
        <h2
          className="text-sm md:text-base font-normal text-gray-900 tracking-tight text-left mb-6 md:mb-10"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Brands of the moment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
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
                className="group relative block w-full aspect-[3/4] overflow-hidden bg-neutral-100"
              >
                <Image
                  src={item.image_url}
                  alt={label || "Brand"}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
                  aria-hidden
                />
                <span
                  className="absolute bottom-4 left-4 right-4 text-left text-white text-sm md:text-base font-normal drop-shadow-sm"
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
