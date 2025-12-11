"use client";

import { useState } from "react";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
import CTAButton from "@/components/_common/CTAButton";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // simulate submit — replace with your auth call
    setTimeout(() => {
      setLoading(false);
      alert(`Submitted: ${email}`);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 font-poppins">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid items-center gap-8 md:grid-cols-12">
          {/* Video column */}
          <div className="col-span-12 md:col-span-7">
            <div className="relative w-full h-80 md:h-[520px] overflow-hidden">
              <video
                className="w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src="/assets/video/bnr_vdo.webm" type="video/webm" />
                <source src="/assets/video/bnr_vdo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Form column */}
          <div className="col-span-12 md:col-span-5">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-[200] tracking-tight">LOG IN</h2>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-[300] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email Address"
                    className="w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <CTAButton>{loading ? "Logging In..." : "Log In"}</CTAButton>

                  <p className="text-sm font-[300]">
                    Don't have an account?{" "}
                    <CTAButton
                      as={"link"}
                      href="/signup"
                      variant="text"
                      color="gold"
                    >
                      Sign Up
                    </CTAButton>
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-[300] mb-3">
                    Social Login
                  </label>

                  <div className="flex items-center gap-4 text-xl">
                    <Link
                      href="#"
                      aria-label="Instagram"
                      className="hover:text-pink-500 transition-colors"
                    >
                      <FaInstagram />
                    </Link>
                    <Link
                      href="#"
                      aria-label="Facebook"
                      className="hover:text-blue-600 transition-colors"
                    >
                      <FaFacebook />
                    </Link>
                    <Link
                      href="#"
                      aria-label="Google"
                      className="hover:text-red-500 transition-colors"
                    >
                      <FaGoogle />
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
