"use client";

import ProductCard from "@/components/_cards/ProductCard";
import useAxios from "@/hooks/useAxios";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SimilarProductsSection() {
  const { productId } = useParams();
  const { request, loading } = useAxios();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products ONLY when productId changes
    const fetchSimilarProducts = async () => {
      const { data, error } = await request({
        url: "/users/get-similar-product",
        method: "GET",
        params: { productId },
      });

      if (!error) {
        const list = data?.data?.products ?? data?.products ?? [];
        setProducts(Array.isArray(list) ? list : []);
      } else {
        console.error("Similar Products Error:", error);
      }
    };

    fetchSimilarProducts();
  }, [productId]);

  // Select EXACT 4 items – memoized for performance
  const firstFour = useMemo(() => products.slice(0, 4), [products]);

  return (
    <section className="relative isolate my-12 w-full bg-white py-10">
      <div className="mx-auto max-w-[1250px] px-4">
        <h2 className="mb-5 text-2xl font-light tracking-wide">
          Similar Products
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6 text-gray-400">Loading...</div>
        )}

        {/* No Products */}
        {!loading && !products.length && (
          <div className="text-center py-6 text-gray-400">
            No similar products found
          </div>
        )}

        {/* Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {firstFour.map((p) => (
              <ProductCard key={p?.id} product={p?.product ?? p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
