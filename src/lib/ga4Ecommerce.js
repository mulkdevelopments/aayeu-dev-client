import { readStoredConsent } from "@/utils/cookieConsent";

function analyticsConsentGranted() {
  if (typeof window === "undefined") return false;
  return readStoredConsent()?.analytics === true;
}

function ensureDataLayer() {
  if (typeof window === "undefined") return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * GA4 + GTM: clear prior ecommerce object, then push event (recommended pattern).
 */
export function pushGa4EcommerceEvent(eventName, ecommerce) {
  if (!analyticsConsentGranted()) return;
  const dl = ensureDataLayer();
  if (!dl) return;
  dl.push({ ecommerce: null });
  dl.push({ event: eventName, ecommerce });
}

function normalizeCurrency(code) {
  if (!code || typeof code !== "string") return "AED";
  return code.trim().toUpperCase();
}

function variantLabel(variant) {
  if (!variant) return undefined;
  const parts = [
    variant.variant_color || variant.attributes?.color,
    variant.variant_size || variant.attributes?.size,
  ].filter(Boolean);
  const s = parts.join(" / ");
  return s || undefined;
}

export function productVariantToGa4Item(product, variant, qty = 1) {
  const unit =
    variant?.sale_price != null && variant.sale_price !== ""
      ? Number(variant.sale_price)
      : Number(variant?.price ?? 0);
  return {
    item_id: String(
      variant?.sku || variant?.id || variant?.variant_id || product?.id || ""
    ),
    item_name: product?.name || "",
    item_brand: product?.brand_name || product?.brand || undefined,
    item_variant: variantLabel(variant),
    price: Number.isFinite(unit) ? unit : 0,
    quantity: Math.max(1, Number(qty) || 1),
  };
}

/**
 * @param {object} payload — from verify-payment: transaction_id, value, currency, items
 */
export function pushGa4Purchase(payload) {
  if (!payload || payload.transaction_id == null || payload.transaction_id === "")
    return;
  if (!analyticsConsentGranted()) return;
  const items = Array.isArray(payload.items) ? payload.items : [];
  const ecommerce = {
    transaction_id: String(payload.transaction_id),
    value: Number(payload.value) || 0,
    currency: normalizeCurrency(payload.currency),
    items,
  };
  pushGa4EcommerceEvent("purchase", ecommerce);
}

export function pushGa4AddToCart({ product, variant, qty = 1, currency }) {
  if (!product || !variant) return;
  const item = productVariantToGa4Item(product, variant, qty);
  const value = (Number(item.price) || 0) * (Number(item.quantity) || 1);
  pushGa4EcommerceEvent("add_to_cart", {
    currency: normalizeCurrency(currency),
    value,
    items: [item],
  });
}

export function pushGa4ViewItem({ product, variant, currency }) {
  if (!product) return;
  const v = variant || product.variants?.[0];
  if (!v) return;
  const item = productVariantToGa4Item(product, v, 1);
  pushGa4EcommerceEvent("view_item", {
    currency: normalizeCurrency(currency),
    value: Number(item.price) || 0,
    items: [item],
  });
}
