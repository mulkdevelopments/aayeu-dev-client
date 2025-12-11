"use client";

import useHomeConfig from "@/hooks/useHomeConfig";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductGridOverlay() {
  const { productOverlayHome, fetchProductOverlayHome } = useHomeConfig();

  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadOverlay = async () => {
      const res = await fetchProductOverlayHome();
      const data = res?.data ?? productOverlayHome ?? [];

      // Ensure final result is always an array
      setItems(Array.isArray(data) ? data : []);
    };

    loadOverlay();
  }, []);

  // No data? → Do not crash or render empty white space
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const {
            id,
            title,
            mrp,
            sale_price,
            product_image,
            product_redirect_url,
          } = item || {};

          const imageUrl = product_image || "/assets/images/fallback.jpg"; // fallback image

          const redirect = product_redirect_url || "#";

          return (
            <Link
              key={id}
              href={redirect}
              className="relative cursor-pointer group overflow-hidden"
            >
              {/* Image */}
              <img
                src={imageUrl}
                alt={title || "Product"}
                className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/assets/images/fallback.jpg";
                }}
              />

              {/* Overlay */}
              <div className="absolute bottom-0 left-0 w-full px-4 py-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                <div className="text-lg font-medium mb-1 line-clamp-1">
                  {title}
                </div>

                <div className="text-base font-semibold">
                  AED {sale_price ?? mrp ?? "-"}
                  {mrp && sale_price && mrp !== sale_price && (
                    <del className="opacity-70 ml-2 text-sm">AED {mrp}</del>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
