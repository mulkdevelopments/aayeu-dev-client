"use client";

import { useState, useEffect, useMemo } from "react";
import useCurrency from "@/hooks/useCurrency";
import { CURRENCIES, REGIONS } from "@/store/slices/currencySlice";
import Link from "next/link";

const REGION_INFO = {
  GCC: {
    name: "GCC",
    description: "Gulf Cooperation Council",
  },
  Asia: {
    name: "Asia",
    description: "India, Pakistan & more",
  },
};

export default function CountrySelectionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [search, setSearch] = useState("");
  const { changeCurrency } = useCurrency();

  useEffect(() => {
    const hasSelectedCountry = localStorage.getItem("hasSelectedCountry");
    if (!hasSelectedCountry) {
      setIsOpen(true);
    }
  }, []);

  const handleRegionSelect = (regionKey) => {
    setSelectedRegion(regionKey);
    setSearch("");
  };

  const handleCountrySelect = (currencyCode) => {
    setSelectedCountry(currencyCode);
    changeCurrency(currencyCode);
    localStorage.setItem("hasSelectedCountry", "true");
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleBack = () => {
    setSelectedRegion(null);
    setSearch("");
  };

  const filteredCountries = useMemo(() => {
    if (!selectedRegion) return [];
    const list = REGIONS[selectedRegion];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      ({ country, code }) =>
        country.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        (CURRENCIES[code]?.name || "").toLowerCase().includes(q)
    );
  }, [selectedRegion, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header — black bar */}
        <div className="bg-black px-6 py-5 text-center">
          <Link href="/" className="inline-block mb-3">
            <img
              src="/assets/images/aayeu-f-white.png"
              alt="Aayeu"
              className="h-16 w-auto opacity-95"
            />
          </Link>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Welcome to Aayeu
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {selectedRegion
              ? "Select your country & currency"
              : "Select your region to continue"}
          </p>
        </div>

        <div className="p-6">
          {!selectedRegion ? (
            /* Step 1: Region — two text-only cards, black & white */
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(REGION_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => handleRegionSelect(key)}
                  className="border border-black rounded-sm py-6 px-4 text-center transition-colors hover:bg-black hover:text-white"
                >
                  <span className="block text-lg font-medium tracking-tight">
                    {info.name}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1 hover:text-white/80">
                    {info.description}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Step 2: Country list — search + rows, no icons */
            <>
              <button
                onClick={handleBack}
                className="text-xs text-gray-500 hover:text-black mb-4 uppercase tracking-wider"
              >
                ← Change region
              </button>

              <div className="border-b border-gray-200 mb-4">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 text-sm text-black placeholder:text-gray-400 bg-transparent outline-none"
                />
              </div>

              <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                {filteredCountries.map(({ code, country }) => {
                  const currency = CURRENCIES[code];
                  const isSelected = selectedCountry === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleCountrySelect(code)}
                      className={`w-full flex items-center justify-between py-3.5 px-0 text-left transition-colors ${
                        isSelected
                          ? "bg-black text-white"
                          : "hover:bg-gray-50 text-black"
                      }`}
                    >
                      <div>
                        <span className="block text-sm font-medium">
                          {country}
                        </span>
                        <span
                          className={`block text-xs mt-0.5 ${
                            isSelected ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {currency?.name} {code}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-sm font-medium">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {filteredCountries.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No matches
                </p>
              )}
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            You can change this later in the header
          </p>
        </div>
      </div>
    </div>
  );
}
