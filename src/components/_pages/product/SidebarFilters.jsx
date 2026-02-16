"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { XIcon, Search, ChevronDown } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useAxios from "@/hooks/useAxios";
import useCurrency from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import _ from "lodash";

export default function SidebarFilters({
  open,
  onClose,
  onApply,
  onReset,
  initialFilters = {}, // parent passes filters parsed from URL
  categories = [],
  totalCount = null,
}) {
  const { request, loading } = useAxios();
  const { selectedCurrency, exchangeRates, format } = useCurrency();
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.category?.[params.category.length - 1];
  const searchParams = useSearchParams();
  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;

  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [brandCounts, setBrandCounts] = useState([]);
  const [colors, setColors] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [colorCounts, setColorCounts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [sizeCounts, setSizeCounts] = useState([]);
  const [genders, setGenders] = useState([]);
  const [allGenders, setAllGenders] = useState([]);
  const [genderCounts, setGenderCounts] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [liveTotal, setLiveTotal] = useState(null);

  // ✅ Local states
  const [price, setPrice] = useState({ min: 0, max: 100000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [openSection, setOpenSection] = useState(null);

  const currencyRate = useMemo(() => {
    const rate = exchangeRates?.[selectedCurrency];
    return rate && Number(rate) > 0 ? Number(rate) : 1;
  }, [exchangeRates, selectedCurrency]);

  const displayPriceRange = useMemo(
    () => ({
      min: Math.round(priceRange.min * currencyRate),
      max: Math.round(priceRange.max * currencyRate),
    }),
    [priceRange, currencyRate]
  );

  const displayPrice = useMemo(
    () => ({
      min: Math.round(price.min * currencyRate),
      max: Math.round(price.max * currencyRate),
    }),
    [price, currencyRate]
  );

  const hasInteracted = useRef(false); // ensures no URL update on mount

  // ✅ Fetch filter options (brands, colors, sizes, price range)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();

        if (searchQuery) {
          params.set("q", searchQuery);
        } else if (categoryId) {
          params.set("category_id", categoryId);
        }

        const appliedBrands = selectedBrands || [];
        const appliedColors = selectedColors || [];
        const appliedSizes = selectedSizes || [];
        const appliedPrice = price || null;
        const appliedGenders = selectedGenders || [];

        appliedBrands.forEach((b) => params.append("brand", b));
        appliedColors.forEach((c) => params.append("color", c));
        appliedSizes.forEach((s) => params.append("size", s));
        appliedGenders.forEach((g) => params.append("gender", g));

        if (appliedPrice?.min) params.set("min_price", String(appliedPrice.min));
        if (appliedPrice?.max) params.set("max_price", String(appliedPrice.max));

        const queryString = params.toString();
        const { data } = await request({
          method: "GET",
          url: queryString
            ? `/users/get-filters-for-products?${queryString}`
            : `/users/get-filters-for-products`,
        });

        if (data?.status === 200 && data.data) {
          const {
            brands,
            colors,
            sizes,
            genders,
            price,
            brand_counts,
            color_counts,
            size_counts,
            gender_counts,
            total,
          } = data.data;
          setBrands(brands?.filter(Boolean) || []);
          setColors(colors?.filter(Boolean) || []);
          setSizes(sizes?.filter(Boolean) || []);
          setAllSizes((prev) =>
            prev.length > 0 ? prev : sizes?.filter(Boolean) || []
          );
          setGenders(genders?.filter(Boolean) || []);
          setAllBrands((prev) =>
            prev.length > 0 ? prev : brands?.filter(Boolean) || []
          );
          setAllColors((prev) =>
            prev.length > 0 ? prev : colors?.filter(Boolean) || []
          );
          setAllGenders((prev) =>
            prev.length > 0 ? prev : genders?.filter(Boolean) || []
          );
          setBrandCounts(Array.isArray(brand_counts) ? brand_counts : []);
          setColorCounts(Array.isArray(color_counts) ? color_counts : []);
          setSizeCounts(Array.isArray(size_counts) ? size_counts : []);
          setGenderCounts(Array.isArray(gender_counts) ? gender_counts : []);
          setLiveTotal(typeof total === "number" ? total : null);
          setPriceRange({
            min: price?.min ?? 0,
            max: price?.max ?? 100000,
          });
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, [
    categoryId,
    searchQuery,
    selectedBrands,
    selectedColors,
    selectedSizes,
    selectedGenders,
    price,
  ]);

  useEffect(() => {
    setAllSizes([]);
    setAllBrands([]);
    setAllColors([]);
    setAllGenders([]);
  }, [categoryId, searchQuery]);

  // ✅ Sync local filter state when parent updates (e.g. after refresh)
  useEffect(() => {
    setSelectedBrands(initialFilters.brands || []);
    setSelectedColors(initialFilters.colors || []);
    setSelectedSizes(initialFilters.sizes || []);
    setSelectedGenders(initialFilters.genders || []);
    setPrice(initialFilters.price || { min: 0, max: 100000 });
  }, [initialFilters]);

  // ✅ Helper: build filters object for parent
  const buildFilters = () => ({
    brands: selectedBrands,
    colors: selectedColors,
    sizes: selectedSizes,
    genders: selectedGenders,
    price,
  });

  // Auto-apply is disabled; Show Results handles non-category filters.

  // ✅ Helper: toggle array values
  const toggle = (setter, arr, value) => {
    hasInteracted.current = true; // mark user interaction
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    );
  };

  // ✅ Reset filters locally and notify parent
  const handleReset = () => {
    hasInteracted.current = true;
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedGenders([]);
    setPrice(priceRange);
    onReset?.();
  };

  // ✅ Explicit apply button (for UX consistency)
  const handleShowResults = () => {
    hasInteracted.current = true;
    onApply(buildFilters());
    onClose?.();
  };

  const brandCountMap = useMemo(() => {
    const map = new Map();
    brandCounts.forEach((b) => {
      const key = String(b.value || "").trim().toLowerCase();
      if (!key) return;
      map.set(key, { label: b.label, count: Number(b.count) || 0 });
    });
    return map;
  }, [brandCounts]);

  const colorCountMap = useMemo(() => {
    const map = new Map();
    colorCounts.forEach((c) => {
      const key = String(c.value || "").trim().toLowerCase();
      if (!key) return;
      map.set(key, Number(c.count) || 0);
    });
    return map;
  }, [colorCounts]);

  const sizeCountMap = useMemo(() => {
    const map = new Map();
    sizeCounts.forEach((s) => {
      const key = String(s.value || "").trim().toLowerCase();
      if (!key) return;
      map.set(key, Number(s.count) || 0);
    });
    return map;
  }, [sizeCounts]);

  const genderCountMap = useMemo(() => {
    const map = new Map();
    genderCounts.forEach((g) => {
      const key = String(g.value || "").trim().toLowerCase();
      if (!key) return;
      map.set(key, Number(g.count) || 0);
    });
    return map;
  }, [genderCounts]);

  const filteredBrands = useMemo(() => {
    const list = allBrands.length > 0 ? allBrands : brands;
    const term = brandSearch.trim().toLowerCase();
    return list.filter((b) => b.toLowerCase().includes(term));
  }, [allBrands, brands, brandSearch]);

  const groupedBrands = useMemo(() => {
    const groups = new Map();
    filteredBrands.forEach((brand) => {
      const label = _.startCase(_.toLower(brand));
      let key = (label[0] || "#").toUpperCase();
      if (!/^[A-Z]$/.test(key)) key = "#";
      if (!groups.has(key)) groups.set(key, []);
      const countKey = String(brand || "").trim().toLowerCase();
      const countInfo = brandCountMap.get(countKey);
      const count = countInfo?.count ?? 0;
      groups.get(key).push({ value: brand, label, count });
    });
    const entries = Array.from(groups.entries()).map(([key, items]) => {
      items.sort((a, b) => a.label.localeCompare(b.label));
      return { key, items };
    });
    entries.sort((a, b) => {
      if (a.key === "#") return 1;
      if (b.key === "#") return -1;
      return a.key.localeCompare(b.key);
    });
    return entries;
  }, [filteredBrands, brandCountMap]);

  const sizeGroups = useMemo(() => {
    const map = new Map();
    const source = allSizes.length > 0 ? allSizes : sizes;
    source.forEach((s) => {
      const raw = String(s || "").trim();
      if (!raw) return;
      const normalized = raw.replace(/\s+/g, " ").toLowerCase();
      if (!map.has(normalized)) {
        map.set(normalized, {
          key: normalized,
          label: raw.replace(/\s+/g, " ").toUpperCase(),
          values: [raw],
        });
      } else {
        map.get(normalized).values.push(raw);
      }
    });
    const alphaOrder = [
      "xxxs",
      "xxs",
      "xs",
      "s",
      "m",
      "l",
      "xl",
      "xxl",
      "xxxl",
      "4xl",
      "5xl",
      "6xl",
    ];
    const alphaIndex = new Map(alphaOrder.map((v, i) => [v, i]));

    const parseNumeric = (value) => {
      const normalized = value.replace(",", ".").replace(/\s+/g, "");
      const match = normalized.match(/^\d+(\.\d+)?$/);
      return match ? Number(match[0]) : null;
    };

    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      const aKey = a.key.replace(/[^a-z0-9]/g, "");
      const bKey = b.key.replace(/[^a-z0-9]/g, "");

      const aAlpha = alphaIndex.has(aKey) ? alphaIndex.get(aKey) : null;
      const bAlpha = alphaIndex.has(bKey) ? alphaIndex.get(bKey) : null;
      if (aAlpha !== null || bAlpha !== null) {
        if (aAlpha === null) return 1;
        if (bAlpha === null) return -1;
        return aAlpha - bAlpha;
      }

      const aNum = parseNumeric(a.key);
      const bNum = parseNumeric(b.key);
      if (aNum !== null || bNum !== null) {
        if (aNum === null) return 1;
        if (bNum === null) return -1;
        return aNum - bNum;
      }

      return a.label.localeCompare(b.label);
    });

    return groups;
  }, [allSizes, sizes]);

  const availableSizeKeys = useMemo(() => {
    return new Set(
      sizes.map((s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase())
    );
  }, [sizes]);

  const availableSections = useMemo(() => {
    const list = [];
    if (categories.length > 0) list.push("category");
    if (allBrands.length > 0 || brands.length > 0) list.push("brand");
    if (allGenders.length > 0 || genders.length > 0) list.push("gender");
    if (allColors.length > 0 || colors.length > 0) list.push("color");
    if (allSizes.length > 0 || sizes.length > 0) list.push("size");
    if (priceRange.min < priceRange.max) list.push("price");
    return list;
  }, [
    categories.length,
    brands.length,
    allBrands.length,
    genders.length,
    allGenders.length,
    colors.length,
    allColors.length,
    sizes.length,
    allSizes.length,
    priceRange.min,
    priceRange.max,
  ]);

  const hasInitializedSection = useRef(false);

  useEffect(() => {
    if (!availableSections.length) return;
    if (hasInitializedSection.current) return;
    setOpenSection(availableSections[0]);
    hasInitializedSection.current = true;
  }, [availableSections]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-220 flex overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="relative bg-white w-full sm:w-[420px] h-full shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white z-10">
          <h5 className="text-xl font-medium">All Filters</h5>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClose?.()}
            aria-label="Close filters"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
          {loading && (
            <p className="text-sm text-gray-500 mb-3">Loading filters...</p>
          )}

          {/* --- Category Filter --- */}
          {categories.length > 0 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "category" ? null : "category")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Category
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "category" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "category" && (
                <div className="pb-5 space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onClose?.();
                        router.push(`/shop/${cat.path}/${cat.id}`);
                      }}
                      className="w-full text-left text-sm text-gray-800 hover:text-black transition-colors py-1"
                    >
                      {_.startCase(_.toLower(cat.name))}
                    </button>
                  ))}
                </div>
              )}
              <Separator />
            </>
          )}

          {/* --- Brand Filter --- */}
          {(allBrands.length > 0 || brands.length > 0) && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "brand" ? null : "brand")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Brand
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "brand" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "brand" && (
                <div className="pb-5">
                  <div className="relative mb-4">
                    <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder={`Search ${allBrands.length || brands.length} brands`}
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="pl-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      {groupedBrands.map((group) => (
                        <div key={group.key}>
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            {group.key}
                          </div>
                          <div className="space-y-3">
                            {group.items.map((item) => {
                              const isSelected = selectedBrands.includes(item.value);
                              const isDisabled = item.count === 0 && !isSelected;
                              return (
                                <label
                                  key={item.value}
                                  className={`flex items-center justify-between gap-3 text-sm ${
                                    isDisabled ? "text-gray-400" : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        toggle(setSelectedBrands, selectedBrands, item.value)
                                      }
                                      disabled={isDisabled}
                                    />
                                    <span>{item.label}</span>
                                  </div>
                                  <span className="text-xs text-gray-500"></span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <Separator className="my-1" />
            </>
          )}

          {/* --- Gender Filter --- */}
          {(allGenders.length > 0 || genders.length > 0) && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "gender" ? null : "gender")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Gender
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "gender" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "gender" && (
                <div className="pb-5">
                  <div className="space-y-3">
                    {(allGenders.length > 0 ? allGenders : genders).map((g) => {
                      const key = String(g || "").trim().toLowerCase();
                      const count = genderCountMap.get(key) ?? 0;
                      const isSelected = selectedGenders.includes(g);
                      const isDisabled = count === 0 && !isSelected;
                      return (
                        <label
                          key={g}
                          className={`flex items-center justify-between gap-3 text-sm ${
                            isDisabled ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggle(setSelectedGenders, selectedGenders, g)
                              }
                              disabled={isDisabled}
                            />
                            <span>{_.startCase(_.toLower(g))}</span>
                          </div>
                          <span className="text-xs text-gray-500"></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              <Separator className="my-1" />
            </>
          )}

          {/* --- Color Filter --- */}
          {(allColors.length > 0 || colors.length > 0) && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "color" ? null : "color")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Colour
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "color" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "color" && (
                <div className="pb-5">
                  <div className="space-y-3">
                    {(allColors.length > 0 ? allColors : colors).map((c) => {
                      const key = String(c || "").trim().toLowerCase();
                      const count = colorCountMap.get(key) ?? 0;
                      const isSelected = selectedColors.includes(c);
                      const isDisabled = count === 0 && !isSelected;
                      return (
                        <label
                          key={c}
                          className={`flex items-center justify-between gap-3 text-sm ${
                            isDisabled ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggle(setSelectedColors, selectedColors, c)
                              }
                              disabled={isDisabled}
                            />
                            <span>{c}</span>
                          </div>
                          <span className="text-xs text-gray-500"></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              <Separator className="my-1" />
            </>
          )}

          {/* --- Size Filter --- */}
          {sizes.length > 0 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "size" ? null : "size")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Size
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "size" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "size" && (
                <div className="pb-5">
                  <div className="grid grid-cols-3 gap-3">
                    {sizeGroups.map((group) => {
                      const isSelected = group.values.some((v) =>
                        selectedSizes.includes(v)
                      );
                      const isAvailable = group.values.some((v) =>
                        availableSizeKeys.has(
                          String(v || "").trim().replace(/\s+/g, " ").toLowerCase()
                        )
                      );
                      const isDisabled = !isAvailable && !isSelected;
                      const count = group.values.reduce((sum, v) => {
                        const key = String(v || "").trim().toLowerCase();
                        return sum + (sizeCountMap.get(key) || 0);
                      }, 0);
                      return (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => {
                            hasInteracted.current = true;
                            if (isSelected) {
                              setSelectedSizes((prev) =>
                                prev.filter((v) => !group.values.includes(v))
                              );
                            } else {
                              if (isDisabled) return;
                              setSelectedSizes((prev) => [
                                ...prev,
                                ...group.values.filter((v) => !prev.includes(v)),
                              ]);
                            }
                          }}
                          className={`h-10 text-sm border transition-colors ${
                            isSelected
                              ? "border-black text-black"
                              : isDisabled
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 text-gray-700"
                          }`}
                        >
                          <span>{group.label}</span>
                          <span className="ml-1 text-[10px] text-gray-500"></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <Separator className="my-1" />
            </>
          )}

          {/* --- Price Filter --- */}
          {priceRange.min < priceRange.max && (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSection(openSection === "price" ? null : "price")
                }
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Price
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openSection === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "price" && (
                <div className="pb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <Input
                      type="number"
                      value={displayPrice.min}
                      onChange={(e) => {
                        hasInteracted.current = true;
                        const raw = Number(e.target.value);
                        const displayValue = Number.isFinite(raw) ? raw : 0;
                        const baseValue = displayValue / currencyRate;
                        setPrice((p) => ({
                          ...p,
                          min: Math.max(0, Math.min(baseValue, p.max)),
                        }));
                      }}
                      className="w-1/2 rounded-none border-gray-300"
                    />
                    <Input
                      type="number"
                      value={displayPrice.max}
                      onChange={(e) => {
                        hasInteracted.current = true;
                        const raw = Number(e.target.value);
                        const displayValue = Number.isFinite(raw) ? raw : 0;
                        const baseValue = displayValue / currencyRate;
                        setPrice((p) => ({
                          ...p,
                          max: Math.min(priceRange.max, Math.max(baseValue, p.min)),
                        }));
                      }}
                      className="w-1/2 rounded-none border-gray-300"
                    />
                  </div>

                  <Slider
                    min={0}
                    max={Math.max(displayPriceRange.max, 0)}
                    step={1}
                    value={[displayPrice.min, displayPrice.max]}
                    onValueChange={([min, max]) => {
                      hasInteracted.current = true;
                      const baseMin = min / currencyRate;
                      const baseMax = max / currencyRate;
                      setPrice({
                        min: Math.max(0, Math.min(baseMin, priceRange.max)),
                        max: Math.min(
                          priceRange.max,
                          Math.max(baseMax, Math.max(baseMin, 0))
                        ),
                      });
                    }}
                    className="mt-4"
                  />

                  <div className="text-xs text-gray-500 mt-2">
                    {format(price.min)} – {format(price.max)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 shadow-sm flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Reset
          </Button>
          <Button
            onClick={handleShowResults}
            className="flex-1 bg-black text-white font-medium"
          >
            Show {(() => {
              const count =
                typeof liveTotal === "number"
                  ? liveTotal
                  : typeof totalCount === "number"
                  ? totalCount
                  : null;
              if (count === null) return "results";
              return `${count > 10000 ? "10000+" : count} results`;
            })()}
          </Button>
        </div>
      </aside>
    </div>
  );
}
