/**
 * SPA navigations: push to dataLayer for GTM.
 * In GTM, add a trigger on custom event "virtual_page_view" and forward to GA4 if needed.
 */
export const pageview = (url) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "virtual_page_view",
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
};
