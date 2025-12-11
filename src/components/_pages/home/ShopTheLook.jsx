"use client";
import Image from "next/image";

export default function ShopTheLook() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left Side */}
        <div>
          <h2 className="text-3xl font-light mb-4">SHOP THE LOOK</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Step into style with our curated collections designed to make every
            outfit effortless. Whether you're looking for bold statement pieces
            or subtle wardrobe essentials, each look is thoughtfully put
            together to inspire your fashion choices.
            <br />
            <br />
            Explore complete outfits that take the guesswork out of styling.
            From head-to-toe coordination to the perfect mix of textures and
            colors, every detail is chosen to help you express your unique
            personality with confidence.
            <br />
            <br />
            Shopping the look has never been easier. Find your favorite
            ensembles, mix and match, and elevate your everyday style with
            pieces that work together seamlessly for any occasion.
            <br />
            <br />
          </p>

          {/* Side images */}
          <div className="flex gap-4 mt-8">
            <div className="w-1/2">
              <Image
                src="/assets/images/look_image_3.jpg"
                alt="Look 3"
                width={277}
                height={367}
                className="rounded-md object-cover"
              />
            </div>
            <div className="w-1/2">
              <Image
                src="/assets/images/look_image_2.jpg"
                alt="Look 2"
                width={277}
                height={367}
                className="rounded-md object-cover"
              />
            </div>
          </div>

          {/* Products grid (dynamic area) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {/* Example Product */}
            {/* Map your products dynamically here */}
            {/* <div className="bg-gray-100 rounded-md p-2 text-center">
              <Image
                src="/assets/images/look_image_2.jpg"
                alt="Product"
                width={150}
                height={200}
                className="rounded-md mx-auto"
              />
              <p className="mt-2 text-sm font-medium">Product Name</p>
            </div> */}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          <Image
            src="/assets/images/look_image_1.jpg"
            alt="Main Look"
            width={600}
            height={715}
            className="rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
}
