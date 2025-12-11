"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/thumbs";

export default function ProductImagesSection({ images = [], product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const intervalRef = useRef(null);
  const delay = 3000; // 3 seconds per image

  // 🖥️ Auto-slide for Desktop only
  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, delay);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [images]);

  return (
    <div className="flex-[1.2] box-border p-4">
      {/* 🖥️ Desktop view: keep your current slider */}
      <div
        className="hidden lg:block h-full w-full rounded-2xl overflow-hidden relative"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
      >
        {images.map((src, index) => (
          <img
            key={product?.id + "-" + index}
            src={src}
            alt={product?.name || "Product"}
            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          />
        ))}
      </div>

      {/* 📱 Mobile: Swiper carousel with fade + thumbnails */}
      <div className="block lg:hidden">
        {/* Main image carousel */}
        <Swiper
          modules={[EffectFade, Thumbs]}
          effect="fade"
          spaceBetween={10}
          thumbs={{ swiper: thumbsSwiper }}
          className="rounded-2xl bg-gray-50 w-full h-[380px]"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={product?.name || "Product"}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnail bar */}
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={4.5}
          freeMode
          watchSlidesProgress
          className="mt-4"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
