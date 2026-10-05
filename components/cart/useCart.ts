"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { MAX_QTY_PER_ITEM } from "@/lib/order-limits";

// Display snapshot only: prices and stock are re-checked on the server
// (refreshCart on the cart/checkout pages, and again in placeOrder).
export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  image: string | null;
  available: number;
  quantity: number;
};

const STORAGE_KEY = "noir-cart-v1";
const EMPTY: CartItem[] = [];

// Cart lives in localStorage, exposed to React as an external store
// (also keeps several open tabs in sync).
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache === null) {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      cache = Array.isArray(parsed) ? parsed : [];
    } catch {
      cache = []; // storage unavailable or corrupted
    }
  }
  return cache;
}

function write(update: (items: CartItem[]) => CartItem[]) {
  cache = update(read());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode / quota: the cart still works for this tab.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

function clampQty(quantity: number, available: number) {
  return Math.max(0, Math.min(quantity, available, MAX_QTY_PER_ITEM));
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  // false during SSR and the hydration render, true afterwards.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    write((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, ...item, quantity: clampQty(i.quantity + quantity, item.available) }
            : i
        );
      }
      const qty = clampQty(quantity, item.available);
      return qty > 0 ? [...prev, { ...item, quantity: qty }] : prev;
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    write((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: clampQty(quantity, i.available) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    write((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateItems = useCallback((update: (items: CartItem[]) => CartItem[]) => write(update), []);
  const clear = useCallback(() => write(() => []), []);

  return useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      updateItems,
      clear,
    }),
    [items, hydrated, addItem, setQuantity, removeItem, updateItems, clear]
  );
}
