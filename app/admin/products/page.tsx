"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { getAllProducts, type Product } from "@/lib/products";

// NOTE (phase 1): this list lives in React state only, seeded from lib/products.ts.
// Refreshing the page resets it. Phase 2 swaps these handlers for real API calls
// (POST/PATCH/DELETE /api/products) backed by the database, so changes persist
// and are reflected on the live storefront.

type Draft = Omit<Product, "id" | "sizes"> & { sizes: string };

const emptyDraft: Draft = {
  slug: "",
  sku: "",
  name: "",
  category: "Tops",
  colorName: "",
  price: 0,
  description: "",
  details: [],
  image: "",
  gallery: [],
  sizes: "S:0, M:0, L:0, XL:0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(getAllProducts());
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [showForm, setShowForm] = useState(false);

  function openNew() {
    setEditing(null);
    setDraft(emptyDraft);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setDraft({
      ...p,
      sizes: Object.entries(p.sizes)
        .map(([s, q]) => `${s}:${q}`)
        .join(", "),
    });
    setShowForm(true);
  }

  function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function save() {
    const sizes = Object.fromEntries(
      draft.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [size, qty] = s.split(":").map((x) => x.trim());
          return [size, Number(qty) || 0];
        })
    );

    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...editing, ...draft, sizes } : p))
      );
    } else {
      const id = crypto.randomUUID();
      setProducts((prev) => [...prev, { ...draft, id, sizes }]);
    }
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl mb-2">Product Inventory</h1>
          <p className="text-white/50">Manage your collection and stock levels.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="mt-10 bg-ink-panel border border-ink-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 uppercase text-xs tracking-label border-b border-ink-border">
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock by size</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink-border last:border-0 hover:bg-white/2">
                <td className="px-6 py-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-white/40 text-xs">{p.colorName}</p>
                </td>
                <td className="px-6 py-4 text-white/60">{p.sku}</td>
                <td className="px-6 py-4">{p.price.toLocaleString()} DZD</td>
                <td className="px-6 py-4 text-white/60">
                  {Object.entries(p.sizes).map(([s, q]) => `${s}:${q}`).join("  ")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(p)} className="text-white/60 hover:text-white">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(p.id)} className="text-white/60 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-6 py-4 text-xs text-white/40">Showing {products.length} products.</p>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-panel border border-ink-border rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <Input label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Input label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
              <Input label="SKU" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Color" value={draft.colorName} onChange={(v) => setDraft({ ...draft, colorName: v })} />
                <Input
                  label="Price (DZD)"
                  type="number"
                  value={String(draft.price)}
                  onChange={(v) => setDraft({ ...draft, price: Number(v) })}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Product["category"] })}
                  className="w-full bg-ink border border-ink-border rounded-md px-3 py-2 text-sm"
                >
                  {["Outerwear", "Tops", "Bottoms", "Accessories"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={3}
                  className="w-full bg-ink border border-ink-border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <Input
                label="Image URL"
                value={draft.image}
                onChange={(v) => setDraft({ ...draft, image: v })}
              />
              <Input
                label="Sizes & stock (e.g. S:10, M:20, L:5)"
                value={draft.sizes}
                onChange={(v) => setDraft({ ...draft, sizes: v })}
              />
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={save}
                className="flex-1 bg-white text-black py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Save Product
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-ink-border py-3 rounded-full text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-white/40 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink border border-ink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/40"
      />
    </div>
  );
}
