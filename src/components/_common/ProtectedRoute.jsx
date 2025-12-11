"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Spinner } from "../ui/spinner";

/**
 * A unified protection wrapper
 * Supports 3 modes:
 *  - layout → protect entire route groups
 *  - page → protect individual pages
 *  - component → show "Login to Continue" prompt inline
 */
export default function ProtectedRoute({
  children,
  mode = "layout", // "layout" | "page" | "component"
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // local loading for client-side hydration phase
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // small delay to allow hydration / store load
    const timer = setTimeout(() => {
      setChecking(false);
    }, 300);

    // Redirect if not logged in for layout/page level
    if (!isAuthenticated && mode !== "component") {
      router.replace("/auth?type=signin");
    }

    return () => clearTimeout(timer);
  }, [isAuthenticated, mode, router]);

  // Show loader briefly while verifying auth state
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <Spinner className="h-8 w-8" />
          <span className="text-gray-600 text-sm">
            Checking authentication...
          </span>
        </div>
      </div>
    );
  }

  // layout/page-level: redirect handled above
  if (mode !== "component") {
    return isAuthenticated && user ? children : null;
  }

  // component-level: show inline login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-700 mb-3 text-center">
          Please login to continue
        </p>
        <button
          onClick={() => router.push("/auth?type=signin")}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Login
        </button>
      </div>
    );
  }

  return children;
}
