"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import TextField from "@/components/_fields/TextField";
import TextareaField from "@/components/_fields/TextareaField";
import SelectField from "@/components/_fields/SelectField";
import CTAButton from "@/components/_common/CTAButton";
import formSchemas from "@/lib/formSchemas";
import { showToast } from "@/providers/ToastProvider";
import useAxios from "@/hooks/useAxios";

export default function ContactUsPage() {
  const { request, loading } = useAxios();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchemas.contact),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      reason: "",
      message: "",
      consent: false,
    },
  });

  const reasonOptions = [
    { value: "Support", label: "Support" },
    { value: "Business Inquiry", label: "Business Inquiry" },
    { value: "Feedback", label: "Feedback" },
  ];

  const onSubmit = async (form) => {
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      reason_of_contact: form.reason,
      message: form.message,
    };

    const { data, error } = await request({
      url: "/users/contact-us",
      method: "POST",
      payload: payload,
    });

    if (error) {
      showToast("error", error || "Failed to submit form. Try again.");
      return;
    }

    showToast("success", data?.message || "Message sent successfully!");
    reset();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Contact Form */}
        <div className="md:w-5/12">
          <h2 className="text-3xl font-extralight mb-6">Contact Us</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    placeholder="First Name"
                    error={errors.firstName?.message}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    placeholder="Last Name"
                    error={errors.lastName?.message}
                  />
                )}
              />
            </div>

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="email"
                  label="Email"
                  placeholder="Email"
                  error={errors.email?.message}
                />
              )}
            />

            {/* Phone Number */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>

                  <PhoneInput
                    {...field}
                    international
                    defaultCountry="AE"
                    placeholder="Enter phone number"
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

            {/* Reason */}
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Reason for Contact"
                  placeholder="Select a reason"
                  options={reasonOptions}
                  error={errors.reason?.message}
                />
              )}
            />

            {/* Message */}
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <TextareaField
                  {...field}
                  label="Message"
                  placeholder="Your message..."
                  error={errors.message?.message}
                />
              )}
            />

            {/* Consent */}
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...field}
                    checked={field.value}
                    id="newsletterCheck"
                    className="mt-1"
                  />
                  <label
                    htmlFor="newsletterCheck"
                    className="text-sm text-gray-700"
                  >
                    I agree to the Terms of Service
                  </label>
                </div>
              )}
            />
            {errors.consent && (
              <p className="mt-1 text-sm text-red-500">
                {errors.consent.message}
              </p>
            )}

            <CTAButton disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </CTAButton>
          </form>
        </div>

        {/* Illustration */}
        <div className="md:w-6/12 mt-8 md:mt-0">
          <img
            src="/assets/images/look_image_1.jpg"
            alt="Contact Illustration"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
}
