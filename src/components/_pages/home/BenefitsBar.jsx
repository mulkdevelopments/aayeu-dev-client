// components/BenefitsBar.jsx
"use client";

import Link from "next/link";

const benefits = [
  {
    title: "CUSTOMER CARE",
    description:
      "Esse repellendus dignissimos neque illum voluptatibus eaque quas vero exercitationem.",
    buttonText: "Learn More",
    buttonLink: "#",
  },
  {
    title: "APPOINTMENTS",
    description:
      "Earum quaerat facilis placeat numquam nam hic magnam velit quae.",
    buttonText: "Request an Appointment",
    buttonLink: "#",
  },
  {
    title: "MEMBERSHIP",
    description: "Nisi nobis ea nemo neque accusamus exercitationem incidunt.",
    buttonText: "Learn More",
    buttonLink: "#",
  },
];

export default function BenefitsBar() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 text-center md:grid-cols-3">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* Title */}
              <h6 className="text-xl font-light mb-2">{benefit.title}</h6>

              {/* Description */}
              {/* <p className="text-gray-600 mb-4">
                {benefit.description}
              </p> */}

              {/* Button */}
              <Link
                href={benefit.buttonLink}
                className="px-4 py-2 mt-4 text-sm rounded-none bg-[#c38e1e] text-white hover:bg-[#a87518] transition"
              >
                {benefit.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
