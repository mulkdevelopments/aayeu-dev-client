"use client";

import useCurrency from "@/hooks/useCurrency";
import { CURRENCIES, REGIONS } from "@/store/slices/currencySlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Circular SVG flag icons (same aspect in circle for UAE, Oman, etc.)
const CIRCLE_FLAGS_BASE = "https://hatscripts.github.io/circle-flags/flags";
const CURRENCY_TO_ISO2 = {
  AED: "ae",
  SAR: "sa",
  QAR: "qa",
  KWD: "kw",
  OMR: "om",
  BHD: "bh",
  INR: "in",
  PKR: "pk",
};
function getFlagSrc(currencyCode) {
  const iso2 = CURRENCY_TO_ISO2[currencyCode] || "ae";
  return `${CIRCLE_FLAGS_BASE}/${iso2}.svg`;
}

function getCountryByCode(code) {
  for (const items of Object.values(REGIONS)) {
    const found = items.find((c) => c.code === code);
    if (found) return found.country;
  }
  return code;
}

export default function CurrencySelector({ isMobileSidebar = false }) {
  const { selectedCurrency, currencyInfo, changeCurrency } = useCurrency();

  const allOptions = [
    { region: "GCC", items: REGIONS.GCC },
    { region: "Asia", items: REGIONS.Asia },
  ];

  const triggerLabel = currencyInfo
    ? `${getCountryByCode(currencyInfo.code)} · ${currencyInfo.code}`
    : "Country";

  if (isMobileSidebar) {
    return (
      <div className="space-y-4">
        {allOptions.map(({ region, items }) => (
          <div key={region}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
              {region}
            </div>
            <div className="space-y-0 divide-y divide-gray-100">
              {items.map(({ code, country }) => (
                <button
                  key={code}
                  onClick={() => changeCurrency(code)}
                  className={`w-full flex items-center justify-between gap-3 py-3 px-3 text-left ${
                    selectedCurrency === code
                      ? "bg-black text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={getFlagSrc(code)}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{country}</span>
                    <span
                      className={`block text-xs mt-0.5 ${
                        selectedCurrency === code
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {CURRENCIES[code]?.name} {code}
                    </span>
                  </div>
                  {selectedCurrency === code && (
                    <span className="text-sm font-medium">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 hover:border-black transition-colors outline-none flex-shrink-0 flex items-center justify-center bg-gray-50"
          title={triggerLabel}
          aria-label={triggerLabel}
        >
          <img
            src={getFlagSrc(currencyInfo?.code || "AED")}
            alt=""
            className="w-full h-full"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 z-[100] max-h-[70vh] overflow-y-auto rounded-sm border-gray-200 bg-white p-0"
        sideOffset={6}
      >
        {allOptions.map(({ region, items }) => (
          <div key={region}>
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 border-b border-gray-100">
              {region}
            </DropdownMenuLabel>
            {items.map(({ code, country }) => (
              <DropdownMenuItem
                key={code}
                onClick={() => changeCurrency(code)}
                className="cursor-pointer flex items-center justify-between gap-2.5 py-2.5 px-3 rounded-none border-b border-gray-50 last:border-0 focus:bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={getFlagSrc(code)}
                    alt=""
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-black">
                    {country}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {CURRENCIES[code]?.name} {code}
                  </span>
                </div>
                {selectedCurrency === code && (
                  <span className="text-sm font-medium text-black">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            {region === "GCC" && (
              <DropdownMenuSeparator className="bg-gray-100 my-0" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
