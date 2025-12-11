"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import routesConfig from "@/config/routes.config";

export default function PageHeader({ showBack = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Clean path (ignore query string)
  const cleanPath = pathname.split("?")[0];

  // Get current route config
  const currentRoute = routesConfig[cleanPath] || {};
  const { title, subtitle, crumbs = [] } = currentRoute;

  // Final breadcrumb list
  let breadcrumbItems = [...crumbs];

  // --- Add query-based crumbs ---
  if (currentRoute.queryMap) {
    for (const [param, map] of Object.entries(currentRoute.queryMap)) {
      const value = searchParams.get(param);
      if (value && map[value]) {
        breadcrumbItems.push({
          label: map[value],
          href: null, // last item, not clickable
        });
      }
    }
  }

  // --- Add param-based crumbs ---
  if (currentRoute.paramsMap) {
    const segments = cleanPath.split("/").filter(Boolean);
    Object.entries(currentRoute.paramsMap).forEach(([param, label]) => {
      // check if param exists in last segment (e.g. /admin/staff/123)
      const lastSeg = segments[segments.length - 1];
      if (!isNaN(lastSeg) || lastSeg.match(/^[a-f0-9-]+$/i)) {
        breadcrumbItems.push({
          label,
          href: null,
        });
      }
    });
  }

  // --- Fallback: auto-generate crumbs ---
  if (breadcrumbItems.length === 0) {
    const segments = cleanPath.split("/").filter(Boolean);
    breadcrumbItems = segments.map((seg, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      return {
        label: seg.charAt(0).toUpperCase() + seg.slice(1),
        href: i < segments.length - 1 ? href : null,
      };
    });
  }

  return (
    <div className="w-full border-b py-4 flex flex-col gap-3 mb-4">
      {/* Row 1: Back + Breadcrumb */}
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              Back
            </span>
          </Button>
        )}

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((crumb, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Row 2: Title + Subtitle */}
      <div>
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
