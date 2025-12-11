"use client";

import React from "react";
import Link from "next/link";
import CTAButton from "@/components/_common/CTAButton";

export default function RefundSection({ product }) {
  return (
    <>
      {/* ✅ Apply for Refund */}
      <div className="bg-white border p-4 mb-4">
        <h5 className="text-lg font-medium mb-3">Apply for Refund</h5>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Product Image or Video
            </label>
            <input type="file" className="block w-full text-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason / Remark
            </label>
            <textarea
              rows="3"
              placeholder="Write your reason here..."
              className="w-full border p-2 text-sm"
            />
          </div>
          <div className="flex items-start space-x-2">
            <input type="checkbox" id="refundTerms" required className="mt-1" />
            <label htmlFor="refundTerms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link
                href="/terms-and-condition"
                target="_blank"
                className="text-blue-600 underline"
              >
                Terms & Conditions
              </Link>
              .
            </label>
          </div>

          <CTAButton variant="solid" color="gold">
            Submit Refund Request
          </CTAButton>
        </form>
      </div>

      {/* ✅ Refund Details */}
      <div className="bg-white border p-4 mb-4">
        <h5 className="text-lg font-medium mb-3">Refund Details</h5>
        <div className="flex items-start gap-3">
          <img
            src={product?.product_img || "/assets/images/product-placeholder.webp"}
            alt="Refund"
            className="w-20"
          />
          <div className="text-sm text-gray-600 space-y-1">
            <p>Remark: Size mismatch and stitching issue</p>
            <p>Status: Under Review</p>
            <p>Payment Status: Under Review</p>
          </div>
        </div>
      </div>
    </>
  );
}
