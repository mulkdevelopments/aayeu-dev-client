"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductGallerySection({
  images = [],
  productVideo,
  product,
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });
  const retryTimersRef = useRef({});
  const [imageStates, setImageStates] = useState({});

  const openFullscreen = (index) => {
    setFullscreenIndex(index);
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
    setZoomLevel(1);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
    setZoomLevel(1);
    setIsFullscreenOpen(false);
  };

  const goPrev = () => {
    setIsZoomed(false);
    setFullscreenIndex((prev) =>
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setIsZoomed(false);
    setFullscreenIndex((prev) =>
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
  };
  const handleZoomClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
    setIsZoomed((prev) => !prev);
    setZoomLevel((prev) => (prev > 1 ? 1 : 2));
  };

  const clampZoom = (value) => Math.min(3, Math.max(1, value));

  const handleWheelZoom = (e) => {
    if (mediaItems[fullscreenIndex]?.type === "video") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
    const direction = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel((prev) => {
      const next = clampZoom(prev + direction);
      setIsZoomed(next > 1);
      return next;
    });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const next = clampZoom(prev + 0.5);
      setIsZoomed(next > 1);
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = clampZoom(prev - 0.5);
      setIsZoomed(next > 1);
      return next;
    });
  };

  const handleZoomReset = () => {
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
    setZoomLevel(1);
  };
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    if (!isHorizontalSwipe) return;
    if (deltaX > 40) goNext();
    if (deltaX < -40) goPrev();
  };

  const MAX_RETRIES = 2;
  const getImageState = (index) =>
    imageStates[index] || { status: "loading", retry: 0 };

  const updateImageState = (index, patch) => {
    setImageStates((prev) => ({
      ...prev,
      [index]: { ...getImageState(index), ...patch },
    }));
  };

  const withRetryParam = (src, index) => {
    if (!src) return src;
    const { retry } = getImageState(index);
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}retry=${retry}`;
  };

  const scheduleRetry = (index) => {
    const { retry } = getImageState(index);
    if (retry >= MAX_RETRIES) return;
    updateImageState(index, { status: "retrying" });
    if (retryTimersRef.current[index]) {
      clearTimeout(retryTimersRef.current[index]);
    }
    retryTimersRef.current[index] = setTimeout(() => {
      updateImageState(index, { retry: retry + 1, status: "loading" });
    }, 800);
  };

  const handleImageError = (index) => {
    const { retry } = getImageState(index);
    if (retry < MAX_RETRIES) {
      scheduleRetry(index);
    } else {
      updateImageState(index, { status: "error" });
    }
  };

  const handleImageLoaded = (index) => {
    updateImageState(index, { status: "ok" });
  };

  useEffect(() => {
    return () => {
      Object.values(retryTimersRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

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
                <div
                  className="w-full h-full flex items-center justify-center p-4 md:p-8 relative cursor-zoom-in"
                  onClick={() => openFullscreen(index)}
                >
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
                      {getImageState(index).status !== "ok" && (
                        <div className="absolute inset-0 z-10">
                          <Skeleton className="w-full h-full" />
                        </div>
                      )}
                      <div className="relative w-full h-full hidden md:block">
                        <img
                          src={withRetryParam(item, index)}
                          alt={`${product?.name || "Product"} ${
                            index + 1
                          }`}
                          className="w-full h-full object-contain"
                          draggable={false}
                          onLoad={() => handleImageLoaded(index)}
                          onError={() => handleImageError(index)}
                        />

                      </div>

                      {/* MOBILE */}
                      <img
                        src={withRetryParam(item, index)}
                        alt=""
                        className="w-full h-full object-contain md:hidden"
                        onLoad={() => handleImageLoaded(index)}
                        onError={() => handleImageError(index)}
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
              <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow z-20 hover:bg-white transition-colors">
                <ChevronLeft />
              </button>
              <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow z-20 hover:bg-white transition-colors">
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
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg relative">
                  {getImageState(i).status !== "ok" && (
                    <div className="absolute inset-0 z-10">
                      <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                  )}
                  <img
                    src={withRetryParam(item.src || item, i)}
                    alt={`Thumbnail ${i + 1}`}
                    className="max-w-full max-h-full object-contain p-2"
                    draggable={false}
                    onLoad={() => handleImageLoaded(i)}
                    onError={() => handleImageError(i)}
                  />
                </div>

              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-[999] bg-white flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullscreen();
          }}
        >
          <button
            type="button"
            onClick={closeFullscreen}
            className="absolute top-6 right-6 z-30 text-gray-700 hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>

          {mediaItems.length > 1 && (
            <>
            <button
              type="button"
              onClick={goPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 hover:text-black transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-9 h-9" />
            </button>
            <button
              type="button"
              onClick={goNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-800 hover:text-black transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-9 h-9" />
            </button>
            </>
          )}

          <div className="w-full h-full max-w-[88vw] max-h-[88vh] flex items-center justify-center">
            {mediaItems[fullscreenIndex]?.type === "video" ? (
              <video
                src={mediaItems[fullscreenIndex].src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {getImageState(fullscreenIndex).status !== "ok" && (
                  <div className="absolute inset-0 z-10">
                    <Skeleton className="w-full h-full" />
                  </div>
                )}
                <img
                  src={withRetryParam(mediaItems[fullscreenIndex], fullscreenIndex)}
                  alt={`${product?.name || "Product"} ${fullscreenIndex + 1}`}
                  onClick={handleZoomClick}
                  onLoad={() => handleImageLoaded(fullscreenIndex)}
                  onError={() => handleImageError(fullscreenIndex)}
                  onWheel={handleWheelZoom}
                  className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  style={{
                    transformOrigin: zoomOrigin,
                    transform: `scale(${zoomLevel})`,
                  }}
                />
              </div>
            )}
          </div>

          {!mediaItems[fullscreenIndex]?.type && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 border border-gray-200 rounded-full px-3 py-2 shadow">
              <button
                type="button"
                onClick={handleZoomOut}
                className="px-2 text-sm text-gray-700 hover:text-black"
                aria-label="Zoom out"
              >
                –
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 text-xs text-gray-500 hover:text-black"
                aria-label="Reset zoom"
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="px-2 text-sm text-gray-700 hover:text-black"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
