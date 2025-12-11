"use client";

import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { slugifyProductName } from "@/utils/seoHelpers";
import STATIC from "@/utils/constants";

export default function SearchResults({
  results = [],
  loading = false,
  query = "",
  onClose,
}) {
  const skeletonCount = 5; // how many skeleton items to show while loading

  return (
    <div className="absolute right-0 top-full w-[400px] bg-white border shadow-lg mt-2 z-[100] max-h-[70vh] overflow-auto rounded-md">
      {/* 🕐 Loading State */}
      {loading ? (
        <ul className="divide-y divide-gray-100 p-3 animate-pulse">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-[50px] h-[50px] rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-3 w-[40%]" />
              </div>
            </li>
          ))}
        </ul>
      ) : !query.trim() ? (
        <div className="p-4 text-center text-gray-400 text-sm">
          Type to search for products
        </div>
      ) : results.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {results.map((item) => (
            <li key={item.id}>
              <Link
                href={`/shop/product/${slugifyProductName(item.name)}/${
                  item.id
                }`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
              >
                <Image
                  src={
                    item.media?.[0]?.url || item.product_img || STATIC.IMAGES.IMAGE_NOT_AVAILABLE
                  }
                  alt={item.name}
                  width={50}
                  height={50}
                  className="object-cover w-[50px] h-[50px] rounded-md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.name}
                  </p>
                  {/* <p className="text-xs text-gray-500 line-clamp-1">
                    {item.category || "Uncategorized"}
                  </p> */}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">
          No results found for{" "}
          <span className="font-medium text-gray-800">{query}</span>
        </div>
      )}
    </div>
  );
}
