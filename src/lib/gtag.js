import { GA_TRACKING_ID } from "@/utils/constants";

export const pageview = (url) => {
  if (typeof window === "undefined") return;
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};
