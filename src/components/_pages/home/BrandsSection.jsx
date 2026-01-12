"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toLower } from "lodash";
import useAxios from "@/hooks/useAxios";

const SKELETON_COUNT = 8;

export default function BrandsSection() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { request } = useAxios();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await request({
          url: "/users/get-all-brands",
          method: "GET",
        });

        if (!error && data?.success && data?.data) {
          setBrands(data.data);
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || brands.length === 0) return;

    let animationId;
    let isPaused = false;

    const animate = () => {
      if (!isPaused && container) {
        container.scrollLeft += 0.5;

        // Reset scroll for infinite loop
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [brands]);

  // Check scroll position for arrow visibility
  const checkScrollPosition = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollPosition();
    }, 100);

    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        clearTimeout(timer);
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }

    return () => clearTimeout(timer);
  }, [brands, isLoading]);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const handleBrandClick = (brandName) => {
    router.push(`/shop?brand=${encodeURIComponent(toLower(brandName))}`);
  };

  return (
    <section className="relative py-12 md:py-16 lg:py-20 bg-black overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-white uppercase">
            Featured Brands
          </h2>
          <div className="w-16 h-px bg-white mx-auto mt-4" />
        </div>

        {/* Scroll Container with Arrows */}
        <div className="relative group">
          {/* Left Arrow */}
          {!isLoading && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12
                bg-white text-black flex items-center justify-center rounded-sm
                opacity-90 hover:opacity-100 transition-opacity duration-300"
              aria-label="Scroll left"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {!isLoading && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12
                bg-white text-black flex items-center justify-center rounded-sm
                opacity-90 hover:opacity-100 transition-opacity duration-300"
              aria-label="Scroll right"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Scroll Area */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-12 md:px-16"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Skeleton Loader */}
            {isLoading &&
              Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-24 sm:h-28 md:h-32 lg:h-36 px-8 md:px-12
                    border border-neutral-800 bg-neutral-900 animate-pulse rounded-sm"
                  style={{ minWidth: "150px" }}
                />
              ))}

            {/* Brands - Duplicated for infinite scroll effect */}
            {!isLoading &&
              [...brands, ...brands].map((brand, index) => (
                <button
                  key={`${brand.brand_name}-${index}`}
                  onClick={() => handleBrandClick(brand.brand_name)}
                  className="flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <div
                    className="h-24 sm:h-28 md:h-32 lg:h-36
                      border border-white bg-black rounded-sm
                      flex items-center justify-center px-6 md:px-8 lg:px-10"
                  >
                    <span
                      className="text-center text-sm sm:text-base md:text-lg lg:text-xl
                        font-light tracking-widest text-white uppercase
                        whitespace-nowrap"
                      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {brand.brand_name}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Edge fade gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent" />
    </section>
  );
}
