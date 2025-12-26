"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import startCase from "lodash/startCase";
import toLower from "lodash/toLower";
import isString from "lodash/isString";
import get from "lodash/get";
import { useRouter } from "next/navigation";
import { buildCategoryHref } from "@/utils/seoHelpers";
import useAxios from "@/hooks/useAxios";
import SearchResults from "./SearchResults";
import NavMenuCategoryImage from "./NavMenuCategoryImage";

export default function MegaMenu({ activeCategoryData, allCategories = [], onCategoryChange }) {
  const router = useRouter();

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { request } = useAxios();
  const searchRef = useRef(null);
  const hideTimer = useRef(null);
  const switchTimer = useRef(null);
  const debounceTimer = useRef(null);

  const HIDE_DELAY_MS = 120;
  const TRANS_MS = 180;

  const safeCap = (value) => {
    if (!value) return "";
    const s = isString(value) ? value : String(value);
    const normalized = s.replace(/[-_/]+/g, " ").trim();
    return startCase(toLower(normalized));
  };

  const safeChildren = (item) => get(item, "children", []) || [];
  const topLevelCats = safeChildren(activeCategoryData);
  const activeCategory = topLevelCats.find((c) => c.id === activeCategoryId);

  const splitIntoColumns = (arr = [], cols = 3) => {
    const result = Array.from({ length: cols }, () => []);
    if (!arr?.length) return result;
    const per = Math.ceil(arr.length / cols);
    for (let i = 0; i < cols; i++) {
      result[i] = arr.slice(i * per, i * per + per);
    }
    return result;
  };

  /* ----------------------------------------------------------------
     FIX #2 → Do NOT open MegaMenu for categories that have no children
  ------------------------------------------------------------------ */
  const openCategory = (id) => {
    const cat = topLevelCats.find((c) => c.id === id);
    if (!cat?.children?.length) return; // 👈 prevent opening panel

    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (!panelOpen) {
      setActiveCategoryId(id);
      setPanelOpen(true);
      setTimeout(() => setContentVisible(true), 10);
      return;
    }

    if (id !== activeCategoryId) {
      setContentVisible(false);
      if (switchTimer.current) clearTimeout(switchTimer.current);
      switchTimer.current = setTimeout(() => {
        setActiveCategoryId(id);
        setContentVisible(true);
        switchTimer.current = null;
      }, Math.max(TRANS_MS - 20, 80));
    }
  };

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setContentVisible(false);
    hideTimer.current = setTimeout(() => {
      setPanelOpen(false);
      setTimeout(() => setActiveCategoryId(null), TRANS_MS);
      hideTimer.current = null;
    }, HIDE_DELAY_MS);
  };

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!panelOpen) {
      setPanelOpen(true);
      setTimeout(() => setContentVisible(true), 10);
    } else setContentVisible(true);
  };

  const handleLinkClick = () => {
    setContentVisible(false);
    setPanelOpen(false);
    setActiveCategoryId(null);
    setSearchVisible(false);
  };

  /* ---------------------- SEARCH ---------------------- */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchVisible(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await request({
          method: "GET",
          url: `/users/get-products-from-our-categories?q=${query}`,
        });
        setResults(data?.data?.products || []);
        setSearchVisible(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recursive function to render category tree with unlimited depth
  const renderCategoryTree = (category, breadcrumbs, level) => {
    const hasChildren = category.children && category.children.length > 0;
    const isTopLevel = level === 0;

    return (
      <li key={category.id}>
        <Link
          href={buildCategoryHref(category, activeCategoryData, breadcrumbs)}
          onClick={handleLinkClick}
          className={`block text-sm transition-colors duration-200 mb-2 ${
            isTopLevel
              ? "font-semibold text-gray-900 hover:text-red-600"
              : "text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all py-1"
          }`}
          style={{ paddingLeft: `${level * 12}px` }}
        >
          {safeCap(category.name)}
        </Link>

        {hasChildren && (
          <ul className={`mt-2 space-y-2 ${isTopLevel ? "pl-0" : "pl-2"}`}>
            {category.children.map((child) =>
              renderCategoryTree(child, [...breadcrumbs, category], level + 1)
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="w-full bg-white sticky top-[80px] z-40 shadow-sm">
      {/* Sticky navigation that stays below the main header */}

      <div className="hidden lg:block relative" onMouseLeave={scheduleHide}>
        {/* Combined Navigation - Main Categories + Subcategories */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6 h-12 flex gap-6 items-center text-sm overflow-x-auto scrollbar-hide">
            {/* Main Categories Strip */}
            {allCategories.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20 flex-shrink-0" />
              ))
            ) : (
              allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat)}
                  className={`transition flex-shrink-0 whitespace-nowrap ${
                    activeCategoryData?.id === cat.id
                      ? "font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {safeCap(cat.name)}
                </button>
              ))
            )}

            {/* Divider */}
            {allCategories.length > 0 && topLevelCats.length > 0 && (
              <div className="h-6 w-px bg-gray-300 flex-shrink-0" />
            )}

            {/* Top Level Subcategories */}
            {topLevelCats.length === 0 ? (
              <div className="flex gap-3">
                <Skeleton className="h-4 w-20 flex-shrink-0" />
                <Skeleton className="h-4 w-20 flex-shrink-0" />
                <Skeleton className="h-4 w-20 flex-shrink-0" />
              </div>
            ) : (
              topLevelCats.map((cat) => (
                <div key={cat.id} className="flex-shrink-0">
                  <div
                    onMouseEnter={() => openCategory(cat.id)}
                    className="inline-block cursor-pointer"
                  >
                    <Link
                      href={buildCategoryHref(cat, activeCategoryData)}
                      onClick={handleLinkClick}
                      className={`text-sm font-light transition-colors whitespace-nowrap ${
                        activeCategoryId === cat.id
                          ? "text-red-600"
                          : "hover:text-red-600"
                      }`}
                    >
                      {safeCap(cat.name)}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Dropdown Panel */}
        <div
          className={`absolute left-0 top-full w-full bg-white shadow-xl border-t border-gray-200 transition-all duration-300 ${
            panelOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible pointer-events-none"
          }`}
          style={{ zIndex: 9998 }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {/* FIX #2 — If category has no children, do not show empty panel */}
          {activeCategory?.children?.length ? (
            <div
              className="max-w-[1400px] mx-auto px-8 py-10 transition-opacity duration-300"
              style={{
                opacity: contentVisible ? 1 : 0,
                maxHeight: '70vh',
                overflowY: 'auto'
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left 3 columns */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {splitIntoColumns(safeChildren(activeCategory), 3).map(
                    (col, i) => (
                      <div key={i} className="space-y-6">
                        <ul className="space-y-4">
                          {col.map((child) =>
                            renderCategoryTree(child, [activeCategory], 0)
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>

                {/* Right image placeholder */}
                <div className="md:col-span-1">
                  <div className="sticky top-4">
                    <NavMenuCategoryImage activeCategory={activeCategory} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
