"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import type { CatalogProduct } from "@/lib/catalog";

// The first cards rise in with CSS from the first frame (they're on screen at
// load); the rest fade in as they're scrolled to. Changing category remounts
// the grid, so the new selection plays the entrance again.
const ENTRANCE_COUNT = 6;
const STAGGER_MS = 90;

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
      <div className="flex flex-wrap gap-3 mb-12 hide-scrollbar overflow-x-auto pb-2 motion-safe:animate-rise [animation-delay:100ms]">
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

      <div key={active} className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((p, i) =>
          i < ENTRANCE_COUNT ? (
            <div key={p.id} className="motion-safe:animate-rise" style={{ animationDelay: `${150 + i * STAGGER_MS}ms` }}>
              <ProductCard product={p} />
            </div>
          ) : (
            <Reveal key={p.id} delay={(i % 3) * 120}>
              <ProductCard product={p} />
            </Reveal>
          )
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-secondary py-24">No products in this category yet</p>
      )}
    </>
  );
}
