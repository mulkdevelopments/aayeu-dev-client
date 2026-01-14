// components/TopStrip.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopStrip({ message, href = "#", className = "" }) {
  const displayMessage =
    message || "WELCOME OFFER FOR FIRST ORDER · 10% OFF · CODE: WELCOME10";

  const [isDark, setIsDark] = useState(true);

  // Auto switch every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDark((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`
        w-full transition-colors duration-500
        ${isDark ? "bg-black text-white" : "bg-white text-black"}
        ${className}
      `}
    >
      <div className="px-3 py-2 flex items-center justify-center text-center">
        <Link
          href={href}
          className="
            text-[10px] sm:text-xs md:text-sm
            font-medium uppercase
            tracking-widest
            leading-relaxed
            hover:opacity-70
            transition
          "
        >
          {displayMessage}
        </Link>
      </div>
    </div>
  );
}
