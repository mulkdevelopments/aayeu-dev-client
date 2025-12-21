"use client";

import Image from "next/image";

export default function ShopTheLook() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT – Content */}
          <div className="space-y-8">
            <div>
              <p className="text-xs tracking-widest text-neutral-400 mb-2">
                CURATED STYLE
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                Shop the <span className="italic">Look</span>
              </h2>
            </div>

            <p className="text-neutral-300 max-w-xl leading-relaxed">
              Carefully styled outfits designed to work together seamlessly.
              From statement essentials to subtle details — each look is made
              to elevate your everyday presence.
            </p>

            {/* CTA */}
            {/* <div className="flex items-center gap-6">
              <button className="px-6 py-3 border border-white/70 text-sm tracking-wide hover:bg-white hover:text-black transition">
                Explore Looks
              </button>
              <span className="text-xs text-neutral-400">
                Limited seasonal edit
              </span>
            </div> */}

            {/* Floating stacked images */}
            <div className="relative mt-12 h-[260px] sm:h-[300px]">
              <div className="absolute left-0 top-0 w-40 sm:w-44 rotate-[-4deg]">
                <Image
                  src="/assets/images/look_image_2.jpg"
                  alt="Look detail"
                  width={300}
                  height={400}
                  className="rounded-xl object-cover shadow-2xl"
                />
              </div>

              <div className="absolute left-32 sm:left-44 top-10 w-40 sm:w-44 rotate-[5deg]">
                <Image
                  src="/assets/images/look_image_3.jpg"
                  alt="Look detail"
                  width={300}
                  height={400}
                  className="rounded-xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* RIGHT – Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/assets/images/look_image_1.jpg"
                alt="Main Look"
                width={700}
                height={900}
                className="object-cover w-full h-full scale-105 hover:scale-100 transition-transform duration-700"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />

              {/* caption */}
              <div className="absolute bottom-6 left-6">
                <p className="text-sm tracking-wide">
                  Complete Outfit · Editorial Pick
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile swipe products */}
        {/* <div className="mt-16 lg:mt-20">
          <h3 className="text-sm tracking-widest text-neutral-400 mb-4">
            ITEMS IN THIS LOOK
          </h3>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="min-w-[160px] bg-neutral-900 rounded-xl p-3 hover:bg-neutral-800 transition"
              >
                <Image
                  src="/assets/images/look_image_2.jpg"
                  alt="Product"
                  width={200}
                  height={260}
                  className="rounded-lg object-cover"
                />
                <p className="mt-3 text-sm font-light">
                  Essential Piece
                </p>
                <p className="text-xs text-neutral-400">
                aed 34
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
