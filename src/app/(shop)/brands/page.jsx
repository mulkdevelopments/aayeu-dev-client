"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAxios from "@/hooks/useAxios";

const LETTERS = ["0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const splitIntoColumns = (items = [], columns = 3) => {
  const per = Math.ceil(items.length / columns);
  return Array.from({ length: columns }, (_, i) =>
    items.slice(i * per, i * per + per)
  );
};

export default function BrandsPage() {
  const { request } = useAxios();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLetter = searchParams.get("letter") || "A";

  const [allBrands, setAllBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(initialLetter);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await request({
          url: "/users/get-all-brands",
          method: "GET",
        });
        if (!error && data?.success) {
          setAllBrands((data?.data || []).map((b) => b.brand_name).filter(Boolean));
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (initialLetter !== activeLetter) setActiveLetter(initialLetter);
  }, [initialLetter]);

  const filteredBrands = useMemo(() => {
    let list = allBrands;
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((b) => b.toLowerCase().includes(term));
    }
    if (activeLetter === "0-9") {
      return list.filter((b) => /^[0-9]/.test(b));
    }
    if (activeLetter) {
      return list.filter((b) => b?.[0]?.toUpperCase() === activeLetter);
    }
    return list;
  }, [allBrands, search, activeLetter]);

  const columns = useMemo(
    () => splitIntoColumns(filteredBrands, 3),
    [filteredBrands]
  );

  const handleLetterClick = (letter) => {
    setActiveLetter(letter);
    router.replace(`/brands?letter=${letter}`);
  };

  const handleBrandClick = (brand) => {
    router.push(`/shop?brand=${encodeURIComponent(brand.toLowerCase())}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-4 text-xs tracking-[0.2em] uppercase text-gray-700">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => handleLetterClick(letter)}
              className={`hover:text-black ${activeLetter === letter ? "text-black font-semibold" : ""}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center gap-2 border-b border-gray-300 pb-1">
          <span className="text-gray-500 text-xs uppercase tracking-[0.2em]">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands"
            className="bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg tracking-[0.2em] uppercase text-gray-900 mb-6">
          {activeLetter}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {columns.map((col, idx) => (
            <ul key={idx} className="space-y-3">
              {col.map((brand) => (
                <li key={brand}>
                  <button
                    type="button"
                    onClick={() => handleBrandClick(brand)}
                    className="text-sm text-gray-800 hover:text-black transition-colors"
                  >
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
