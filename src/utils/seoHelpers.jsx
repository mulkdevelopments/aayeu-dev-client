import toLower from "lodash/toLower";
import deburr from "lodash/deburr";
import kebabCase from "lodash/kebabCase";
import { get } from "lodash";

/**
 * Converts a product name into an SEO-friendly slug.
 * Example: "Wool, silk and cashmere sweater" -> "wool-silk-and-cashmere-sweater"
 */
export function slugifyProductName(name = "") {
  return kebabCase(toLower(deburr(name))); // removes accents, converts to kebab case
}

// Builds a nested SEO-friendly category URL like /shop/man/accessories/jewellery/scarves/<id>
export const buildCategoryHref = (item, parent = null) => {
  if (!item) return "/shop";

  // Start with the current category slug
  const slug = kebabCase(get(item, "name", ""));
  const id = get(item, "id", "");

  // Walk up the parent chain if available
  let pathSegments = [slug];
  let currentParent = parent;

  while (currentParent) {
    const parentSlug = kebabCase(get(currentParent, "name", ""));
    if (parentSlug) pathSegments.unshift(parentSlug);
    currentParent = get(currentParent, "parent", null);
  }

  // Final URL
  const fullPath = pathSegments.join("/");
  return id ? `/shop/${fullPath}/${id}` : `/shop/${fullPath}`;
};

/**
 * Generates an SEO-friendly product URL.
 * Example: /shop/product/wool-silk-and-cashmere-sweater/123?cat=shirts
 */
export function createProductUrl(product, extraParams = {}) {
  const slug = slugifyProductName(product.name);
  let url = `/shop/product/${slug}/${product.id}`;

  const queryParams = new URLSearchParams(extraParams).toString();
  if (queryParams) url += `?${queryParams}`;

  return url;
}
