"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal, ChevronRight, LayoutGrid } from "lucide-react";
import ProductCard from "@/components/_cards/ProductCard";
import useAxios from "@/hooks/useAxios";
import SidebarFilters from "@/components/_pages/product/SidebarFilters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { startCase, toLower } from "lodash";
import { useSelector } from "react-redux";

export default function ProductsListGrid({
  categoryId = null,
  categorySlug = "Shop",
  showCategoryFilters = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery =
    searchParams.get("query") || searchParams.get("q") || null;
  const isSearchMode = !!searchQuery;

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [categoryData, setCategoryData] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState("is_our_picks");

  const isSyncing = useRef(false);
  const hasMounted = useRef(false);
  const observerTarget = useRef(null);
  const categoryScrollRef = useRef(null);

  const { request: getAllProducts } = useAxios();
  const { request: getCategory } = useAxios();
  const { request: getChildCategories, loading: loadingChildren } = useAxios();

  // ✅ Build query string for URL
  const buildQuery = (filters, newSort = sort) => {
    const params = new URLSearchParams();

    if (isSearchMode && searchQuery) {
      params.set("q", searchQuery);
    }

    if (filters.brands?.length)
      filters.brands.forEach((b) => b?.trim() && params.append("brand", b));
    if (filters.colors?.length)
      filters.colors.forEach((c) => c?.trim() && params.append("color", c));
    if (filters.sizes?.length)
      filters.sizes.forEach((s) => s?.trim() && params.append("size", s));
    if (filters.genders?.length)
      filters.genders.forEach((g) => g?.trim() && params.append("gender", g));

    if (
      filters.price &&
      (filters.price.min !== 0 || filters.price.max !== 100000)
    ) {
      params.set("min_price", filters.price.min.toString());
      params.set("max_price", filters.price.max.toString());
    }

    params.set("sort_by", newSort);
    return params.toString();
  };

  // ✅ Fetch products (initial load or reset)
  const fetchAllProducts = async (
    pageNumber = 1,
    filters = selectedFilters,
    sortValue = sort,
    append = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let url = `/users/get-products-from-our-categories?limit=20&page=${pageNumber}`;

      if (isSearchMode) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      } else if (categoryId) {
        url += `&category_id=${categoryId}`;
      } else if (categorySlug && categorySlug !== "Shop") {
        url += `&category_slug=${encodeURIComponent(categorySlug)}`;
      }
      if (sortValue) url += `&sort_by=${sortValue}`;

      const params = new URLSearchParams();
      if (filters.brands?.length)
        filters.brands.forEach((b) => params.append("brand", b));
      if (filters.colors?.length)
        filters.colors.forEach((c) => params.append("color", c));
      if (filters.sizes?.length)
        filters.sizes.forEach((s) => params.append("size", s));
    if (filters.genders?.length)
      filters.genders.forEach((g) => params.append("gender", g));

      if (
        filters.price &&
        (filters.price.min !== 0 || filters.price.max !== 100000)
      ) {
        params.set("min_price", filters.price.min.toString());
        params.set("max_price", filters.price.max.toString());
      }

      if (params.toString()) url += `&${params.toString()}`;

      const { data } = await getAllProducts({
        method: "GET",
        url,
        authRequired: isAuthenticated,
      });
      if (data?.status === 200 && Array.isArray(data.data?.products)) {
        let prods = data.data.products;

        if (!data.data.sorted) {
          const getSortPrice = (product) => {
            const variantPrice = product?.variants?.[0]?.price ?? null;
            const minPrice = product?.min_price ?? product?.price ?? null;
            const value = variantPrice ?? minPrice;
            return Number.isFinite(Number(value)) ? Number(value) : null;
          };

          if (sortValue === "price_low_to_high") {
            prods = [...prods].sort((a, b) => {
              const aPrice = getSortPrice(a);
              const bPrice = getSortPrice(b);
              if (aPrice == null && bPrice == null) return 0;
              if (aPrice == null) return 1;
              if (bPrice == null) return -1;
              return aPrice - bPrice;
            });
          } else if (sortValue === "price_high_to_low") {
            prods = [...prods].sort((a, b) => {
              const aPrice = getSortPrice(a);
              const bPrice = getSortPrice(b);
              if (aPrice == null && bPrice == null) return 0;
              if (aPrice == null) return 1;
              if (bPrice == null) return -1;
              return bPrice - aPrice;
            });
          } else if (sortValue === "is_newest") {
            prods = [...prods].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }
        }

        if (append) {
          setProducts((prev) => [...prev, ...prods]);
        } else {
          setProducts(prods);
        }

        setTotalProducts(data.data.total || data.data.products.length);
        setPage(pageNumber);

        // Check if there are more pages
        const totalPages = data.data.total_pages || 1;
        setHasMore(pageNumber < totalPages);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ✅ Parse filters from URL
  const parseFilters = (urlParams) => {
    const filters = {
      brands: urlParams.getAll("brand"),
      colors: urlParams.getAll("color"),
      sizes: urlParams.getAll("size"),
      genders: urlParams.getAll("gender"),
    };

    const min_price = urlParams.get("min_price");
    const max_price = urlParams.get("max_price");
    if (min_price || max_price)
      filters.price = {
        min: Number(min_price) || 0,
        max: Number(max_price) || 100000,
      };
    return filters;
  };

  // ✅ Initial load
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const filters = parseFilters(params);

    const sortValue = params.get("sort_by") || "is_our_picks";

    setSelectedFilters(filters);
    setPage(1);
    setSort(sortValue);

    fetchAllProducts(1, filters, sortValue, false);
  }, [categoryId]);

  // ✅ Sync URL change
  useEffect(() => {
    if (!hasMounted.current) return;

    const params = new URLSearchParams(searchParams.toString());
    const filters = parseFilters(params);
    const sortValue = params.get("sort_by") || "is_our_picks";

    if (isSyncing.current) {
      isSyncing.current = false;
      return;
    }

    setSelectedFilters(filters);
    setPage(1);
    setSort(sortValue);
    fetchAllProducts(1, filters, sortValue, false);
  }, [searchParams]);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // ✅ Fetch category info
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        if (!categoryId) {
          setCategoryData(null);
          setChildCategories([]);
          return;
        }

        const { data } = await getCategory({
          method: "GET",
          url: `/users/get-category/${categoryId}`,
        });
        if (data?.status === 200) setCategoryData(data.data);

        const { data: childData } = await getChildCategories({
          method: "GET",
          url: `/users/get-child-categories?category_id=${categoryId}`,
        });
        if (childData?.status === 200 && Array.isArray(childData.data))
          setChildCategories(childData.data);
        else setChildCategories([]);
      } catch (err) {
        console.error("Failed to fetch category details:", err);
      }
    };
    fetchCategoryData();
  }, [categoryId]);

  // ✅ Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    fetchAllProducts(nextPage, selectedFilters, sort, true);
  }, [hasMore, loadingMore, loading, page, selectedFilters, sort]);

  // ✅ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // ✅ Handlers
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    setProducts([]);
    const query = buildQuery(selectedFilters, newSort);
    isSyncing.current = true;
    router.replace(`${pathname}?${query}`);
    fetchAllProducts(1, selectedFilters, newSort, false);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    params.set("sort_by", sort);
    isSyncing.current = true;
    router.replace(`${pathname}?${params.toString()}`);
    setSelectedFilters({});
    setPage(1);
    setProducts([]);
    fetchAllProducts(1, {}, sort, false);
  };

  // Count active filters
  const activeFiltersCount =
    (selectedFilters.brands?.length || 0) +
    (selectedFilters.colors?.length || 0) +
    (selectedFilters.sizes?.length || 0) +
    (selectedFilters.genders?.length || 0) +
    (selectedFilters.price ? 1 : 0);

  return (
    <div className="bg-gradient-to-b from-white via-amber-50/10 to-white min-h-screen pb-24 md:pb-8">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
        {/* Breadcrumb */}
        {/* <nav className="text-xs md:text-sm mb-4 md:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-amber-600 transition-colors">
                Home
              </Link>
            </li>
            <li><ChevronRight className="w-3 h-3 md:w-4 md:h-4" /></li>
            <li>
              <Link href="/shop" className="hover:text-amber-600 transition-colors">
                Shop
              </Link>
            </li>
            {categoryData?.name && (
              <>
                <li><ChevronRight className="w-3 h-3 md:w-4 md:h-4" /></li>
                <li className="text-gray-900 font-medium capitalize truncate max-w-[150px] md:max-w-none">
                  {categoryData.name}
                </li>
              </>
            )}
          </ol>
        </nav> */}

        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          {categoryData?.breadcrumbs && (
            <p className="text-xs md:text-sm text-gray-500 mb-2 capitalize">
              {categoryData.breadcrumbs.join(" / ")}
            </p>
          )}

          {/* <div className="mb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 capitalize tracking-tight">
              {categoryData?.name || categorySlug}
            </h1>

            {searchQuery && (
              <p className="mt-2 text-base md:text-lg text-gray-600">
                Results for <span className="font-semibold text-gray-900">"{searchQuery}"</span>
              </p>
            )}
          </div> */}
      {/* Category Filters + Actions Row */}
        {showCategoryFilters ? (
          <div className="mb-6 -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex-1 min-w-0 relative">
                {loadingChildren ? (
                  <div className="flex gap-2 md:gap-3 overflow-x-auto category-scroll">
                    <Skeleton className="h-10 w-32 flex-shrink-0 rounded-lg" />
                    <Skeleton className="h-10 w-32 flex-shrink-0 rounded-lg" />
                    <Skeleton className="h-10 w-32 flex-shrink-0 rounded-lg" />
                    <Skeleton className="h-10 w-32 flex-shrink-0 rounded-lg" />
                    <Skeleton className="h-10 w-32 flex-shrink-0 rounded-lg" />
                  </div>
                ) : (
                  childCategories.length > 0 && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() =>
                          categoryScrollRef.current?.scrollBy({
                            left: -320,
                            behavior: "smooth",
                          })
                        }
                        className="hidden md:flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-black hover:border-black shadow-sm transition-colors"
                        aria-label="Scroll categories left"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>
                      <div
                        ref={categoryScrollRef}
                        className="hidden md:block overflow-x-auto category-scroll flex-1"
                      >
                        <div className="flex gap-2 md:gap-3">
                          {childCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => router.push(`/shop/${cat.path}/${cat.id}`)}
                              className="flex-shrink-0 px-4 py-2.5 md:px-5 md:py-3 bg-white border-2 border-gray-200 hover:border-black hover:shadow-md transition-all duration-200 text-sm font-medium whitespace-nowrap"
                            >
                              {startCase(toLower(cat.name))}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          categoryScrollRef.current?.scrollBy({
                            left: 320,
                            behavior: "smooth",
                          })
                        }
                        className="hidden md:flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:text-black hover:border-black shadow-sm transition-colors"
                        aria-label="Scroll categories right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px] sm:w-48 border-2 border-gray-200 transition-colors">
                    <SelectValue placeholder="Our Picks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="is_our_picks">Our Picks</SelectItem>
                    <SelectItem value="is_newest">Newest Arrivals</SelectItem>
                    <SelectItem value="price_low_to_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_to_low">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px] sm:w-48 border-2 border-gray-200 transition-colors">
                  <SelectValue placeholder="Our Picks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is_our_picks">Our Picks</SelectItem>
                  <SelectItem value="is_newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_low_to_high">Price: Low to High</SelectItem>
                  <SelectItem value="price_high_to_low">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        </div>

  
        <style jsx>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .category-scroll::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          .category-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Mobile product count hidden as requested */}

        {/* Product Grid */}
        <section className="min-h-[60vh]">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-20 h-20 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 font-medium mb-2">No products found</p>
              <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search query</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-black text-white rounded-lg transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {loadingMore &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`loading-more-${i}`} className="space-y-3">
                      <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
              </div>

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="w-full py-8">
                {loadingMore && <div className="h-2" />}
                {!hasMore && products.length > 0 && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white">
                    
                      <p className="text-sm font-semibold text-gray-700">
                        You've reached the end
                      </p>
                     
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <SidebarFilters
        open={isSidebarOpen}
        initialFilters={selectedFilters}
        categories={categoryId ? childCategories : []}
        totalCount={totalProducts}
        onClose={() => setSidebarOpen(false)}
        onApply={(filters) => {
          const query = buildQuery(filters, sort);
          isSyncing.current = true;
          router.replace(`${pathname}?${query}`);
          setSelectedFilters(filters);
          setPage(1);
          setProducts([]);
          fetchAllProducts(1, filters, sort, false);
        }}
        onReset={handleResetFilters}
      />
    </div>
  );
}
