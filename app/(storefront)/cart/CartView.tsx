"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/useCart";
import { useCartSync } from "@/components/cart/useCartSync";
import { MAX_QTY_PER_ITEM } from "@/lib/order-limits";
import { formatDZD } from "@/lib/format";

export function variantLabel(item: Pick<CartItem, "size" | "color">) {
  return [item.color, item.size].filter(Boolean).join(" / ");
}

export function CartLine({ item, editable }: { item: CartItem; editable: boolean }) {
  const { setQuantity, removeItem } = useCart();
  const max = Math.min(item.available, MAX_QTY_PER_ITEM);

  return (
    <div className="flex gap-4 py-6 border-b border-outline-variant">
      <Link href={`/products/${item.slug}`} className="relative w-20 md:w-24 aspect-3/4 shrink-0 bg-surface-container overflow-hidden">
        {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${item.slug}`} className="font-display text-lg block truncate">
              {item.name}
            </Link>
            <p className="text-secondary text-xs tracking-label uppercase mt-1">{variantLabel(item)}</p>
          </div>
          {editable && (
            <button onClick={() => removeItem(item.variantId)} aria-label={`Remove ${item.name}`} className="text-secondary hover:text-primary h-fit">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="mt-auto pt-4 flex items-end justify-between">
          {editable ? (
            <div className="flex items-center border border-outline-variant">
              <button
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="w-9 h-9 flex items-center justify-center hover:bg-surface-container"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                disabled={item.quantity >= max}
                aria-label="Increase quantity"
                className="w-9 h-9 flex items-center justify-center hover:bg-surface-container disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <span className="text-sm text-secondary">Qty {item.quantity}</span>
          )}
          <span className="text-sm font-semibold whitespace-nowrap">
            {formatDZD(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CartView() {
  const { items, subtotal, hydrated } = useCart();
  const { syncing, notice } = useCartSync();

  if (!hydrated) return <p className="text-secondary py-24 text-center">Loading your bag…</p>;

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-secondary mb-8">Your bag is empty.</p>
        <Link
          href="/products"
          className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">
      <div>
        {notice && <p className="mb-6 p-4 bg-surface-container text-sm">{notice}</p>}
        <div className="border-t border-outline-variant">
          {items.map((item) => (
            <CartLine key={item.variantId} item={item} editable />
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 h-fit bg-surface-container-low p-6 md:p-8">
        <h2 className="text-xs font-medium tracking-label uppercase mb-6">Summary</h2>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-secondary">Subtotal</span>
          <span className="font-semibold">{formatDZD(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-8">
          <span className="text-secondary">Delivery</span>
          <span className="text-secondary">Calculated at checkout</span>
        </div>
        <Link
          href="/checkout"
          aria-disabled={syncing}
          onClick={(event) => {
            if (syncing) event.preventDefault();
          }}
          className={`block text-center w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity ${syncing ? "pointer-events-none opacity-40" : ""}`}
        >
          Checkout
        </Link>
        <p className="text-xs text-secondary text-center mt-4">Cash on delivery · Pay when you receive your order</p>
      </aside>
    </div>
  );
}
