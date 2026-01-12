"use client";

import Link from "next/link";
import { Globe, User, Heart, ShoppingBag, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
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
import MegaMenu from "./MegaMenu";
import CurrencySelector from "./CurrencySelector";
import { startCase, toLower } from "lodash";

export default function MiddleHeader() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useCart();
  const { menu, fetchMenu } = useMenu();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMenu().then((res) => {
      if (res?.data?.length) setActiveCategory(res.data[0]);
    });
  }, []);

  const handleNavigation = (path, { requireAuth = true } = {}) => {
    setIsSheetOpen(false);
    if (requireAuth && !isAuthenticated) {
      router.push("/auth?type=signin");
      return;
    }
    router.push(path);
  };

  const safeCap = (val) =>
    startCase(toLower(String(val || "").replace(/[-_/]+/g, " ")));

  const submitSearch = () => {
    if (!search.trim()) return;
    router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    setIsSheetOpen(false);
  };

  // Recursive function to render mobile category tree with unlimited depth
  const renderMobileCategoryTree = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;

    if (!hasChildren) {
      // Leaf node - render as clickable button
      return (
        <button
          key={category.id}
          onClick={() =>
            handleNavigation(
              `/shop/${toLower(category.name)}/${category.id}`,
              { requireAuth: false }
            )
          }
          className="block w-full text-left text-sm text-gray-600 hover:text-black
            py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
        >
          {safeCap(category.name)}
        </button>
      );
    }

    // Parent node - render with nested accordion
    return (
      <Accordion key={category.id} type="single" collapsible>
        <AccordionItem value={category.id} className="border-none">
          <div className="flex items-center">
            <button
              onClick={() =>
                handleNavigation(
                  `/shop/${toLower(category.name)}/${category.id}`,
                  { requireAuth: false }
                )
              }
              className="flex-1 text-left py-2 px-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              style={{ paddingLeft: `${level * 12}px` }}
            >
              <span className={level === 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}>
                {safeCap(category.name)}
              </span>
            </button>
            <AccordionTrigger
              className="py-2 hover:no-underline hover:bg-gray-50 px-3 rounded-lg text-sm w-8 flex-shrink-0"
            >
            </AccordionTrigger>
          </div>
          <AccordionContent className="space-y-1 pt-1">
            {category.children.map((child) =>
              renderMobileCategoryTree(child, level + 1)
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  /* ---------------- DESKTOP / TABLET ---------------- */
  return (
    <>
      <header className="sticky top-0 z-55 bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-0 grid grid-cols-[auto_1fr_auto] items-center gap-8">

          {/* Logo - Larger */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="/assets/images/aayeu_logo.png"
              alt="Aayeu Logo"
              className="h-20 w-auto hover:opacity-80 transition-opacity duration-300"
            />
          </Link>

          {/* Center Search - Enhanced */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search for products & brands..."
                className="w-full h-12 pl-14 pr-6 rounded-full border-2 border-gray-200
                  focus:border-black focus:ring-0 outline-none text-sm
                  transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right Icons - Premium Styling */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <CurrencySelector />

            <button
              onClick={() =>
                handleNavigation("/profile-overview", { requireAuth: true })
              }
              className="group flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
            >
              <User className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors" />
              <span className="text-[10px] text-gray-600 group-hover:text-black font-medium">Account</span>
            </button>

            <button
              onClick={() =>
                handleNavigation("/wishlists", { requireAuth: true })
              }
              className="group flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
            >
              <Heart className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
              <span className="text-[10px] text-gray-600 group-hover:text-red-500 font-medium">Wishlist</span>
            </button>

            <button
              onClick={() =>
                handleNavigation("/cart", { requireAuth: false })
              }
              className="group relative flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
            >
              <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors" />
              <span className="text-[10px] text-gray-600 group-hover:text-black font-medium">Cart</span>
              {items.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-black
                  text-white text-[10px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center
                  font-bold shadow-md border border-[#F5E6A8] ">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE ---------------- */}
      <header className="md:hidden sticky top-0 z-50 bg-white shadow-md">
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-[85%]">
              <SheetHeader className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Search products..."
                    className="w-full h-11 pl-11 pr-4 rounded-full border-2 border-gray-200
                      focus:border-black focus:ring-0 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  />
                </div>
              </SheetHeader>

              <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
                {menu.map((cat) => renderMobileCategoryTree(cat))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-3 rounded-full border-2 border-gray-200
                focus:border-amber-500 focus:ring-0 outline-none text-sm
                transition-all duration-300 placeholder:text-gray-400"
            />
          </div>

          {/* Mobile Logo - Compact */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/assets/images/aayeu_logo.png"
              className="h-10 w-auto"
              alt="Aayeu"
            />
          </Link>
        </div>
      </header>

      {/* Mega Menu */}
      <MegaMenu
        activeCategoryData={
          activeCategory
            ? { ...activeCategory, children: activeCategory.children }
            : null
        }
        allCategories={menu}
        onCategoryChange={setActiveCategory}
      />
    </>
  );
}
