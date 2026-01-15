"use client";

import { useState } from "react";
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

export default function SignupDialog({
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  trigger,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const [selfOpen, setSelfOpen] = useState(false);
  const open = controlledOpen ?? selfOpen;
  const onOpenChange = controlledOnChange ?? setSelfOpen;

  const [mode, setMode] = useState("signup"); // signup | login

  // Use new cart architecture
  const { syncGuestCartToServer, fetchCart } = useCart();

  const { request: signUpRequest, loading } = useAxios();

  const schema = mode === "signup" ? signupSchema : loginSchema;

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (payload) => {
    const requestPayload =
      mode === "signup" ? payload : { email: payload.email, is_login: true };

    const { data, error } = await signUpRequest({
      method: "POST",
      url: "/users/register-guest-user",
      payload: requestPayload,
    });

    if (error) {
      showToast("error", error || "Something went wrong");
      return;
    }

    if (data?.status === 200 || data?.status === 201) {
      dispatch(login(data.data));
      onOpenChange(false);
      reset();
      setMode("signup");
      await syncGuestCartToServer({
        isAuthenticated: true,
        accessToken: data?.data?.accessToken,
      });
      onSuccess?.(data?.data || {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ? trigger : <CTAButton color="black">Create Account</CTAButton>}
      </DialogTrigger>

      <DialogContent
        className="rounded-none w-full max-w-md p-6 overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === "signup" ? "Create New Account" : "Login to Your Account"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between h-full max-h-[75vh]"
        >
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Signup Only Fields */}
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

            {/* Email */}
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
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
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
                  ? "Processing..."
                  : mode === "signup"
                  ? "Continue"
                  : "Login"}
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
                      reset({ email: "" });
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
      </DialogContent>
    </Dialog>
  );
}
