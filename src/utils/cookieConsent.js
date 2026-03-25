/**
 * GDPR / ePrivacy cookie consent + Google Consent Mode v2 bridge for GTM.
 */

export const COOKIE_CONSENT_STORAGE_KEY = "aayeu_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;

/**
 * @typedef {{ v: number, analytics: boolean, marketing: boolean, updatedAt: string }} StoredConsent
 */

/** @returns {StoredConsent | null} */
export function readStoredConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (j.v !== COOKIE_CONSENT_VERSION) return null;
    if (typeof j.analytics !== "boolean" || typeof j.marketing !== "boolean")
      return null;
    return j;
  } catch {
    return null;
  }
}

/** @param {Pick<StoredConsent, "analytics" | "marketing">} prefs */
export function writeStoredConsent(prefs) {
  if (typeof window === "undefined") return;
  const payload = {
    v: COOKIE_CONSENT_VERSION,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

/** @param {Pick<StoredConsent, "analytics" | "marketing">} prefs */
export function pushGtmConsentUpdate(prefs) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  window.gtag("consent", "update", {
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_storage: prefs.marketing ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
  });
}

/**
 * Inline script: default Consent Mode (denied) before GTM loads.
 * Must run first on every page view.
 */
export function getConsentDefaultScript() {
  return `(function(){window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:2000});})();`;
}

/**
 * Inline script: restore prior choice from localStorage before GTM loads.
 */
export function getConsentRestoreScript() {
  const k = COOKIE_CONSENT_STORAGE_KEY;
  const v = COOKIE_CONSENT_VERSION;
  return `(function(){try{var raw=localStorage.getItem("${k}");if(!raw)return;var j=JSON.parse(raw);if(j.v!==${v})return;window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=="function"){window.gtag=function(){window.dataLayer.push(arguments);};}var a=j.analytics===true,m=j.marketing===true;window.gtag("consent","update",{analytics_storage:a?"granted":"denied",ad_storage:m?"granted":"denied",ad_user_data:m?"granted":"denied",ad_personalization:m?"granted":"denied"});}catch(e){}})();`;
}
