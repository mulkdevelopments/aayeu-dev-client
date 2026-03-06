"use client";

import { useEffect, useState } from "react";

export default function NavMenuCategoryImage({ activeCategory }) {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  if (!activeCategory)
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Hover on a category
      </div>
    );

  const adminImageUrl = (activeCategory?.image_url || "").trim();

  useEffect(() => {
    if (!adminImageUrl) {
      setImgSrc(null);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    const loadImage = async () => {
      const img = new Image();
      const ok = await new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = adminImageUrl;
      });

      if (cancelled) return;
      if (ok) setImgSrc(adminImageUrl);
      setLoaded(true);
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [adminImageUrl]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {!loaded && <div className="absolute inset-0 bg-transparent" />}

      {imgSrc && (
        <img
          src={imgSrc}
          alt={activeCategory.name}
          className="max-w-full max-h-full object-contain transition-opacity duration-300"
        />
      )}
    </div>
  );
}
