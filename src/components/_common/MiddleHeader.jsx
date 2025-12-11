"use client";

import Link from "next/link";
import { Globe, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import MegaMenu from "./MegaMenu";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { isString, startCase, toLower } from "lodash";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useCart from "@/hooks/useCart";
import useMenu from "@/hooks/useMenu";

export default function MiddleHeader() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { menu, fetchMenu } = useMenu(); // 🔥 RTK cached menu
  const [activeCategory, setActiveCategory] = useState(null);

  const { items } = useCart();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /* --------------------------------------
    Load Categories once from RTK (cached)
  ---------------------------------------*/
  useEffect(() => {
    const load = async () => {
      const res = await fetchMenu();
      if (res.data?.length > 0) {
        setActiveCategory(res.data[0]);
      }
    };
    load();
  }, []);

  /** Unified navigation handler */
  const handleNavigation = (path, { requireAuth = true } = {}) => {
    setIsSheetOpen(false);

    if (requireAuth && !isAuthenticated) {
      router.push("/auth?type=signin");
      return;
    }

    router.push(path);
  };

  /* Utility for formatting category names */
  const safeCap = (value) => {
    if (!value) return "";
    const normalized = String(value)
      .replace(/[-_/]+/g, " ")
      .trim();
    return startCase(toLower(normalized));
  };

  /* Build nested URLs */
  const toHref = (item, parents = []) => {
    const pathParts = parents
      .map((p) =>
        encodeURIComponent(toLower(p.name?.replace(/\s+/g, "-") || ""))
      )
      .filter(Boolean);
    if (item.name) {
      pathParts.push(
        encodeURIComponent(toLower(item.name.replace(/\s+/g, "-")))
      );
    }
    return `/shop/${pathParts.join("/")}/${item.id}`;
  };
  /* On category click */
  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);

    const slug = encodeURIComponent(
      toLower(cat.name?.replace(/\s+/g, "-") || "")
    );
    const href = `/shop/${slug}/${cat.id}`;

    setIsSheetOpen(false);
    router.push(href);
  };
  /* Render subcategories (accordion) */
  const renderSubCategories = (subs = [], parents = []) =>
    subs.map((sub) => (
      <AccordionItem key={sub.id} value={sub.id}>
        <AccordionTrigger className="text-sm font-medium">
          {safeCap(sub.name)}
        </AccordionTrigger>
        <AccordionContent>
          {sub.children?.length > 0 ? (
            <ul className="pl-4 space-y-1">
              {sub.children.map((child) => (
                <li key={child.id}>
                  <button
                    onClick={() =>
                      handleNavigation(toHref(child, [...parents, sub]), {
                        requireAuth: false,
                      })
                    }
                    className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                  >
                    {safeCap(child.name)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button
              onClick={() =>
                handleNavigation(toHref(sub, parents), { requireAuth: false })
              }
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              {safeCap(sub.name)}
            </button>
          )}
        </AccordionContent>
      </AccordionItem>
    ));

  /* Parent-specific ordering rules */
  const CHILD_ORDER_MAP = {
    Man: ["Accessories", "Bags", "Clothing", "Footwear", "Shoes"],
    Women: ["Clothing", "Accessories", "Shoes", "Bags", "Footwear"],
    Unisex: ["Shoes", "Clothing", "Bags", "Accessories", "Footwear"],
  };

  const getOrderedChildren = (category) => {
    if (!category?.children?.length) return [];
    const order = CHILD_ORDER_MAP[category.name] || [];
    return [...category.children].sort(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
    );
  };
  /* -------------------------- RENDER --------------------------- */
  return (
    <>
      {/* 🖥 Desktop Header */}
      <header className="relative py-10 hidden lg:block">
        <div className="relative flex items-center justify-between">
          {/* Desktop categories */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 flex gap-5 text-base font-light font-sans">
            <div className="flex gap-6 items-center">
              {menu.length === 0 ? (
                <div className="text-sm text-gray-500 flex gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                menu.map((cat) => (
                  <div key={cat.id} className="relative">
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`text-base font-light transition-colors ${
                        activeCategory?.id === cat.id
                          ? "font-medium"
                          : "hover:text-gray-500"
                      }`}
                    >
                      {safeCap(cat.name)}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/">
              <img
                src="/assets/images/aayeu_logo.png"
                alt="Logo"
                width={50}
                height={115}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right Icons */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-6">
            <Globe className="cursor-pointer hover:text-gray-400" />
            <User
              onClick={() =>
                handleNavigation("/profile-overview", { requireAuth: true })
              }
              className="cursor-pointer hover:text-gray-400"
            />
            <Heart
              onClick={() =>
                handleNavigation("/wishlists", { requireAuth: true })
              }
              className="cursor-pointer hover:text-gray-400"
            />
            <div className="relative">
              <ShoppingBag
                onClick={() =>
                  handleNavigation("/cart", { requireAuth: false })
                }
                className="cursor-pointer hover:text-gray-400"
              />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                  {items.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 📱 Mobile Header */}
      <header className="py-4 px-4 flex justify-between items-center lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Menu className="w-6 h-6 cursor-pointer" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] p-0 flex flex-col">
            <SheetHeader className="border-b">
              {/* Quick Actions */}
              <div className="px-2 py-2 flex justify-around items-center mt-5">
                <Globe className="w-6 h-6 text-gray-700" />

                <User
                  onClick={() =>
                    handleNavigation("/profile-overview", { requireAuth: true })
                  }
                  className="w-6 h-6 text-gray-700"
                />
                <Heart
                  onClick={() =>
                    handleNavigation("/wishlists", { requireAuth: true })
                  }
                  className="w-6 h-6 text-gray-700"
                />
                <div className="relative">
                  <ShoppingBag
                    onClick={() =>
                      handleNavigation("/cart", { requireAuth: false })
                    }
                    className="w-6 h-6"
                  />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold">
                      {items.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Search bar */}
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full border-b border-gray-300 px-4 py-2 text-sm focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.target.value.trim();
                    if (value.length > 0) {
                      setIsSheetOpen(false);
                      router.push(`/search?query=${encodeURIComponent(value)}`);
                    }
                  }
                }}
              />
            </SheetHeader>

            {/* Main category tabs */}
            <div className="flex overflow-x-auto gap-3 px-4 py-2 border-b">
              {menu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 text-sm ${
                    activeCategory?.id === cat.id
                      ? "border-b-2 border-gray-900 text-gray-900"
                      : "text-gray-700 border-b-2 border-transparent"
                  }`}
                >
                  {safeCap(cat.name)}
                </button>
              ))}
            </div>

            {/* Subcategory Accordion */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeCategory?.children?.length ? (
                <Accordion type="single" collapsible>
                  {renderSubCategories(getOrderedChildren(activeCategory), [
                    activeCategory,
                  ])}
                </Accordion>
              ) : (
                <p className="text-gray-500 text-sm">No subcategories found.</p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/">
          <img
            src="/assets/images/aayeu_logo.png"
            alt="Logo"
            width={50}
            height={25}
            className="object-contain"
          />
        </Link>

        <ShoppingBag
          onClick={() => handleNavigation("/cart", { requireAuth: false })}
          className="w-6 h-6 cursor-pointer"
        />
      </header>

      {/* Desktop Mega Menu */}
      <MegaMenu
        activeCategoryData={
          activeCategory
            ? {
                ...activeCategory,
                children: getOrderedChildren(activeCategory),
              }
            : null
        }
      />
    </>
  );
}
