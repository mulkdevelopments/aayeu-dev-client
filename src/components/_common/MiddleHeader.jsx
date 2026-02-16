"use client";

import Link from "next/link";
import { Globe, User, Heart, ShoppingBag, Menu, Search, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useState, useRef, useMemo } from "react";
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
import useAxios from "@/hooks/useAxios";
import CurrencySelector from "./CurrencySelector";
import NavMenuCategoryImage from "./NavMenuCategoryImage";
import { startCase, toLower } from "lodash";

export default function MiddleHeader() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useCart();
  const { menu, fetchMenu } = useMenu();
  const { request } = useAxios();

  const [activeCategory, setActiveCategory] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
  const [mobileRootTab, setMobileRootTab] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const headerRef = useRef(null);
  const [panelTop, setPanelTop] = useState(0);
  const [brandGroups, setBrandGroups] = useState([]);

  const categorizedSubCategories = useMemo(() => {
    const list = hoveredCategory?.children ? [...hoveredCategory.children] : [];
    const withChildren = list.filter((item) => item?.children?.length > 0);
    const leafItems = list.filter((item) => !item?.children?.length);
    withChildren.sort((a, b) => {
      const aCount = Array.isArray(a?.children) ? a.children.length : 0;
      const bCount = Array.isArray(b?.children) ? b.children.length : 0;
      return bCount - aCount;
    });
    return { withChildren, leafItems };
  }, [hoveredCategory]);

  useEffect(() => {
    fetchMenu().then((res) => {
      if (res?.data?.length) setActiveCategory(res.data[0]);
    });
  }, []);

  const activeCategorySlug = useMemo(() => {
    if (!activeCategory?.name) return "";
    return toLower(activeCategory.name);
  }, [activeCategory]);

  const lastBrandCategoryRef = useRef("");

  useEffect(() => {
    const nextSlug = activeCategorySlug || "";
    if (lastBrandCategoryRef.current === nextSlug) return;
    lastBrandCategoryRef.current = nextSlug;

    const fetchBrandData = async () => {
      try {
        const query = nextSlug
          ? `?category_slug=${encodeURIComponent(nextSlug)}`
          : "";
        const [groupsRes] = await Promise.all([
          request({ method: "GET", url: `/users/get-brand-groups${query}` }),
        ]);
        const groups = groupsRes?.data?.data?.items || [];
        setBrandGroups(groups);
      } catch (err) {
        console.error("Failed to fetch brand data:", err);
      }
    };
    fetchBrandData();
  }, [activeCategorySlug]);

  useEffect(() => {
    if (!menu?.length) return;
    if (!mobileRootTab) setMobileRootTab(menu[0]);
  }, [menu, mobileRootTab]);

  useEffect(() => {
    if (!isSheetOpen) {
      setMobileActiveCategory(null);
      setIsCurrencyExpanded(false);
    }
  }, [isSheetOpen, menu]);

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

  const normalizeBrandParam = (value = "") => {
    if (value === undefined || value === null) return "";
    const superscripts = "¹²³⁴⁵⁶⁷⁸⁹⁰";
    const digits = "1234567890";
    const replaced = String(value)
      .split("")
      .map((ch) => {
        const idx = superscripts.indexOf(ch);
        return idx === -1 ? ch : digits[idx];
      })
      .join("");

    return replaced
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

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

  const displayedBrandGroups = useMemo(
    () => brandGroups.slice(0, 2),
    [brandGroups]
  );

  const brandLetters = useMemo(
    () => ["0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")],
    []
  );


  const updatePanelTop = () => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setPanelTop(Math.round(rect.bottom));
  };

  useEffect(() => {
    if (!hoveredCategory) return;
    updatePanelTop();
    const onScroll = () => updatePanelTop();
    const onResize = () => updatePanelTop();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [hoveredCategory]);

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
      <header
        ref={headerRef}
        className="sticky top-0 z-55 bg-white border-b border-gray-200 hidden md:block"
      >
        {/* Top Row */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
            {/* Left - Top Level Category Links */}
            <div className="flex items-center gap-8">
              {menu.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category);
                    router.push(`/shop/${toLower(category.name)}/${category.id}`);
                  }}
                  className={`text-sm transition-colors ${
                    activeCategory?.id === category.id
                      ? "font-semibold text-gray-900"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {safeCap(category.name)}
                </button>
              ))}
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <img
                src="/assets/images/aayeu_logo.png"
                alt="Aayeu Logo"
                className="h-auto w-42 hover:opacity-80 transition-opacity"
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
            {activeCategory?.children?.slice(0, 1).map((childCategory) => (
              <div
                key={childCategory.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(childCategory)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  href={`/shop/${toLower(activeCategory?.name)}/${toLower(childCategory.name)}/${childCategory.id}`}
                  className={`text-sm transition-colors whitespace-nowrap ${
                    hoveredCategory?.id === childCategory.id
                      ? "text-gray-600 font-medium"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {safeCap(childCategory.name)}
                </Link>
              </div>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setHoveredCategory({ name: "Brands", children: [] })}
              onMouseLeave={handleCategoryLeave}
            >
              <Link
                href={activeCategorySlug ? `/brands?category=${encodeURIComponent(activeCategorySlug)}` : "/brands"}
                className="text-sm transition-colors whitespace-nowrap text-gray-700 hover:text-black"
                onClick={() => setHoveredCategory(null)}
              >
                Brands
              </Link>
            </div>
            {activeCategory?.children?.slice(1, 9).map((childCategory) => (
              <div
                key={childCategory.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(childCategory)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  href={`/shop/${toLower(activeCategory?.name)}/${toLower(childCategory.name)}/${childCategory.id}`}
                  className={`text-sm transition-colors whitespace-nowrap ${
                    hoveredCategory?.id === childCategory.id
                      ? "text-gray-600 font-medium"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {safeCap(childCategory.name)}
                </Link>
              </div>
            ))}

            {/* Floating Panel for Children - MegaMenu Style */}
            {hoveredCategory && (hoveredCategory.children?.length > 0 || hoveredCategory?.name?.toLowerCase() === "brands") && (
              <div
                className="fixed left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-50"
                style={{ top: panelTop }}
                onMouseEnter={handlePanelEnter}
                onMouseLeave={handleCategoryLeave}
              >
                <div className="max-w-[1400px] mx-auto px-8 py-8" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="flex gap-12">
                    {/* Left content - Farfetch style columns */}
                    <div className="flex-1">
                      {hoveredCategory?.name?.toLowerCase() === "brands" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                          {displayedBrandGroups.map((group) => (
                            <div key={group.id} className="space-y-3">
                              <p className="text-[11px] tracking-[0.2em] text-gray-600 uppercase">
                                {group.name}
                              </p>
                              <ul className="space-y-2">
                                {(group.brands || []).map((brand) => (
                                  <li key={brand.id || brand.brand_name}>
                                    <Link
                                      href={
                                        activeCategorySlug
                                          ? `/shop/${encodeURIComponent(
                                              activeCategorySlug
                                            )}?brand=${encodeURIComponent(
                                              normalizeBrandParam(brand.brand_name)
                                            )}`
                                          : `/shop?brand=${encodeURIComponent(
                                              normalizeBrandParam(brand.brand_name)
                                            )}`
                                      }
                                      className="block text-sm text-gray-800 hover:text-black transition-colors"
                                      onClick={() => setHoveredCategory(null)}
                                    >
                                      {brand.brand_name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          <div className="space-y-3">
                            <p className="text-[11px] tracking-[0.2em] text-gray-600 uppercase">Brands A-Z</p>
                            <div className="grid grid-cols-8 gap-y-2 gap-x-4 text-xs text-gray-700">
                              {brandLetters.map((letter) => (
                                <Link
                                  key={letter}
                                  href={`/brands?letter=${letter}${
                                    activeCategorySlug
                                      ? `&category=${encodeURIComponent(activeCategorySlug)}`
                                      : ""
                                  }`}
                                  onClick={() => setHoveredCategory(null)}
                                  className="text-left hover:text-black"
                                >
                                  {letter}
                                </Link>
                              ))}
                            </div>
                            <Link
                              href={
                                activeCategorySlug
                                  ? `/brands?category=${encodeURIComponent(activeCategorySlug)}`
                                  : "/brands"
                              }
                              className="inline-block mt-4 text-sm text-gray-800 hover:text-black underline"
                              onClick={() => setHoveredCategory(null)}
                            >
                              View All
                            </Link>
                          </div>
                        </div>
                      ) : (
                      <div className="grid grid-cols-3 gap-12">
                        {categorizedSubCategories.withChildren.length > 0 ? (
                          categorizedSubCategories.withChildren.map((subCat, idx) => (
                            <div key={subCat.id} className="space-y-3">
                              <Link
                                href={`/shop/${toLower(activeCategory?.name)}/${toLower(hoveredCategory.name)}/${toLower(subCat.name)}/${subCat.id}`}
                                className="block text-[11px] tracking-[0.2em] text-gray-600 uppercase hover:text-black transition-colors"
                                onClick={() => setHoveredCategory(null)}
                              >
                                {safeCap(subCat.name)}
                              </Link>
                              {subCat.children?.length > 0 && (
                                <ul className="space-y-2">
                                  {subCat.children.map((grandchild) => (
                                    <li key={grandchild.id}>
                                      <Link
                                        href={`/shop/${toLower(activeCategory?.name)}/${toLower(hoveredCategory.name)}/${toLower(subCat.name)}/${toLower(grandchild.name)}/${grandchild.id}`}
                                      className="block text-sm text-gray-800 hover:text-black transition-colors"
                                        onClick={() => setHoveredCategory(null)}
                                      >
                                        {safeCap(grandchild.name)}
                                      </Link>
                                    </li>
                                  ))}
                                  {idx === categorizedSubCategories.withChildren.length - 1 &&
                                    categorizedSubCategories.leafItems.map((leaf) => (
                                      <li key={leaf.id}>
                                        <Link
                                          href={`/shop/${toLower(activeCategory?.name)}/${toLower(hoveredCategory.name)}/${toLower(leaf.name)}/${leaf.id}`}
                                          className="block text-[11px] tracking-[0.2em] text-gray-600 uppercase hover:text-black transition-colors"
                                          onClick={() => setHoveredCategory(null)}
                                        >
                                          {safeCap(leaf.name)}
                                        </Link>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="space-y-3">
                            <ul className="space-y-2">
                              {categorizedSubCategories.leafItems.map((leaf) => (
                                <li key={leaf.id}>
                                  <Link
                                    href={`/shop/${toLower(activeCategory?.name)}/${toLower(hoveredCategory.name)}/${toLower(leaf.name)}/${leaf.id}`}
                                    className="block text-[11px] tracking-[0.2em] text-gray-600 uppercase hover:text-black transition-colors"
                                    onClick={() => setHoveredCategory(null)}
                                  >
                                    {safeCap(leaf.name)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {/* Right column - Image */}
                    <div className="w-[320px] flex-shrink-0">
                      <div className="sticky top-4">
                        <NavMenuCategoryImage
                          activeCategory={hoveredCategory}
                          fallbackCategory={hoveredCategory}
                        />
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
              <div className="sticky top-0 z-10 bg-white border-b">
                <div className="h-12 px-4 flex items-center justify-between">
                  {mobileActiveCategory ? (
                    <button
                      onClick={() => setMobileActiveCategory(null)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Back"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <img
                        src="/assets/images/aayeu_logo.png"
                        alt="AAYEU"
                        className="h-auto w-22"
                      />
                    </div>
                  )}
                  <div className="text-sm font-semibold">
                    {mobileActiveCategory ? safeCap(mobileActiveCategory.name) : ""}
                  </div>
                  <button
                    onClick={() => setIsSheetOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-48px)]">
                {/* Parent category tabs (Farfetch-style) */}
                {!mobileActiveCategory && (
                  <div className="px-4 pt-3 border-b border-gray-200">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar">
                      {menu.length === 0 ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-20" />
                        ))
                      ) : (
                        menu.slice(0, 3).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setMobileRootTab(cat)}
                            className={`pb-2 text-xs tracking-[0.16em] uppercase border-b-2 ${
                              mobileRootTab?.id === cat.id
                                ? "text-gray-900 border-gray-900"
                                : "text-gray-500 border-transparent hover:border-gray-900"
                            }`}
                          >
                            {safeCap(cat.name)}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {/* Categories */}
                {!mobileActiveCategory ? (
                  <div className="py-2">
                    {menu.length === 0 ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-3/4" />
                        ))}
                      </div>
                    ) : (
                      <>
                        {(mobileRootTab?.children || []).slice(0, 1).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setMobileActiveCategory(cat)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{safeCap(cat.name)}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            handleNavigation(
                              activeCategorySlug
                                ? `/brands?category=${encodeURIComponent(activeCategorySlug)}`
                                : "/brands",
                              { requireAuth: false }
                            )
                          }
                          className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium">Brands</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        {(mobileRootTab?.children || []).slice(1).map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setMobileActiveCategory(cat)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium">{safeCap(cat.name)}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </>
                    )}
                    <div className="border-b border-gray-200" />

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
                        <div className="space-y-2">
                          <button
                            onClick={() => handleNavigation("/auth?type=signin", { requireAuth: false })}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-md bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => handleNavigation("/auth?type=signup", { requireAuth: false })}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Register
                          </button>
                        </div>
                      )}
                    </div>

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
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                    <Link
                      href={`/shop/${toLower(mobileRootTab?.name || "shop")}/${toLower(
                        mobileActiveCategory.name
                      )}/${mobileActiveCategory.id}`}
                      className="block text-sm font-medium text-gray-900"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      All {safeCap(mobileActiveCategory.name)}
                    </Link>

                    {(mobileActiveCategory.children || []).map((subCat) => (
                      <div key={subCat.id} className="space-y-3">
                        <div className="text-xs tracking-[0.2em] text-gray-500 uppercase">
                          {safeCap(subCat.name)}
                        </div>
                        {subCat.children?.length > 0 ? (
                          <ul className="space-y-2">
                            {subCat.children.map((grandchild) => (
                              <li key={grandchild.id}>
                              <Link
                                href={`/shop/${toLower(mobileRootTab?.name || "shop")}/${toLower(
                                  mobileActiveCategory.name
                                )}/${toLower(subCat.name)}/${toLower(grandchild.name)}/${
                                  grandchild.id
                                }`}
                                className="block text-sm text-gray-900"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                  {safeCap(grandchild.name)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Link
                            href={`/shop/${toLower(mobileRootTab?.name || "shop")}/${toLower(
                              mobileActiveCategory.name
                            )}/${toLower(subCat.name)}/${subCat.id}`}
                            className="block text-sm text-gray-900"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            {safeCap(subCat.name)}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
              className="h-auto w-32"
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
