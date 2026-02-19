"use client";

import useAxios from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutUsPage() {
  const { request } = useAxios();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch About Us data on first load
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAboutUsSection = async () => {
      try {
        const { data, error } = await request({
          url: "/users/get-about-us",
          method: "GET",
        });

        if (!error && data?.data) {
          setAbout(data.data);
        }
      } catch (err) {
        console.error("About Us Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsSection();
  }, []);

  // 🧱 Loading UI
  if (loading || !about) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-full h-[400px]" />
        <Skeleton className="w-1/3 h-8" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  const { summary, top, middle, bottom } = about;

  return (
    <div className="font-poppins">
      {/* 🔥 Banner */}
      <div>
        <img
          src={summary?.summary_banner}
          alt={summary?.heading}
          className="w-full max-h-[600px] object-cover"
        />
      </div>

      {/* 🔥 Summary Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extralight mb-6">
          {summary?.heading ?? "About Us"}
        </h1>

        {summary?.subheading && (
          <h3 className="text-2xl font-light mb-4">{summary.subheading}</h3>
        )}

        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          {summary?.text}
        </p>
      </section>

      {/* 🔥 Top Section */}
      {top && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src={top.image_url}
                alt={top.title}
                className="w-full max-h-[350px] object-cover rounded-md"
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-2xl font-light mb-3">{top.title}</h3>
              <p className="text-lg mb-2">{top.subtitle}</p>
              <p className="text-gray-500 text-base">{top.text}</p>
            </div>
          </div>
        </section>
      )}

      {/* 🔥 Middle Section */}
      {middle && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <img
                src={middle.image_url}
                alt={middle.title}
                className="w-full max-h-[350px] object-cover rounded-md"
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-2xl font-light mb-3">{middle.title}</h3>
              <p className="text-lg mb-2">{middle.subtitle}</p>
              <p className="text-gray-500 text-base">{middle.text}</p>
            </div>
          </div>
        </section>
      )}

      {/* 🔥 Bottom Section */}
      {bottom && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src={bottom.image_url}
                alt={bottom.title}
                className="w-full max-h-[350px] object-cover rounded-md"
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-2xl font-light mb-3">{bottom.title}</h3>
              <p className="text-lg mb-2">{bottom.subtitle}</p>
              <p className="text-gray-500 text-base">{bottom.text}</p>
            </div>
          </div>
        </section>
      )}

      {/* 📰 News Section (static but preserved — can be API-driven later) */}
      {/* <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-extralight text-center mb-8">News</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              date: "19.06.2025",
              title: "Lorem ipsum dolor sit amet",
              desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac risus at orci.",
              img: "/assets/images/n1.webp",
            },
            {
              date: "09.06.2025",
              title: "Consectetur adipiscing elit",
              desc: "Donec id velit a ipsum tempor pretium. Nullam porttitor nisl nec sem fermentum.",
              img: "/assets/images/n2.avif",
            },
            {
              date: "07.05.2025",
              title: "Sed do eiusmod tempor",
              desc: "Aenean ac ex nec ligula volutpat tristique. Sed in magna vel metus gravida.",
              img: "/assets/images/n3.avif",
            },
            {
              date: "18.03.2025",
              title: "Ut enim ad minim veniam",
              desc: "Curabitur fermentum, massa in dictum volutpat, ligula leo dignissim sapien.",
              img: "/assets/images/n4.webp",
            },
            {
              date: "29.01.2025",
              title: "Excepteur sint occaecat",
              desc: "Mauris luctus, justo sed consequat tincidunt, erat risus lobortis orci.",
              img: "/assets/images/n1.webp",
            },
            {
              date: "12.12.2024",
              title: "Duis aute irure dolor",
              desc: "Vivamus malesuada sapien non felis efficitur, sed laoreet orci mattis.",
              img: "/assets/images/n2.avif",
            },
          ].map((news, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md overflow-hidden shadow-sm"
            >
              <img
                src={news.img}
                alt={news.title}
                className="w-full h-[275px] object-cover"
              />

              <div className="p-4">
                <p className="text-gray-500 text-sm mb-2">{news.date}</p>
                <h5 className="text-xl font-light mb-2">{news.title}</h5>
                <p className="text-base text-gray-700">{news.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
}
