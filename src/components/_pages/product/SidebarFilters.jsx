"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { XIcon, Search } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import useAxios from "@/hooks/useAxios";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
}) {
  const { request, loading } = useAxios();
  const params = useParams();
  const categoryId = params?.category?.[params.category.length - 1];
  const searchParams = useSearchParams();
  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;

  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  // ✅ Local states
  const [price, setPrice] = useState({ min: 0, max: 100000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");

  const hasInteracted = useRef(false); // ensures no URL update on mount

  // ✅ Fetch filter options (brands, colors, sizes, price range)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data } = await request({
          method: "GET",
          url: searchQuery
            ? `/users/get-filters-for-products?q=${encodeURIComponent(
                searchQuery
              )}`
            : categoryId
            ? `/users/get-filters-for-products?category_id=${categoryId}`
            : `/users/get-filters-for-products`,
        });

        if (data?.status === 200 && data.data) {
          const { brands, colors, sizes, price } = data.data;
          setBrands(brands?.filter(Boolean) || []);
          setColors(colors?.filter(Boolean) || []);
          setSizes(sizes?.filter(Boolean) || []);
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
  }, [categoryId, searchQuery]);

  // ✅ Sync local filter state when parent updates (e.g. after refresh)
  useEffect(() => {
    setSelectedBrands(initialFilters.brands || []);
    setSelectedColors(initialFilters.colors || []);
    setSelectedSizes(initialFilters.sizes || []);
    setPrice(initialFilters.price || { min: 0, max: 100000 });
  }, [initialFilters]);

  // ✅ Helper: build filters object for parent
  const buildFilters = () => ({
    brands: selectedBrands,
    colors: selectedColors,
    sizes: selectedSizes,
    price,
  });

  // ✅ Auto-apply filters only after user interaction (not on mount)
  useEffect(() => {
    if (hasInteracted.current) {
      const timeout = setTimeout(() => {
        onApply(buildFilters());
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [selectedBrands, selectedColors, selectedSizes, price]);

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
        className="relative bg-white w-80 h-full shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
          <h5 className="text-lg font-semibold">Filters</h5>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
          {loading && (
            <p className="text-sm text-gray-500 mb-3">Loading filters...</p>
          )}

          {/* --- Brand Filter --- */}
          {brands.length > 0 && (
            <>
              <Label className="text-sm font-medium text-gray-700">
                Brands
              </Label>
              <div className="relative my-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <ScrollArea className="h-40 p-2 mt-2 mb-4">
                {filteredBrands.map((b) => (
                  <div key={b} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={selectedBrands.includes(b)}
                      onCheckedChange={() =>
                        toggle(setSelectedBrands, selectedBrands, b)
                      }
                    />
                    <span className="text-sm">{_.startCase(_.toLower(b))}</span>
                  </div>
                ))}
              </ScrollArea>
              <Separator className="my-3" />
            </>
          )}

          {/* --- Color Filter --- */}
          {colors.length > 0 && (
            <>
              <Label className="text-sm font-medium text-gray-700">
                Colors
              </Label>
              <ScrollArea className="h-40 p-2 mt-2 mb-4">
                {colors.map((c) => (
                  <div key={c} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={selectedColors.includes(c)}
                      onCheckedChange={() =>
                        toggle(setSelectedColors, selectedColors, c)
                      }
                    />
                    <span className="text-sm">{c}</span>
                  </div>
                ))}
              </ScrollArea>
              <Separator className="my-3" />
            </>
          )}

          {/* --- Size Filter --- */}
          {sizes.length > 0 && (
            <>
              <Label className="text-sm font-medium text-gray-700">Sizes</Label>
              <ScrollArea className="h-40 p-2 mt-2 mb-4">
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <Button
                      key={s}
                      variant={
                        selectedSizes.includes(s) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggle(setSelectedSizes, selectedSizes, s)}
                      className={`text-xs ${
                        selectedSizes.includes(s)
                          ? "bg-[#c38e1e] hover:bg-[#b2821c]"
                          : ""
                      }`}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-3" />
            </>
          )}

          {/* --- Price Filter --- */}
          {priceRange.min < priceRange.max && (
            <>
              <Label className="text-sm font-medium text-gray-700">
                Price (AED)
              </Label>
              <div className="flex items-center gap-2 text-sm mt-2 mb-2">
                <Input
                  type="number"
                  value={price.min}
                  onChange={(e) => {
                    hasInteracted.current = true;
                    setPrice((p) => ({
                      ...p,
                      min: Math.max(
                        priceRange.min,
                        Math.min(Number(e.target.value), p.max)
                      ),
                    }));
                  }}
                  className="w-1/2"
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
                  className="w-1/2"
                />
              </div>

              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={1}
                value={[price.min, price.max]}
                onValueChange={([min, max]) => {
                  hasInteracted.current = true;
                  setPrice({ min, max });
                }}
                className="mt-3"
              />

              <div className="text-xs text-gray-500 mt-1 mb-3">
                AED {price.min.toFixed(2)} – AED {price.max.toFixed(2)}
              </div>

              <Separator className="my-3" />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-5 py-3 shadow-sm flex gap-3">
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
