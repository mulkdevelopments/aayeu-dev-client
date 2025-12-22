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
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50/10 to-white text-gray-900 font-poppins">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {type === "magic-login" ? (
          <>
            <MagicLogin />
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <AuthForm type={type} />
          </div>
        )}
      </div>
    </main>
  );
}
