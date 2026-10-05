"use client";

import { useEffect, useRef, useState } from "react";
import { refreshCart } from "@/app/(storefront)/checkout/actions";
import { MAX_QTY_PER_ITEM } from "@/lib/order-limits";
import { useCart, type CartItem } from "./useCart";

/**
 * Re-checks the cart against current prices/stock once per page visit.
 * Returns a message when something in the bag had to change.
 */
export function useCartSync() {
  const { items, hydrated, updateItems } = useCart();
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current || items.length === 0) return;
    started.current = true;

    refreshCart(items.map((i) => i.variantId))
      .then((latest) => {
        let changed = false;
        // Apply to the current cart, in case it was edited while we were checking.
        updateItems((current) => {
          const next: CartItem[] = [];
          for (const item of current) {
            const info = latest[item.variantId];
            if (!info) {
              // Not part of this check (added meanwhile) is kept; a variant we asked about
              // and didn't get back is no longer for sale.
              if (items.some((i) => i.variantId === item.variantId)) changed = true;
              else next.push(item);
              continue;
            }
            const quantity = Math.min(item.quantity, info.available, MAX_QTY_PER_ITEM);
            if (quantity !== item.quantity || info.price !== item.price) changed = true;
            if (quantity > 0) next.push({ ...item, ...info, quantity });
          }
          return next;
        });
        if (changed) setNotice("Some items in your bag changed price or availability. Please review before ordering.");
      })
      .catch(() => {
        // Offline / server error: keep the local cart; the order is re-validated anyway.
      })
      .finally(() => setDone(true));
  }, [hydrated, items, updateItems]);

  return { syncing: hydrated && !done && items.length > 0, notice };
}
