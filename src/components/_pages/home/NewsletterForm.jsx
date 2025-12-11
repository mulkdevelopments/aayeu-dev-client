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
    <div className="relative z-10 mt-6 lg:mt-auto w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-3 w-full"
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
              <div className="flex w-full bg-black/50 rounded-full overflow-hidden">
                <input
                  {...field}
                  type="email"
                  placeholder="Email"
                  className={clsx(
                    "flex-grow px-4 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none",
                    { "border border-red-500": errors.email }
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#c38e1e] text-white px-6 py-2 text-sm font-medium hover:bg-[#a87518] transition disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "SUBSCRIBE"}
                </button>
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
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
            <label className="flex items-center text-sm text-white gap-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="accent-[#c38e1e]"
              />
              I agree with the{" "}
              <Link href="#" className="underline">
                Terms of service
              </Link>
            </label>
          )}
        />

        {errors.agree && (
          <p className="text-red-400 text-xs">{errors.agree.message}</p>
        )}
      </form>
    </div>
  );
}
