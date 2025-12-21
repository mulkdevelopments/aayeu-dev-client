"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/assets/images/aayeu_logo.png"
                alt="AAYEU"
                width={140}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
              Curated collections that inspire style. Quality craftsmanship meets timeless design.
            </p>
            <div className="space-y-2 text-sm">
              <Link
                href="mailto:help@aayeu.com"
                className="block text-gray-900 hover:text-gray-600 transition-colors"
              >
                help@aayeu.com
              </Link>
              <p className="text-gray-500">Mon - Fri: 10:00 AM - 6:00 PM</p>
            </div>
          </div>

          {/* Shop Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-6 text-gray-900">
              Shop
            </h3>
            <ul className="space-y-3">
              {["Clothing", "Shoes", "Bags", "Accessories", "Jewellery", "Brands"].map((item) => (
                <li key={item}>
                  <Link
                    href="/shop"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-6 text-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "/about-us" },
                { name: "Contact", href: "/contact-us" },
                { name: "Shipping", href: "/shipping-policy" },
                { name: "Returns", href: "/refund-policy" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-6 text-gray-900">
              Account
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Sign In", href: "/auth?type=signin" },
                { name: "Register", href: "/auth?type=signup" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-6 text-gray-900">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Pinterest"
              >
                <FaPinterestP className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 AAYEU. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/accessibility"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}