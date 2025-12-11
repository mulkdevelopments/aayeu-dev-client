"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CTAButton from "@/components/_common/CTAButton";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/components/_fields/TextField";
import SelectField from "@/components/_fields/SelectField"; // ✅ Using your custom SelectField
import RadioField from "@/components/_fields/RadioField";
import SwitchField from "@/components/_fields/SwitchField";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import PhoneInput from "react-phone-number-input";
import countryList from "react-select-country-list";
import "react-phone-number-input/style.css";

const LABEL_OPTIONS = ["Home", "Work", "Other"];

// ✅ Updated schema
const addressSchema = z.object({
  label: z.enum(LABEL_OPTIONS, { required_error: "Please select a label" }),
  street: z.string().min(1, "Full address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  mobile: z.string().nonempty("Mobile number is required"),
  is_default: z.boolean().optional().default(false),
});

export default function AddressForm({ address = null, onSuccess }) {
  const router = useRouter();
  const { request } = useAxios();

  // ✅ Load country list once
  const countries = useMemo(() => countryList().getData(), []);
  const defaultCountry = countries.find((c) => c.value === "AE")?.value || "AE";

  // ✅ Setup RHF
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: defaultCountry,
      mobile: "",
      is_default: false,
    },
  });

  // ✅ Prefill when editing
  useEffect(() => {
    if (address) {
      const matchedCountry =
        countries.find(
          (c) =>
            c.value === address.country ||
            c.label.toLowerCase() === address.country?.toLowerCase()
        )?.value || defaultCountry;

      reset({
        label: address.label || "Home",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        country: matchedCountry,
        mobile: address.mobile || "",
        is_default: !!address.is_default,
      });
    }
  }, [address, countries, defaultCountry, reset]);

  // ✅ Submit Handler
  const onSubmit = async (values) => {
    const isEditing = !!address?.id;
    const endpoint = isEditing ? `/users/update-address` : `/users/add-address`;
    const method = isEditing ? "PUT" : "POST";

    // Convert country code → readable name
    const countryLabel =
      countries.find((c) => c.value === values.country)?.label ||
      values.country;

    const payload = { ...values, country: countryLabel };

    const { data, error } = await request({
      url: endpoint,
      method,
      payload: isEditing ? { address_id: address.id, ...payload } : payload,
      authRequired: true,
    });

    if (error) {
      console.error("Error saving address:", error);
      showToast?.("error", error || "Failed to save address");
    } else {
      showToast?.(
        "success",
        data?.message ||
          (isEditing
            ? "Address updated successfully"
            : "Address added successfully")
      );
      if (onSuccess) onSuccess();
      else router.back();
    }
  };

  return (
    <div className="max-w-[1250px] mx-auto p-4">
      <div className="bg-white border p-4 mb-3">
        <h5 className="font-light text-lg mb-0">
          {address ? "Edit Address" : "Add New Address"}
        </h5>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border p-6 space-y-6"
        noValidate
      >
        {/* Label (RadioField) */}
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <RadioField
              label="Address Type"
              options={LABEL_OPTIONS.map((option) => ({
                label: option,
                value: option,
              }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.label?.message}
            />
          )}
        />

        {/* Address Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={"Full Address"}
                error={errors.street?.message}
              />
            )}
          />

          {["city", "state", "postal_code"].map((fieldName) => (
            <Controller
              key={fieldName}
              name={fieldName}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={fieldName
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  inputMode={fieldName === "postal_code" ? "text" : undefined}
                  error={errors[fieldName]?.message}
                />
              )}
            />
          ))}

          {/* ✅ Country SelectField */}
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <SelectField
                field={field}
                label="Country"
                placeholder="Select Country"
                options={countries.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                error={errors.country?.message}
              />
            )}
          />

          {/* ✅ Mobile Number */}
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-700">Mobile</label>
                <PhoneInput
                  international
                  defaultCountry="AE"
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full border-b border-gray-600 px-3 py-3 text-sm placeholder:font-light"
                />
                {errors.mobile?.message && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.mobile.message}
                  </span>
                )}
              </div>
            )}
          />
        </div>

        {/* Default Switch */}
        <Controller
          name="is_default"
          control={control}
          render={({ field }) => (
            <SwitchField
              label="Set as default address"
              value={field.value}
              onChange={(checked) => field.onChange(checked)}
            />
          )}
        />

        {/* Actions */}
        <div className="pt-4 flex flex-col md:flex-row gap-3 items-center">
          <CTAButton
            color="gold"
            type="submit"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? address
                ? "Updating..."
                : "Saving..."
              : address
              ? "Update Address"
              : "Save Address"}
          </CTAButton>
        </div>
      </form>
    </div>
  );
}
