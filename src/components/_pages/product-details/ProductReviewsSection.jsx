"use client";

import useAxios from "@/hooks/useAxios";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReviewCard from "@/components/_cards/ReviewCard";

const Stars = ({ count = 0, size = 18 }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={
          i <= count ? "text-gray-900 fill-gray-900" : "text-gray-300"
        }
      />
    ))}
  </div>
);

const RatingRow = ({ star, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-12">
        <span className="text-xs text-gray-700">{star}</span>
        <Star size={12} className="text-gray-900 fill-gray-900" />
      </div>

      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-xs w-8 text-right text-gray-600">{count}</span>
    </div>
  );
};

export default function ProductReviewsSection() {
  const { productId } = useParams();
  const { request } = useAxios();

  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Fetch reviews */
  const fetchReviews = async () => {
    setLoading(true);

    const { data } = await request({
      url: `/users/get-reviews`,
      method: "GET",
      authRequired: false,
      params: { productId },
    });

    setReviews(data?.data?.reviews || []);
    setMeta(data?.data?.meta || {});
    setLoading(false);
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  return (
    <section className="relative w-full bg-white border-t border-gray-200 py-8 md:py-8">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-600">
            Customer Ratings
          </div>

          <div className="bg-white border border-gray-200 p-6">
            {/* Average Rating */}
            <div className="text-center mb-6">
              <p className="text-4xl font-semibold text-gray-900">
                {meta?.avg_rating ? meta.avg_rating.toFixed(1) : "--"}
              </p>

              <div className="flex justify-center mt-1">
                <Stars count={Math.round(meta?.avg_rating || 0)} />
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Based on {meta?.total || 0} reviews
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingRow
                  key={star}
                  star={star}
                  count={meta?.rating_counts?.[star] || 0}
                  total={meta?.total || 0}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4 text-[11px] uppercase tracking-[0.2em] text-gray-600">
            Customer Reviews
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-gray-600 text-center py-10">
              Loading reviews...
            </div>
          )}

          <div className="no-scrollbar max-h-[450px] overflow-y-auto pr-2 space-y-4">
            {!loading && reviews.length > 0
              ? reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              : !loading && (
                  <div className="text-gray-600 text-center py-10">
                    No reviews yet. Be the first to review!
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}
