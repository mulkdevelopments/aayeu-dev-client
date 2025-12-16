"use client";

import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import { login } from "@/store/slices/authSlice";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import useCart from "@/hooks/useCart";

function MagicLogin() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || null;

  const dispatch = useDispatch();
  const router = useRouter();

  const { request, loading, error } = useAxios();

  // from new optimized cart system
  const { syncGuestCartToServer } = useCart();

  const handleMagicLogin = async () => {
    if (!token) {
      showToast("error", "Invalid or missing token");
      router.push("/auth?type=signin");
      return;
    }

    const { data, error } = await request({
      url: "/users/login-with-magic-link",
      method: "POST",
      payload: { token },
    });

    if (error) {
      console.error("Magic login error:", error);
      showToast("error", error || "Magic login failed");
      router.push("/auth?type=signin");
      return;
    }

    if (data.status === 200) {
      const userData = data.data;

      // 🔥 login user
      dispatch(login(userData));

      // 🔥 sync guest → server
      await syncGuestCartToServer({
        isAuthenticated: true,
        accessToken: userData?.accessToken,
      });

      showToast("success", data?.message || "Magic login successful");
      router.push("/");
    }
  };

  const hasCalled = React.useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      handleMagicLogin();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div className="text-lg">
          <Loader2 className="animate-spin mr-2 inline-block" />
          Logging you in...
        </div>
      ) : error ? (
        <div className="text-lg">
          <XCircle className="text-red-500 mr-2 inline-block" />
          Login failed! Please try again.
        </div>
      ) : (
        <div className="text-lg">
          <CheckCircle2 className="text-green-500 mr-2 inline-block" />
          Login successful! Redirecting...
        </div>
      )}
    </div>
  );
}

export default MagicLogin;
