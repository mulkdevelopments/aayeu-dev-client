"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
import { Mail, User, Phone, Lock, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import TextField from "@/components/_fields/TextField";
import formSchemas from "@/lib/formSchemas";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import { login } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";

/* ----- Social Icon ----- */
function SocialIcon({ icon, color, label }) {
  return (
    <Link
      href="#"
      className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 group"
      aria-label={label}
    >
      <span className={`text-lg transition-colors duration-200 ${color}`}>
        {icon}
      </span>
    </Link>
  );
}

/* ----- Custom Input Field ----- */
function InputField({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-white border-2 ${
            error ? 'border-red-500' : 'border-gray-200'
          } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ----- Authentication Form ----- */
export default function AuthForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "signin";
  const router = useRouter();
  const dispatch = useDispatch();

  const { request, loading } = useAxios();

  const schema =
    type === "signup"
      ? formSchemas.signUp
      : type === "signin"
        ? formSchemas.signIn
        : formSchemas.forgotPassword;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      type === "signup"
        ? { name: "", email: "", phone: "" }
        : type === "signin"
          ? { email: "" }
          : { email: "" },
  });

  const onSubmit = async (payload) => {
    const { data, error } = await request({
      url:
        type === "signup"
          ? "/users/register-user"
          : type === "signin"
            ? "/users/send-magic-link"
            : "/auth/forgot-password",
      method: "POST",
      payload: { ...payload, redirectUrl: process.env.NEXT_PUBLIC_APP_URL },
    });

    if (error) return showToast("error", error);

    if (data.status === 201 || data.status === 200) {
      dispatch(login(data.data));
      showToast("success", data?.message || "Operation successful");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-10">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full mb-4 shadow-lg shadow-amber-500/30">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {type === "signup" && "Create Account"}
            {type === "signin" && "Welcome Back"}
            {type === "forgot-password" && "Reset Password"}
          </h1>
          <p className="text-gray-600">
            {type === "signup"
              ? "Join us and start shopping today"
              : type === "signin"
                ? "Sign in to your account"
                : "We'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {type === "signup" && (
            <>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputField
                    {...field}
                    label="Full Name"
                    placeholder="Enter your full name"
                    icon={User}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    {...field}
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    icon={Mail}
                    error={errors.email?.message}
                  />
                )}
              />

              {/* Phone Number Field */}
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                        <Phone className="w-5 h-5" />
                      </div>
                      <PhoneInput
                        {...field}
                        international
                        defaultCountry="AE"
                        placeholder="Enter mobile number"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        className="phone-input-custom"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </>
          )}

          {type === "signin" && (
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  icon={Mail}
                  error={errors.email?.message}
                />
              )}
            />
          )}

          {type === "forgot-password" && (
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  icon={Mail}
                  error={errors.email?.message}
                />
              )}
            />
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold text-base hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {type === "signup"
                      ? "Creating Account..."
                      : type === "signin"
                        ? "Signing In..."
                        : "Sending Link..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {type === "signup"
                      ? "Create Account"
                      : type === "signin"
                        ? "Sign In"
                        : "Send Reset Link"}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center pt-2">
            {type === "signup" && (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth?type=signin"
                  className="font-semibold text-amber-600 hover:text-amber-700 underline"
                >
                  Sign In
                </Link>
              </p>
            )}

            {type === "signin" && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Don't have an account?{" "}
                  <Link
                    href="/auth?type=signup"
                    className="font-semibold text-amber-600 hover:text-amber-700 underline"
                  >
                    Create Account
                  </Link>
                </p>
                {/* <Link
                  href="/auth?type=forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Forgot your password?
                </Link> */}
              </>
            )}

            {type === "forgot-password" && (
              <p className="text-sm text-gray-600">
                Remembered your password?{" "}
                <Link
                  href="/auth?type=signin"
                  className="font-semibold text-amber-600 hover:text-amber-700 underline"
                >
                  Sign In
                </Link>
              </p>
            )}
          </div>

          {/* Divider */}
          {/* {(type === "signin" || type === "signup") && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>
          )} */}

          {/* Social Login */}
          {/* {(type === "signin" || type === "signup") && (
            <div className="flex items-center justify-center gap-4">
              <SocialIcon
                icon={<FaGoogle />}
                color="group-hover:text-red-500"
                label="Sign in with Google"
              />
              <SocialIcon
                icon={<FaFacebook />}
                color="group-hover:text-blue-600"
                label="Sign in with Facebook"
              />
              <SocialIcon
                icon={<FaInstagram />}
                color="group-hover:text-pink-500"
                label="Sign in with Instagram"
              />
            </div>
          )} */}
        </form>
      </div>


      {/* Custom Phone Input Styles */}
      <style jsx global>{`
        .phone-input-custom input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          transition: all 0.2s;
        }

        .phone-input-custom input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .phone-input-custom input::placeholder {
          color: #9ca3af;
        }

        .phone-input-custom .PhoneInputCountry {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
        }
      `}</style>
    </div>
  );
}
