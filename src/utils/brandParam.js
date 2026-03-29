/**
 * Match shop / header brand filter query normalization.
 */
export function normalizeBrandParam(value = "") {
  if (value === undefined || value === null) return "";
  const superscripts = "¹²³⁴⁵⁶⁷⁸⁹⁰";
  const digits = "1234567890";
  const replaced = String(value)
    .split("")
    .map((ch) => {
      const idx = superscripts.indexOf(ch);
      return idx === -1 ? ch : digits[idx];
    })
    .join("");

  return replaced
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function shopBrandListingHref(brandName) {
  const q = normalizeBrandParam(brandName);
  if (!q) return "/shop";
  return `/shop?brand=${encodeURIComponent(q)}`;
}
