"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";
import STATIC from "@/utils/constants";

export default function FeaturedBrands() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { request } = useAxios();
  const [featuredBrands, setFeaturedBrands] = useState([]);

  const fetchBrands = async () => {
    const { data, error } = await request({
      url: "/users/get-active-brand-spotlights",
      method: "GET",
    });

    if (error) {
      console.error("Error fetching brands:", error);
    }

    const payload = data?.data?.items ?? data?.items ?? [];
    setFeaturedBrands(payload);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <section className="mt-8 relative container mx-auto px-4">
      <h2 className="text-3xl font-light mb-6">Featured Brands</h2>

      {/* Custom Arrows */}
      <button
        ref={prevRef}
        className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 w-9 h-9 bg-black/60 text-white flex items-center justify-center rounded-full hover:bg-[#c38e1e] transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        ref={nextRef}
        className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-9 h-9 bg-black/60 text-white flex items-center justify-center rounded-full hover:bg-[#c38e1e] transition"
      >
        <ChevronRight size={20} />
      </button>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onSwiper={(swiper) => {
          setTimeout(() => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
          });
        }}
        autoplay={{ delay: 4000 }}
        loop={true}
        spaceBetween={15}
        slidesPerView={2}
        breakpoints={{
          576: { slidesPerView: 2.5 },
          768: { slidesPerView: 3.5 },
          992: { slidesPerView: 4.5 },
          1200: { slidesPerView: 5.5 },
        }}
      >
        {featuredBrands.map((brand) => (
          <SwiperSlide key={brand.id}>
            <Link
              href={brand.href || "#"}
              className="block cursor-pointer overflow-hidden rounded-lg transition"
            >
              <Image
                src={
                  brand?.meta?.hero_image ||
                  brand?.products[0]?.product_img ||
                  STATIC.IMAGES.IMAGE_NOT_AVAILABLE
                }
                alt={brand.brand_name}
                width={200}
                height={120}
                className="w-full h-auto object-cover rounded-lg"
                unoptimized
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
