"use client";

import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import {
  selectSelectedCurrency,
  selectSelectedLanguage,
  setPreferences,
  ALL_COUNTRIES,
  COUNTRY_LANGUAGES,
  CURRENCIES,
} from "@/store/slices/currencySlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getCountryByCode(code) {
  const found = ALL_COUNTRIES.find((c) => c.code === code);
  return found ? found.country : code;
}

function getLanguageLabel(currencyCode, langCode) {
  const list = COUNTRY_LANGUAGES[currencyCode] || COUNTRY_LANGUAGES.AED;
  const item = list.find((l) => l.code === langCode);
  return item ? item.label : "English";
}

export default function PreferencesSelector({ isMobileSidebar = false }) {
  const dispatch = useDispatch();
  const selectedCurrency = useSelector(selectSelectedCurrency) || "AED";
  const selectedLanguage = useSelector(selectSelectedLanguage) || "en";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("main"); // "main" | "country"
  const [tempCountry, setTempCountry] = useState(selectedCurrency);
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);
  const [countrySearch, setCountrySearch] = useState("");

  const countryName = getCountryByCode(tempCountry);
  const languageLabel = getLanguageLabel(tempCountry, tempLanguage);
  const languages = COUNTRY_LANGUAGES[tempCountry] || COUNTRY_LANGUAGES.AED;

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        (CURRENCIES[c.code]?.name || "").toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const openModal = () => {
    setTempCountry(selectedCurrency);
    setTempLanguage(selectedLanguage);
    setStep("main");
    setCountrySearch("");
    setOpen(true);
  };

  const handleSave = () => {
    dispatch(setPreferences({ currency: tempCountry, language: tempLanguage }));
    setOpen(false);
  };

  const handleCountrySelect = (code) => {
    setTempCountry(code);
    const langs = COUNTRY_LANGUAGES[code] || COUNTRY_LANGUAGES.AED;
    const firstCode = langs[0]?.code || "en";
    if (!langs.some((l) => l.code === tempLanguage)) {
      setTempLanguage(firstCode);
    }
    setStep("main");
  };

  const modalProps = {
    open,
    onOpenChange: setOpen,
    step,
    setStep,
    tempCountry,
    tempLanguage,
    setTempLanguage,
    countrySearch,
    setCountrySearch,
    filteredCountries,
    countryName,
    languageLabel,
    languages,
    onCountrySelect: handleCountrySelect,
    onSave: handleSave,
  };

  if (isMobileSidebar) {
    return (
      <div className="space-y-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
          Delivery &amp; Language
        </div>
        <button
          type="button"
          onClick={openModal}
          className="w-full flex items-center justify-between py-3 px-3 border border-black rounded-sm text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-black">
            {getCountryByCode(selectedCurrency)} | {getLanguageLabel(selectedCurrency, selectedLanguage)}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
        <PreferencesModal {...modalProps} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-black rounded-sm text-sm font-medium text-black hover:bg-gray-50 transition-colors min-w-[140px]"
        aria-label="Select country and language"
      >
        <span className="truncate">
          {getCountryByCode(selectedCurrency)} | {getLanguageLabel(selectedCurrency, selectedLanguage)}
        </span>
        <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-500" />
      </button>
      <PreferencesModal {...modalProps} />
    </>
  );
}

function PreferencesModal({
  open,
  onOpenChange,
  step,
  setStep,
  tempCountry,
  tempLanguage,
  setTempLanguage,
  countrySearch,
  setCountrySearch,
  filteredCountries,
  countryName,
  languageLabel,
  languages,
  onCountrySelect,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {step === "country" ? (
                <button
                  type="button"
                  onClick={() => setStep("main")}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-black"
                >
                  <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                  DELIVERY DESTINATION
                </button>
              ) : (
                <DialogTitle className="text-lg font-semibold tracking-tight text-gray-900">
                  YOUR PREFERENCES
                </DialogTitle>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-black flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {step === "main" && (
            <p className="text-sm text-gray-500 mt-1">
              For your personalized shopping experience, please select your delivery destination and language preferences.
            </p>
          )}
        </DialogHeader>

        <div className="px-6 py-5">
          {step === "country" ? (
            <>
              <div className="relative border-b border-gray-200 mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 bg-transparent outline-none border-0"
                  autoFocus
                />
              </div>
              <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100">
                {filteredCountries.map(({ code, country }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onCountrySelect(code)}
                    className="w-full flex items-center justify-between py-3.5 px-0 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-black">{country}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No matches</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                    DELIVERY DESTINATION
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("country")}
                    className="w-full flex items-center justify-between py-3 px-0 border-b border-gray-200 text-left hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm font-medium text-black">{countryName}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    * Please note: your delivery location may affect the availability, price, and shipping options of the items in your cart.
                  </p>
                </div>

                {/* Language section — commented out for now
                <div>
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                    LANGUAGE
                  </p>
                  <div className="space-y-0 divide-y divide-gray-100 rounded-sm overflow-hidden border border-gray-200">
                    {languages.map(({ code, label }) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setTempLanguage(code)}
                        className={`w-full flex items-center justify-between py-3 px-3 text-left transition-colors ${
                          tempLanguage === code ? "bg-black text-white" : "hover:bg-gray-50 text-black"
                        }`}
                      >
                        <span className="text-sm font-medium">{label}</span>
                        {tempLanguage === code && (
                          <span className="text-sm font-medium">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                */}
              </div>

              <button
                type="button"
                onClick={onSave}
                className="w-full mt-6 py-3.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                SAVE CHANGES
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
