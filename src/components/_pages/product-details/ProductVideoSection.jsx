import React from "react";

export default function ProductVideoSection({ productVideo, onVideoWheel }) {
  return (
    <div
      id="videoCol"
      onWheel={onVideoWheel}
      className="hidden md:flex flex-1 box-border overflow-hidden p-4 min-h-0"
    >
      {productVideo ? (
        <video
          key={productVideo}
          autoPlay
          muted
          loop
          playsInline
          className="w-full rounded-2xl object-contain lg:object-cover"
        >
          <source src={productVideo} type="video/mp4" />
        </video>
      ) : (
        <div className="flex items-center justify-center w-full h-full rounded-2xl bg-[#f3f3f3] p-4">
          <div className="text-center">
            <img
              src="/assets/images/aayeu_logo.png"
              alt="Aayeu"
              className="mx-auto w-32 mb-3"
            />
            <p className="text-gray-700 text-lg font-semibold">
              Aayeu — Redefining Everyday Shopping
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
