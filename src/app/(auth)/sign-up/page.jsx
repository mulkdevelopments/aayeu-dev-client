"use client";

import { useState } from "react";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
import CTAButton from "@/components/_common/CTAButton";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // simulate submit — replace with your API call
    setTimeout(() => {
      setLoading(false);
      alert(`Submitted: ${JSON.stringify(form, null, 2)}`);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 font-poppins">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-12 items-center">
          {/* Video Column */}
          {/* <div className="col-span-12 md:col-span-7">
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
          </div> */}

          {/* Signup Form Column */}
          <div className="col-span-12 md:col-span-5">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-[200] tracking-tight mb-6">
                CREATE AN ACCOUNT
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-[300] mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter Your Name"
                    className="w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-[300] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    className="w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-[300] mb-2"
                  >
                    Mobile
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="text"
                    required
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter Your Mobile"
                    className="w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Submit + Login link */}
                <div className="flex items-center justify-between">
                  <CTAButton>{loading ? "Signing Up..." : "Sign Up"}</CTAButton>

                  <p className="text-sm font-[300]">
                    Already have an account?{" "}
                    <CTAButton
                      as={"link"}
                      href="/login"
                      variant="text"
                      color="black"
                    >
                      Log In
                    </CTAButton>
                  </p>
                </div>

                {/* Social Logins */}
                <div className="mt-3">
                  <label className="block text-sm font-[300] mb-3">
                    Social Login
                  </label>
                  <div className="flex gap-4 text-xl">
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
