"use client";

import React, { useEffect } from "react";
import WishlistCard from "@/components/_cards/WishlistCard";
import CTAButton from "@/components/_common/CTAButton";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistsPage() {
  const { items, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <main className="md:col-span-9">
      <div className="grid grid-cols-3 items-center mb-6">
        <div className="text-left">
          <CTAButton as="link" href="/profile-overview" color="gold">
            Back
          </CTAButton>
        </div>
        <h1 className="text-center text-2xl font-light">My Wishlist</h1>
        <div className="text-right">
          <CTAButton as="link" href="/cart" color="gold">
            Go to Cart
          </CTAButton>
        </div>
      </div>

      {/* Wishlist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <WishlistCard key={item.product_id} item={item} />
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center p-10 space-y-4">
            <p className="text-gray-500">Your wishlist is empty.</p>
            <CTAButton as="link" href="/shop">
              Shop Now
            </CTAButton>
          </div>
        )}
      </div>
    </main>
  );
}
