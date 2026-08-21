"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product, Size } from "@/lib/products";
import { ChevronDown } from "lucide-react";

export default function ProductDetailClient({ product }: { product: Product }) {
  const sizeEntries = Object.entries(product.sizes) as [Size, number][];
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [added, setAdded] = useState(false);

  const handleAddToBag = () => {
    if (!selectedSize) return;
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
            {product.category.toUpperCase()} / SKU {product.sku}
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-3">{product.name}</h1>
          <p className="text-sm text-secondary mb-6">{product.colorName}</p>
          <p className="text-xl font-semibold mb-8">{product.price.toLocaleString()} DZD</p>

          <p className="text-on-surface-variant mb-8 max-w-md">{product.description}</p>

          {/* Size selector */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium tracking-label uppercase">Select Size</span>
            <button className="text-xs text-secondary underline">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {sizeEntries.map(([size, stock]) => (
              <button
                key={size}
                disabled={stock === 0}
                onClick={() => setSelectedSize(size)}
                className={`w-14 h-12 flex items-center justify-center border text-sm transition-colors
                  ${stock === 0 ? "border-outline-variant text-outline-variant line-through cursor-not-allowed" : "border-outline-variant hover:border-primary"}
                  ${selectedSize === size ? "bg-primary text-on-primary border-primary" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mb-10">
            <button
              onClick={handleAddToBag}
              className="w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
            <button className="w-full border border-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:bg-surface-container transition-colors">
              Buy with BaridiMob
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
