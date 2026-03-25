"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  readStoredConsent,
  writeStoredConsent,
  pushGtmConsentUpdate,
} from "@/utils/cookieConsent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  /** No non-essential cookies pre-ticked (GDPR-friendly defaults). */
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readStoredConsent();
    if (!existing) {
      setVisible(true);
      return;
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  const persistAndClose = useCallback((prefs) => {
    writeStoredConsent(prefs);
    pushGtmConsentUpdate(prefs);
    setVisible(false);
    setSettingsOpen(false);
  }, []);

  const acceptAll = () => {
    persistAndClose({ analytics: true, marketing: true });
  };

  const essentialOnly = () => {
    persistAndClose({ analytics: false, marketing: false });
  };

  const savePreferences = () => {
    persistAndClose({ analytics, marketing });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-lg border-2 border-black bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="p-5 md:p-6">
          <h2
            id="cookie-consent-title"
            className="text-base md:text-lg font-semibold text-black mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Cookies &amp; privacy
          </h2>
          <p
            id="cookie-consent-desc"
            className="text-sm text-gray-600 leading-relaxed mb-4"
          >
            We use cookies and similar technologies for essential site operation,
            analytics, and relevant marketing. You can accept all, use only
            essential cookies, or customise your choices. See our{" "}
            <Link
              href="/privacy-policy"
              className="underline text-black hover:no-underline font-medium"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>

          {settingsOpen && (
            <div className="mb-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-left">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span>
                  <span className="font-medium text-black text-sm">
                    Analytics
                  </span>
                  <span className="block text-xs text-gray-600 mt-0.5">
                    Helps us understand how the site is used (e.g. Google
                    Analytics via Tag Manager).
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span>
                  <span className="font-medium text-black text-sm">
                    Marketing
                  </span>
                  <span className="block text-xs text-gray-600 mt-0.5">
                    Used for personalised ads and measurement where applicable.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-black text-left sm:order-first"
            >
              {settingsOpen ? "Hide settings" : "Cookie settings"}
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={essentialOnly}
                className="min-h-[44px] px-5 py-2.5 text-sm font-semibold border-2 border-gray-300 text-gray-800 hover:border-black hover:text-black transition-colors rounded-sm"
              >
                Essential only
              </button>
              {settingsOpen ? (
                <button
                  type="button"
                  onClick={savePreferences}
                  className="min-h-[44px] px-5 py-2.5 text-sm font-semibold border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded-sm"
                >
                  Save preferences
                </button>
              ) : (
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-[44px] px-5 py-2.5 text-sm font-semibold bg-black text-white border-2 border-black hover:bg-gray-900 transition-colors rounded-sm"
                >
                  Accept all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
