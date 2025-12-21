// components/TopStrip.jsx
"use client";

import Link from "next/link";

export default function TopStrip({ message, href, className }) {
  const displayMessage = message || "WELCOME DISCOUNTS FOR THE FIRST ORDER · 10% OFF CODE: WELCOME10";

  return (
    <div
      className={`w-full text-white relative overflow-hidden ${className || ""}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,215,122,0.15), transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(212,175,55,0.12), transparent 50%),
          linear-gradient(90deg, #1a1614, #2a2420, #1a1614)
        `,
      }}
    >
      {/* Premium gold shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD77A]/30 to-transparent animate-[shine_8s_linear_infinite]" />

      {/* Subtle texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(rgba(255,215,122,0.6)_1px,transparent_1px)] bg-[length:6px_6px]" />

      {/* Scrolling content */}
      <div className="relative z-10 py-2.5 flex whitespace-nowrap">
        <div className="animate-[scroll_20s_linear_infinite] flex items-center gap-8">
          {[...Array(3)].map((_, i) => (
            <Link
              key={i}
              href={href || "#"}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase
                bg-gradient-to-r from-[#FFD77A] via-[#F5E6A8] to-[#FFD77A] bg-clip-text text-transparent
                hover:from-white hover:via-[#FFD77A] hover:to-white transition-all duration-500"
            >
              <span className="text-[#D4AF37]">✦</span>
              {displayMessage}
              <span className="text-[#D4AF37]">✦</span>
            </Link>
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div className="animate-[scroll_20s_linear_infinite] flex items-center gap-8">
          {[...Array(3)].map((_, i) => (
            <Link
              key={`dup-${i}`}
              href={href || "#"}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase
                bg-gradient-to-r from-[#FFD77A] via-[#F5E6A8] to-[#FFD77A] bg-clip-text text-transparent
                hover:from-white hover:via-[#FFD77A] hover:to-white transition-all duration-500"
            >
              <span className="text-[#D4AF37]">✦</span>
              {displayMessage}
              <span className="text-[#D4AF37]">✦</span>
            </Link>
          ))}
        </div>
      </div>

      {/* keyframes */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
