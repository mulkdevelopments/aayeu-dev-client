"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { login } from "@/store/slices/authSlice";
import { showToast } from "@/providers/ToastProvider";
import useCart from "@/hooks/useCart";

function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { syncGuestCartToServer } = useCart();

  const provider = searchParams.get("type") || "oauth";
  const accessToken = searchParams.get("accessToken") || null;

  const [state, setState] = useState({ loading: true, error: null });
  const hasCalled = useRef(false);

  const handleOAuthLogin = async () => {
    if (!accessToken) {
      showToast("error", "Missing login token");
      router.replace("/auth?type=signin");
      return;
    }

    try {
      const response = await axiosInstance.get("/users/get-user-profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const user = response.data?.data;
      if (!user) {
        throw new Error("Failed to load user profile");
      }

      dispatch(login({ ...user, accessToken }));

      await syncGuestCartToServer({
        isAuthenticated: true,
        accessToken,
      });

      showToast(
        "success",
        `${provider === "apple" ? "Apple" : "Google"} login successful`
      );
      router.push("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "OAuth login failed";
      setState({ loading: false, error: message });
      showToast("error", message);
      router.replace("/auth?type=signin");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      handleOAuthLogin();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {state.loading ? (
        <div className="text-lg">
          <Loader2 className="animate-spin mr-2 inline-block" />
          Logging you in...
        </div>
      ) : state.error ? (
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

export default OAuthCallback;
