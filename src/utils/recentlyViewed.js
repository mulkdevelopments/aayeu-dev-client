import { slugifyProductName } from "@/utils/seoHelpers";

const STORAGE_KEY = "aayeu_recently_viewed_v1";
const MAX_ITEMS = 16;
const EVENT_NAME = "aayeu-recently-viewed";

export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * @param {object} product - Full product from get-product-by-id (or compatible)
 */
export function addRecentlyViewed(product) {
  if (typeof window === "undefined" || !product?.id) return;

  const v0 = product.variants?.[0];
  const price = product.min_price ?? v0?.price ?? null;
  const mrp = v0?.mrp ?? null;
  const cat = product.mapped_categories?.[0];
  const img =
    product.product_img ||
    (Array.isArray(v0?.images) && v0.images[0]) ||
    null;

  const entry = {
    id: product.id,
    name: product.name || product.title || "Product",
    brand_name: product.brand_name ?? "",
    product_img: img,
    min_price: price,
    mrp,
    catSlug: cat?.slug || null,
    viewedAt: Date.now(),
  };

  let list = getRecentlyViewed().filter((x) => x.id !== entry.id);
  list.unshift(entry);
  list = list.slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getRecentlyViewedProductHref(entry) {
  if (!entry?.id || !entry.name) return "/shop";
  const slug = slugifyProductName(entry.name);
  return entry.catSlug
    ? `/shop/product/${slug}/${entry.id}?cat=${encodeURIComponent(entry.catSlug)}`
    : `/shop/product/${slug}/${entry.id}`;
}

export function entryToProductCardShape(entry) {
  if (!entry?.id) return null;
  const images = entry.product_img ? [entry.product_img] : [];
  return {
    id: entry.id,
    name: entry.name,
    brand_name: entry.brand_name,
    product_img: entry.product_img,
    min_price: entry.min_price,
    variants: [
      {
        price: entry.min_price,
        mrp: entry.mrp,
        images,
      },
    ],
    mapped_categories: entry.catSlug ? [{ slug: entry.catSlug }] : [],
  };
}

export { EVENT_NAME as RECENTLY_VIEWED_EVENT };
