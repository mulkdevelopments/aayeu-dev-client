"use client";

import { useState, useMemo } from "react";
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
import SelectField from "../_fields/SelectField"; // ✅ your custom SelectField
import CTAButton from "../_common/CTAButton";
import RadioField from "../_fields/RadioField";
import SwitchField from "../_fields/SwitchField";
import PhoneInput from "react-phone-number-input";
import countryList from "react-select-country-list";
import "react-phone-number-input/style.css";

const LABEL_OPTIONS = ["Home", "Work", "Other"];

// ✅ Validation schema
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

export default function AddAddressDialog({
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  trigger,
  onAddressSubmit,
}) {
  const [selfOpen, setSelfOpen] = useState(false);
  const open = controlledOpen ?? selfOpen;
  const onOpenChange = controlledOnChange ?? setSelfOpen;

  // ✅ Generate country list once
  const countries = useMemo(() => countryList().getData(), []);
  const defaultCountry = countries.find((c) => c.value === "AE")?.value || "AE";

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

  const onSubmit = (payload) => {
    // Convert country code to readable label
    const countryLabel =
      countries.find((c) => c.value === payload.country)?.label ||
      payload.country;

    const formatted = {
      ...payload,

      country: countryLabel,
    };

    onAddressSubmit?.(formatted);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <CTAButton color="gold">Add New Address</CTAButton>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-3xl p-0 flex flex-col rounded-none overflow-hidden"
        showCloseButton
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-lg font-semibold">
            Add New Address
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Form */}
        <div className="overflow-y-auto max-h-[60vh] px-6 py-4">
          <form
            id="add-address-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Address Type */}
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <RadioField
                  label="Address Type"
                  options={LABEL_OPTIONS.map((opt) => ({
                    label: opt,
                    value: opt,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.label?.message}
                />
              )}
            />

            {/* Address Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                key={"street"}
                name={"street"}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Full Address"}
                    placeholder={`Enter Full Address`}
                    error={errors["street"]?.message}
                  />
                )}
              />

              {["city", "state", "postal_code"].map((name) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={name
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      placeholder={`Enter ${name.replace("_", " ")}`}
                      error={errors[name]?.message}
                    />
                  )}
                />
              ))}

              {/* ✅ Country Dropdown using your SelectField */}
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
                    <label className="text-sm text-gray-700">Mobile</label>
                    <PhoneInput
                      international
                      defaultCountry="AE"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full border-b border-gray-600 px-3 py-2 text-sm placeholder:font-light"
                    />
                    {errors.mobile && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.mobile.message}
                      </p>
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
                  onChange={field.onChange}
                />
              )}
            />
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
          <CTAButton
            color="danger"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
          >
            Cancel
          </CTAButton>
          <CTAButton
            color="gold"
            form="add-address-form"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Address"}
          </CTAButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
