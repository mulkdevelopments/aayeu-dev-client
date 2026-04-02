/**
 * Tapfiliate (affiliate tracking).
 * Override with NEXT_PUBLIC_TAPFILIATE_ACCOUNT_ID in env when needed.
 */
export const TAPFILIATE_ACCOUNT_ID =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_TAPFILIATE_ACCOUNT_ID
    ? process.env.NEXT_PUBLIC_TAPFILIATE_ACCOUNT_ID
    : "63330-3930c6";

/** Ensures the `tap` queue exists (same stub as Tapfiliate’s snippet). */
export function ensureTapfiliateQueue() {
  if (typeof window === "undefined") return;
  if (typeof window.tap === "function") return;
  (function (t, a, p) {
    t.TapfiliateObject = a;
    t[a] =
      t[a] ||
      function () {
        (t[a].q = t[a].q || []).push(arguments);
      };
  })(window, "tap");
}

const tapfiliateConversionsSent = new Set();

/**
 * Fire a conversion after a verified sale. Site layout should already run tap('create') + tap('detect').
 * @param {string} conversionId — stable id for deduplication (e.g. order_no / transaction_id)
 * @param {number} [amount] — order total for percentage commissions (omit if unknown)
 */
export function fireTapfiliateConversion(conversionId, amount) {
  if (typeof window === "undefined" || conversionId == null || conversionId === "")
    return;
  const key = String(conversionId);
  if (tapfiliateConversionsSent.has(key)) return;
  tapfiliateConversionsSent.add(key);

  ensureTapfiliateQueue();
  const tap = window.tap;
  if (typeof tap !== "function") return;
  const n = Number(amount);
  if (Number.isFinite(n) && n > 0) {
    tap("conversion", key, n);
  } else {
    tap("conversion", key);
  }
}
