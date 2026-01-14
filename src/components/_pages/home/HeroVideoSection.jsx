"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroVideoSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Hardcoded hero items
  const heroItems = [
    {
      title: "Refined Workwear Staples",
      description: "Dress for the year you want with refined workwear staples from Brunello Cucinelli and other iconic houses. Thoughtfully designed pieces that balance elegance, comfort, and everyday sophistication.",
      image: "/assets/images/look_image_1.jpg",
      redirectUrl: "/shop"
    },
    {
      title: "Timeless Modern Wardrobe",
      description: "Discover our curated collection of timeless pieces created for the modern wardrobe. Each item is selected to transcend seasons and trends with effortless style.",
      image: "/assets/images/look_image_2.jpg",
      redirectUrl: "/shop"
    },
    {
      title: "Pick Your Essentials",
      description: "Elevate your style with  essentials from the world's finest brands. Experience exceptional craftsmanship, premium materials, and enduring design.",
      image: "/assets/images/look_image_3.jpg",
      redirectUrl: "/shop"
    }
  ];

  /* ------------------ AUTO ROTATE ------------------ */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % heroItems.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const activeItem = heroItems[activeIndex];

  return (
    <section className="w-full bg-gray-50 py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Mobile: Single Column Layout */}
        <div className="md:hidden">
          {/* Image Card */}
          <a
            href={activeItem.redirectUrl}
            className="block mb-4"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-sm">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </a>

          {/* Description */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeItem.title}
            </h3>
            <p className="text-sm font-normal text-gray-600 mb-4 px-4" style={{ fontFamily: "'Canela', 'Georgia', serif" }}>
              {activeItem.description}
            </p>
            <a
              href={activeItem.redirectUrl}
              className="inline-flex items-center gap-2 px-6 py-2 border-2 border-black
                text-sm font-semibold hover:bg-black hover:text-white transition"
            >
              Shop Now
            </a>
          </div>

          {/* Dots Indicator */}
          {/* <div className="flex justify-center gap-2 mt-6">
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex ? "bg-black w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div> */}
        </div>

        {/* Desktop: Side-by-side Layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-16 lg:gap-20 md:items-center">

          {/* Left: Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeItem.title}
            </h2>

            <p className="text-base lg:text-lg font-normal text-gray-600 leading-relaxed" style={{ fontFamily: "'Canela', 'Georgia', serif" }}>
              {activeItem.description}
            </p>

            <a
              href={activeItem.redirectUrl}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black
                text-sm font-semibold hover:bg-black hover:text-white transition"
            >
              Shop Now
            </a>

            {/* Dots Indicator */}
            {/* <div className="flex gap-2 pt-4">
              {heroItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? "bg-black w-8" : "bg-gray-300"
                  }`}
                />
              ))}
            </div> */}
          </div>

          {/* Right: Image Card */}
          <a
            href={activeItem.redirectUrl}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-lg">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
