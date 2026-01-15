"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "@/components/_fields/TextField";
import SelectField from "@/components/_fields/SelectField";
import DateField from "@/components/_fields/DateField";
import CTAButton from "@/components/_common/CTAButton";
import useAxios from "@/hooks/useAxios";
import { showToast } from "@/providers/ToastProvider";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "@/store/slices/authSlice";
import formSchemas from "@/lib/formSchemas";

function ProfilePage() {
  const dispatch = useDispatch();
  const { request, loading } = useAxios();

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchemas.editProfile),
    defaultValues: {
      full_name: null,
      email: "",
      phone: null,
      gender: null,
      dob: null, // ⭐ store DOB as string
    },
  });

  // -----------------------
  // SUBMIT HANDLER
  // -----------------------
  const onSubmit = async (payload) => {
    const { data, error } = await request({
      url: "/users/update-user-profile",
      method: "PUT",
      authRequired: true,
      payload, // ⭐ send as-is, no manipulation
    });

    if (error) {
      showToast("error", error || "Failed to update profile");
    } else {
      dispatch(updateUserProfile(payload));
      showToast("success", data?.message || "Profile updated successfully");
    }
  };

  // -----------------------
  // FETCH PROFILE
  // -----------------------
  const fetchUserProfile = async () => {
    const { data, error } = await request({
      url: "/users/get-user-profile",
      method: "GET",
      authRequired: true,
    });

    if (error) {
      showToast("error", "Failed to load profile");
    } else {
      const profile = data?.data || data;

      setValue("full_name", profile.full_name || null);
      setValue("email", profile.email || "");
      setValue("phone", profile.phone || null);
      setValue("gender", profile.gender?.toLowerCase() || null);

      // ⭐ Store ISO string exactly as it comes
      setValue("dob", profile.dob || null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="max-w-[1250px] mx-auto">
      <div className="bg-white border p-6 mb-6">
        <h5 className="text-lg font-light mb-6">Profile Details</h5>

        {loading && <div className="text-center">Profile Loading...</div>}

        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ---------------- Row 1 ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="full_name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="full_name"
                    label="Full Name"
                    value={field.value ?? ""}
                    error={fieldState?.error?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="email"
                    type="email"
                    label="Email"
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </div>

            {/* ---------------- Row 2 ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="phone"
                    label="Phone"
                    value={field.value ?? ""}
                    error={fieldState?.error?.message}
                  />
                )}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField
                    field={{
                      ...field,
                      value: field.value ?? "",
                      onChange: (val) => field.onChange(val || null),
                    }}
                    label="Gender"
                    error={fieldState?.error?.message}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                )}
              />

              {/* ⭐ DATE STRING HANDLER */}
              <Controller
                name="dob"
                control={control}
                render={({ field, fieldState }) => (
                  <DateField
                    id="dob"
                    label="Date of Birth"
                    value={field.value} // ⭐ ISO string
                    onChange={(date) => field.onChange(date)} // ⭐ return ISO string or null
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </div>

            <div className="text-left">
              <CTAButton variant="solid" color="black">
                Save Changes
              </CTAButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
