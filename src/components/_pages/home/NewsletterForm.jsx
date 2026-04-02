"use client";

import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";

export default function NewsletterForm() {
  const { request, loading } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      agree: false,
    },
  });

  const onSubmit = async (values) => {
    const { data, error } = await request({
      url: "/users/subscribe-newsletter",
      method: "POST",
      payload: {
        email: values.email,
      },
    });

    if (error) {
      showToast("error", error || "Something went wrong");
      return;
    }

    if (data?.data?.alreadySubscribed) {
      showToast(
        "info",
        data?.message || "You're already subscribed with this email."
      );
      return;
    }

    showToast(
      "success",
      data?.message || "Thanks for subscribing — check your inbox."
    );
    reset();
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
        noValidate
      >
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          }}
          render={({ field }) => (
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
                <input
                  {...field}
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={clsx(
                    "min-h-[48px] w-full flex-1 rounded-xl border bg-white px-4 text-base text-neutral-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:min-h-[44px] sm:text-sm",
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-neutral-200 focus:border-neutral-400 focus:ring-neutral-900/10"
                  )}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[48px] shrink-0 touch-manipulation items-center justify-center rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 sm:min-h-[44px] sm:min-w-[8.5rem]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2
                        className="h-4 w-4 shrink-0 animate-spin"
                        aria-hidden
                      />
                      <span>Subscribing…</span>
                    </span>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="agree"
          control={control}
          rules={{ required: "Please accept the terms to continue" }}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg py-0.5 text-sm leading-snug text-neutral-600 transition-colors hover:text-neutral-800">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/15 focus:ring-offset-0"
              />
              <span className="text-xs leading-relaxed sm:text-sm">
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                >
                  Terms of service
                </Link>
              </span>
            </label>
          )}
        />

        {errors.agree && (
          <p className="text-xs font-medium text-red-600" role="alert">
            {errors.agree.message}
          </p>
        )}
      </form>
    </div>
  );
}
