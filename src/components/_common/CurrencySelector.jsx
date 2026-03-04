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

// Use w80 for sharper display on retina (trigger circle is 32px, 2x = 64px)
const FLAG_CDN = "https://flagcdn.com/w80";
const COUNTRY_FLAGS = {
  AED: `${FLAG_CDN}/ae.png`,
  SAR: `${FLAG_CDN}/sa.png`,
  QAR: `${FLAG_CDN}/qa.png`,
  KWD: `${FLAG_CDN}/kw.png`,
  OMR: `${FLAG_CDN}/om.png`,
  BHD: `${FLAG_CDN}/bh.png`,
  INR: `${FLAG_CDN}/in.png`,
  PKR: `${FLAG_CDN}/pk.png`,
};

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
                  <div className="w-8 h-6 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={COUNTRY_FLAGS[code]}
                      alt=""
                      className="w-full h-full object-cover"
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
          className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 hover:border-black transition-colors outline-none flex-shrink-0 flex items-center justify-center"
          title={triggerLabel}
          aria-label={triggerLabel}
        >
          <img
            src={COUNTRY_FLAGS[currencyInfo?.code] || COUNTRY_FLAGS.AED}
            alt=""
            className="w-full h-full object-cover"
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
                <div className="w-8 h-6 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={COUNTRY_FLAGS[code]}
                    alt=""
                    className="w-full h-full object-cover"
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
