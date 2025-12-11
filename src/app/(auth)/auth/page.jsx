"use client";

import { useSearchParams } from "next/navigation";
import VideoSection from "@/components/_pages/auth/VideoSection";
import AuthForm from "@/components/_pages/auth/AuthForm";
import MagicLogin from "@/components/_pages/auth/MagicLogin";

/* Main Authentication Page */
export default function AuthenticationPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "signin";

  if (process.env.NODE_ENV === "development") {
    console.log("type:", type);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 font-poppins">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {type === "magic-login" ? (
          <>
            <MagicLogin />
          </>
        ) : (
          <div className="grid items-center gap-8 md:grid-cols-12">
            <VideoSection />
            <AuthForm type={type} />
          </div>
        )}
      </div>
    </main>
  );
}
