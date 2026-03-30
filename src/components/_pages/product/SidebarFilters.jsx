"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Loader2, XIcon, Search, ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import useAxios from "@/hooks/useAxios";
import useCurrency from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import _ from "lodash";

export default function SidebarFilters({
  open,
  onClose,
  onApply,
  onReset,
  initialFilters = {}, // parent passes filters parsed from URL
  categories = [],
  categoryId: categoryIdProp = null, // prefer parent UUID (same as ProductsListGrid / page)
  activeCategoryName = null, // applied PLP category label for chips
  onRemoveAppliedFilter = null, // (type, value?) => void — updates URL + listing
  totalCount = null,
  sortValue = "is_our_picks",
  onSortChange,
}) {
  const { request, loading } = useAxios();
  const { format, convert, parseDisplayPrice } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const categoryIdFromRoute =
    params?.category?.[params.category?.length - 1] ?? null;
  const categoryId = categoryIdProp ?? categoryIdFromRoute;
  const searchParams = useSearchParams();
  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;
  const searchCategorySlug = searchParams.get("category") || null;

  /**
   * Category navigation inside the drawer must NOT copy facet params (brand/color/…),
   * or mobile keeps ?brand= from the parent PLP while PC often used clean links — same UX everywhere.
   * Only keep sort, filters drawer flag, and search query when on /search.
   */
  const buildFiltersQuery = useCallback(() => {
    const p = new URLSearchParams();
    const sortBy = searchParams.get("sort_by");
    if (sortBy) p.set("sort_by", sortBy);
    else p.set("sort_by", "is_our_picks");
    if (searchParams.get("filters") === "1") p.set("filters", "1");
    if (pathname?.includes("/search")) {
      const q = searchParams.get("q") || searchParams.get("query");
      if (q) p.set("q", q);
      const cat = searchParams.get("category");
      if (cat) p.set("category", cat);
    }
    return p.toString();
  }, [searchParams, pathname]);

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
  const [colorSearch, setColorSearch] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [priceInputMin, setPriceInputMin] = useState("");
  const [priceInputMax, setPriceInputMax] = useState("");
  const [priceApplyError, setPriceApplyError] = useState("");
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [categoryChildren, setCategoryChildren] = useState({});
  const [categoryStack, setCategoryStack] = useState([]);
  const [categoryMap, setCategoryMap] = useState(null);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const [hasFetchedFilters, setHasFetchedFilters] = useState(false);
  const lastFiltersKeyRef = useRef("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);

  const handleRemoveCategoryChip = useCallback(() => {
    const query = buildFiltersQuery();
    if (categoryId && categoryMap?.has(categoryId)) {
      const parentId = categoryMap.get(categoryId)?.parent_id;
      const parentNode = parentId ? categoryMap.get(parentId) : null;
      if (parentNode?.id && parentNode?.path) {
        router.push(`/shop/${parentNode.path}/${parentNode.id}?${query}`);
        return;
      }
    }
    router.push(`/shop?${query}`);
  }, [categoryId, categoryMap, router, buildFiltersQuery]);

  // Match backend/DB brand normalization for count lookup (e.g. "Dolce & Gabbana" -> "dolce gabbana")
  const normalizeBrandKey = (value) =>
    String(value || "")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const normalizeSizeKey = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const cleaned = raw.replace(/\s+/g, " ");
    const compact = cleaned.replace(/\s+/g, "");
    if (/^x+l$/.test(compact)) {
      const xCount = compact.replace(/[^x]/g, "").length;
      if (xCount <= 1) return "xl";
      if (xCount === 2) return "2xl";
      if (xCount === 3) return "3xl";
      if (xCount === 4) return "4xl";
      if (xCount === 5) return "5xl";
      if (xCount === 6) return "6xl";
      return `${xCount}xl`;
    }
    if (/^\d+xl$/.test(compact)) {
      const num = parseInt(compact.replace("xl", ""), 10);
      if (!Number.isNaN(num) && num >= 2) {
        return `${num}xl`;
      }
      return "xl";
    }
    return compact;
  };

  const formatSizeLabel = (key) => {
    if (!key) return "";
    if (key === "xl") return "XL";
    if (/^\d+xl$/.test(key)) return `${key.replace("xl", "")}XL`;
    return key.toUpperCase();
  };

  /** Applied filters from URL/parent — shown above Sort by */
  const appliedFilterChips = useMemo(() => {
    const f = initialFilters || {};
    const chips = [];
    const catLabel =
      typeof activeCategoryName === "string" ? activeCategoryName.trim() : "";
    if (catLabel && categoryId) {
      chips.push({ key: "cat", kind: "category", label: catLabel });
    }
    (f.brands || []).forEach((b) => {
      const t = String(b || "").trim();
      if (t) chips.push({ key: `b-${t}`, kind: "brand", label: t, value: t });
    });
    (f.colors || []).forEach((c) => {
      const t = String(c || "").trim();
      if (t) chips.push({ key: `c-${t}`, kind: "color", label: t, value: t });
    });
    (f.sizes || []).forEach((s) => {
      const raw = String(s || "").trim();
      if (!raw) return;
      const nk = normalizeSizeKey(raw);
      chips.push({
        key: `s-${raw}`,
        kind: "size",
        label: formatSizeLabel(nk),
        value: raw,
      });
    });
    (f.genders || []).forEach((g) => {
      const t = String(g || "").trim();
      if (t)
        chips.push({
          key: `g-${t}`,
          kind: "gender",
          label: _.startCase(_.toLower(t)),
          value: t,
        });
    });
    const pr = f.price;
    if (pr && (Number(pr.min) !== 0 || Number(pr.max) !== 100000)) {
      chips.push({
        key: "price",
        kind: "price",
        label: `${format(Number(pr.min) || 0)} – ${format(Number(pr.max) || 100000)}`,
      });
    }
    return chips;
  }, [
    activeCategoryName,
    categoryId,
    initialFilters,
    format,
  ]);

  const displayPriceRange = useMemo(
    () => ({
      min: convert(priceRange.min),
      max: convert(priceRange.max),
    }),
    [priceRange, convert]
  );

  const fetchCategoryChildren = async (categoryId) => {
    if (!categoryId) return [];
    if (categoryChildren[categoryId]) return categoryChildren[categoryId];
    const { data } = await request({
      method: "GET",
      url: `/users/get-child-categories?category_id=${categoryId}`,
    });
    if (data?.status === 200 && Array.isArray(data.data)) {
      setCategoryChildren((prev) => ({ ...prev, [categoryId]: data.data }));
      return data.data;
    }
    setCategoryChildren((prev) => ({ ...prev, [categoryId]: [] }));
    return [];
  };

  useEffect(() => {
    if (!categoryId || categoryMap) return;
    (async () => {
      const { data } = await request({
        method: "GET",
        url: "/users/get-child-categories",
      });
      if (data?.status !== 200 || !Array.isArray(data.data)) return;
      const map = new Map();
      const walk = (nodes, parentId = null) => {
        nodes.forEach((node) => {
          map.set(node.id, {
            id: node.id,
            parent_id: parentId ?? node.parent_id ?? null,
            path: node.path,
          });
          if (node.children?.length) walk(node.children, node.id);
        });
      };
      walk(data.data);
      setCategoryMap(map);
    })();
  }, [categoryId, categoryMap, request]);

  const displayPrice = useMemo(
    () => ({
      min: convert(price.min),
      max: convert(price.max),
    }),
    [price, convert]
  );

  const isPriceDirty = useMemo(() => {
    const base = initialFilters.price || { min: 0, max: 100000 };
    return (
      priceInputMin !== String(convert(base.min)) ||
      priceInputMax !== String(convert(base.max))
    );
  }, [priceInputMin, priceInputMax, initialFilters, convert]);

  const priceInputErrors = useMemo(() => {
    const minVal = Number(priceInputMin);
    const maxVal = Number(priceInputMax);
    const minInvalid =
      priceInputMin !== "" &&
      (!Number.isFinite(minVal) || minVal < 0 || minVal > maxVal);
    const maxInvalid =
      priceInputMax !== "" &&
      (!Number.isFinite(maxVal) || maxVal < 0 || maxVal < minVal);
    return { minInvalid, maxInvalid };
  }, [priceInputMin, priceInputMax]);

  useEffect(() => {
    setPriceInputMin(String(displayPrice.min));
    setPriceInputMax(String(displayPrice.max));
    setPriceApplyError("");
  }, [displayPrice.min, displayPrice.max]);

  const hasInteracted = useRef(false); // ensures no URL update on mount

  // ✅ Fetch filter options (brands, colors, sizes, price range)
  useEffect(() => {
    if (!open) return;
    const fetchFilters = async () => {
      setIsFiltersLoading(true);
      try {
        const params = new URLSearchParams();

        if (searchQuery) {
          params.set("q", searchQuery);
          if (searchCategorySlug) {
            params.set("category_slug", searchCategorySlug);
          }
        } else if (categoryId) {
          params.set("category_id", categoryId);
        }

        const appliedBrands = selectedBrands || [];
        const appliedColors = selectedColors || [];
        const appliedSizes = selectedSizes || [];
        const appliedPrice = initialFilters.price || null;
        const appliedGenders = selectedGenders || [];

        appliedBrands.forEach((b) => params.append("brand", b));
        appliedColors.forEach((c) => params.append("color", c));
        appliedSizes.forEach((s) => params.append("size", s));
        appliedGenders.forEach((g) => params.append("gender", g));

        if (appliedPrice?.min) params.set("min_price", String(appliedPrice.min));
        if (appliedPrice?.max) params.set("max_price", String(appliedPrice.max));

        const queryString = params.toString();
        if (lastFiltersKeyRef.current === queryString) {
          setIsFiltersLoading(false);
          return;
        }
        lastFiltersKeyRef.current = queryString;
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
      } finally {
        setHasFetchedFilters(true);
        setIsFiltersLoading(false);
      }
    };
    fetchFilters();
  }, [
    open,
    categoryId,
    searchQuery,
    selectedBrands,
    selectedColors,
    selectedSizes,
    selectedGenders,
    searchCategorySlug,
    initialFilters.price,
  ]);

  useEffect(() => {
    setAllSizes([]);
    setAllBrands([]);
    setAllColors([]);
    setAllGenders([]);
    lastFiltersKeyRef.current = "";
  }, [categoryId, searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
  const handleShowResults = ({ closeSidebar = true } = {}) => {
    hasInteracted.current = true;
    if (isPriceDirty) {
      const minVal = Number(priceInputMin);
      const maxVal = Number(priceInputMax);
      if (
        !Number.isFinite(minVal) ||
        !Number.isFinite(maxVal) ||
        minVal < 0 ||
        maxVal < 0 ||
        minVal > maxVal
      ) {
        setPriceApplyError("Please enter a valid min and max price.");
        return;
      }
      const nextPrice = {
        min: Math.max(0, parseDisplayPrice(minVal)),
        max: Math.max(0, parseDisplayPrice(maxVal)),
      };
      setPriceApplyError("");
      setPrice(nextPrice);
      onApply({
        brands: selectedBrands,
        colors: selectedColors,
        sizes: selectedSizes,
        genders: selectedGenders,
        price: nextPrice,
      });
      if (closeSidebar) onClose?.();
      return;
    }
    onApply(buildFilters());
    if (closeSidebar) onClose?.();
  };

  const handleApplyPrice = () => {
    const minVal = Number(priceInputMin);
    const maxVal = Number(priceInputMax);

    if (
      !Number.isFinite(minVal) ||
      !Number.isFinite(maxVal) ||
      minVal < 0 ||
      maxVal < 0 ||
      minVal > maxVal
    ) {
      setPriceApplyError("Please enter a valid min and max price.");
      return;
    }

    const nextPrice = {
      min: Math.max(0, parseDisplayPrice(minVal)),
      max: Math.max(0, parseDisplayPrice(maxVal)),
    };
    setPriceApplyError("");
    setPrice(nextPrice);
    hasInteracted.current = true;
    onApply({
      brands: selectedBrands,
      colors: selectedColors,
      sizes: selectedSizes,
      genders: selectedGenders,
      price: nextPrice,
    });
    onClose?.();
  };

  const brandCountMap = useMemo(() => {
    const map = new Map();
    brandCounts.forEach((b) => {
      const key = normalizeBrandKey(b.value ?? b.label);
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
      const key = normalizeSizeKey(String(s.value || ""));
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

  const filteredColors = useMemo(() => {
    const list = allColors.length > 0 ? allColors : colors;
    const term = colorSearch.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) => String(c || "").toLowerCase().includes(term));
  }, [allColors, colors, colorSearch]);

  const groupedBrands = useMemo(() => {
    const groups = new Map();
    filteredBrands.forEach((brand) => {
      const label = _.startCase(_.toLower(brand));
      let key = (label[0] || "#").toUpperCase();
      if (!/^[A-Z]$/.test(key)) key = "#";
      if (!groups.has(key)) groups.set(key, []);
      const countKey = normalizeBrandKey(brand);
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
      const normalized = normalizeSizeKey(raw);
      if (!map.has(normalized)) {
        map.set(normalized, {
          key: normalized,
          label: formatSizeLabel(normalized),
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
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "nosize",
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

  const SIZE_VISIBLE_COUNT = 24;
  const visibleSizeGroups = showAllSizes
    ? sizeGroups
    : sizeGroups.slice(0, SIZE_VISIBLE_COUNT);

  const availableSizeKeys = useMemo(() => {
    return new Set(
      sizes.map((s) => normalizeSizeKey(String(s || "")))
    );
  }, [sizes]);

  /** Used only to decide full-panel skeleton vs real layout (first load edge case) */
  const filtersQueryActive = Boolean(
    categoryId || searchQuery || searchCategorySlug
  );

  // Full skeleton only when we have no facet context (edge); otherwise always show facet rows (no length > 0 gate)
  const showSkeleton = !hasFetchedFilters && !filtersQueryActive;

  const showBrandRow = !showSkeleton;
  const showGenderRow = !showSkeleton;
  const showColorRow = !showSkeleton;
  const showSizeRow = !showSkeleton;
  const showPriceRow = !showSkeleton;

  /** One get-filters-for-products round-trip: spinners on every facet row until it completes */
  const filtersFacetFetchPending =
    !hasFetchedFilters || isFiltersLoading;

  const renderFacetTrailing = () =>
    filtersFacetFetchPending ? (
      <Loader2
        className="h-4 w-4 shrink-0 animate-spin text-gray-500"
        aria-label="Loading filters"
      />
    ) : (
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
    );

  const availableSections = useMemo(() => {
    const list = [];
    if (categories.length > 0) list.push("category");
    if (showBrandRow) list.push("brand");
    if (showGenderRow) list.push("gender");
    if (showColorRow) list.push("color");
    if (showSizeRow) list.push("size");
    if (showPriceRow) list.push("price");
    return list;
  }, [
    categories.length,
    showBrandRow,
    showGenderRow,
    showColorRow,
    showSizeRow,
    showPriceRow,
  ]);

  const hasInitializedSection = useRef(false);

  useEffect(() => {
    if (!availableSections.length) return;
    if (hasInitializedSection.current) return;
    setOpenSection(availableSections[0]);
    hasInitializedSection.current = true;
  }, [availableSections]);

  const sortOptions = [
    { value: "is_our_picks", label: "Our Picks" },
    { value: "is_newest", label: "Newest first" },
    { value: "price_high_to_low", label: "Price: high to low" },
    { value: "price_low_to_high", label: "Price: low to high" },
  ];

  const handleSectionToggle = (section) => {
    if (
      filtersFacetFetchPending &&
      ["brand", "gender", "color", "size", "price"].includes(section)
    ) {
      return;
    }
    if (isMobile) {
      setMobileSection(section);
      return;
    }
    setOpenSection(openSection === section ? null : section);
  };

  const renderCategoryContent = () => (
    <div className="pb-5 space-y-2">
      {(() => {
        const currentCategoryId =
          categoryStack.length > 0
            ? categoryStack[categoryStack.length - 1].id
            : null;
        const list = currentCategoryId
          ? categoryChildren[currentCategoryId] || []
          : categories;

        return (
          <>
            {list.map((cat) => {
              const children = categoryChildren[cat.id] || [];
              return (
                <div key={cat.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const nextChildren =
                        children.length > 0
                          ? children
                          : await fetchCategoryChildren(cat.id);
                      if (nextChildren.length > 0) {
                        setCategoryStack((prev) => [
                          ...prev,
                          { id: cat.id, path: cat.path, name: cat.name },
                        ]);
                        return;
                      }
                      onClose?.();
                      const query = buildFiltersQuery();
                      router.push(`/shop/${cat.path}/${cat.id}?${query}`);
                    }}
                    className="w-full text-left text-sm text-gray-800 hover:text-black transition-colors py-1"
                  >
                    {_.startCase(_.toLower(cat.name))}
                  </button>
                </div>
              );
            })}
          </>
        );
      })()}
    </div>
  );

  const renderBrandContent = () => (
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
      <div className="pr-2">
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
  );

  const renderGenderContent = () => (
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
  );

  const renderColorContent = () => (
    <div className="pb-5">
      <div className="relative mb-4">
        <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={`Search ${allColors.length || colors.length} colours`}
          value={colorSearch}
          onChange={(e) => setColorSearch(e.target.value)}
          className="pl-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <div className="space-y-3">
        {filteredColors.map((c) => {
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
  );

  const renderSizeContent = () => (
    <div className="pb-5">
      <div className="grid grid-cols-3 gap-2">
        {visibleSizeGroups.map((group) => {
          const isSelected = group.values.some((v) =>
            selectedSizes.includes(v)
          );
          const isAvailable = availableSizeKeys.has(group.key);
          const isDisabled = !isAvailable && !isSelected;
          const count = group.values.reduce((sum, v) => {
            const key = normalizeSizeKey(String(v || ""));
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
              className={`w-full min-h-10 px-2 py-2 text-[11px] leading-snug border transition-colors whitespace-normal break-words text-center ${
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
      {sizeGroups.length > SIZE_VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setShowAllSizes((prev) => !prev)}
          className="mt-4 w-full h-9 border border-gray-300 text-xs font-medium tracking-[0.2em] uppercase hover:border-black"
        >
          {showAllSizes ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );

  const renderPriceContent = () => (
    <div className="pb-5">
      <div className="flex items-center gap-3 text-sm">
        <Input
          type="number"
          value={priceInputMin}
          onChange={(e) => {
            hasInteracted.current = true;
            setPriceInputMin(e.target.value);
            setPriceApplyError("");
          }}
          className="w-1/2 rounded-none border-gray-300"
        />
        <Input
          type="number"
          value={priceInputMax}
          onChange={(e) => {
            hasInteracted.current = true;
            setPriceInputMax(e.target.value);
            setPriceApplyError("");
          }}
          className="w-1/2 rounded-none border-gray-300"
        />
      </div>

      {!isMobile && isPriceDirty && (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleApplyPrice}
            className="w-full h-9 border border-gray-300 text-sm font-medium hover:border-black"
          >
            Apply
          </button>
          {priceApplyError && (
            <p className="mt-2 text-xs text-red-600">{priceApplyError}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={
        open ? "fixed inset-0 z-220 flex overflow-hidden" : "hidden"
      }
      aria-hidden={!open}
    >
      {/* Backdrop: absolute inside fixed shell so it never stacks above the panel (fixed sibling was stealing chip / Clear all clicks). */}
      <div
        className="absolute inset-0 z-0 bg-black/40"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="relative z-10 flex h-full w-full flex-col bg-white shadow-xl sm:w-[420px]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white z-10 relative">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                if (categoryStack.length > 0) {
                  const nextStack = categoryStack.slice(0, -1);
                  const parent = nextStack[nextStack.length - 1];
                  setCategoryStack(nextStack);
                  setOpenSection("category");
                  if (parent?.id && parent?.path) {
                    const query = buildFiltersQuery();
                    router.push(`/shop/${parent.path}/${parent.id}?${query}`);
                  }
                  return;
                }
                if (categoryId && categoryMap?.has(categoryId)) {
                  const parentId = categoryMap.get(categoryId)?.parent_id;
                  const parentNode = parentId ? categoryMap.get(parentId) : null;
                  if (parentNode?.id && parentNode?.path) {
                    const query = buildFiltersQuery();
                    router.push(`/shop/${parentNode.path}/${parentNode.id}?${query}`);
                  }
                }
              }}
              className="h-9 px-2.5 text-sm"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <h5 className="text-xl font-medium absolute left-1/2 -translate-x-1/2">
            All Filters
          </h5>
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
          {showSkeleton ? (
            <div className="space-y-2 pb-3">
              {Array.from({ length: 6 }).map((_, sectionIndex) => (
                <div key={`filter-skel-${sectionIndex}`}>
                  <div className="flex items-center justify-between py-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <>
              {isMobile && mobileSection && (
                <div className="fixed inset-0 z-230 bg-white flex flex-col">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (mobileSection === "category" && categoryStack.length > 0) {
                          setCategoryStack((prev) => prev.slice(0, -1));
                        } else {
                          setMobileSection(null);
                        }
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-black transition-colors -ml-1"
                      aria-label={
                        mobileSection === "category" && categoryStack.length > 1
                          ? `Back to ${categoryStack[categoryStack.length - 2]?.name ?? "category"}`
                          : "Back"
                      }
                    >
                      <Undo2 className="h-5 w-5" />
                      <span>
                        {mobileSection === "category" && categoryStack.length > 1
                          ? `Back to ${categoryStack[categoryStack.length - 2]?.name ?? "category"}`
                          : "Back"}
                      </span>
                    </button>
                    <div className="text-sm font-medium tracking-[0.2em] uppercase text-gray-700">
                      {mobileSection}
                    </div>
                    <div className="w-14" />
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {mobileSection === "category" && renderCategoryContent()}
                    {mobileSection === "brand" && renderBrandContent()}
                    {mobileSection === "gender" && renderGenderContent()}
                    {mobileSection === "color" && renderColorContent()}
                    {mobileSection === "size" && renderSizeContent()}
                    {mobileSection === "price" && renderPriceContent()}
                  </div>
                  <div className="border-t border-gray-200 bg-white px-6 py-4">
                    <Button
                      onClick={() => {
                        handleShowResults({ closeSidebar: false });
                        setMobileSection(null);
                      }}
                      className="w-full bg-black text-white font-medium"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              {appliedFilterChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-gray-100">
                  {appliedFilterChips.map((ch) => (
                    <span
                      key={ch.key}
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1.5 text-sm text-gray-900"
                    >
                      <span className="max-w-[220px] truncate" title={ch.label}>
                        {ch.label}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 rounded p-0.5 text-gray-500 transition-colors hover:text-gray-900"
                        aria-label={`Remove ${ch.label}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (ch.kind === "category") handleRemoveCategoryChip();
                          else if (ch.kind === "price")
                            onRemoveAppliedFilter?.("price");
                          else onRemoveAppliedFilter?.(ch.kind, ch.value);
                        }}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="ml-1 text-sm font-bold text-gray-900"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="pb-5">
                <div className="text-xs tracking-[0.2em] uppercase text-gray-900 mb-4">
                  Sort by
                </div>
                <div className="space-y-4">
                  {sortOptions.map((option) => {
                    const isActive = sortValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onSortChange?.(option.value)}
                        className="w-full flex items-center gap-3 text-sm text-gray-800"
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400">
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-black" />
                          )}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Separator className="my-1" />

              {availableSections.length === 0 &&
                !isFiltersLoading &&
                hasFetchedFilters && (
                <div className="flex flex-col items-start gap-3 py-6">
                  <p className="text-sm text-gray-700">
                    No filters available for this selection.
                  </p>
                  <p className="text-xs text-gray-500">
                    Try a different category or clear filters to see more options.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (categoryStack.length > 0) {
                        const nextStack = categoryStack.slice(0, -1);
                        const parent = nextStack[nextStack.length - 1];
                        setCategoryStack(nextStack);
                        setOpenSection("category");
                        if (parent?.id && parent?.path) {
                          const query = buildFiltersQuery();
                          router.push(`/shop/${parent.path}/${parent.id}?${query}`);
                          return;
                        }
                      } else if (categoryId && categoryMap?.has(categoryId)) {
                        const parentId = categoryMap.get(categoryId)?.parent_id;
                        const parentNode = parentId ? categoryMap.get(parentId) : null;
                        if (parentNode?.id && parentNode?.path) {
                          const query = buildFiltersQuery();
                          router.push(`/shop/${parentNode.path}/${parentNode.id}?${query}`);
                          return;
                        }
                      }
                      onClose?.();
                    }}
                    className="h-9 px-4 border border-gray-300 text-xs font-medium tracking-[0.2em] uppercase hover:border-black"
                  >
                    Back
                  </button>
                </div>
              )}

              {/* --- Category Filter --- */}
              {categories.length > 0 && (
                <>
              <button
                type="button"
                    onClick={() => handleSectionToggle("category")}
                className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900"
              >
                Category
                <ChevronRight className="h-4 w-4" />
              </button>
                  {!isMobile && openSection === "category" && renderCategoryContent()}
                  <Separator />
                </>
              )}

              {/* --- Brand Filter --- */}
              {showBrandRow && (
                <>
                  <button
                    type="button"
                    disabled={filtersFacetFetchPending}
                    onClick={() => handleSectionToggle("brand")}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    Brand
                    {renderFacetTrailing()}
                  </button>
                  {!isMobile && openSection === "brand" && renderBrandContent()}
                  <Separator className="my-1" />
                </>
              )}

              {/* --- Gender Filter --- */}
              {showGenderRow && (
                <>
                  <button
                    type="button"
                    disabled={filtersFacetFetchPending}
                    onClick={() => handleSectionToggle("gender")}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    Gender
                    {renderFacetTrailing()}
                  </button>
                  {!isMobile && openSection === "gender" && renderGenderContent()}
                  <Separator className="my-1" />
                </>
              )}

              {/* --- Color Filter --- */}
              {showColorRow && (
                <>
                  <button
                    type="button"
                    disabled={filtersFacetFetchPending}
                    onClick={() => handleSectionToggle("color")}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    Colour
                    {renderFacetTrailing()}
                  </button>
                  {!isMobile && openSection === "color" && renderColorContent()}
                  <Separator className="my-1" />
                </>
              )}

              {/* --- Size Filter --- */}
              {showSizeRow && (
                <>
                  <button
                    type="button"
                    disabled={filtersFacetFetchPending}
                    onClick={() => handleSectionToggle("size")}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    Size
                    {renderFacetTrailing()}
                  </button>
                  {!isMobile && openSection === "size" && renderSizeContent()}
                  <Separator className="my-1" />
                </>
              )}

              {/* --- Price Filter --- */}
              {showPriceRow && (
                <>
                  <button
                    type="button"
                    disabled={filtersFacetFetchPending}
                    onClick={() => handleSectionToggle("price")}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-[0.2em] uppercase text-gray-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    Price
                    {renderFacetTrailing()}
                  </button>
                  {!isMobile && openSection === "price" && renderPriceContent()}
                </>
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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Show ${(() => {
                const count =
                  typeof liveTotal === "number"
                    ? liveTotal
                    : typeof totalCount === "number"
                    ? totalCount
                    : null;
                if (count === null) return "results";
                return `${count > 10000 ? "10000+" : count} results`;
              })()}`
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}
