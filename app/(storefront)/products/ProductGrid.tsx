"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";

export default function ProductGrid({
  products,
  categories,
}: {
  products: CatalogProduct[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.categories.includes(active))),
    [active, products]
  );

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-3 mb-12 hide-scrollbar overflow-x-auto pb-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-label uppercase border transition-colors whitespace-nowrap ${
              active === cat
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-secondary mb-8">Showing {filtered.length} of {products.length} items.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-secondary py-24">No products in this category yet</p>
      )}
    </>
  );
}
