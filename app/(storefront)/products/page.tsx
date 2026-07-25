"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getCategories } from "@/lib/products";

export default function ProductsPage() {
  const all = getAllProducts();
  const categories = getCategories();
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(
    () => (active === "All" ? all : all.filter((p) => p.category === active)),
    [active, all]
  );

  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Collection &apos;26</p>
        <h1 className="font-display text-3xl md:text-5xl">Essential Catalog</h1>
      </div>

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

      <p className="text-sm text-secondary mb-8">Showing {filtered.length} of {all.length} items.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-secondary py-24">No products in this category yet.</p>
      )}
    </div>
  );
}
