"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/_common/ProtectedRoute";
import CTAButton from "@/components/_common/CTAButton";

const sidebarLinks = [
  {
    section: "Dashboard",
    items: [{ href: "/profile-overview", label: "Overview", isActive: true }],
  },
  {
    section: "Orders",
    items: [{ href: "/orders", label: "Orders & Returns", isActive: true }],
  },
  {
    section: "Credits",
    items: [
      { href: "/coupons", label: "Coupons", isActive: false }, // Hidden
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/profile", label: "Profile", isActive: true },
      { href: "/saved-cards", label: "Saved Cards", isActive: false },
      { href: "/saved-wallets", label: "Wallet", isActive: false },
      { href: "/addresses", label: "Addresses", isActive: true },
      { href: "/wishlists", label: "Wishlist", isActive: true },
    ],
  },
];

export default function ProfileOverviewLayout({ children }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute mode="layout">
      <main className="max-w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:block border-r md:pr-4">
            {sidebarLinks.map((section) => {
              const activeItems = section.items.filter((item) => item.isActive);
              if (activeItems.length === 0) return null;

              return (
                <div key={section.section} className="mb-6">
                  <h6 className="text-sm font-semibold text-gray-600 mb-2">
                    {section.section}
                  </h6>

                  <nav className="flex flex-col space-y-1">
                    {activeItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "px-2 py-1.5 text-sm transition-colors",
                          pathname === item.href
                            ? "bg-gray-200 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              );
            })}
          </aside>

          {/* Mobile Horizontal Navigation */}
          <div className="md:hidden mb-4 mr-2 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {sidebarLinks
                .flatMap((section) => section.items)
                .filter((item) => item.isActive)
                .map((item) => (
                  <CTAButton
                    as="link"
                    key={item.href}
                    href={item.href}
                    variant={pathname === item.href ? "solid" : "outline"}
                    color={"gold"}
                  >
                    {item.label}
                  </CTAButton>
                ))}
            </div>
          </div>

          {/* Main Content */}
          <section className="md:col-span-3">{children}</section>
        </div>
      </main>

      {/* Scoped CSS (only for this layout) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </ProtectedRoute>
  );
}
