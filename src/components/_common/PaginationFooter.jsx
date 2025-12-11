"use client";

import React from "react";
import CTAButton from "@/components/_common/CTAButton";

export default function PaginationFooter({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible)
        start = Math.max(1, end - maxVisible + 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPaginationNumbers();

  return (
    <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">
      <CTAButton
        variant="outline"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </CTAButton>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-3 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
              p === page
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      <CTAButton
        variant="outline"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </CTAButton>
    </div>
  );
}
