"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallerySection({ images = [], productVideo, product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Combine images and video into single media array
  const mediaItems = [...images];
  if (productVideo) {
    mediaItems.push({ type: 'video', src: productVideo });
  }

  if (!mediaItems.length) return null;

  return (
    <div className="w-full lg:w-[60%] p-4 lg:p-6">
      <div className="w-full max-w-2xl mx-auto lg:sticky lg:top-6">
        {/* Main Gallery */}
        <div className="relative group">
          <Swiper
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            spaceBetween={10}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl bg-gradient-to-br from-amber-50/20 via-white to-emerald-50/10 overflow-hidden"
          >
            {mediaItems.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                  {item.type === 'video' ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain rounded-xl"
                    >
                      <source src={item.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={item}
                      alt={`${product?.name || 'Product'} - Image ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows - Hidden on mobile, visible on hover for desktop */}
          {mediaItems.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
              </button>
              <button className="swiper-button-next-custom absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium">
            {activeIndex + 1} / {mediaItems.length}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {mediaItems.length > 1 && (
          <div className="mt-4">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView={4}
              breakpoints={{
                640: { slidesPerView: 5 },
                768: { slidesPerView: 6 },
              }}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbnail-swiper h-20 md:h-24"
            >
              {mediaItems.map((item, index) => (
                <SwiperSlide key={index} className="h-full">
                  <div
                    className={`relative w-full h-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                      index === activeIndex
                        ? 'border-amber-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.5 5.5v9l7-4.5-7-4.5z"/>
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={item}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
}
