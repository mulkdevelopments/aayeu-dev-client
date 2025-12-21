import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";

export default function NewsletterForm() {
  const { request, loading } = useAxios();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      agree: false,
    },
  });

  const onSubmit = async (values) => {
    console.log("Newsletter form submitted:", values);

    const { data, error } = await request({
      url: "/users/subscribe-newsletter",
      method: "POST",
      payload: {
        email: values.email,
      },
    });

    if (error) showToast("error", error || error.message);
    else {
      showToast(
        "success",
        data?.message || "Subscribed to newsletter successfully!"
      );
      reset();
    }
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 w-full"
      >
        {/* ---------------- EMAIL INPUT ---------------- */}
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
            <div className="flex flex-col w-full">
              <div className="flex w-full border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
                <input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className={clsx(
                    "flex-grow px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none",
                    { "border-red-500": errors.email }
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white px-4 py-2 text-xs font-semibold hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "SUBSCRIBE"}
                </button>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        />

        {/* ---------------- TERMS CHECKBOX ---------------- */}
        <Controller
          name="agree"
          control={control}
          rules={{ required: "You must agree to the terms" }}
          render={({ field }) => (
            <label className="flex items-start text-xs text-gray-600 gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="accent-amber-500 mt-0.5 cursor-pointer"
              />
              <span>
                I agree with the{" "}
                <Link href="/terms-and-conditions" className="text-amber-600 hover:text-amber-700 underline">
                  Terms of service
                </Link>
              </span>
            </label>
          )}
        />

        {errors.agree && (
          <p className="text-red-500 text-xs">{errors.agree.message}</p>
        )}
      </form>
    </div>
  );
}
