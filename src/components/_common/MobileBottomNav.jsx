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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        {/* Decorative Black Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-black"></div>

        {/* Navigation Items */}
        <div className="flex items-center justify-around h-16 px-3 max-w-md mx-auto relative">
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
                {/* Icon Container */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Icon Background */}
                  <div className="relative flex items-center justify-center">
                    {/* Icon */}
                    <Icon
                      size={24}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-all duration-200 ${
                        active
                          ? "text-black"
                          : "text-gray-600 group-hover:text-black"
                      }`}
                    />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-black text-white text-[10px] font-bold rounded-full border-2 border-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium mt-1.5 px-2 py-0.5 rounded transition-all duration-200 ${
                      active
                        ? "text-white bg-black"
                        : "text-gray-500 bg-transparent"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Active Indicator Line */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-black"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe Area for Devices with Home Indicator */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white"></div>
      </nav>
    </>
  );
}
