"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";
import { useCart } from "@/components/cart/useCart";
import { ChevronDown } from "lucide-react";

export default function ProductDetailClient({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [added, setAdded] = useState(false);

  const selected = product.variants.find((v) => v.id === selectedId) ?? null;
  const multiColor = new Set(product.variants.map((v) => v.color)).size > 1;
  const variantLabel = (v: CatalogVariant) =>
    multiColor ? [v.color, v.size].filter(Boolean).join(" / ") : v.size ?? v.color ?? "One size";

  const handleAddToBag = () => {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      color: selected.color,
      price: selected.price,
      image: product.image,
      available: selected.available,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="px-5 md:px-16 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Gallery */}
        <div className="aspect-3/4 bg-surface-container overflow-hidden relative">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary text-sm tracking-label uppercase">
              {product.name}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:pt-4">
          <p className="text-xs tracking-label uppercase text-secondary mb-3">
            {[product.categories.join(", ").toUpperCase(), selected && `SKU ${selected.sku}`].filter(Boolean).join(" / ")}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-3">{product.name}</h1>
          <p className="text-sm text-secondary mb-6">{product.colorName}</p>
          <p className="text-xl font-semibold mb-8">{(selected?.price ?? product.price).toLocaleString()} DZD</p>

          <p className="text-on-surface-variant mb-8 max-w-md">{product.description}</p>

          {/* Size selector */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium tracking-label uppercase">Select Size</span>
            <button className="text-xs text-secondary underline">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.available === 0}
                onClick={() => setSelectedId(v.id)}
                className={`min-w-14 h-12 px-3 flex items-center justify-center border text-sm transition-colors
                  ${v.available === 0 ? "border-outline-variant text-outline-variant line-through cursor-not-allowed" : "border-outline-variant hover:border-primary"}
                  ${selectedId === v.id ? "bg-primary text-on-primary border-primary" : ""}`}
              >
                {variantLabel(v)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mb-10">
            <button
              onClick={handleAddToBag}
              disabled={!selected}
              className="w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {added ? "Added to Bag ✓" : selected ? "Add to Bag" : "Select a Size"}
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-outline-variant">
            {[
              { id: "details", title: "Details & Care", body: product.details.join(" · ") },
              { id: "shipping", title: "Yalidine Shipping", body: "Delivered nationwide via Yalidine, home or relay-point delivery to all 58 wilayas. Cash on delivery available." },
              { id: "returns", title: "Returns & Exchanges", body: "Free exchanges within 14 days of delivery for unworn items in original packaging." },
            ].map((section) => (
              <div key={section.id} className="border-b border-outline-variant">
                <button
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between py-5 text-sm font-medium"
                >
                  {section.title}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openSection === section.id ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === section.id && (
                  <p className="text-sm text-secondary pb-5 pr-8">{section.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
