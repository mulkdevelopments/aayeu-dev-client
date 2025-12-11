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

export default function MegaMenu({ activeCategoryData }) {
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

  return (
    <nav className="w-full bg-white relative z-[9999]">
      {/* ↑ FIX #1: Higher z-index so wishlist heart no longer overlaps */}

      <div className="hidden lg:block relative" onMouseLeave={scheduleHide}>
        {/* Top Level Links */}
        <div className="flex px-10 py-2 items-center">
          <div className="flex-[4] flex gap-6 items-center">
            {topLevelCats.length === 0 ? (
              <div className="flex gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            ) : (
              topLevelCats.map((cat) => (
                <div key={cat.id}>
                  <div
                    onMouseEnter={() => openCategory(cat.id)}
                    className="inline-block cursor-pointer"
                  >
                    <Link
                      href={buildCategoryHref(cat, activeCategoryData)}
                      onClick={handleLinkClick}
                      className={`text-base font-light transition-colors ${
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

          {/* Search bar */}
          <div className="flex-[1] relative" ref={searchRef}>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = query.trim();
                  if (q) {
                    setSearchVisible(false);
                    setPanelOpen(false);
                    setContentVisible(false);
                    setActiveCategoryId(null);
                    router.push(`/search?q=${encodeURIComponent(q)}`);
                  }
                }
              }}
              className="border-b w-full border-gray-400 outline-none px-2 py-1 text-sm placeholder:text-center placeholder:font-semibold"
              onFocus={() => setSearchVisible(!!query)}
            />

            {searchVisible && (
              <SearchResults
                results={results}
                loading={loading}
                query={query}
                onClose={handleLinkClick}
              />
            )}
          </div>
        </div>

        {/* Dropdown Panel */}
        <div
          className={`absolute left-0 top-full w-full bg-white shadow-md z-[9999] transition-all duration-200 ${
            panelOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {/* FIX #2 — If category has no children, do not show empty panel */}
          {activeCategory?.children?.length ? (
            <div
              className="max-w-[1400px] mx-auto p-8 transition-opacity duration-200 h-[65vh] overflow-auto"
              style={{ opacity: contentVisible ? 1 : 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
                {/* Left 3 columns */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {splitIntoColumns(safeChildren(activeCategory), 3).map(
                    (col, i) => (
                      <div key={i}>
                        <ul className="space-y-3 text-sm">
                          {col.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={buildCategoryHref(
                                  child,
                                  activeCategoryData,
                                  [activeCategory]
                                )}
                                onClick={handleLinkClick}
                                className="font-medium hover:text-red-600"
                              >
                                {safeCap(child.name)}
                              </Link>

                              {child.children?.length > 0 && (
                                <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                                  {child.children.map((gc) => (
                                    <li key={gc.id}>
                                      <Link
                                        href={buildCategoryHref(
                                          gc,
                                          activeCategoryData,
                                          [activeCategory, child]
                                        )}
                                        onClick={handleLinkClick}
                                        className="hover:text-red-600"
                                      >
                                        {safeCap(gc.name)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>

                {/* Right image placeholder */}
                <div className="md:col-span-1">
                  <NavMenuCategoryImage activeCategory={activeCategory} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
