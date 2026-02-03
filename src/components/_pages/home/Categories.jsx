"use client"

import useHomeConfig from "@/hooks/useHomeConfig"
import { selectTopBanner } from "@/store/selectors/homeConfigSelectors"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Link from "next/link"
import useCurrency from "@/hooks/useCurrency"
import { Skeleton } from "@/components/ui/skeleton"

export default function HeroVideoSection() {
  const { fetchHomeConfig, productOverlayHome, fetchProductOverlayHome } =
    useHomeConfig()
  const topBanner = useSelector(selectTopBanner)
  const { format } = useCurrency()

  const [overlayItems, setOverlayItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Default categories fallback
  const defaultCategories = [
    {
      title: "WOMENSWEAR",
      image: "/assets/images/womenswear.jpg",
      url: "/shop/women"
    },
    {
      title: "MENSWEAR",
      image: "/assets/images/menswear.jpg",
      url: "/shop/men"
    }
  ]

  /* ------------------ DATA ------------------ */
  useEffect(() => {
    fetchHomeConfig()
    loadOverlayProducts()
  }, [])

  const loadOverlayProducts = async () => {
    setIsLoading(true)
    const res = await fetchProductOverlayHome()
    const data = res?.data ?? productOverlayHome ?? []

    setOverlayItems(Array.isArray(data) && data.length > 0 ? data : defaultCategories)
    setIsLoading(false)
  }

  /* ------------------ RENDER ------------------ */

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="w-full bg-white">
        <div className="max-w-[1600px] mx-auto">
          {/* Hero Banner Skeleton */}
          <div className="px-4 md:px-12 lg:px-16 py-8 md:py-12 lg:py-16">
            <Skeleton className="h-8 md:h-10 lg:h-12 w-3/4 max-w-4xl mx-auto mb-8" />
          </div>

          {/* Category Cards Skeleton */}
          <div className="px-4 md:px-12 lg:px-16 pb-8 md:pb-12">
            <div className="flex gap-4 md:gap-6">
              <Skeleton className="flex-shrink-0 w-56 h-28 md:w-96 md:h-40 lg:w-[480px] lg:h-48 rounded-md" />
              <Skeleton className="flex-shrink-0 w-56 h-28 md:w-96 md:h-40 lg:w-[480px] lg:h-48 rounded-md" />
              <Skeleton className="flex-shrink-0 w-56 h-28 md:w-96 md:h-40 lg:w-[480px] lg:h-48 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1600px] mx-auto">

        {/* Hero Banner Section */}
        <div className="px-4 md:px-12 lg:px-16 py-8 md:py-12 lg:py-16 text-center">
          <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-900 leading-tight tracking-tight">
            {topBanner?.title || "Aayeu Sale: Up to 70% Off Selected Styles"}
          </h1>
        </div>

        {/* Category Cards - Horizontal Scrollable Row (All Screens) */}
        <div
          className="overflow-x-auto scrollbar-hide px-4 md:px-12 lg:px-16 pb-8 md:pb-12"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-4 md:gap-6">
            {overlayItems.map((item, index) => (
              <Link
                key={index}
                href={item?.product_redirect_url || item?.url || "#"}
                className="group relative flex-shrink-0 w-56 h-28 md:w-96 md:h-40 lg:w-[680px] lg:h-68 overflow-hidden  transition-transform duration-300 hover:scale-105"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={item?.product_image || item?.image || "/assets/images/fallback.jpg"}
                    alt={item?.title || `Category ${index + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>

                {/* Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center px-2">
                  <h2 className="text-white text-sm md:text-base lg:text-lg font-medium tracking-wider drop-shadow-md text-center uppercase">
                    {item?.title || "CATEGORY"}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
