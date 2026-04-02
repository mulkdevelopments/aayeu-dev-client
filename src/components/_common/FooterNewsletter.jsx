"use client";

import Link from "next/link";
import NewsletterForm from "../_pages/home/NewsletterForm";
import { Mail } from "lucide-react";

export default function FooterNewsletter() {
  return (
    <section
      className="relative border-t border-neutral-200/80 bg-gradient-to-b from-neutral-50 via-white to-white"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16">
          {/* Copy */}
          <div className="flex flex-1 flex-col justify-center lg:max-w-xl xl:max-w-2xl">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200/90 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 shadow-sm backdrop-blur-sm sm:text-xs">
              <Mail className="h-3.5 w-3.5 text-neutral-500" aria-hidden />
              Newsletter
            </div>
            <h2
              id="newsletter-heading"
              className="text-balance text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl md:text-[1.75rem] md:leading-snug lg:text-4xl"
            >
              Never miss a drop
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-neutral-600 sm:text-base sm:leading-relaxed md:mt-4 md:max-w-lg">
              Promotions, new arrivals, and restocks — curated for your inbox.
            </p>
          </div>

          {/* Form card */}
          <div className="w-full lg:flex lg:max-w-md lg:flex-col lg:justify-center xl:max-w-lg">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6 md:p-7 lg:shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500 sm:mb-5">
                Get updates
              </p>
              <NewsletterForm />
              <p className="mt-4 text-[11px] leading-relaxed text-neutral-500 sm:mt-5 sm:text-xs">
                By subscribing, you agree to receive marketing emails. You can
                unsubscribe at any time.                 See our{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-800"
                >
                  Terms
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
