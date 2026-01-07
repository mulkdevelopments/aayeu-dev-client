"use client";

import { Globe } from "lucide-react";
import useCurrency from "@/hooks/useCurrency";
import { CURRENCIES } from "@/store/slices/currencySlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CurrencySelector() {
  const { selectedCurrency, currencyInfo, changeCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="group flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 outline-none"
        >
          <Globe className="w-6 h-6 text-gray-700 group-hover:text-black transition-colors" />
          <span className="text-[10px] text-gray-600 group-hover:text-black font-medium">
            {currencyInfo?.code || "EUR"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.values(CURRENCIES).map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => changeCurrency(currency.code)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>
              {currency.code==="EUR" ? "Europe" : ""}
              {currency.code==="AED" ? "UAE" : ""}
              {currency.code==="INR" ? "INDIA" : ""}
              {currency.code==="PKR" ? "PAKISTAN" : ""}
            </span>
            {selectedCurrency === currency.code && (
              <span className="text-green-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
