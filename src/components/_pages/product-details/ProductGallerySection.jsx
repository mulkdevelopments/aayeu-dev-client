"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallerySection({
  images = [],
  productVideo,
  product,
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [lens, setLens] = useState({
    visible: false,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
  });

  const LENS_SIZE = 160;
  const ZOOM = 5.5;

  const handleMouseMove = (e, img) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setLens({
      visible: true,
      x: x - LENS_SIZE / 2,
      y: y - LENS_SIZE / 2,
      bgX,
      bgY,
      img,
    });
  };

  const handleMouseLeave = () => {
    setLens({ ...lens, visible: false });
  };

  const mediaItems = [...images];
  if (productVideo) mediaItems.push({ type: "video", src: productVideo });
  if (!mediaItems.length) return null;

  return (
    <div className="w-full lg:w-[60%] p-4 lg:p-6">
      <div className="w-full max-w-2xl mx-auto lg:sticky lg:top-6">
        <div className="relative group">
          <Swiper
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed
                  ? thumbsSwiper
                  : null,
            }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden"
          >
            {mediaItems.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
                  {item.type === "video" ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <>
                      {/* BASE IMAGE */}
                      <div
                        className="relative w-full h-full hidden md:block"
                        onMouseMove={(e) => handleMouseMove(e, item)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <img
                          src={item}
                          alt={`${product?.name || "Product"} ${
                            index + 1
                          }`}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />

                        {/* LENS */}
                        {lens.visible && (
                          <div
                            className="absolute pointer-events-none rounded-full border-2 border-white shadow-xl"
                            style={{
                              width: LENS_SIZE,
                              height: LENS_SIZE,
                              left: lens.x,
                              top: lens.y,
                              backgroundImage: `url(${lens.img})`,
                              backgroundRepeat: "no-repeat",
                              backgroundSize: `${ZOOM * 100}%`,
                              backgroundPosition: `${lens.bgX}% ${lens.bgY}%`,
                            }}
                          />
                        )}
                      </div>

                      {/* MOBILE */}
                      <img
                        src={item}
                        alt=""
                        className="w-full h-full object-contain md:hidden"
                      />
                    </>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* NAV */}
          {mediaItems.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
                <ChevronLeft />
              </button>
              <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow">
                <ChevronRight />
              </button>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {mediaItems.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={5}
            freeMode
            watchSlidesProgress
            modules={[FreeMode, Thumbs]}
            className="mt-4 h-20"
          >
            {mediaItems.map((item, i) => (
              <SwiperSlide key={i}>
               <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
  <img
    src={item.src || item}
    alt={`Thumbnail ${i + 1}`}
    className="max-w-full max-h-full object-contain p-2"
    draggable={false}
  />
</div>

              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
