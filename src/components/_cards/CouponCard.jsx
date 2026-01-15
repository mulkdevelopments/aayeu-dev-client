"use client";

import React from "react";
import CTAButton from "../_common/CTAButton";

export default function CouponCard({ coupon }) {
  return (
    <div className="coupon-card border p-4 flex flex-wrap justify-between items-start">
      {/* Details */}
      <div className="coupon-details w-full sm:w-2/5 mb-2 sm:mb-0">
        <div className="coupon-code third-level font-medium text-[#c38e1e]">
          {coupon.code}
        </div>
        <p className="mb-1 third-level">{coupon.description}</p>
        <small className="fourth-level text-gray-600">
          Valid till: {coupon.validTill}
        </small>
      </div>

      {/* Image */}
      <div className="coupon-image w-full sm:w-2/5 mb-2 sm:mb-0 flex justify-center">
        <img
          src={coupon.img}
          alt={coupon.code}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Apply Button */}
      <div className="coupon-action w-full sm:w-1/8 flex justify-center items-start">
        <CTAButton color="black" className="mt-2 px-4 py-1 w-full">
          Apply
        </CTAButton>
      </div>
    </div>
  );
}
