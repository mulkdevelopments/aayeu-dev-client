"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import useAxios from "@/hooks/useAxios";

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HeroVideoSection() {
  const { request } = useAxios();
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef(null);

  const heroCount = heroItems.length;

  const scheduleAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    if (heroCount <= 1) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroCount);
    }, 5000);
  }, [heroCount]);

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
    if (heroCount === 0) return undefined;
    scheduleAutoplay();
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [heroCount, scheduleAutoplay]);

  const goNext = () => {
    if (heroCount <= 1) return;
    setActiveIndex((prev) => (prev + 1) % heroCount);
    scheduleAutoplay();
  };

  const goPrev = () => {
    if (heroCount <= 1) return;
    setActiveIndex((prev) => (prev - 1 + heroCount) % heroCount);
    scheduleAutoplay();
  };

  const goToIndex = (index) => {
    if (index < 0 || index >= heroCount) return;
    setActiveIndex(index);
    scheduleAutoplay();
  };

  const showNav = heroCount > 1;

  const arrowBtnClass =
    "absolute top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-black/35 text-white shadow-md backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

  const activeItem = heroItems[activeIndex];

  if (loading || heroItems.length === 0) return null;

  return (
    <section className="w-full bg-gray-50 py-12 md:py-16" aria-label="Featured collections">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Mobile: Single Column Layout */}
        <div className="md:hidden">
          {/* Image Card + manual arrows */}
          <div className="relative mb-4">
            <Link
              href={activeItem.redirectUrl || "/shop"}
              className="block"
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
            {showNav && (
              <>
                <button
                  type="button"
                  className={`${arrowBtnClass} left-2`}
                  onClick={(e) => {
                    e.preventDefault();
                    goPrev();
                  }}
                  aria-label="Previous slide"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  className={`${arrowBtnClass} right-2`}
                  onClick={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                  aria-label="Next slide"
                >
                  <ChevronRightIcon />
                </button>
              </>
            )}
          </div>

          {/* Description */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeItem.title}
            </h3>
            <p className="text-sm font-normal text-gray-600 mb-4 px-4" style={{ fontFamily: "'Canela', 'Georgia', serif" }}>
              {activeItem.description}
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link
                href={activeItem.redirectUrl || "/shop"}
                className="inline-flex items-center gap-2 px-6 py-2 border-2 border-black
                  text-sm font-semibold hover:bg-black hover:text-white transition"
              >
                Shop Now
              </Link>
              {showNav && (
                <div className="flex justify-center gap-2" role="tablist" aria-label="Hero slides">
                  {heroItems.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex}
                      aria-label={`Slide ${index + 1} of ${heroCount}`}
                      onClick={() => goToIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeIndex ? "w-6 bg-black" : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={activeItem.redirectUrl || "/shop"}
                className="inline-flex w-fit items-center gap-2 px-6 py-3 border-2 border-black
                  text-sm font-semibold hover:bg-black hover:text-white transition"
              >
                Shop Now
              </Link>
              {showNav && (
                <div className="flex gap-2" role="tablist" aria-label="Hero slides">
                  {heroItems.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex}
                      aria-label={`Slide ${index + 1} of ${heroCount}`}
                      onClick={() => goToIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeIndex ? "w-8 bg-black" : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Image Card + manual arrows */}
          <div className="relative">
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
            {showNav && (
              <>
                <button
                  type="button"
                  className={`${arrowBtnClass} left-3`}
                  onClick={(e) => {
                    e.preventDefault();
                    goPrev();
                  }}
                  aria-label="Previous slide"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  className={`${arrowBtnClass} right-3`}
                  onClick={(e) => {
                    e.preventDefault();
                    goNext();
                  }}
                  aria-label="Next slide"
                >
                  <ChevronRightIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
