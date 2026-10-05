import "server-only";
import { prisma } from "./prisma";

export type WilayaOption = { id: string; code: string; name: string };

export async function getWilayas(): Promise<WilayaOption[]> {
  const rows = await prisma.wilaya.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  return rows.map((w) => ({ id: w.id.toString(), code: w.code, name: w.name }));
}

export const DELIVERY_TYPES = ["HOME", "STOP_DESK"] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];

export function isDeliveryType(value: unknown): value is DeliveryType {
  return typeof value === "string" && (DELIVERY_TYPES as readonly string[]).includes(value);
}

// TODO(phase 4): replace with the delivery company's rates API (likely Yalidine),
// cached for a few hours. Until then every wilaya uses these flat placeholder fees.
const PLACEHOLDER_FEES: Record<DeliveryType, number> = {
  HOME: 800,
  STOP_DESK: 500,
};

/**
 * Delivery fee in DZD for a wilaya (by its code, e.g. "16") and delivery type,
 * or null when that destination can't be served. Always called on the server:
 * the fee a customer is charged never comes from the browser.
 */
export async function getDeliveryFee(wilayaCode: string, type: DeliveryType): Promise<number | null> {
  void wilayaCode;
  return PLACEHOLDER_FEES[type];
}
