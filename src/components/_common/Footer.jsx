"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaTwitter,
  FaSnapchatGhost,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#e6e6e6] border-t">
      <div className="max-w-[1250px] mx-auto px-4 py-8 md:py-10">
        {/* ---- Top Section ---- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Column 1 */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image
                src="/assets/images/aayeu_logo.png"
                alt="Logo"
                width={180}
                height={70}
                className="h-[70px] w-auto object-contain"
              />
            </div>
            <h5 className="text-xl font-light mb-2">AAYEU</h5>
            <p className="text-base text-gray-700 mb-3 leading-relaxed">
              At AAYEU, we don’t just sell clothes — we inspire style. Our
              handpicked collections stand out for quality and originality.
            </p>
            <p className="text-base">
              <Link
                href="mailto:help@aayeu.com"
                className="text-gray-800 hover:underline"
              >
                help@aayeu.com
              </Link>
            </p>
            <p className="text-sm text-gray-600">Mon - Fri: 10:00 - 6:00 PM</p>
          </div>

          {/* Column 2 - Top Categories */}
          <div>
            <h5 className="text-xl mb-4 font-medium">Top Categories</h5>
            <ul className="space-y-1.5 text-base">
              {[
                "Vacation",
                "Brands",
                "Clothing",
                "Shoes",
                "Bags",
                "Accessories",
                "Jewellery",
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href="/shop"
                    className="text-gray-800 hover:underline transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div>
            <h5 className="text-xl mb-4 font-medium">Quick Links</h5>
            <ul className="space-y-1.5 text-base">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about-us" },
                { name: "Shop", href: "/shop" },
                { name: "Contact Us", href: "/contact-us" },
                { name: "Log in", href: "/auth?type=signin" },
                { name: "Sign Up", href: "/auth?type=signup" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-gray-800 hover:underline transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Legal & Social */}
          <div>
            <h5 className="text-xl mb-4 font-medium">Legal</h5>
            <ul className="space-y-1.5 text-base">
              {[
                { name: "Terms & Conditions", href: "/terms-and-conditions" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Shipping Policy", href: "/shipping-policy" },
                { name: "Payment Policy", href: "/payment-policy" },
                { name: "Refund Policy", href: "/refund-policy" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-gray-800 hover:underline transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <p className="text-sm text-gray-700 mb-2">Follow us</p>
              <div className="flex items-center space-x-3 text-gray-800 text-xl">
                <Link href="#">
                  <FaInstagram className="hover:text-pink-600 transition" />
                </Link>
                <Link href="#">
                  <FaFacebookF className="hover:text-blue-600 transition" />
                </Link>
                <Link href="#">
                  <FaPinterestP className="hover:text-red-600 transition" />
                </Link>
                <Link href="#">
                  <FaTwitter className="hover:text-sky-500 transition" />
                </Link>
                <Link href="#">
                  <FaSnapchatGhost className="hover:text-yellow-500 transition" />
                </Link>
                <Link href="#">
                  <FaYoutube className="hover:text-red-500 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Bottom Section ---- */}
        <hr className="my-6 border-gray-400" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm md:text-base gap-3 pb-4 text-gray-700">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:underline">
              Terms & Conditions
            </Link>
            <Link href="/accessibility" className="hover:underline">
              Accessibility
            </Link>
          </div>
          <p className="text-center text-gray-600">
            © 2025 AAYEU Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
