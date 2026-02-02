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
                color="black"
                className="mb-4"
                as="link"
                href={bottomLeftBanner.link_url ?? "#"}
              >
                {bottomLeftBanner.button_text}
              </CTAButton>
            ) : (
              <CTAButton color="black" className="mb-4">
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
          {/* <NewsletterForm /> */}
        </div>
      </div>

      {/* =======================================================
         🔹 HELP SECTION - 3 Cards
      ======================================================= */}
      <div className="bg-white py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            {/* HOW TO SHOP Card */}
            <a
              href="/how-to-shop"
              className="group border border-gray-200 p-6 md:p-8 hover:border-black transition-colors duration-300"
            >
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2 text-black"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                HOW TO SHOP
              </h3>
              <p className="text-sm text-gray-600">
                Your guide to shopping and placing orders
              </p>
            </a>

            {/* FAQS Card */}
            <a
              href="/faqs"
              className="group border border-gray-200 p-6 md:p-8 hover:border-black transition-colors duration-300"
            >
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2 text-black"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                FAQS
              </h3>
              <p className="text-sm text-gray-600">
                Your questions answered
              </p>
            </a>

            {/* NEED HELP Card */}
            <a
              href="mailto:help@aayeu.com"
              className="group border border-gray-200 p-6 md:p-8 hover:border-black transition-colors duration-300"
            >
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg font-semibold mb-2 text-black"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                NEED HELP?
              </h3>
              <p className="text-sm text-gray-600">
                Contact our global Customer Service team
              </p>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
