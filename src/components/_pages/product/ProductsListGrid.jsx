"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/_cards/ProductCard";
import CTAButton from "@/components/_common/CTAButton";
import useAxios from "@/hooks/useAxios";
import SidebarFilters from "@/components/_pages/product/SidebarFilters";
import PaginationFooter from "@/components/_common/PaginationFooter";
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
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("is_our_picks");

  const isSyncing = useRef(false);
  const hasMounted = useRef(false);

  const { request: getAllProducts } = useAxios();
  const { request: getCategory } = useAxios();
  const { request: getChildCategories, loading: loadingChildren } = useAxios();

  // ✅ Build query string for URL
  const buildQuery = (filters, newPage = page, newSort = sort) => {
    const params = new URLSearchParams();

    // 🔥 Carry forward search term in URL always
    if (isSearchMode && searchQuery) {
      params.set("q", searchQuery);
    }

    if (filters.brands?.length)
      filters.brands.forEach((b) => b?.trim() && params.append("brand", b));
    if (filters.colors?.length)
      filters.colors.forEach((c) => c?.trim() && params.append("color", c));
    if (filters.sizes?.length)
      filters.sizes.forEach((s) => s?.trim() && params.append("size", s));

    if (
      filters.price &&
      (filters.price.min !== 0 || filters.price.max !== 100000)
    ) {
      params.set("min_price", filters.price.min.toString());
      params.set("max_price", filters.price.max.toString());
    }

    params.set("page", newPage.toString());
    params.set("sort_by", newSort);
    return params.toString();
  };

  // ✅ Fetch products
  const fetchAllProducts = async (
    pageNumber = 1,
    filters = selectedFilters,
    sortValue = sort
  ) => {
    try {
      setLoading(true);
      let url = `/users/get-products-from-our-categories?limit=20&page=${pageNumber}`;

      // 🔥 Include search query in API
      if (isSearchMode) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      } else if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      if (sortValue) url += `&sort_by=${sortValue}`;

      const params = new URLSearchParams();
      if (filters.brands?.length)
        filters.brands.forEach((b) => params.append("brand", b));
      if (filters.colors?.length)
        filters.colors.forEach((c) => params.append("color", c));
      if (filters.sizes?.length)
        filters.sizes.forEach((s) => params.append("size", s));

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

        // 🔹 Optional frontend fallback sort
        if (!data.data.sorted) {
          if (sortValue === "price_low_to_high")
            prods = [...prods].sort((a, b) => a.price - b.price);
          else if (sortValue === "price_high_to_low")
            prods = [...prods].sort((a, b) => b.price - a.price);
          else if (sortValue === "is_newest")
            prods = [...prods].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        setProducts(prods);
        setTotalProducts(data.data.total || data.data.products.length);
        setTotalPages(data.data.total_pages || 1);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Parse filters from URL
  const parseFilters = (urlParams) => {
    const filters = {
      brands: urlParams.getAll("brand"),
      colors: urlParams.getAll("color"),
      sizes: urlParams.getAll("size"),
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

  // ✅ Initial load (retain page + sort)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const filters = parseFilters(params);

    const currentPage = Number(params.get("page")) || 1;
    const sortValue = params.get("sort_by") || "is_our_picks";

    setSelectedFilters(filters);
    setPage(currentPage);
    setSort(sortValue);

    fetchAllProducts(currentPage, filters, sortValue);
  }, [categoryId]);

  // ✅ Sync URL change (back/forward)
  useEffect(() => {
    if (!hasMounted.current) return;

    const params = new URLSearchParams(searchParams.toString());
    const filters = parseFilters(params);
    const currentPage = Number(params.get("page")) || 1;
    const sortValue = params.get("sort_by") || "is_our_picks";

    if (isSyncing.current) {
      isSyncing.current = false;
      return;
    }

    setSelectedFilters(filters);
    setPage(currentPage);
    setSort(sortValue);
    fetchAllProducts(currentPage, filters, sortValue);
  }, [searchParams]);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // ✅ Fetch category info
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;
      try {
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

  // ✅ Handlers
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    const query = buildQuery(selectedFilters, newPage, sort);
    isSyncing.current = true;
    router.replace(`${pathname}?${query}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchAllProducts(newPage, selectedFilters, sort);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const query = buildQuery(selectedFilters, 1, newSort);
    isSyncing.current = true;
    router.replace(`${pathname}?${query}`);
    fetchAllProducts(1, selectedFilters, newSort);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sort_by", sort);
    isSyncing.current = true;
    router.replace(`${pathname}?${params.toString()}`);
    setSelectedFilters({});
    fetchAllProducts(1, {}, sort);
  };

  // ✅ Auto scroll top when loading finishes
  useEffect(() => {
    if (!loading) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loading]);

  return (
    <div className="container mx-auto px-4 mt-6 font-[poppins]">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex space-x-2 text-gray-600">
          <li>
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
          </li>
          {categoryData?.name && (
            <>
              <li>{">"}</li>
              <li className="text-black font-medium capitalize">
                {categoryData.name}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Title & Sort */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-1">
          <p className="text-sm text-muted-foreground capitalize">
            {categoryData?.breadcrumbs?.join(" / ")}
          </p>

          <h1 className="text-3xl font-bold capitalize mt-1 tracking-tight">
            {categoryData?.name || categorySlug}
          </h1>

          {searchQuery && (
            <p className="mt-2 text-2xl text-gray-600">
              Showing results for{" "}
              <span className="font-bold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Our Picks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="is_our_picks">Our Picks</SelectItem>
              <SelectItem value="is_newest">Newest</SelectItem>
              <SelectItem value="price_low_to_high">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price_high_to_low">
                Price: High to Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters & Category Buttons */}
      <div className="mb-6 flex items-center flex-wrap gap-3">
        <CTAButton
          variant="outline"
          color="neutral"
          onClick={() => setSidebarOpen(true)}
        >
          Filters
        </CTAButton>

        {showCategoryFilters &&
          (loadingChildren ? (
            <>
              <Skeleton className="h-8 w-32 ml-3" />
              <Skeleton className="h-8 w-32 ml-3" />
            </>
          ) : (
            childCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-3">
                {childCategories.map((cat) => (
                  <CTAButton
                    key={cat.id}
                    variant="outline"
                    onClick={() => router.push(`/shop/${cat.path}/${cat.id}`)}
                  >
                    {startCase(toLower(cat.name))}
                  </CTAButton>
                ))}
              </div>
            )
          ))}

        {totalProducts > 0 && (
          <span className="ml-auto text-sm text-gray-600">
            Showing <b>{products.length}</b> of <b>{totalProducts}</b> products
          </span>
        )}
      </div>

      {/* Product Grid */}
      <section className="py-6 min-h-[50vh]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-6 w-6 mr-2 text-gray-500" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

      {/* Sidebar Filters */}
      <SidebarFilters
        open={isSidebarOpen}
        initialFilters={selectedFilters}
        onClose={() => setSidebarOpen(false)}
        onApply={(filters) => {
          const currentPage = Number(searchParams.get("page")) || page || 1;
          const query = buildQuery(filters, currentPage, sort);
          isSyncing.current = true;
          router.replace(`${pathname}?${query}`);
          fetchAllProducts(currentPage, filters, sort);
        }}
        onReset={handleResetFilters}
      />
    </div>
  );
}
