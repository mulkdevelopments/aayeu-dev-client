"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextField from "../_fields/TextField";
import CTAButton from "../_common/CTAButton";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import useAxios from "@/hooks/useAxios";
import { login } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { showToast } from "@/providers/ToastProvider";
import useCart from "@/hooks/useCart";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => /^\+?[1-9]\d{6,14}$/.test(val), {
      message: "Enter a valid phone number (with country code)",
    }),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const allowedDomains = ["mulkholdings.com", "aayeu.com"];

function isAllowedEmail(value) {
  if (!value) return false;
  const email = String(value).trim().toLowerCase();
  const domain = email.split("@")[1] || "";
  return allowedDomains.includes(domain);
}

export default function SignupDialog({
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  trigger,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [selfOpen, setSelfOpen] = useState(false);
  const open = controlledOpen ?? selfOpen;

  const [phase, setPhase] = useState("form"); // form | otp | request_access
  const [mode, setMode] = useState("signup");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");

  const { syncGuestCartToServer } = useCart();
  const { request, loading } = useAxios();

  const resolver = useMemo(
    () => zodResolver(mode === "signup" ? signupSchema : loginSchema),
    [mode]
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver,
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (!nextOpen) {
        setPhase("form");
        setPendingEmail("");
        setOtpCode("");
        setRequestName("");
        setRequestEmail("");
        setMode("signup");
        reset({
          full_name: "",
          email: "",
          phone: "",
        });
      }
      if (controlledOnChange) controlledOnChange(nextOpen);
      else setSelfOpen(nextOpen);
    },
    [controlledOnChange, reset]
  );

  const sendLoginOtpToEmail = async (email) => {
    const normalized = String(email).trim().toLowerCase();
    const { data, error } = await request({
      method: "POST",
      url: "/users/send-login-otp",
      payload: {
        email: normalized,
        redirectUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
    if (error) {
      showToast("error", error || "Something went wrong");
      return false;
    }
    if (data?.status === 200 || data?.status === 201) {
      setPendingEmail(normalized);
      setOtpCode("");
      setPhase("otp");
      showToast("success", data?.message || "Check your email for a code");
      return true;
    }
    return false;
  };

  const onMainSubmit = async (payload) => {
    if (mode === "signup") {
      if (!isAllowedEmail(payload.email)) {
        const normalized = String(payload.email).trim().toLowerCase();
        const { data: statusRes, error: statusErr } = await request({
          method: "POST",
          url: "/users/access-request-status",
          payload: { email: normalized },
        });
        if (statusErr) {
          showToast("error", statusErr || "Could not check access status");
          return;
        }
        const accessStatus = statusRes?.data?.accessStatus;

        if (accessStatus === "approved") {
          await sendLoginOtpToEmail(normalized);
          return;
        }
        if (accessStatus === "pending") {
          showToast(
            "info",
            "We already have an access request for this email. We will email you when it has been reviewed."
          );
          return;
        }

        setRequestName(payload.full_name.trim());
        setRequestEmail(normalized);
        setPhase("request_access");
        showToast(
          "info",
          "Members use @mulkholdings.com or @aayeu.com. Submit a request below and we’ll email you when you’re approved."
        );
        return;
      }

      const { data, error } = await request({
        method: "POST",
        url: "/users/register-user",
        payload: {
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone,
          redirectUrl: process.env.NEXT_PUBLIC_APP_URL,
        },
      });

      if (error) {
        showToast("error", error || "Something went wrong");
        return;
      }

      if (data?.status === 200 || data?.status === 201) {
        setPendingEmail(String(payload.email).trim().toLowerCase());
        setOtpCode("");
        setPhase("otp");
        showToast("success", data?.message || "Check your email for a code");
      }
      return;
    }

    if (mode === "login") {
      if (!isAllowedEmail(payload.email)) {
        const normalized = String(payload.email).trim().toLowerCase();
        const { data: statusRes, error: statusErr } = await request({
          method: "POST",
          url: "/users/access-request-status",
          payload: { email: normalized },
        });
        if (statusErr) {
          showToast("error", statusErr || "Could not check access status");
          return;
        }
        const accessStatus = statusRes?.data?.accessStatus;

        if (accessStatus === "approved") {
          await sendLoginOtpToEmail(normalized);
          return;
        }
        if (accessStatus === "pending") {
          showToast(
            "info",
            "We already have an access request for this email. We will email you when it has been reviewed."
          );
          return;
        }

        setRequestName("");
        setRequestEmail(normalized);
        setPhase("request_access");
        showToast(
          "info",
          "This email isn’t on the members list yet. Tell us your name below to request access."
        );
        return;
      }

      await sendLoginOtpToEmail(payload.email);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;
    const { data, error } = await request({
      method: "POST",
      url: "/users/send-login-otp",
      payload: {
        email: pendingEmail,
        redirectUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
    if (error) return showToast("error", error);
    showToast("success", data?.message || "We sent a new code");
  };

  const handleVerifyOtp = async () => {
    const normalized = String(otpCode).replace(/\s/g, "");
    if (!/^\d{6}$/.test(normalized)) {
      showToast("error", "Enter the 6-digit code from your email");
      return;
    }
    const { data, error } = await request({
      method: "POST",
      url: "/users/verify-login-otp",
      payload: { email: pendingEmail, otp: normalized },
    });
    if (error) {
      showToast("error", error);
      return;
    }
    if (data?.status === 200) {
      dispatch(login(data.data));
      await syncGuestCartToServer({
        isAuthenticated: true,
        accessToken: data.data?.accessToken,
      });
      showToast("success", data?.message || "Signed in");
      handleOpenChange(false);
      onSuccess?.(data.data || {});
      router.refresh();
    }
  };

  const submitRequestAccess = async (e) => {
    e.preventDefault();
    const full_name = requestName.trim();
    const email = requestEmail.trim().toLowerCase();
    if (!full_name) {
      showToast("error", "Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "Please enter a valid email.");
      return;
    }
    setRequestSubmitting(true);
    const { data, error } = await request({
      method: "POST",
      url: "/users/request-access",
      payload: { full_name, email },
    });
    setRequestSubmitting(false);
    if (error) {
      showToast("error", error || "Failed to submit request");
      return;
    }
    if (data?.status === 200 || data?.status === 201) {
      const meta = data?.data;
      if (meta?.alreadyApproved) {
        showToast(
          "success",
          data?.message ||
            "You are already approved. Use Sign in and we will email you a one-time code."
        );
      } else if (meta?.alreadyPending) {
        showToast(
          "info",
          data?.message ||
            "We already have a request for this email. We will email you when it has been reviewed."
        );
      } else {
        showToast(
          "success",
          data?.message ||
            "Thanks — we received your request. We will email you when your access is approved."
        );
      }
      handleOpenChange(false);
    }
  };

  const titleForPhase = () => {
    if (phase === "otp") return "Enter your code";
    if (phase === "request_access") return "Request access";
    return mode === "signup" ? "Create New Account" : "Login to Your Account";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? trigger : <CTAButton color="black">Create Account</CTAButton>}
      </DialogTrigger>

      <DialogContent
        className="rounded-none w-full max-w-md p-6 overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {titleForPhase()}
          </DialogTitle>
          {phase === "otp" && (
            <p className="text-sm text-muted-foreground font-normal pt-1">
              We sent a 6-digit code to {pendingEmail}
            </p>
          )}
          {phase === "request_access" && (
            <p className="text-sm text-muted-foreground font-normal pt-1">
              Members use @mulkholdings.com or @aayeu.com. We’ll notify you by
              email when your request is approved.
            </p>
          )}
        </DialogHeader>

        {phase === "otp" && (
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg tracking-widest text-center"
              />
            </div>
            <CTAButton
              color="black"
              type="button"
              disabled={loading}
              onClick={handleVerifyOtp}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Verify & sign in"
              )}
            </CTAButton>
            <div className="flex flex-col sm:flex-row gap-2 justify-between text-sm">
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium disabled:opacity-50"
                disabled={loading}
                onClick={handleResendOtp}
              >
                Resend code
              </button>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setPhase("form");
                  setOtpCode("");
                  setPendingEmail("");
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {phase === "request_access" && (
          <form
            onSubmit={submitRequestAccess}
            className="flex flex-col gap-4 py-2"
          >
            <TextField
              label="Full Name"
              placeholder="Your full name"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
            />
            <TextField
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <CTAButton
                type="button"
                color="danger"
                className="flex-1"
                onClick={() => setPhase("form")}
              >
                <span className="inline-flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </span>
              </CTAButton>
              <CTAButton
                type="submit"
                color="black"
                className="flex-1"
                disabled={requestSubmitting}
              >
                {requestSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  "Submit request"
                )}
              </CTAButton>
            </div>
          </form>
        )}

        {phase === "form" && (
          <form
            onSubmit={handleSubmit(onMainSubmit)}
            className="flex flex-col justify-between h-full max-h-[75vh]"
          >
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {mode === "signup" && (
                <>
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        placeholder="Enter your full name"
                        error={errors.full_name?.message}
                      />
                    )}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-light mb-1">
                          Phone Number
                        </label>
                        <PhoneInput
                          {...field}
                          international
                          defaultCountry="AE"
                          placeholder="Enter phone number"
                          onChange={(value) => field.onChange(value)}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </>
              )}

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                  />
                )}
              />
            </div>

            <DialogFooter className="flex flex-col gap-3 pt-6 border-t mt-4">
              <div className="flex justify-end items-center gap-3 w-full">
                <CTAButton
                  type="button"
                  color="danger"
                  onClick={() => handleOpenChange(false)}
                  className="min-w-[100px]"
                >
                  Cancel
                </CTAButton>

                <CTAButton
                  color="black"
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading
                    ? mode === "signup"
                      ? "Sending..."
                      : "Sending code..."
                    : mode === "signup"
                      ? "Continue"
                      : "Send code"}
                </CTAButton>
              </div>

              <div className="text-center text-sm text-gray-500 mt-2">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => {
                        setMode("login");
                        reset({ email: "", full_name: "", phone: "" });
                      }}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => {
                        setMode("signup");
                        reset();
                      }}
                    >
                      Create one
                    </button>
                  </>
                )}
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
