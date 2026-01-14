"use client";

import useCurrency from "@/hooks/useCurrency";
import { CURRENCIES } from "@/store/slices/currencySlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COUNTRY_FLAGS = {
  EUR: "https://flagcdn.com/w40/eu.png",
  AED: "https://flagcdn.com/w40/ae.png",
  INR: "https://flagcdn.com/w40/in.png",
  PKR: "https://flagcdn.com/w40/pk.png",
};

const COUNTRY_NAMES = {
  EUR: "Europe",
  AED: "UAE",
  INR: "India",
  PKR: "Pakistan",
};

export default function CurrencySelector({ isMobileSidebar = false }) {
  const { selectedCurrency, currencyInfo, changeCurrency } = useCurrency();

  // Mobile Sidebar Version - Direct list of options
  if (isMobileSidebar) {
    return (
      <div className="space-y-2">
        {Object.values(CURRENCIES).map((currency) => (
          <button
            key={currency.code}
            onClick={() => changeCurrency(currency.code)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              selectedCurrency === currency.code
                ? "bg-black text-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden ${
                selectedCurrency === currency.code ? "border-white bg-white/20" : "border-gray-200 bg-white"
              }`}>
                <img
                  src={COUNTRY_FLAGS[currency.code]}
                  alt={currency.code}
                  className="w-5 h-4 object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{COUNTRY_NAMES[currency.code]}</div>
                <div className={`text-xs ${
                  selectedCurrency === currency.code ? "text-white/80" : "text-gray-500"
                }`}>
                  {currency.code}
                </div>
              </div>
            </div>
            {selectedCurrency === currency.code && (
              <span className="text-white font-bold">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Desktop Version - Dropdown
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="hover:opacity-70 transition-opacity outline-none flex items-center gap-1.5"
        >
          <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
            <img
              src={COUNTRY_FLAGS[currencyInfo?.code || "EUR"]}
              alt={currencyInfo?.code || "EUR"}
              className="w-5 h-4 object-cover"
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 z-[100]"
        sideOffset={8}
      >
        {Object.values(CURRENCIES).map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => changeCurrency(currency.code)}
            className="cursor-pointer flex items-center justify-between py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                <img
                  src={COUNTRY_FLAGS[currency.code]}
                  alt={currency.code}
                  className="w-5 h-4 object-cover"
                />
              </div>
              <span className="text-sm">{COUNTRY_NAMES[currency.code]}</span>
            </div>
            {selectedCurrency === currency.code && (
              <span className="text-black font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
