"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import useAxios from "@/hooks/useAxios";
import useCurrency from "@/hooks/useCurrency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import _ from "lodash";
import {
  shoeDisplaySize,
  sortShoesByEU,
  sortClothingSizes,
  isAlphaSize,
  isWaistSize,
  isShoeEUSize,
  SHOE_SYSTEMS,
  SIZE_STORAGE_KEY,
} from "@/utils/sizeConversion";

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const normalizeBrandKey = (v) =>
  String(v || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const SORT_OPTIONS = [
  { value: "is_our_picks", label: "Our Picks" },
  { value: "is_newest", label: "Newest first" },
  { value: "price_high_to_low", label: "Price: high to low" },
  { value: "price_low_to_high", label: "Price: low to high" },
];

const VISIBLE_CLOTHING_SIZES = 24;
const VISIBLE_SHOE_SIZES = 24;

/**
 * Determines which size-filter variant to render based on the URL path.
 *   "alpha"          – standard XXS–6XL grid
 *   "alpha+numeric"  – alpha grid + numeric (waist, etc.)
 *   "shoe"           – EU shoe-size grid with EU/US/UK toggle
 *   "numeric"        – plain numeric (glasses, sunglasses)
 *   "us"             – US ring sizes
 *   "none"           – no size filter (bags)
 */
function getSizeFilterType(path) {
  const p = (path || "").toLowerCase();
  const segments = p.split("/").filter(Boolean);

  const has = (keyword) => segments.some((s) => s.includes(keyword));

  if (has("footwear"))   return "shoe";
  if (has("bags"))       return "none";
  if (has("glasses") || has("sunglasses")) return "numeric";
  if (has("ring"))       return "us";
  if (has("watch"))      return "numeric";
  if (has("bottomwear") || has("bottom") || has("jeans") || has("trousers") ||
      has("shorts") || has("skirt") || has("belt") || has("suit"))
    return "alpha+numeric";
  if (has("underwear") || has("lingerie") || has("nightwear"))
    return "alpha+numeric";

  return "alpha";
}

const STANDARD_ALPHA_SIZES = [
  { value: "XXS", label: "XXS" },
  { value: "XS",  label: "XS" },
  { value: "S",   label: "S" },
  { value: "M",   label: "M" },
  { value: "L",   label: "L" },
  { value: "XL",  label: "XL" },
  { value: "2XL", label: "XXL" },
  { value: "3XL", label: "3XL" },
  { value: "4XL", label: "4XL" },
  { value: "5XL", label: "5XL" },
  { value: "6XL", label: "6XL" },
];

const WOMEN_SHOE_EU_SIZES = [
  { value: "36", label: "36" },
  { value: "37", label: "37" },
  { value: "38", label: "38" },
  { value: "39", label: "39" },
  { value: "40", label: "40" },
  { value: "41", label: "41" },
  { value: "42", label: "42" },
];

const MEN_SHOE_EU_SIZES = [
  { value: "39", label: "39" },
  { value: "40", label: "40" },
  { value: "41", label: "41" },
  { value: "42", label: "42" },
  { value: "43", label: "43" },
  { value: "44", label: "44" },
  { value: "45", label: "45" },
  { value: "46", label: "46" },
  { value: "47", label: "47" },
  { value: "48", label: "48" },
  { value: "49", label: "49" },
  { value: "50", label: "50" },
];

/* ═══════════════════════════════════════════════════════════════
   SidebarFilters
   ═══════════════════════════════════════════════════════════════ */

export default function SidebarFilters({
  open,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
  categories = [],
  categoryId: categoryIdProp = null,
  activeCategoryName = null,
  totalCount = null,
  sortValue = "is_our_picks",
  onSortChange,
}) {
  const { request } = useAxios();
  const { convert, parseDisplayPrice, currencyInfo } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const categoryId =
    categoryIdProp ??
    routeParams?.category?.[routeParams.category?.length - 1] ??
    null;
  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;
  const searchCategorySlug = searchParams.get("category") || null;

  /* ── Facet data from API ─────────────────────────────────── */
  const [facets, setFacets] = useState(null);
  const [fetchState, setFetchState] = useState("idle");

  /* ── Local selections (uncommitted) ──────────────────────── */
  const [selBrands, setSelBrands] = useState([]);
  const [selColors, setSelColors] = useState([]);
  const [selSizes, setSelSizes] = useState([]);
  const [selGenders, setSelGenders] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceErr, setPriceErr] = useState("");

  /* ── UI state ────────────────────────────────────────────── */
  const [expanded, setExpanded] = useState(null);
  const [brandQ, setBrandQ] = useState("");
  const [colorQ, setColorQ] = useState("");
  const [showAllClothingSizes, setShowAllClothingSizes] = useState(false);
  const [showAllShoeSizes, setShowAllShoeSizes] = useState(false);
  const [shoeSystem, setShoeSystem] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SIZE_STORAGE_KEY) || "eu";
    }
    return "eu";
  });
  const [isMobile, setIsMobile] = useState(false);
  const [mobSection, setMobSection] = useState(null);
  const [localSort, setLocalSort] = useState(sortValue);
  const [renderContent, setRenderContent] = useState(false);

  /* ── Category navigation ─────────────────────────────────── */
  const [catStack, setCatStack] = useState([]);
  const [catCache, setCatCache] = useState({});
  const [catMap, setCatMap] = useState(null);

  /* ── Live facets (debounced re-fetch when selections change) ─ */
  const [liveTotal, setLiveTotal] = useState(null);
  const [liveFacets, setLiveFacets] = useState(null);
  const [refetchingCount, setRefetchingCount] = useState(false);

  /* ── Refs ─────────────────────────────────────────────────── */
  const lastKey = useRef("");
  const sectionInit = useRef(false);
  const countDebounce = useRef(null);

  /* ═══════════════════════════════════════════════════════════
     Effects
     ═══════════════════════════════════════════════════════════ */

  useEffect(() => {
    setLocalSort(sortValue);
  }, [sortValue]);

  useEffect(() => {
    if (open) {
      setRenderContent(true);
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
    document.body.style.overflow = "";
    const t = setTimeout(() => setRenderContent(false), 350);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    setSelBrands(initialFilters.brands || []);
    setSelColors(initialFilters.colors || []);
    setSelSizes(initialFilters.sizes || []);
    setSelGenders(initialFilters.genders || []);
    const p = initialFilters.price || { min: 0, max: 100000 };
    setPriceMin(String(convert(p.min)));
    setPriceMax(String(convert(p.max)));
    setPriceErr("");
  }, [initialFilters, convert]);

  useEffect(() => {
    if (!open) return;

    const qp = new URLSearchParams();
    if (searchQuery) {
      qp.set("q", searchQuery);
      if (searchCategorySlug) qp.set("category_slug", searchCategorySlug);
    } else if (categoryId) {
      qp.set("category_id", categoryId);
    }
    (initialFilters.brands || []).forEach((b) => qp.append("brand", b));
    (initialFilters.colors || []).forEach((c) => qp.append("color", c));
    (initialFilters.sizes || []).forEach((s) => qp.append("size", s));
    (initialFilters.genders || []).forEach((g) => qp.append("gender", g));
    if (initialFilters.price?.min)
      qp.set("min_price", String(initialFilters.price.min));
    if (initialFilters.price?.max && initialFilters.price.max !== 100000)
      qp.set("max_price", String(initialFilters.price.max));

    const key = qp.toString();
    if (lastKey.current === key && facets) return;
    lastKey.current = key;
    setFetchState("loading");

    (async () => {
      try {
        const { data } = await request({
          method: "GET",
          url: key
            ? `/users/get-filters-for-products?${key}`
            : "/users/get-filters-for-products",
        });
        if (data?.status === 200 && data.data) {
          const d = data.data;
          setFacets({
            brands: (d.brands || []).filter(Boolean),
            colors: (d.colors || []).filter(Boolean),
            sizes: (d.sizes || []).filter(Boolean),
            genders: (d.genders || []).filter(Boolean),
            price: { min: d.price?.min ?? 0, max: d.price?.max ?? 100000 },
            brandCounts: Array.isArray(d.brand_counts)
              ? d.brand_counts
              : [],
            colorCounts: Array.isArray(d.color_counts)
              ? d.color_counts
              : [],
            sizeCounts: Array.isArray(d.size_counts) ? d.size_counts : [],
            sizeGroups: d.sizeGroups || null,
            genderCounts: Array.isArray(d.gender_counts)
              ? d.gender_counts
              : [],
            total: typeof d.total === "number" ? d.total : null,
          });
        }
      } catch (e) {
        console.error("Failed to fetch filters:", e);
      } finally {
        setFetchState("done");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, categoryId, searchQuery, searchCategorySlug, initialFilters]);

  useEffect(() => {
    lastKey.current = "";
    setFacets(null);
    setLiveFacets(null);
    setLiveTotal(null);
    setFetchState("idle");
    sectionInit.current = false;
  }, [categoryId, searchQuery]);

  useEffect(() => {
    if (!categoryId || catMap) return;
    (async () => {
      const { data } = await request({
        method: "GET",
        url: "/users/get-child-categories",
      });
      if (data?.status !== 200 || !Array.isArray(data.data)) return;
      const m = new Map();
      const walk = (nodes, pid = null) => {
        nodes.forEach((n) => {
          m.set(n.id, {
            id: n.id,
            parent_id: pid ?? n.parent_id ?? null,
            path: n.path,
          });
          if (n.children?.length) walk(n.children, n.id);
        });
      };
      walk(data.data);
      setCatMap(m);
    })();
  }, [categoryId, catMap, request]);

  useEffect(() => {
    if (sectionInit.current || !facets) return;
    setExpanded(null);
    sectionInit.current = true;
  }, [facets, categories]);

  /* ═══════════════════════════════════════════════════════════
     Live result count — debounced re-fetch when selections differ
     ═══════════════════════════════════════════════════════════ */

  const hasChanges = useMemo(() => {
    const eq = (a, b) => {
      const sa = [...(a || [])].sort();
      const sb = [...(b || [])].sort();
      return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
    };
    const initPrice = initialFilters.price || { min: 0, max: 100000 };
    const curMin = Number(priceMin) || 0;
    const curMax = Number(priceMax) || 0;
    const initMin = convert(initPrice.min) || 0;
    const initMax = convert(initPrice.max) || 0;
    return (
      !eq(initialFilters.brands, selBrands) ||
      !eq(initialFilters.colors, selColors) ||
      !eq(initialFilters.sizes, selSizes) ||
      !eq(initialFilters.genders, selGenders) ||
      curMin !== initMin ||
      curMax !== initMax
    );
  }, [initialFilters, selBrands, selColors, selSizes, selGenders, priceMin, priceMax, convert]);

  useEffect(() => {
    if (!open || !hasChanges || !facets) {
      setLiveTotal(null);
      setLiveFacets(null);
      return;
    }
    setLiveTotal(null);
    setRefetchingCount(true);

    if (countDebounce.current) clearTimeout(countDebounce.current);
    countDebounce.current = setTimeout(async () => {
      try {
        const qp = new URLSearchParams();
        if (searchQuery) {
          qp.set("q", searchQuery);
          if (searchCategorySlug) qp.set("category_slug", searchCategorySlug);
        } else if (categoryId) {
          qp.set("category_id", categoryId);
        }
        selBrands.forEach((b) => qp.append("brand", b));
        selColors.forEach((c) => qp.append("color", c));
        selSizes.forEach((s) => qp.append("size", s));
        selGenders.forEach((g) => qp.append("gender", g));
        const mn = Number(priceMin);
        const mx = Number(priceMax);
        if (Number.isFinite(mn) && mn > 0)
          qp.set("min_price", String(parseDisplayPrice(mn)));
        if (Number.isFinite(mx) && mx > 0 && mx !== convert(100000))
          qp.set("max_price", String(parseDisplayPrice(mx)));

        const { data } = await request({
          method: "GET",
          url: `/users/get-filters-for-products?${qp.toString()}`,
        });
        if (data?.status === 200 && data.data) {
          const d = data.data;
          if (typeof d.total === "number") setLiveTotal(d.total);
          setLiveFacets({
            brandCounts: Array.isArray(d.brand_counts) ? d.brand_counts : [],
            colorCounts: Array.isArray(d.color_counts) ? d.color_counts : [],
            sizeCounts: Array.isArray(d.size_counts) ? d.size_counts : [],
            sizeGroups: d.sizeGroups || null,
            genderCounts: Array.isArray(d.gender_counts) ? d.gender_counts : [],
            total: typeof d.total === "number" ? d.total : null,
          });
        }
      } catch {
        /* silent — button falls back to "Show results" */
      } finally {
        setRefetchingCount(false);
      }
    }, 300);

    return () => {
      if (countDebounce.current) clearTimeout(countDebounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasChanges, facets, selBrands, selColors, selSizes, selGenders, priceMin, priceMax]);

  /* ═══════════════════════════════════════════════════════════
     Count maps — use liveFacets (from debounced re-fetch) when
     the user has local changes, otherwise fall back to facets.
     ═══════════════════════════════════════════════════════════ */

  const countSource = hasChanges && liveFacets ? liveFacets : facets;

  const brandCM = useMemo(() => {
    const m = new Map();
    countSource?.brandCounts.forEach((b) => {
      const k = normalizeBrandKey(b.value ?? b.label);
      if (k) m.set(k, { label: b.label, count: Number(b.count) || 0 });
    });
    return m;
  }, [countSource]);

  const colorCM = useMemo(() => {
    const m = new Map();
    countSource?.colorCounts.forEach((c) => {
      const k = String(c.value || "").trim().toLowerCase();
      if (k) m.set(k, Number(c.count) || 0);
    });
    return m;
  }, [countSource]);

  const sizeCM = useMemo(() => {
    const m = new Map();
    countSource?.sizeCounts.forEach((s) => {
      const k = String(s.value || "").trim();
      if (k) m.set(k, (m.get(k) || 0) + (Number(s.count) || 0));
    });
    return m;
  }, [countSource]);

  const genderCM = useMemo(() => {
    const m = new Map();
    countSource?.genderCounts.forEach((g) => {
      const k = String(g.value || "").trim().toLowerCase();
      if (k) m.set(k, Number(g.count) || 0);
    });
    return m;
  }, [countSource]);

  /* ═══════════════════════════════════════════════════════════
     Computed facet lists
     ═══════════════════════════════════════════════════════════ */

  const filteredBrands = useMemo(() => {
    if (!facets) return [];
    const t = brandQ.trim().toLowerCase();
    return facets.brands.filter((b) => b.toLowerCase().includes(t));
  }, [facets, brandQ]);

  const groupedBrands = useMemo(() => {
    const groups = new Map();
    filteredBrands.forEach((brand) => {
      const label = _.startCase(_.toLower(brand));
      let letter = (label[0] || "#").toUpperCase();
      if (!/^[A-Z]$/.test(letter)) letter = "#";
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push({
        value: brand,
        label,
        count: brandCM.get(normalizeBrandKey(brand))?.count ?? 0,
      });
    });
    return Array.from(groups.entries())
      .map(([letter, items]) => ({
        letter,
        items: items.sort((a, b) => {
          const aS = selBrands.includes(a.value) ? 0 : 1;
          const bS = selBrands.includes(b.value) ? 0 : 1;
          return aS !== bS ? aS - bS : a.label.localeCompare(b.label);
        }),
      }))
      .sort((a, b) =>
        a.letter === "#" ? 1 : b.letter === "#" ? -1 : a.letter.localeCompare(b.letter),
      );
  }, [filteredBrands, brandCM, selBrands]);

  const filteredColors = useMemo(() => {
    if (!facets) return [];
    const t = colorQ.trim().toLowerCase();
    return t
      ? facets.colors.filter((c) => String(c).toLowerCase().includes(t))
      : facets.colors;
  }, [facets, colorQ]);

  const { clothingSizes, shoeSizes, oneSizeEntry, accessorySizes, hasOnlyOneGroup } = useMemo(() => {
    const empty = { clothingSizes: [], shoeSizes: [], oneSizeEntry: null, accessorySizes: [], hasOnlyOneGroup: true };
    if (!facets) return empty;

    const grps = facets.sizeGroups;
    if (grps) {
      const toItems = (arr) => (arr || []).map((s) => ({
        value: String(s.value),
        count: Number(s.count) || 0,
      }));

      // Clothing: only keep alpha + waist sizes (safety filter)
      const rawClothing = toItems(grps["Clothing"]);
      const cleanClothing = rawClothing.filter(
        (s) => isAlphaSize(s.value) || isWaistSize(s.value),
      );

      // Footwear: only keep valid numeric shoe sizes
      const rawFootwear = toItems(grps["Footwear"]);
      const cleanShoes = rawFootwear.filter((s) => isShoeEUSize(s.value));

      // One Size: separate
      const oneSizeArr = toItems(grps["One Size"]);
      const oneSize = oneSizeArr.length > 0 ? oneSizeArr[0] : null;

      // Accessory: belt sizes etc.
      const accessory = sortShoesByEU(toItems(grps["Accessory"]));

      const sortedClothing = sortClothingSizes(cleanClothing);
      const sortedShoes = sortShoesByEU(cleanShoes);
      const groups = [sortedClothing, sortedShoes, accessory].filter((g) => g.length > 0);
      return {
        clothingSizes: sortedClothing,
        shoeSizes: sortedShoes,
        oneSizeEntry: oneSize,
        accessorySizes: accessory,
        hasOnlyOneGroup: groups.length <= 1,
      };
    }

    // Fallback for old API format (pre-backfill)
    const all = facets.sizes.map((s) => ({
      value: String(s || "").trim(),
      count: sizeCM.get(String(s || "").trim()) || 0,
    })).filter((s) => s.value);
    return { ...empty, clothingSizes: sortClothingSizes(all) };
  }, [facets, sizeCM]);

  const hasSizes = clothingSizes.length > 0 || shoeSizes.length > 0 || !!oneSizeEntry || accessorySizes.length > 0;

  const sizeFilterType = useMemo(() => getSizeFilterType(pathname), [pathname]);

  const standardAlphaSizes = useMemo(() => {
    if (!facets) return [];
    return STANDARD_ALPHA_SIZES.map((s) => ({
      ...s,
      count: sizeCM.get(s.value) ?? 0,
    }));
  }, [facets, sizeCM]);

  const hasStandardAlpha = standardAlphaSizes.some((s) => s.count > 0);

  const shoeEuList = useMemo(() => {
    const p = (pathname || "").toLowerCase();
    if (p.includes("menswear")) return MEN_SHOE_EU_SIZES;
    return WOMEN_SHOE_EU_SIZES;
  }, [pathname]);

  const standardShoeSizes = useMemo(() => {
    if (!facets) return [];
    return shoeEuList.map((s) => ({
      ...s,
      count: sizeCM.get(s.value) ?? 0,
    }));
  }, [facets, sizeCM, shoeEuList]);

  const hasStandardShoe = standardShoeSizes.some((s) => s.count > 0);

  const hasAnySizeFilter = sizeFilterType === "none"
    ? false
    : sizeFilterType === "shoe"
      ? hasStandardShoe
      : sizeFilterType === "numeric" || sizeFilterType === "us"
        ? clothingSizes.length > 0 || accessorySizes.length > 0
        : hasStandardAlpha || hasSizes;

  /* ═══════════════════════════════════════════════════════════
     Applied chips (reflects LOCAL selections in real-time)
     ═══════════════════════════════════════════════════════════ */

  const chips = useMemo(() => {
    const arr = [];
    if (activeCategoryName?.trim() && categoryId)
      arr.push({
        key: "cat",
        kind: "category",
        label: activeCategoryName.trim(),
      });
    selBrands.forEach((b) => {
      const t = String(b).trim();
      if (t) arr.push({ key: `b-${t}`, kind: "brand", label: _.startCase(_.toLower(t)), value: t });
    });
    selColors.forEach((c) => {
      const t = String(c).trim();
      if (t) arr.push({ key: `c-${t}`, kind: "color", label: t, value: t });
    });
    selSizes.forEach((s) => {
      const r = String(s).trim();
      if (r)
        arr.push({
          key: `s-${r}`,
          kind: "size",
          label: r,
          value: r,
        });
    });
    selGenders.forEach((g) => {
      const t = String(g).trim();
      if (t)
        arr.push({
          key: `g-${t}`,
          kind: "gender",
          label: _.startCase(_.toLower(t)),
          value: t,
        });
    });
    const defaultMin = facets ? String(convert(facets.price.min)) : "";
    const defaultMax = facets ? String(convert(facets.price.max)) : "";
    if (priceMin && priceMax && (priceMin !== defaultMin || priceMax !== defaultMax)) {
      const sym = currencyInfo?.symbol || "₹";
      arr.push({
        key: "price",
        kind: "price",
        label: `${sym}${Number(priceMin).toLocaleString()} – ${sym}${Number(priceMax).toLocaleString()}`,
      });
    }
    return arr;
  }, [activeCategoryName, categoryId, selBrands, selColors, selSizes, selGenders, priceMin, priceMax, facets, convert, currencyInfo]);

  /* ═══════════════════════════════════════════════════════════
     Handlers
     ═══════════════════════════════════════════════════════════ */

  const tog = (setter, arr, val) =>
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const handleReset = () => {
    setSelBrands([]);
    setSelColors([]);
    setSelSizes([]);
    setSelGenders([]);
    if (facets) {
      setPriceMin(String(convert(facets.price.min)));
      setPriceMax(String(convert(facets.price.max)));
    }
    setPriceErr("");
    setLiveFacets(null);
    setLiveTotal(null);
    setRefetchingCount(false);
    setShowAllClothingSizes(false);
    setShowAllShoeSizes(false);
    if (countDebounce.current) clearTimeout(countDebounce.current);
    onReset?.();
  };

  const handleApply = () => {
    const mn = Number(priceMin);
    const mx = Number(priceMax);
    if (
      priceMin &&
      priceMax &&
      (!Number.isFinite(mn) ||
        !Number.isFinite(mx) ||
        mn < 0 ||
        mx < 0 ||
        mn > mx)
    ) {
      setPriceErr("Enter a valid price range");
      return;
    }
    setPriceErr("");
    const price = {
      min: Number.isFinite(mn) && mn > 0 ? parseDisplayPrice(mn) : 0,
      max: Number.isFinite(mx) && mx > 0 ? parseDisplayPrice(mx) : 100000,
    };
    onApply({
      brands: selBrands,
      colors: selColors,
      sizes: selSizes,
      genders: selGenders,
      price,
    });
    onClose?.();
  };

  const handleSort = (v) => {
    setLocalSort(v);
    onSortChange?.(v);
  };

  const handleSection = (s) => {
    if (fetchState === "loading" && s !== "category") return;
    if (isMobile) {
      setMobSection(s);
      return;
    }
    setExpanded(expanded === s ? null : s);
  };

  /* ── Category navigation ─────────────────────────────────── */

  const cleanQ = useCallback(() => {
    const p = new URLSearchParams();
    const sb = searchParams.get("sort_by");
    if (sb) p.set("sort_by", sb);
    else p.set("sort_by", "is_our_picks");
    if (searchParams.get("filters") === "1") p.set("filters", "1");
    if (pathname?.includes("/search")) {
      const q = searchParams.get("q") || searchParams.get("query");
      if (q) p.set("q", q);
      const c = searchParams.get("category");
      if (c) p.set("category", c);
    }
    return p.toString();
  }, [searchParams, pathname]);

  const fetchChildren = async (id) => {
    if (!id) return [];
    if (catCache[id]) return catCache[id];
    const { data } = await request({
      method: "GET",
      url: `/users/get-child-categories?category_id=${id}`,
    });
    const ch =
      data?.status === 200 && Array.isArray(data.data) ? data.data : [];
    setCatCache((p) => ({ ...p, [id]: ch }));
    return ch;
  };

  const handleCatClick = async (cat) => {
    const ch = catCache[cat.id]?.length
      ? catCache[cat.id]
      : await fetchChildren(cat.id);
    if (ch.length > 0) {
      setCatStack((p) => [
        ...p,
        { id: cat.id, path: cat.path, name: cat.name },
      ]);
      return;
    }
    onClose?.();
    router.push(`/shop/${cat.path}/${cat.id}?${cleanQ()}`);
  };

  const handleCatBack = () => {
    if (catStack.length > 0) {
      setCatStack((p) => p.slice(0, -1));
      return;
    }
    if (categoryId && catMap?.has(categoryId)) {
      const pid = catMap.get(categoryId)?.parent_id;
      const pn = pid ? catMap.get(pid) : null;
      if (pn?.id && pn?.path)
        router.push(`/shop/${pn.path}/${pn.id}?${cleanQ()}`);
    }
  };

  const handleRemoveCatChip = useCallback(() => {
    const q = cleanQ();
    if (categoryId && catMap?.has(categoryId)) {
      const pid = catMap.get(categoryId)?.parent_id;
      const pn = pid ? catMap.get(pid) : null;
      if (pn?.id && pn?.path) {
        router.push(`/shop/${pn.path}/${pn.id}?${q}`);
        return;
      }
    }
    router.push(`/shop?${q}`);
  }, [categoryId, catMap, router, cleanQ]);

  const removeChip = (ch) => {
    if (ch.kind === "category") handleRemoveCatChip();
    else if (ch.kind === "brand") tog(setSelBrands, selBrands, ch.value);
    else if (ch.kind === "color") tog(setSelColors, selColors, ch.value);
    else if (ch.kind === "size")
      setSelSizes((prev) => prev.filter((v) => v !== ch.value));
    else if (ch.kind === "gender") tog(setSelGenders, selGenders, ch.value);
    else if (ch.kind === "price" && facets) {
      setPriceMin(String(convert(facets.price.min)));
      setPriceMax(String(convert(facets.price.max)));
    }
  };

  /* ═══════════════════════════════════════════════════════════
     Derived
     ═══════════════════════════════════════════════════════════ */

  const skeleton = fetchState === "loading" && !facets;

  const countText = useMemo(() => {
    if (hasChanges) {
      if (liveTotal != null)
        return liveTotal > 10000 ? "10,000+" : liveTotal.toLocaleString();
      return null;
    }
    const c = facets?.total ?? totalCount;
    if (c == null) return null;
    return c > 10000 ? "10,000+" : c.toLocaleString();
  }, [hasChanges, liveTotal, facets, totalCount]);

  /* ═══════════════════════════════════════════════════════════
     Section header
     ═══════════════════════════════════════════════════════════ */

  const sectionHead = (id, label, isLoadable = false) => (
    <button
      type="button"
      onClick={() => handleSection(id)}
      disabled={isLoadable && fetchState === "loading"}
      className="w-full flex items-center justify-between py-4 text-xs font-medium tracking-[0.15em] uppercase text-gray-900 border-b border-gray-100 disabled:cursor-wait disabled:opacity-70"
    >
      <span>{label}</span>
      {isLoadable && fetchState === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            expanded === id ? "rotate-180" : ""
          }`}
        />
      )}
    </button>
  );

  /* ═══════════════════════════════════════════════════════════
     Content renderers
     ═══════════════════════════════════════════════════════════ */

  function renderCats() {
    const top = catStack.length ? catStack[catStack.length - 1] : null;
    const list = top ? catCache[top.id] || [] : categories;
    return (
      <div className="py-3 space-y-1">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleCatClick(c)}
            className="w-full text-left text-sm text-gray-700 hover:text-black py-1.5 transition-colors"
          >
            {_.startCase(_.toLower(c.name))}
          </button>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-gray-400 py-2">No subcategories</p>
        )}
      </div>
    );
  }

  function renderBrands() {
    return (
      <div className="py-3">
        <div className="relative mb-3">
          <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${facets?.brands.length || 0} brands`}
            value={brandQ}
            onChange={(e) => setBrandQ(e.target.value)}
            className="pl-6 border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
        <div className="max-h-none sm:max-h-[320px] overflow-y-auto pr-1 space-y-4">
          {groupedBrands
            .filter((g) => g.items.some((item) => item.count > 0 || selBrands.includes(item.value)))
            .map((g) => (
            <div key={g.letter}>
              <div className="text-[11px] font-semibold text-gray-400 uppercase mb-2">
                {g.letter}
              </div>
              <div className="space-y-2.5">
                {g.items
                  .filter((item) => item.count > 0 || selBrands.includes(item.value))
                  .map((item) => {
                  const sel = selBrands.includes(item.value);
                  return (
                    <label
                      key={item.value}
                      className="flex items-center justify-between gap-3 text-sm text-gray-700 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={sel}
                          onCheckedChange={() =>
                            tog(setSelBrands, selBrands, item.value)
                          }
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums shrink-0">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {groupedBrands.length === 0 && brandQ && (
            <p className="text-sm text-gray-400 py-2">
              No brands match &ldquo;{brandQ}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderGenders() {
    const list = facets?.genders || [];
    return (
      <div className="py-3 space-y-2.5">
        {list
          .filter((g) => {
            const k = String(g).trim().toLowerCase();
            return (genderCM.get(k) ?? 0) > 0 || selGenders.includes(g);
          })
          .map((g) => {
          const k = String(g).trim().toLowerCase();
          const count = genderCM.get(k) ?? 0;
          const sel = selGenders.includes(g);
          return (
            <label
              key={g}
              className="flex items-center justify-between gap-3 text-sm text-gray-700 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Checkbox
                  checked={sel}
                  onCheckedChange={() =>
                    tog(setSelGenders, selGenders, g)
                  }
                />
                <span>{_.startCase(_.toLower(g))}</span>
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {count}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderColors() {
    return (
      <div className="py-3">
        <div className="relative mb-3">
          <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${facets?.colors.length || 0} colours`}
            value={colorQ}
            onChange={(e) => setColorQ(e.target.value)}
            className="pl-6 border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
        <div className="max-h-none sm:max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
          {filteredColors
            .filter((c) => {
              const k = String(c).trim().toLowerCase();
              return (colorCM.get(k) ?? 0) > 0 || selColors.includes(c);
            })
            .map((c) => {
            const k = String(c).trim().toLowerCase();
            const count = colorCM.get(k) ?? 0;
            const sel = selColors.includes(c);
            return (
              <label
                key={c}
                className="flex items-center justify-between gap-3 text-sm text-gray-700 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Checkbox
                    checked={sel}
                    onCheckedChange={() =>
                      tog(setSelColors, selColors, c)
                    }
                  />
                  <span>{c}</span>
                </span>
                <span className="text-xs text-gray-400 tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
          {filteredColors.length === 0 && colorQ && (
            <p className="text-sm text-gray-400 py-2">
              No colours match &ldquo;{colorQ}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderSizeGrid(items, visLimit, showAll, setShowAll) {
    const liveCounts = new Map();
    const src = hasChanges && liveFacets ? liveFacets.sizeCounts : null;
    if (src) {
      src.forEach((s) => {
        const k = String(s.value || "").trim();
        if (k) liveCounts.set(k, (liveCounts.get(k) || 0) + (Number(s.count) || 0));
      });
    }

    const getCount = (val) => {
      if (liveCounts.size > 0) return liveCounts.get(val) ?? 0;
      return sizeCM.get(val) ?? 0;
    };

    const visible = items.filter(
      (g) => getCount(g.value) > 0 || selSizes.includes(g.value),
    );
    const shown = showAll ? visible : visible.slice(0, visLimit);

    return (
      <>
        <div className="grid grid-cols-4 gap-2">
          {shown.map((g) => {
            const sel = selSizes.includes(g.value);
            const count = getCount(g.value);
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => {
                  if (sel) setSelSizes((p) => p.filter((v) => v !== g.value));
                  else setSelSizes((p) => [...p, g.value]);
                }}
                className={`min-h-10 px-1 py-2 text-[11px] leading-snug border transition-colors text-center ${
                  sel
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                <span className="block">{g.displayLabel || g.value}</span>
                {count > 0 && (
                  <span className="block text-[10px] mt-0.5 opacity-60">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {visible.length > visLimit && (
          <button
            type="button"
            onClick={() => setShowAll((p) => !p)}
            className="mt-3 w-full h-9 border border-gray-200 text-xs font-medium tracking-[0.15em] uppercase hover:border-black transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${visible.length})`}
          </button>
        )}
      </>
    );
  }

  function renderStandardAlpha() {
    const liveCounts = new Map();
    const src = hasChanges && liveFacets ? liveFacets.sizeCounts : null;
    if (src) {
      src.forEach((s) => {
        const k = String(s.value || "").trim();
        if (k) liveCounts.set(k, (liveCounts.get(k) || 0) + (Number(s.count) || 0));
      });
    }
    const getCount = (val) => {
      if (liveCounts.size > 0) return liveCounts.get(val) ?? 0;
      return sizeCM.get(val) ?? 0;
    };

    return (
      <div className="py-3">
        <div className="grid grid-cols-4 gap-2">
          {STANDARD_ALPHA_SIZES.map((s) => {
            const sel = selSizes.includes(s.value);
            const count = getCount(s.value);
            if (count === 0 && !sel) return null;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  if (sel) setSelSizes((p) => p.filter((v) => v !== s.value));
                  else setSelSizes((p) => [...p, s.value]);
                }}
                className={`min-h-10 px-1 py-2 text-[11px] leading-snug border transition-colors text-center ${
                  sel
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                <span className="block">{s.label}</span>
                {count > 0 && (
                  <span className="block text-[10px] mt-0.5 opacity-60">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSizeFilter() {
    if (sizeFilterType === "none") return null;

    if (sizeFilterType === "shoe") {
      if (!hasStandardShoe) return null;

      const liveCounts = new Map();
      const src = hasChanges && liveFacets ? liveFacets.sizeCounts : null;
      if (src) src.forEach((s) => { const k = String(s.value || "").trim(); if (k) liveCounts.set(k, (liveCounts.get(k) || 0) + (Number(s.count) || 0)); });
      const getCount = (val) => liveCounts.size > 0 ? (liveCounts.get(val) ?? 0) : (sizeCM.get(val) ?? 0);

      return (
        <div className="py-3">
          <div className="grid grid-cols-4 gap-2">
            {shoeEuList.map((s) => {
              const sel = selSizes.includes(s.value);
              const count = getCount(s.value);
              if (count === 0 && !sel) return null;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    if (sel) setSelSizes((p) => p.filter((v) => v !== s.value));
                    else setSelSizes((p) => [...p, s.value]);
                  }}
                  className={`min-h-10 px-1 py-2 text-[11px] leading-snug border transition-colors text-center ${
                    sel
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  <span className="block">{s.label}</span>
                  {count > 0 && (
                    <span className="block text-[10px] mt-0.5 opacity-60">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (sizeFilterType === "numeric" || sizeFilterType === "us") {
      const items = [...clothingSizes, ...accessorySizes].filter((s) => s.value);
      if (items.length === 0) return null;
      return (
        <div className="py-3">
          {renderSizeGrid(items, 24, showAllClothingSizes, setShowAllClothingSizes)}
        </div>
      );
    }

    if (sizeFilterType === "alpha+numeric") {
      return (
        <div className="py-3 space-y-4">
          {hasStandardAlpha && renderStandardAlpha()}
          {clothingSizes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Numeric
              </p>
              {renderSizeGrid(
                clothingSizes.filter((s) => !STANDARD_ALPHA_SIZES.some((a) => a.value === s.value)),
                VISIBLE_CLOTHING_SIZES,
                showAllClothingSizes,
                setShowAllClothingSizes,
              )}
            </div>
          )}
          {oneSizeEntry && (() => {
            const sel = selSizes.includes("One Size");
            const liveCounts = new Map();
            const src = hasChanges && liveFacets ? liveFacets.sizeCounts : null;
            if (src) src.forEach((s) => { const k = String(s.value || "").trim(); if (k) liveCounts.set(k, (liveCounts.get(k) || 0) + (Number(s.count) || 0)); });
            const count = liveCounts.size > 0 ? (liveCounts.get("One Size") ?? 0) : (oneSizeEntry.count || 0);
            if (count === 0 && !sel) return null;
            return (
              <button
                type="button"
                onClick={() => {
                  if (sel) setSelSizes((p) => p.filter((v) => v !== "One Size"));
                  else setSelSizes((p) => [...p, "One Size"]);
                }}
                className={`w-full h-10 px-3 text-xs font-medium border transition-colors ${
                  sel
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                One Size{count > 0 ? ` (${count})` : ""}
              </button>
            );
          })()}
        </div>
      );
    }

    return renderStandardAlpha();
  }

  function renderSizes() {
    const shoeItems = shoeSizes.map((s) => ({
      ...s,
      displayLabel: shoeDisplaySize(s.value, shoeSystem),
    }));

    return (
      <div className="py-3 space-y-4">
        {/* One Size toggle */}
        {oneSizeEntry && (
          <div>
            {!hasOnlyOneGroup && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Universal
              </p>
            )}
            {(() => {
              const sel = selSizes.includes("One Size");
              const liveCounts = new Map();
              const src = hasChanges && liveFacets ? liveFacets.sizeCounts : null;
              if (src) src.forEach((s) => { const k = String(s.value || "").trim(); if (k) liveCounts.set(k, (liveCounts.get(k) || 0) + (Number(s.count) || 0)); });
              const count = liveCounts.size > 0 ? (liveCounts.get("One Size") ?? 0) : (oneSizeEntry.count || 0);
              if (count === 0 && !sel) return null;
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (sel) setSelSizes((p) => p.filter((v) => v !== "One Size"));
                    else setSelSizes((p) => [...p, "One Size"]);
                  }}
                  className={`w-full h-10 px-3 text-xs font-medium border transition-colors ${
                    sel
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  One Size{count > 0 ? ` (${count})` : ""}
                </button>
              );
            })()}
          </div>
        )}

        {/* Clothing sizes */}
        {clothingSizes.length > 0 && (
          <div>
            {!hasOnlyOneGroup && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Clothing
              </p>
            )}
            {renderSizeGrid(
              clothingSizes,
              VISIBLE_CLOTHING_SIZES,
              showAllClothingSizes,
              setShowAllClothingSizes,
            )}
          </div>
        )}

        {/* Shoe sizes */}
        {shoeSizes.length > 0 && (
          <div>
            {!hasOnlyOneGroup && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Shoes
              </p>
            )}
            <div className="flex gap-1 mb-3">
              {SHOE_SYSTEMS.map((sys) => (
                <button
                  key={sys.key}
                  type="button"
                  onClick={() => {
                    setShoeSystem(sys.key);
                    if (typeof window !== "undefined")
                      localStorage.setItem(SIZE_STORAGE_KEY, sys.key);
                  }}
                  className={`px-3 py-1 text-[11px] font-medium border transition-colors ${
                    shoeSystem === sys.key
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-600 hover:border-black"
                  }`}
                >
                  {sys.label}
                </button>
              ))}
            </div>
            {renderSizeGrid(
              shoeItems,
              VISIBLE_SHOE_SIZES,
              showAllShoeSizes,
              setShowAllShoeSizes,
            )}
          </div>
        )}

        {/* Accessory sizes (belts etc.) */}
        {accessorySizes.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Belt / Accessory
            </p>
            {renderSizeGrid(
              accessorySizes,
              12,
              showAllClothingSizes,
              setShowAllClothingSizes,
            )}
          </div>
        )}

        {!hasSizes && (
          <p className="text-sm text-gray-400 py-2">No sizes available</p>
        )}
      </div>
    );
  }

  function renderPrice() {
    return (
      <div className="py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase mb-1 block">
              Min
            </label>
            <Input
              type="number"
              value={priceMin}
              onChange={(e) => {
                setPriceMin(e.target.value);
                setPriceErr("");
              }}
              className="rounded-none border-gray-300 text-sm"
              placeholder={String(convert(facets?.price.min ?? 0))}
            />
          </div>
          <span className="text-gray-400 mt-4">–</span>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase mb-1 block">
              Max
            </label>
            <Input
              type="number"
              value={priceMax}
              onChange={(e) => {
                setPriceMax(e.target.value);
                setPriceErr("");
              }}
              className="rounded-none border-gray-300 text-sm"
              placeholder={String(convert(facets?.price.max ?? 100000))}
            />
          </div>
        </div>
        {priceErr && (
          <p className="mt-2 text-xs text-red-600">{priceErr}</p>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════ */

  return (
    <div
      className={`fixed inset-0 z-220 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-40" : "opacity-0"
        }`}
        onClick={() => onClose?.()}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`absolute inset-y-0 left-0 z-10 flex w-full flex-col bg-white shadow-xl sm:w-[420px] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <button
            type="button"
            onClick={handleCatBack}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scroll area ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
          {!renderContent ? null : skeleton ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between py-4">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Applied chips */}
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-100 mb-2">
                  {chips.map((ch) => (
                    <span
                      key={ch.key}
                      className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2.5 py-1.5 text-sm text-gray-800"
                    >
                      <span className="max-w-[200px] truncate">
                        {ch.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChip(ch)}
                        className="shrink-0 rounded p-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                        aria-label={`Remove ${ch.label}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-1 text-sm font-semibold text-gray-900 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Sort */}
              <div className="pb-2">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-900 mb-3 pt-2">
                  Sort by
                </p>
                <div className="space-y-3 pb-3">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => handleSort(o.value)}
                      className="w-full flex items-center gap-3 text-sm text-gray-700 hover:text-black transition-colors"
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                          localSort === o.value
                            ? "border-black"
                            : "border-gray-400"
                        }`}
                      >
                        {localSort === o.value && (
                          <span className="h-2 w-2 rounded-full bg-black" />
                        )}
                      </span>
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator className="mb-1" />

              {/* Mobile full-screen panel */}
              {isMobile && mobSection && (
                <div className="fixed inset-0 z-230 bg-white flex flex-col">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          mobSection === "category" &&
                          catStack.length > 0
                        )
                          setCatStack((p) => p.slice(0, -1));
                        else setMobSection(null);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-gray-900"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                    <span className="text-sm font-medium tracking-[0.15em] uppercase text-gray-700">
                      {mobSection === "standardSize"
                        ? (sizeFilterType === "shoe" ? "Shoe Size" : "Size")
                        : mobSection}
                    </span>
                    <div className="w-14" />
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {mobSection === "category" && renderCats()}
                    {mobSection === "brand" && renderBrands()}
                    {mobSection === "gender" && renderGenders()}
                    {mobSection === "color" && renderColors()}
                    {mobSection === "standardSize" && renderSizeFilter()}
                    {mobSection === "price" && renderPrice()}
                  </div>
                  <div className="border-t border-gray-200 bg-white px-6 py-4">
                    <Button
                      onClick={() => setMobSection(null)}
                      className="w-full bg-black text-white font-medium"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Filter sections ────────────────────────── */}
              {categories.length > 0 && (
                <>
                  {sectionHead("category", "Category")}
                  {!isMobile && expanded === "category" && renderCats()}
                </>
              )}

              {facets?.brands.length > 0 && (
                <>
                  {sectionHead("brand", "Brand", true)}
                  {!isMobile && expanded === "brand" && renderBrands()}
                </>
              )}

              {facets?.genders.length > 1 && (
                <>
                  {sectionHead("gender", "Gender", true)}
                  {!isMobile && expanded === "gender" && renderGenders()}
                </>
              )}

              {facets?.colors.length > 0 && (
                <>
                  {sectionHead("color", "Colour", true)}
                  {!isMobile && expanded === "color" && renderColors()}
                </>
              )}

              {hasAnySizeFilter && (
                <>
                  {sectionHead("standardSize", sizeFilterType === "shoe" ? "Shoe Size" : "Size", true)}
                  {!isMobile && expanded === "standardSize" && renderSizeFilter()}
                </>
              )}


              {facets && (
                <>
                  {sectionHead("price", "Price", true)}
                  {!isMobile && expanded === "price" && renderPrice()}
                </>
              )}

              {/* Empty state */}
              {facets &&
                !categories.length &&
                !facets.brands.length &&
                !facets.colors.length &&
                !hasAnySizeFilter &&
                !facets.genders.length && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-600">
                      No filters available.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try a different category or clear filters.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-black text-white font-medium hover:bg-gray-900"
          >
            {refetchingCount ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating…</span>
              </span>
            ) : countText ? (
              `Show ${countText} results`
            ) : (
              "Show results"
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}
