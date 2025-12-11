"use client";

import React from "react";
import CTAButton from "../_common/CTAButton";
import Link from "next/link";
import { slugifyProductName } from "@/utils/seoHelpers";
import useWishlist from "@/hooks/useWishlist";

function WishlistCard({ item, onRemove, onAddToBag }) {
  if (!item) return null;

  const { product_id, snap_name, snap_brand_name, snap_image, snap_min_price } =
    item;

  const { toggleWishlist } = useWishlist();

  return (
    <div className="bg-white overflow-hidden flex flex-col transition">
      {/* Image */}
      <img
        src={snap_image}
        alt={snap_name}
        className="h-56 w-full object-contain p-4 bg-white"
      />

      {/* Details */}
      <div className="px-4 pb-4 flex-1">
        {/* Brand */}

        <h6 className="text-[16px] text-gray-500 font-light">
          {snap_brand_name || "Brand"}
        </h6>

        {/* Name */}
        <Link
          href={`/shop/product/${slugifyProductName(snap_name)}/${product_id}`}
          className="hover:underline"
        >
          <p className="text-sm mb-1 line-clamp-2">{snap_name}</p>
        </Link>

        {/* Price */}
        <div className="text-gray-900 text-sm font-medium">
          AED {Number(snap_min_price) || "N/A"}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <CTAButton
          variant="ghost"
          color="danger"
          className={"w-full hover:underline"}
          onClick={() => toggleWishlist(product_id)}
        >
          Remove
        </CTAButton>

        {/* <CTAButton color="gold" onClick={() => onAddToBag(item)}>
          Add to Bag
        </CTAButton> */}
      </div>
    </div>
  );
}

export default WishlistCard;
