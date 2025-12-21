"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  ShoppingBag,
  Heart,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = wishlistItems.length;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      badge: null,
      requireAuth: false,
    },
    // {
    //   name: "Search",
    //   href: "/shop",
    //   icon: Search,
    //   badge: null,
    //   requireAuth: false,
    // },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
      requireAuth: false,
    },
    {
      name: "Wishlist",
      href: "/wishlists",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      requireAuth: true,
    },
    {
      name: "Account",
      href: "/profile-overview",
      icon: User,
      badge: null,
      requireAuth: true,
    },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleNavigation = (item) => (e) => {
    if (item.requireAuth && !isAuthenticated) {
      e.preventDefault();
      router.push("/auth?type=signin");
    }
  };

  return (
    <>
      {/* Bottom Navigation - Always Fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Decorative Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

        {/* Navigation Items */}
        <div className="flex items-center justify-around h-20 px-3 max-w-md mx-auto relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation(item)}
                className="relative flex flex-col items-center justify-center flex-1 h-full group"
              >
                {/* Active Background Glow */}
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-full blur-xl"></div>
                  </div>
                )}

                {/* Icon Container */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Icon Background */}
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
                        : "bg-gray-50 border border-gray-200 group-hover:border-amber-400/50 group-hover:bg-amber-50/50"
                    }`}
                  >
                    {/* Icon */}
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-all duration-300 ${
                        active
                          ? "text-white scale-110"
                          : "text-gray-700 group-hover:text-amber-600 group-hover:scale-105"
                      }`}
                    />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[10px] font-extrabold rounded-full border-2 border-white shadow-lg">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  {/* <span
                    className={`text-[9px] font-bold mt-1.5 tracking-wide transition-all duration-300 uppercase ${
                      active
                        ? "text-amber-400"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span> */}
                </div>

                {/* Active Indicator Dot */}
                {active && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe Area for Devices with Home Indicator */}
        <div className="h-[env(safe-area-inset-bottom)] bg-black"></div>
      </nav>
    </>
  );
}
