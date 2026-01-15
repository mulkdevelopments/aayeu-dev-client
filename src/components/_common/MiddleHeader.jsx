"use client";

import Link from "next/link";
import { Globe, User, Heart, ShoppingBag, Menu, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
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
import CurrencySelector from "./CurrencySelector";
import NavMenuCategoryImage from "./NavMenuCategoryImage";
import { startCase, toLower } from "lodash";

export default function MiddleHeader() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useCart();
  const { menu, fetchMenu } = useMenu();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverTimeoutRef = useRef(null);

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

  const handleCategoryHover = (category) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (category?.children?.length > 0) {
      setHoveredCategory(category);
    }
  };

  const handleCategoryLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const handlePanelEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const splitIntoColumns = (arr = [], cols = 3) => {
    const result = Array.from({ length: cols }, () => []);
    if (!arr?.length) return result;
    const per = Math.ceil(arr.length / cols);
    for (let i = 0; i < cols; i++) {
      result[i] = arr.slice(i * per, i * per + per);
    }
    return result;
  };

  const submitSearch = () => {
    if (!search.trim()) return;
    router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    setIsSheetOpen(false);
    setIsSearchSheetOpen(false);
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
      <header className="sticky top-0 z-55 bg-white border-b border-gray-200 hidden md:block">
        {/* Top Row */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
            {/* Left - Top Level Category Links */}
            <div className="flex items-center gap-8">
              {menu.slice(0, 3).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/shop/${toLower(category.name)}/${category.id}`}
                  className={`text-sm transition-colors ${
                    index === 0
                      ? "font-semibold text-gray-900 hover:text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {safeCap(category.name)}
                </Link>
              ))}
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <img
                src="/assets/images/aayeu_logo.png"
                alt="Aayeu Logo"
                className="h-12 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-6">
              <CurrencySelector />

              <button
                onClick={() => handleNavigation("/profile-overview", { requireAuth: true })}
                className="hover:opacity-70 transition-opacity"
              >
                <User className="w-5 h-5 text-gray-900" />
              </button>

              <button
                onClick={() => handleNavigation("/wishlists", { requireAuth: true })}
                className="hover:opacity-70 transition-opacity"
              >
                <Heart className="w-5 h-5 text-gray-900" />
              </button>

              <button
                onClick={() => handleNavigation("/cart", { requireAuth: false })}
                className="relative hover:opacity-70 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px]
                    min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation */}
        <div className="max-w-[1440px] mx-auto px-8 h-12 flex items-center justify-between">
          {/* Left - Main Navigation - First active category's children */}
          <nav className="flex items-center gap-8 relative">
            {activeCategory?.children?.slice(0, 9).map((childCategory) => (
              <div
                key={childCategory.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(childCategory)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  href={`/shop/${toLower(childCategory.name)}/${childCategory.id}`}
                  className={`text-sm transition-colors whitespace-nowrap ${
                    hoveredCategory?.id === childCategory.id
                      ? "text-red-600 font-medium"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {safeCap(childCategory.name)}
                </Link>
              </div>
            ))}

            {/* Floating Panel for Children - MegaMenu Style */}
            {hoveredCategory && hoveredCategory.children?.length > 0 && (
              <div
                className="fixed left-0 right-0 top-[144px] bg-white shadow-xl border-t border-gray-200 z-50"
                onMouseEnter={handlePanelEnter}
                onMouseLeave={handleCategoryLeave}
              >
                <div className="max-w-[1400px] mx-auto px-8 py-10" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Left 3 columns - Categories */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {splitIntoColumns(hoveredCategory.children, 3).map((col, i) => (
                        <div key={i} className="space-y-4">
                          <ul className="space-y-3">
                            {col.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/shop/${toLower(child.name)}/${child.id}`}
                                  className="block text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors mb-2"
                                  onClick={() => setHoveredCategory(null)}
                                >
                                  {safeCap(child.name)}
                                </Link>
                                {/* Render grandchildren if available */}
                                {child.children?.length > 0 && (
                                  <ul className="space-y-2 mt-2">
                                    {child.children.map((grandchild) => (
                                      <li key={grandchild.id}>
                                        <Link
                                          href={`/shop/${toLower(grandchild.name)}/${grandchild.id}`}
                                          className="block text-sm text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all py-1 pl-3"
                                          onClick={() => setHoveredCategory(null)}
                                        >
                                          {safeCap(grandchild.name)}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Right column - Image */}
                    <div className="md:col-span-1">
                      <div className="sticky top-4 h-[300px]">
                        <NavMenuCategoryImage activeCategory={hoveredCategory} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Right - Search Bar */}
          <div className="relative w-[320px] flex-shrink-0">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="What are you looking for?"
              className="w-full h-9 pl-6 pr-4 bg-transparent border-0 border-b border-gray-300
                focus:outline-none focus:border-black text-sm placeholder:text-gray-400"
            />
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE ---------------- */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          {/* Menu Icon */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Menu className="w-6 h-6 text-gray-800" />
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

              <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
                {/* Profile Section */}
                <div className="p-4 border-b border-gray-200">
                  {isAuthenticated ? (
                    <button
                      onClick={() => handleNavigation("/profile-overview", { requireAuth: true })}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-sm font-semibold text-gray-900">My Account</div>
                        <div className="text-xs text-gray-500">View profile & orders</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation("/auth?type=signin", { requireAuth: false })}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">Sign In / Register</span>
                    </button>
                  )}
                </div>

                {/* Currency Selector - Collapsible */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setIsCurrencyExpanded(!isCurrencyExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-900">Change Region</span>
                    </div>
                    {isCurrencyExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {isCurrencyExpanded && (
                    <div className="px-4 pb-4">
                      <CurrencySelector isMobileSidebar={true} />
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div className="p-4 space-y-2">
                  {menu.map((cat) => renderMobileCategoryTree(cat))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Search Icon */}
          <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Search className="w-6 h-6 text-gray-800" />
              </button>
            </SheetTrigger>

            <SheetContent side="top" className="p-0 h-auto">
              <SheetHeader className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Search for products & brands..."
                    className="w-full h-14 pl-14 pr-4 rounded-full border-2 border-gray-200
                      focus:border-black focus:ring-0 outline-none text-base"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                    autoFocus
                  />
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          {/* Center Logo */}
          <Link href="/" className="flex-1 flex justify-center">
            <img
              src="/assets/images/aayeu_logo.png"
              alt="Aayeu"
              className="h-12  w-auto"
            />
          </Link>

          {/* Wishlist Icon */}
          <button
            onClick={() => handleNavigation("/wishlists", { requireAuth: true })}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Heart className="w-6 h-6 text-gray-800" />
          </button>

          {/* Cart Icon with Badge */}
          <button
            onClick={() => handleNavigation("/cart", { requireAuth: false })}
            className="relative p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ShoppingBag className="w-6 h-6 text-gray-800" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px]
                min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
