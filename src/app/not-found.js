"use client";

import React from "react";
import CTAButton from "@/components/_common/CTAButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <section className="space-y-6">
          <div className="text-left">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900">
              404
            </h1>
            <p className="mt-3 text-xl md:text-2xl font-medium text-gray-600">
              Page not found — looks like this one wandered off the rack.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            The page you’re looking for doesn’t exist or has been moved. Here
            are quick ways to continue shopping.
          </p>

          <div className="flex gap-3 flex-wrap">
            <CTAButton as="link" href="/">
              Home
            </CTAButton>

            <CTAButton as="link" href="/shop" color="gold">
              Shop
            </CTAButton>
          </div>
        </section>
      </main>
    </div>
  );
}
