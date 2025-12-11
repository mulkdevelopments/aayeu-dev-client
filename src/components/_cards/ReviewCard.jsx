"use client";

import { Star, BadgeCheck } from "lucide-react";
import dayjs from "dayjs";

/* ⭐ STAR DISPLAY COMPONENT */
const Stars = ({ count = 0, size = 18 }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={
          i <= count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
      />
    ))}
  </div>
);

/* ⭐ REVIEW CARD */
export default function ReviewCard({ review }) {
  const { user_name, rating, review_text, verified_buyer, images, created_at } =
    review;

  const formattedDate = created_at
    ? dayjs(created_at).format("DD MMM YYYY")
    : "";

  return (
    <div className="border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">
            {user_name || "Anonymous User"}
          </h4>

          {/* Verified Buyer */}
          {verified_buyer && (
            <div className="flex items-center text-green-600 text-xs mt-1">
              <BadgeCheck size={14} className="mr-1" />
              Verified Buyer
            </div>
          )}
        </div>

        {/* Rating Stars */}
        <Stars count={rating} />
      </div>

      {/* Date */}
      <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>

      {/* Review Text */}
      <p className="text-sm text-gray-700 mt-3 leading-relaxed">
        {review_text}
      </p>

      {/* Review Images */}
      {Array.isArray(images) && images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`review-img-${index}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>
      )}
    </div>
  );
}
