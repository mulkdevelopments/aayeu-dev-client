// components/TopStrip.jsx
"use client";

import Link from "next/link";

export default function TopStrip({ message, href, className }) {
  return (
    <div
      className={`bg-neutral-900 text-white text-center text-sm px-3 py-2 ${
        className || ""
      }`}
    >
      <Link href={href || "#"} className="text-white hover:underline">
        {message || "Shop the sale with up to 70% off"}
      </Link>
    </div>
  );
}
