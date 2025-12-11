"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as gtag from "@/lib/gtag";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Build full URL: /path + ?query=params
    const fullUrl =
      pathname + (searchParams.size ? `?${searchParams.toString()}` : "");

    gtag.pageview(fullUrl);
  }, [pathname, searchParams]);

  return null;
}
