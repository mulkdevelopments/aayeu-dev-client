import { useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";

import {
  setHomeConfig,
  setBestSellers,
  appendBestSellers,
  setNewArrivals,
  appendNewArrivals,
  setProductOverlayHome,
  setSaleSection,
  setBrandSpotlights,
} from "@/store/slices/homeConfigSlice";

const CACHE_TIME = 1000 * 60 * 10; // 10 minutes

// Normalize KEYS from API
const normalizeHomeBanners = (data) => {
  if (!data) return {};

  return {
    topBanner: data["top-banner"] ?? null,
    middleBanner: data["middle-banner"] ?? null,
    bottomTopBanner: data["bottom-top-banner"] ?? null,
    bottomLeftBanner: data["bottom-left-banner"] ?? null,
    bottomRightBanner: data["bottom-right-banner"] ?? null,

    productOverlay: data.productOverlay ?? null,
    saleSection: data.saleSection ?? null,
    bottomBanner: data.bottomBanner ?? null,
  };
};

export default function useHomeConfig() {
  const dispatch = useDispatch();
  const { request } = useAxios();

  const config = useSelector((state) => state.homeConfig);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /* -----------------------------------
       Fetch Home Banners
  -------------------------------------- */
  const fetchHomeConfig = useCallback(
    async ({ force = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.homeConfig;

      if (!force && last && Date.now() - last < CACHE_TIME) {
        return { cached: true, data: cfg };
      }

      const { data, error } = await request({
        url: "/users/get-home-banners",
        method: "GET",
      });

      if (error) return { error };

      const normalized = normalizeHomeBanners(data?.data);

      dispatch(setHomeConfig(normalized));
      return { data: normalized };
    },
    [request, dispatch]
  );

  /* -----------------------------------
       Best Sellers (paginated: initial 4, fetch next when needed)
  -------------------------------------- */
  const fetchBestSellers = useCallback(
    async ({ force = false, limit = 4, page = 1, append = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.bestSellers;
      // Do not require len >= limit: partial API responses must still cache or we refetch forever.
      const useCache =
        !force &&
        !append &&
        page === 1 &&
        last &&
        Date.now() - last < CACHE_TIME;

      if (useCache) return { cached: true, data: cfg.bestSellers };

      const { data, error } = await request({
        url: "/users/get-active-best-sellers",
        method: "GET",
        params: { limit, page },
      });

      if (error) return { error };

      const payload = data?.data ?? data ?? [];
      const arr = Array.isArray(payload) ? payload : payload?.items ?? [];

      if (append) {
        dispatch(appendBestSellers(arr));
      } else {
        dispatch(setBestSellers(arr));
      }
      return { data: arr };
    },
    [request, dispatch]
  );

  /* -----------------------------------
       New Arrivals (paginated: initial 4, fetch next when needed)
  -------------------------------------- */
  const fetchNewArrivals = useCallback(
    async ({ force = false, limit = 4, page = 1, append = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.newArrivals;
      const useCache = !force && !append && page === 1 && last && Date.now() - last < CACHE_TIME;

      if (useCache) return { cached: true, data: cfg.newArrivals };

      const { data, error } = await request({
        url: "/users/get-active-new-arrivals",
        method: "GET",
        params: { limit, page },
      });

      if (error) return { error };

      const payload =
        data?.data?.items ?? data?.items ?? data?.data ?? data ?? [];
      const arr = Array.isArray(payload) ? payload : payload?.items ?? [];

      if (append) {
        dispatch(appendNewArrivals(arr));
      } else {
        dispatch(setNewArrivals(arr));
      }
      return { data: arr };
    },
    [request, dispatch]
  );

  /* -----------------------------------
       PRODUCT OVERLAY HOME GRID
  -------------------------------------- */
  const fetchProductOverlayHome = useCallback(
    async ({ force = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.productOverlayHome;

      if (!force && last && Date.now() - last < CACHE_TIME)
        return { cached: true, data: cfg.productOverlayHome };

      const { data, error } = await request({
        url: "/users/get-overlay-grid",
        method: "GET",
      });

      if (error) return { error };

      const payload = data?.data ?? data ?? [];

      dispatch(setProductOverlayHome(payload));
      return { data: payload };
    },
    [request, dispatch]
  );

  /* -----------------------------------
       SALE SECTION (NEW)
  -------------------------------------- */
  /* ---------------- Fetch SALE SECTION ---------------- */
  const fetchSaleSection = useCallback(
    async ({ force = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.saleSection;

      // ⏳ If cached & not expired → use cache
      const shouldUseCache = !force && last && Date.now() - last < CACHE_TIME;

      if (shouldUseCache) {
        return { cached: true, data: cfg.saleSection };
      }

      // ⏳ Make API call
      const { data, error } = await request({
        url: "/users/get-sales-by-category",
        method: "GET",
      });

      if (error) return { error };

      // ✔ Correct response extraction based on your API
      const payload = data?.data?.items ?? [];

      // ✔ Update Redux
      dispatch(setSaleSection(payload));

      return { data: payload };
    },
    [request, dispatch]
  );

  /* -----------------------------------
       BRAND SPOTLIGHTS
  -------------------------------------- */
  const fetchBrandSpotlights = useCallback(
    async ({ force = false } = {}) => {
      const cfg = configRef.current;
      const last = cfg.timestamps.brandSpotlights;

      if (!force && last && Date.now() - last < CACHE_TIME)
        return { cached: true, data: cfg.brandSpotlights };

      const { data, error } = await request({
        url: "/users/get-active-brand-spotlights",
        method: "GET",
      });

      if (error) return { error };

      const payload = data?.data?.items ?? data?.items ?? data?.data ?? [];
      const arr = Array.isArray(payload) ? payload : [];

      dispatch(setBrandSpotlights(arr));
      return { data: arr };
    },
    [request, dispatch]
  );

  return {
    config,

    fetchHomeConfig,
    fetchBestSellers,
    fetchNewArrivals,
    fetchProductOverlayHome,
    fetchSaleSection,
    fetchBrandSpotlights,

    // Shortcuts
    topBanner: config.topBanner,
    middleBanner: config.middleBanner,
    bottomTopBanner: config.bottomTopBanner,
    bottomLeftBanner: config.bottomLeftBanner,
    bottomRightBanner: config.bottomRightBanner,

    bestSellers: config.bestSellers,
    newArrivals: config.newArrivals,
    productOverlayHome: config.productOverlayHome,
    saleSection: config.saleSection,
    brandSpotlights: config.brandSpotlights,
  };
}