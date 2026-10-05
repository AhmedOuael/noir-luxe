"use server";

import { revalidatePath } from "next/cache";
import { getCartVariants, type CartVariantInfo } from "@/lib/catalog";
import { getDeliveryFee, type DeliveryType } from "@/lib/delivery";
import { createOrder, type PlaceOrderResult } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

// Server Functions are reachable by direct POST, so every argument is
// treated as untrusted input.

const isIdString = (v: unknown): v is string => typeof v === "string" && /^\d{1,18}$/.test(v);

export async function refreshCart(variantIds: unknown): Promise<Record<string, CartVariantInfo>> {
  if (!Array.isArray(variantIds)) return {};
  const ids = variantIds.filter(isIdString).slice(0, 50).map(BigInt);
  return ids.length ? getCartVariants(ids) : {};
}

/** Fee per delivery type for a wilaya; null means that type can't be delivered there. */
export async function quoteDelivery(wilayaId: unknown): Promise<Record<DeliveryType, number | null>> {
  const wilaya = isIdString(wilayaId)
    ? await prisma.wilaya.findFirst({ where: { id: BigInt(wilayaId), active: true } })
    : null;
  if (!wilaya) return { HOME: null, STOP_DESK: null };
  const [home, desk] = await Promise.all([
    getDeliveryFee(wilaya.code, "HOME"),
    getDeliveryFee(wilaya.code, "STOP_DESK"),
  ]);
  return { HOME: home, STOP_DESK: desk };
}

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const result = await createOrder(input);
  if (result.ok) {
    // Ordered items now show less available stock.
    revalidatePath("/");
    revalidatePath("/products");
    for (const slug of result.slugs) revalidatePath(`/products/${slug}`);
  }
  return result;
}
