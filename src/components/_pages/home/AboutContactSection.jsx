"use client";

import CTAButton from "@/components/_common/CTAButton";
import {
  selectBottomLeftBanner,
  selectBottomTopBanner,
} from "@/store/selectors/homeConfigSelectors";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import NewsletterForm from "./NewsletterForm";

export default function AboutContactSection() {
  const bottomTopBanner = useSelector(selectBottomTopBanner);
  const bottomLeftBanner = useSelector(selectBottomLeftBanner);

  const hasTopBanner = bottomTopBanner?.media_url;
  const hasLeftBanner = bottomLeftBanner?.media_url;

  return (
    <section className="w-full">
      {/* =======================================================
         🔹 FULL WIDTH MARQUEE BANNER (bottomTopBanner)
      ======================================================= */}
      <div className="relative w-full max-w-[1425px] mx-auto aspect-[1425/490] overflow-hidden">
        {hasTopBanner ? (
          <Image
            src={bottomTopBanner.media_url}
            alt={bottomTopBanner.title ?? "Banner"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <Image
            src="/assets/images/full-banner-2.jpg"
            alt="Fallback Banner"
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Marquee */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 overflow-hidden whitespace-nowrap z-10 pointer-events-none">
          <div className="flex animate-marquee">
            <span className="marquee-text">
              {bottomTopBanner?.title ??
                "Welcome to Aayeu - Explore the Adventure"}
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================
         🔹 SPLIT SECTION: LEFT = bottomLeftBanner
         🔹 RIGHT = Newsletter
      ======================================================= */}
      <div className="flex flex-col lg:flex-row">
        {/* ---------------- LEFT BLOCK ---------------- */}
        <div
          className="relative flex flex-col justify-center text-center text-white min-h-[500px] lg:min-h-[695px] flex-1 p-8"
          style={{
            backgroundImage: hasLeftBanner
              ? `url(${bottomLeftBanner.media_url})`
              : `url('/assets/images/footer-1.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {bottomLeftBanner?.title ?? "Adventure Pass, Aayeu's Club"}
            </h2>
          </div>

          <div className="relative z-10 mt-6 lg:mt-auto">
            {bottomLeftBanner?.button_text ? (
              <CTAButton
                color="gold"
                className="mb-4"
                as="link"
                href={bottomLeftBanner.link_url ?? "#"}
              >
                {bottomLeftBanner.button_text}
              </CTAButton>
            ) : (
              <CTAButton color="gold" className="mb-4">
                DISCOVER THE CLUB
              </CTAButton>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT BLOCK (Newsletter) ---------------- */}
        <div className="relative flex flex-col justify-center text-center text-white min-h-[500px] lg:min-h-[695px] flex-1 bg-[url('/assets/images/footer-2.jpg')] bg-cover bg-center p-8">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Sign up to our newsletter and get a 10% discount
            </h2>
          </div>

          {/* ---------------- Newsletter Form with RHF ---------------- */}
          <NewsletterForm />
        </div>
      </div>

      {/* ---------------- marquee CSS ---------------- */}
      <style jsx>{`
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
        .marquee-text {
          font-size: clamp(16px, 4vw, 70px);
          font-weight: bold;
          color: white;
          text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
          padding-right: 4vw;
          white-space: nowrap;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
