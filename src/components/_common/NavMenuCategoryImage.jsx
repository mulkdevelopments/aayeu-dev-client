"use client";

import STATIC from "@/utils/constants";
import { useEffect, useState } from "react";

// 🔥 GLOBAL MEMORY CACHE (persists across component renders)
const imageCache = {};
// Structure: { "category-name" : { url: "...", failed: false } }

export default function NavMenuCategoryImage({ activeCategory, fallbackCategory = null }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

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
  const fallbackName = fallbackCategory ? fixSpelling(fallbackCategory.name || "") : null;
  const extensions = ["webp", "jpg", "jpeg", "png"];

  // Helper to try loading an image
  const tryLoadImage = async (categoryName) => {
    const cached = imageCache[categoryName];
    if (cached) {
      return cached;
    }

    const urls = extensions.map((ext) => `${BASE}${categoryName}.${ext}`);
    const results = await Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok: true, url });
            img.onerror = () => resolve({ ok: false, url });
            img.src = url;
          })
      )
    );

    const success = results.find((r) => r.ok);
    const result = success
      ? { url: success.url, failed: false }
      : { url: null, failed: true };

    imageCache[categoryName] = result;
    return result;
  };

  // ⚡ PARALLEL PRELOAD WITH CACHING AND FALLBACK
  useEffect(() => {
    if (!name) return;

    let cancelled = false;

    const loadImage = async () => {
      setLoaded(false);
      setFailed(false);
      setImgSrc(null);
      setUsingFallback(false);

      // Try main category first
      const mainResult = await tryLoadImage(name);

      if (cancelled) return;

      if (!mainResult.failed) {
        setImgSrc(mainResult.url);
        setLoaded(true);
        return;
      }

      // Try fallback if main failed and fallback exists
      if (fallbackName && fallbackName !== name) {
        const fallbackResult = await tryLoadImage(fallbackName);

        if (cancelled) return;

        if (!fallbackResult.failed) {
          setImgSrc(fallbackResult.url);
          setLoaded(true);
          setUsingFallback(true);
          return;
        }
      }

      // Both failed
      setFailed(true);
      setLoaded(true);
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [name, fallbackName]);

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
            alt={usingFallback ? fallbackCategory?.name : activeCategory.name}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
          />
        )
      )}
    </div>
  );
}
