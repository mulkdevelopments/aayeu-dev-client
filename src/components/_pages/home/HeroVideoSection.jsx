"use client";

import useHomeConfig from "@/hooks/useHomeConfig";
import { selectTopBanner } from "@/store/selectors/homeConfigSelectors";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export default function HeroVideoSection() {
  const { fetchHomeConfig } = useHomeConfig();
  const topBanner = useSelector(selectTopBanner);

  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    fetchHomeConfig(); // loads if not cached
  }, []);

  if (!topBanner || !topBanner.media_url) {
    // fallback placeholder or nothing
    return null;
  }

  const isVideo = topBanner.media_type === "video";
  const src = topBanner.media_url;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* ---------------- VIDEO MODE ---------------- */}
      {isVideo ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={src}
        />
      ) : (
        /* ---------------- IMAGE MODE ---------------- */
        <img
          src={src}
          className="w-full h-full object-cover object-center"
          alt={topBanner?.title ?? "Banner"}
        />
      )}

      {/* ---------------- Optional Controls Overlay ---------------- */}
      {isVideo && (
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            onClick={togglePlay}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            {isPaused ? (
              <i className="bi bi-play-fill text-lg"></i>
            ) : (
              <i className="bi bi-pause-fill text-lg"></i>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            {isMuted ? (
              <i className="bi bi-volume-mute-fill text-lg"></i>
            ) : (
              <i className="bi bi-volume-up-fill text-lg"></i>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
