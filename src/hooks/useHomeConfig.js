import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";

import {
  setHomeConfig,
  setBestSellers,
  setNewArrivals,
  setProductOverlayHome,
  setSaleSection,
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

    productOverlay: data.productOverlay ?? null,
    saleSection: data.saleSection ?? null,
    bottomBanner: data.bottomBanner ?? null,
  };
};

export default function useHomeConfig() {
  const dispatch = useDispatch();
  const { request } = useAxios();

  const config = useSelector((state) => state.homeConfig);
  const timestamps = config.timestamps;

  /* -----------------------------------
       Fetch Home Banners
  -------------------------------------- */
  const fetchHomeConfig = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps.homeConfig;

      if (!force && last && Date.now() - last < CACHE_TIME) {
        return { cached: true, data: config };
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
    [timestamps.homeConfig, request, config, dispatch]
  );

  /* -----------------------------------
       Best Sellers
  -------------------------------------- */
  const fetchBestSellers = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps.bestSellers;
      if (!force && last && Date.now() - last < CACHE_TIME)
        return { cached: true, data: config.bestSellers };

      const { data, error } = await request({
        url: "/users/get-active-best-sellers",
        method: "GET",
      });

      if (error) return { error };

      const payload = data?.data ?? data ?? [];
      const arr = Array.isArray(payload) ? payload : payload?.items ?? [];

      dispatch(setBestSellers(arr));
      return { data: arr };
    },
    [timestamps.bestSellers, request, config.bestSellers, dispatch]
  );

  /* -----------------------------------
       New Arrivals
  -------------------------------------- */
  const fetchNewArrivals = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps.newArrivals;

      if (!force && last && Date.now() - last < CACHE_TIME)
        return { cached: true, data: config.newArrivals };

      const { data, error } = await request({
        url: "/users/get-active-new-arrivals",
        method: "GET",
      });

      if (error) return { error };

      const payload =
        data?.data?.items ?? data?.items ?? data?.data ?? data ?? [];

      const arr = Array.isArray(payload) ? payload : payload?.items ?? [];

      dispatch(setNewArrivals(arr));
      return { data: arr };
    },
    [timestamps.newArrivals, request, config.newArrivals, dispatch]
  );

  /* -----------------------------------
       PRODUCT OVERLAY HOME GRID
  -------------------------------------- */
  const fetchProductOverlayHome = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps.productOverlayHome;

      if (!force && last && Date.now() - last < CACHE_TIME)
        return { cached: true, data: config.productOverlayHome };

      const { data, error } = await request({
        url: "/users/get-overlay-grid",
        method: "GET",
      });

      if (error) return { error };

      const payload = data?.data ?? data ?? [];

      dispatch(setProductOverlayHome(payload));
      return { data: payload };
    },
    [
      timestamps.productOverlayHome,
      request,
      config.productOverlayHome,
      dispatch,
    ]
  );

  /* -----------------------------------
       SALE SECTION (NEW)
  -------------------------------------- */
  /* ---------------- Fetch SALE SECTION ---------------- */
  const fetchSaleSection = useCallback(
    async ({ force = false } = {}) => {
      const last = timestamps.saleSection;

      // ⏳ If cached & not expired → use cache
      const shouldUseCache = !force && last && Date.now() - last < CACHE_TIME;

      if (shouldUseCache) {
        return { cached: true, data: config.saleSection };
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
    [timestamps.saleSection, request, config.saleSection, dispatch]
  );

  return {
    config,

    fetchHomeConfig,
    fetchBestSellers,
    fetchNewArrivals,
    fetchProductOverlayHome,
    fetchSaleSection,

    // Shortcuts
    topBanner: config.topBanner,
    middleBanner: config.middleBanner,
    bottomTopBanner: config.bottomTopBanner,
    bottomLeftBanner: config.bottomLeftBanner,

    bestSellers: config.bestSellers,
    newArrivals: config.newArrivals,
    productOverlayHome: config.productOverlayHome,
    saleSection: config.saleSection,
  };
}
