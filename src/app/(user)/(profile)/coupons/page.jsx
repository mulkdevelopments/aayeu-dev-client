"use client";

import CouponCard from "@/components/_cards/CouponCard";
import React from "react";

const coupons = [
  {
    code: "SAVE20",
    description: "Get 20% off on orders above AED 999",
    validTill: "31 July 2025",
    img: "https://placehold.co/300x80?text=Image",
  },
  {
    code: "FREESHIP",
    description: "Free shipping on your next order",
    validTill: "15 August 2025",
    img: "https://placehold.co/300x80?text=Image",
  },
  {
    code: "EXTRA50",
    description: "Flat AED 50 off on prepaid orders",
    validTill: "30 September 2025",
    img: "https://placehold.co/300x80?text=Image",
  },
];

export default function CouponsPage() {
  return (
    <div className="col-span-9">
      {/* Header */}
      <div className="bg-white p-4 mb-3 border">
        <h5 className="second-level mb-0">My Coupons</h5>
      </div>

      {/* Coupon Cards */}
      <div className="flex flex-col gap-4">
        {coupons.map((coupon, idx) => (
          <CouponCard key={idx} coupon={coupon} />
        ))}
      </div>
    </div>
  );
}
