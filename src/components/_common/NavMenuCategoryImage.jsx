"use client";

import STATIC from "@/utils/constants";
import { useEffect, useState } from "react";

// 🔥 GLOBAL MEMORY CACHE (persists across component renders)
const imageCache = {};
// Structure: { "category-name" : { url: "...", failed: false } }

export default function NavMenuCategoryImage({ activeCategory }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  if (!activeCategory)
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Hover on a category
      </div>
    );

  const BASE = "/assets/images/categories/";

  // Fix spelling issues
  const fixSpelling = (str) => {
    const clean = str.toLowerCase().replace(/[^\w]+/g, "-");

    const map = {
      accesories: "accessories",
      accesory: "accessories",
      accessory: "accessories",
      jwellery: "jewellery",
      jewellary: "jewellery",
      jewellry: "jewellery",
      jewlery: "jewellery",
      jewelery: "jewellery",
    };

    return map[clean] || clean;
  };

  const name = fixSpelling(activeCategory.name || "");
  const extensions = ["webp", "jpg", "jpeg", "png"];

  // ⚡ PARALLEL PRELOAD WITH CACHING
  useEffect(() => {
    if (!name) return;

    const cached = imageCache[name];

    // ⚡ INSTANT FETCH FROM CACHE
    if (cached) {
      setLoaded(true);
      setFailed(cached.failed);
      setImgSrc(cached.url);
      return;
    }

    // First-time load
    setLoaded(false);
    setFailed(false);
    setImgSrc(null);

    let cancelled = false;
    const urls = extensions.map((ext) => `${BASE}${name}.${ext}`);

    // Preload all candidate URLs in parallel
    Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok: true, url });
            img.onerror = () => resolve({ ok: false, url });
            img.src = url;
          })
      )
    ).then((results) => {
      if (cancelled) return;

      const success = results.find((r) => r.ok);

      if (success) {
        // Save to global cache
        imageCache[name] = { url: success.url, failed: false };

        setImgSrc(success.url);
        setLoaded(true);
      } else {
        // Save failure to cache
        imageCache[name] = { url: null, failed: true };

        setFailed(true);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {!loaded && <div className="absolute inset-0 bg-transparent" />}

      {failed ? (
        <img
          src={STATIC.IMAGES.IMAGE_NOT_AVAILABLE}
          alt="Not Available"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        imgSrc && (
          <img
            src={imgSrc}
            alt={activeCategory.name}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
          />
        )
      )}
    </div>
  );
}
