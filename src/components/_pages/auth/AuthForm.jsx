"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
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
function SocialIcon({ icon, color }) {
  return (
    <Link href="#" className={`transition-colors duration-200 ${color}`}>
      {icon}
    </Link>
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
      payload: { ...payload, redirectUrl: window.location.origin },
    });

    if (error) return showToast("error", error);

    if (data.status === 201 || data.status === 200) {
      dispatch(login(data.data));
      showToast("success", data?.message || "Operation successful");
    }
  };

  return (
    <div className="col-span-12 md:col-span-5">
      <div className="max-w-md w-full mx-auto p-6 md:p-0">
        {/* Header */}
        <h2 className="text-3xl font-[200] tracking-tight mb-2">
          {type === "signup" && "Create an Account"}
          {type === "signin" && "Log In"}
          {type === "forgot-password" && "Forgot Password?"}
        </h2>
        <p className="text-gray-700 text-base mb-6">
          {type === "signup"
            ? "Fill in the form to create a new account."
            : type === "signin"
              ? "Enter your email to log in."
              : "You can reset your password here."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {type === "signup" && (
            <>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    placeholder="Enter Your Name"
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    placeholder="Enter Your Email"
                    error={errors.email?.message}
                  />
                )}
              />

              {/* 📱 Mobile Number Field */}
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile Number
                    </label>
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="AE"
                      placeholder="Enter mobile number"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      className="w-full border-b border-gray-600 px-3 py-3 text-sm placeholder:font-light"
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

          {type === "signin" && (
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Enter Your Email"
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
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Enter Your Email"
                  error={errors.email?.message}
                />
              )}
            />
          )}

          {/* Submit + Links */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center bg-black text-white py-2 px-5 text-sm font-medium rounded-none disabled:opacity-60 transition-colors duration-200"
            >
              {loading
                ? type === "signup"
                  ? "Signing up..."
                  : type === "signin"
                    ? "Logging in..."
                    : "Sending link..."
                : type === "signup"
                  ? "Sign Up"
                  : type === "signin"
                    ? "Log In"
                    : "Reset Password"}
            </button>

            {type === "signup" && (
              <p className="text-sm font-[300]">
                Already have an account?{" "}
                <Link href="/auth?type=signin" className="underline">
                  Log In
                </Link>
              </p>
            )}

            {type === "signin" && (
              <p className="text-sm font-[300]">
                Don&apos;t have an account?{" "}
                <Link href="/auth?type=signup" className="underline">
                  Sign Up
                </Link>
              </p>
            )}

            {type === "forgot-password" && (
              <p className="text-sm font-[300]">
                Remembered your password?{" "}
                <Link href="/auth?type=signin" className="underline">
                  Log In
                </Link>
              </p>
            )}
          </div>

          {/* 🌐 Social Login */}
          {(type === "signin" || type === "signup") && (
            <div className="mt-4">
              <label className="block text-sm font-[300] mb-3">
                Social Login
              </label>
              <div className="flex items-center gap-4 text-xl">
                <SocialIcon
                  icon={<FaInstagram />}
                  color="hover:text-pink-500"
                />
                <SocialIcon icon={<FaFacebook />} color="hover:text-blue-600" />
                <SocialIcon icon={<FaGoogle />} color="hover:text-red-500" />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
