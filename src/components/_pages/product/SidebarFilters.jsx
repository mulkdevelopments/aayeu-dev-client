"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { XIcon, Search, ChevronDown } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useAxios from "@/hooks/useAxios";
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
}) {
  const { request, loading } = useAxios();
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.category?.[params.category.length - 1];
  const searchParams = useSearchParams();
  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;

  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  // ✅ Local states
  const [price, setPrice] = useState({ min: 0, max: 100000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [openSection, setOpenSection] = useState(null);

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

        // Use applied filters from parent (URL) so sidebar changes
        // don't refetch until Show Results is pressed.
        const appliedBrands = initialFilters.brands || [];
        const appliedColors = initialFilters.colors || [];
        const appliedSizes = initialFilters.sizes || [];
        const appliedPrice = initialFilters.price || null;
        const appliedGenders = initialFilters.genders || [];

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
          const { brands, colors, sizes, genders, price } = data.data;
          setBrands(brands?.filter(Boolean) || []);
          setColors(colors?.filter(Boolean) || []);
          setSizes(sizes?.filter(Boolean) || []);
          setGenders(genders?.filter(Boolean) || []);
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
  }, [categoryId, searchQuery, initialFilters]);

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

  const filteredBrands = useMemo(
    () =>
      brands.filter((b) =>
        b.toLowerCase().includes(brandSearch.trim().toLowerCase())
      ),
    [brands, brandSearch]
  );

  const groupedBrands = useMemo(() => {
    const groups = new Map();
    filteredBrands.forEach((brand) => {
      const label = _.startCase(_.toLower(brand));
      let key = (label[0] || "#").toUpperCase();
      if (!/^[A-Z]$/.test(key)) key = "#";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ value: brand, label });
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
  }, [filteredBrands]);

  const availableSections = useMemo(() => {
    const list = [];
    if (categories.length > 0) list.push("category");
    if (brands.length > 0) list.push("brand");
    if (genders.length > 0) list.push("gender");
    if (colors.length > 0) list.push("color");
    if (sizes.length > 0) list.push("size");
    if (priceRange.min < priceRange.max) list.push("price");
    return list;
  }, [categories.length, brands.length, genders.length, colors.length, sizes.length, priceRange.min, priceRange.max]);

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
          {brands.length > 0 && (
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
                      placeholder={`Search ${brands.length} brands`}
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
                            {group.items.map((item) => (
                              <label
                                key={item.value}
                                className="flex items-center gap-3 text-sm"
                              >
                                <Checkbox
                                  checked={selectedBrands.includes(item.value)}
                                  onCheckedChange={() =>
                                    toggle(setSelectedBrands, selectedBrands, item.value)
                                  }
                                />
                                <span>{item.label}</span>
                              </label>
                            ))}
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
          {genders.length > 0 && (
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
                    {genders.map((g) => (
                      <label key={g} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={selectedGenders.includes(g)}
                          onCheckedChange={() =>
                            toggle(setSelectedGenders, selectedGenders, g)
                          }
                        />
                        <span>{_.startCase(_.toLower(g))}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Separator className="my-1" />
            </>
          )}

          {/* --- Color Filter --- */}
          {colors.length > 0 && (
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
                    {colors.map((c) => (
                      <label key={c} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={selectedColors.includes(c)}
                          onCheckedChange={() =>
                            toggle(setSelectedColors, selectedColors, c)
                          }
                        />
                        <span>{c}</span>
                      </label>
                    ))}
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
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(setSelectedSizes, selectedSizes, s)}
                        className={`h-10 text-sm border transition-colors ${
                          selectedSizes.includes(s)
                            ? "border-black text-black"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
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
                      value={price.min}
                      onChange={(e) => {
                        hasInteracted.current = true;
                        setPrice((p) => ({
                          ...p,
                          min: Math.max(
                            0,
                            Math.min(Number(e.target.value), p.max)
                          ),
                        }));
                      }}
                      className="w-1/2 rounded-none border-gray-300"
                    />
                    <Input
                      type="number"
                      value={price.max}
                      onChange={(e) => {
                        hasInteracted.current = true;
                        setPrice((p) => ({
                          ...p,
                          max: Math.min(
                            priceRange.max,
                            Math.max(Number(e.target.value), p.min)
                          ),
                        }));
                      }}
                      className="w-1/2 rounded-none border-gray-300"
                    />
                  </div>

                  <Slider
                    min={0}
                    max={priceRange.max}
                    step={1}
                    value={[price.min, price.max]}
                    onValueChange={([min, max]) => {
                      hasInteracted.current = true;
                      setPrice({ min, max });
                    }}
                    className="mt-4"
                  />

                  <div className="text-xs text-gray-500 mt-2">
                    AED {price.min.toFixed(2)} – AED {price.max.toFixed(2)}
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
            Show Results
          </Button>
        </div>
      </aside>
    </div>
  );
}
