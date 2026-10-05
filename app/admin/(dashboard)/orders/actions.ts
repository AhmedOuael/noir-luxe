"use server";

import { refresh, revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { changeOrderStatus, updateOrderDetails, type ActionResult } from "@/lib/admin/orders";

// Server Actions are reachable by direct POST: each one checks the session itself.

export async function saveOrderDetails(
  orderId: string,
  input: { deliveryType: unknown; communeId: unknown; address: unknown; deliveryFee: unknown }
): Promise<ActionResult> {
  await requireUser();
  const result = await updateOrderDetails(String(orderId), {
    deliveryType: input?.deliveryType,
    communeId: input?.communeId,
    address: input?.address,
    deliveryFee: input?.deliveryFee,
  });
  if (result.ok) refresh();
  return result;
}

export async function setOrderStatus(orderId: string, from: unknown, to: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const result = await changeOrderStatus(String(orderId), from, to, user);
  if (result.ok) {
    // Cancel/return/delivery change available stock on the storefront.
    revalidatePath("/");
    revalidatePath("/products");
    for (const slug of result.slugs ?? []) revalidatePath(`/products/${slug}`);
    refresh();
  }
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
