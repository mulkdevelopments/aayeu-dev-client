"use client";

import { useState, useEffect } from "react";
import { Globe, MapPin } from "lucide-react";
import useCurrency from "@/hooks/useCurrency";
import { CURRENCIES } from "@/store/slices/currencySlice";
import Link from "next/link";

const COUNTRY_INFO = {
  EUR: {
    name: "Europe",
    flag: "🇪🇺",
    description: "European Union"
  },
  AED: {
    name: "UAE",
    flag: "🇦🇪",
    description: "United Arab Emirates"
  },
  INR: {
    name: "India",
    flag: "🇮🇳",
    description: "Republic of India"
  },
  PKR: {
    name: "Pakistan",
    flag: "🇵🇰",
    description: "Islamic Republic of Pakistan"
  }
};

export default function CountrySelectionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { changeCurrency } = useCurrency();

  useEffect(() => {
    const hasSelectedCountry = localStorage.getItem("hasSelectedCountry");
    if (!hasSelectedCountry) {
      setIsOpen(true);
    }
  }, []);

  const handleCountrySelect = (currencyCode) => {
    setSelectedCountry(currencyCode);
    changeCurrency(currencyCode);
    localStorage.setItem("hasSelectedCountry", "true");

    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative bg-black p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white backdrop-blur-sm rounded-full p-4">
     <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="/assets/images/aayeu_logo.png"
              alt="Aayeu Logo"
              className="h-20 w-auto hover:opacity-80 transition-opacity duration-300"
            />
          </Link>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome to Aayeu
          </h2>
          <p className="text-white/90 text-sm">
            Select your country to continue
          </p>
        </div>

        {/* Country Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Object.values(CURRENCIES).map((currency) => {
              const country = COUNTRY_INFO[currency.code];
              const isSelected = selectedCountry === currency.code;

              return (
                <button
                  key={currency.code}
                  onClick={() => handleCountrySelect(currency.code)}
                  className={`
                    group relative overflow-hidden rounded-xl border-2 p-4 sm:p-6
                    transition-all duration-300 hover:scale-105
                    ${isSelected
                      ? 'border-[#D4AF37] bg-gradient-to-br from-[#E6C15A]/10 to-[#B8962E]/10'
                      : 'border-gray-200 hover:border-[#D4AF37] bg-white'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-[#E6C15A] via-[#D4AF37] to-[#B8962E] rounded-full p-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}

                  {/* Flag */}
                  <div className="text-4xl sm:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">
                    {country.flag}
                  </div>

                  {/* Country name */}
                  <h3 className="text-base sm:text-lg font-bold text-black mb-1">
                    {country.name}
                  </h3>

                  {/* Hover effect gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E6C15A]/0 via-[#D4AF37]/0 to-[#B8962E]/0 group-hover:from-[#E6C15A]/5 group-hover:via-[#D4AF37]/5 group-hover:to-[#B8962E]/5 transition-all duration-300 pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            You can change this later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
