"use client";

import usePolicies from "@/hooks/usePolicies";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PolicyRenderer({ type }) {
  const { policies, ensurePolicyLoaded } = usePolicies();
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const policy = useMemo(() => policies?.[type] ?? null, [policies, type]);

  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const load = async () => {
      try {
        const res = await ensurePolicyLoaded(type);

        if (!active) return;
        if (!res?.data && !policies[type]) {
          setStatus("error");
          return;
        }

        setStatus("ready");
      } catch (err) {
        if (active) setStatus("error");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [type, ensurePolicyLoaded]);

  /* ---------------------------- LOADING UI ---------------------------- */
  if (status === "loading") {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-[1250px] mx-auto px-5 py-12 space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-40" />
          <div className="space-y-3 mt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------- ERROR UI ---------------------------- */
  if (status === "error" || !policy) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Failed to load policy. Please try again later.
      </div>
    );
  }

  /* ---------------------------- SUCCESS UI ---------------------------- */
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1250px] mx-auto px-5 py-12">
        {/* Title */}
        <h1 className="mb-2 text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
          {policy.title}
        </h1>

        {/* Updated timestamp */}
        <p className="text-gray-500 mb-6">
          Last updated:{" "}
          {policy.updated_at
            ? new Date(policy.updated_at).toDateString()
            : "—"}
        </p>

        {/* Actual content */}
        <article
          className="mt-6 prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: policy.content || "<p>No content available.</p>",
          }}
        />
      </div>
    </div>
  );
}
