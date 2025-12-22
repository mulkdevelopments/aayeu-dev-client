"use client"

import useHomeConfig from "@/hooks/useHomeConfig"
import { selectTopBanner } from "@/store/selectors/homeConfigSelectors"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import Link from "next/link"

export default function HeroVideoSection() {
  const { fetchHomeConfig, productOverlayHome, fetchProductOverlayHome } =
    useHomeConfig()
  const topBanner = useSelector(selectTopBanner)

  const videoRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [overlayItems, setOverlayItems] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)

  /* ------------------ DATA ------------------ */
  useEffect(() => {
    fetchHomeConfig()
    loadOverlayProducts()
  }, [])

  const loadOverlayProducts = async () => {
    const res = await fetchProductOverlayHome()
    const data = res?.data ?? productOverlayHome ?? []
    setOverlayItems(Array.isArray(data) ? data : [])
  }

  /* ------------------ AUTO SLIDE ------------------ */
  useEffect(() => {
    if (!overlayItems.length) return

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % overlayItems.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [overlayItems])

  /* ------------------ POSITION LOGIC ------------------ */
  const getPosition = index => {
    const total = overlayItems.length
    let diff = index - activeIndex

    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    return diff
  }

  /* ------------------ VIDEO CONTROLS ------------------ */
  const togglePlay = () => {
    if (!videoRef.current) return
    videoRef.current.paused
      ? (videoRef.current.play(), setIsPaused(false))
      : (videoRef.current.pause(), setIsPaused(true))
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  if (!topBanner?.media_url) return null

  const isVideo = topBanner.media_type === "video"
  const src = topBanner.media_url

  /* ------------------ TRANSFORMS ------------------ */
  const transformMap = {
    0: "translateX(0px) scale(1.15)",
    1: "translateX(280px) scale(0.9)",
    "-1": "translateX(-280px) scale(0.9)",
    2: "translateX(540px) scale(0.75)",
    "-2": "translateX(-540px) scale(0.75)",
  }

  const opacityMap = { 0: 1, 1: 0.85, "-1": 0.85, 2: 0.4, "-2": 0.4 }
  const zMap = { 0: 30, 1: 20, "-1": 20, 2: 10, "-2": 10 }

  /* ------------------ RENDER ------------------ */
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src={src}
          />
        ) : (
          <img src={src} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
      </div>

      {/* Controls */}
      {isVideo && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <button onClick={togglePlay} className="glass-btn">
            <i className={`bi ${isPaused ? "bi-play-fill" : "bi-pause-fill"}`} />
          </button>
          <button onClick={toggleMute} className="glass-btn">
            <i
              className={`bi ${
                isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"
              }`}
            />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center md:justify-end h-full pb-6 md:pb-12 px-4">
        <div className="max-w-[1600px] mx-auto w-full">

          {/* Title */}
          {topBanner?.title && (
            <div className="text-center mb-6 md:mb-10">
              <h1 className="text-2xl md:text-6xl lg:text-7xl text-white font-light">
                {topBanner.title}
              </h1>
              {topBanner.subtitle && (
                <p className="text-white/80 mt-1 md:mt-2 text-sm md:text-base">
                  {topBanner.subtitle}
                </p>
              )}
            </div>
          )}

          {/* 🔥 SMOOTH CAROUSEL */}
          <div className="relative h-[320px] md:h-[400px] lg:h-[460px] flex items-center justify-center overflow-visible">
            {overlayItems.map((item, index) => {
              const pos = getPosition(index)
              if (Math.abs(pos) > 2) return null

              const {
                id,
                title,
                mrp,
                sale_price,
                product_image,
                product_redirect_url,
              } = item

              const discount =
                mrp && sale_price && mrp !== sale_price
                  ? Math.round(((mrp - sale_price) / mrp) * 100)
                  : 0

              return (
                <Link
                  key={id ?? index}
                  href={product_redirect_url || "#"}
                  className="absolute left-1/2 transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    transform: `
                      translateX(-50%)
                      ${transformMap[pos]}
                    `,
                    opacity: opacityMap[pos],
                    zIndex: zMap[pos],
                  }}
                >
                  {/* Card */}
                  <div className="relative w-[160px] md:w-[240px] rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 z-10
                        rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide
                        bg-gradient-to-br from-[#FFD77A] via-[#D4AF37] to-[#8B6B1F]
                        text-[#2A1E05]
                        shadow-[0_0_12px_rgba(212,175,55,0.6)]
                        border border-[#F5E6A8]
                        animate-flash">
                        −{discount}% OFF
                      </span>
                    )}

                    <div className="aspect-square p-5 flex items-center justify-center">
                      <img
                        src={product_image || "/assets/images/fallback.jpg"}
                        className="w-full h-full object-contain drop-shadow-xl"
                      />
                    </div>

                    <div className="p-4 text-center bg-black/50">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {title}
                      </h3>
                      <p className="text-white font-bold mt-1">
                        AED {sale_price ?? mrp}
                      </p>
                      {discount > 0 && (
                        <p className="text-white/50 text-xs line-through">
                          AED {mrp}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* CTA */}
          {topBanner?.button_text && (
            <div className="text-center mt-6 md:mt-10">
              <Link
                href={topBanner.link_url}
                className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-full hover:bg-black hover:text-white transition text-sm md:text-base"
              >
                {topBanner.button_text}
                <i className="bi bi-arrow-right" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
