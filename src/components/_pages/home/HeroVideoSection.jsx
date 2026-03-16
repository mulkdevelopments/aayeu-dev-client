"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import useAxios from "@/hooks/useAxios";

export default function HeroVideoSection() {
  const { request } = useAxios();
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchSlides = async () => {
      try {
        const { data, error } = await request({
          method: "GET",
          url: "/users/get-hero-slides",
        });
        if (cancelled) return;
        if (error || !data?.data) {
          setHeroItems([]);
          return;
        }
        const list = Array.isArray(data.data) ? data.data : [];
        setHeroItems(list.map((s) => ({
          title: s.title || "",
          description: s.description || "",
          image: s.image_url || "",
          redirectUrl: s.collection_slug
            ? `/shop/curated/${s.collection_slug}`
            : (s.redirect_url || "/shop"),
        })));
      } catch (err) {
        if (!cancelled) setHeroItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlides();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroItems.length]);

  const activeItem = heroItems[activeIndex];

  if (loading || heroItems.length === 0) return null;

  return (
    <section className="w-full bg-gray-50 py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Mobile: Single Column Layout */}
        <div className="md:hidden">
          {/* Image Card */}
          <Link
            href={activeItem.redirectUrl || "/shop"}
            className="block mb-4"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-sm bg-gray-200">
              {activeItem.image ? (
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
            </div>
          </Link>

          {/* Description */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeItem.title}
            </h3>
            <p className="text-sm font-normal text-gray-600 mb-4 px-4" style={{ fontFamily: "'Canela', 'Georgia', serif" }}>
              {activeItem.description}
            </p>
            <Link
              href={activeItem.redirectUrl || "/shop"}
              className="inline-flex items-center gap-2 px-6 py-2 border-2 border-black
                text-sm font-semibold hover:bg-black hover:text-white transition"
            >
              Shop Now
            </Link>
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

            <Link
              href={activeItem.redirectUrl || "/shop"}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black
                text-sm font-semibold hover:bg-black hover:text-white transition"
            >
              Shop Now
            </Link>

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
          <Link
            href={activeItem.redirectUrl || "/shop"}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-lg bg-gray-200">
              {activeItem.image ? (
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
