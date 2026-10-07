import "server-only";
import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";

// Algeria is UTC+1 all year (no daylight saving), so day/month boundaries are
// computed at a fixed offset and SQL buckets use the Africa/Algiers zone.
const TZ = "Africa/Algiers";
const OFFSET_MS = 60 * 60 * 1000;

export const PERIODS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "month", label: "This month" },
  { key: "12m", label: "12 months" },
  { key: "all", label: "All time" },
] as const;
export type PeriodKey = (typeof PERIODS)[number]["key"];
export const DEFAULT_PERIOD: PeriodKey = "12m";

export function isPeriod(v: unknown): v is PeriodKey {
  return typeof v === "string" && PERIODS.some((p) => p.key === v);
}

/** Midnight (Algiers) of the day containing `d`, as a UTC instant. */
function startOfDay(d: Date) {
  const local = new Date(d.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET_MS);
}
function startOfMonth(d: Date, monthsBack = 0) {
  const local = new Date(d.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - monthsBack, 1) - OFFSET_MS);
}
/** Calendar date in Algiers, YYYY-MM-DD (for URLs). */
export function algiersDate(d: Date) {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}
/** Parse YYYY-MM-DD as Algiers midnight. */
export function parseAlgiersDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const t = Date.parse(`${s}T00:00:00Z`);
  return Number.isNaN(t) ? null : new Date(t - OFFSET_MS);
}

export function periodRange(period: PeriodKey, now = new Date()) {
  const today = startOfDay(now);
  const day = 24 * 60 * 60 * 1000;
  switch (period) {
    case "today":
      return { from: today, bucket: "day" as const };
    case "7d":
      return { from: new Date(today.getTime() - 6 * day), bucket: "day" as const };
    case "30d":
      return { from: new Date(today.getTime() - 29 * day), bucket: "day" as const };
    case "month":
      return { from: startOfMonth(now), bucket: "day" as const };
    case "12m":
      return { from: startOfMonth(now, 11), bucket: "month" as const };
    case "all":
      return { from: null, bucket: "month" as const };
  }
}

const PENDING = ["NEW", "CALLED", "CUSTOMER_UNREACHABLE"];
const CONFIRMED_OR_LATER = ["CONFIRMED", "PREPARING", "AT_DELIVERY_DESK", "OUT_FOR_DELIVERY", "DELIVERED", "REFUSED", "RETURNED"];
const IN_TRANSIT = ["OUT_FOR_DELIVERY", "AT_DELIVERY_DESK"];

export type TrendPoint = { key: string; label: string; revenue: number; orders: number };

export type Overview = {
  period: PeriodKey;
  bucket: "day" | "month";
  fromDate: string | null; // YYYY-MM-DD, for links
  orders: { period: number; today: number; allTime: number };
  revenue: { amount: number; delivered: number; deliveryFees: number; average: number };
  needsCall: number;
  confirmation: { rate: number | null; confirmed: number; decided: number };
  delivery: { successRate: number | null; returnRate: number | null; delivered: number; refusedOrReturned: number };
  onTheRoad: { amount: number; orders: number };
  split: { home: number; stopDesk: number };
  trend: TrendPoint[];
  byProduct: { id: string; name: string; revenue: number; units: number }[];
  byWilaya: { name: string; orders: number }[];
  lowStock: { productId: string; product: string; variant: string; available: number }[];
};

const n = (v: unknown) => (v == null ? 0 : Number(v));

export async function getOverview(period: PeriodKey, now = new Date()): Promise<Overview> {
  const { from, bucket } = periodRange(period, now);
  const created = from ? { createdAt: { gte: from } } : {};
  const today = startOfDay(now);
  // Raw-SQL fragments for "delivered within the period"
  // Buckets come back as text keys (YYYY-MM-DD or YYYY-MM): no driver timezone conversion.
  const fmt = bucket === "day" ? "YYYY-MM-DD" : "YYYY-MM";
  const deliveredSince = from ? Prisma.sql`AND h."createdAt" >= ${from}` : Prisma.empty;

  const [
    periodCount,
    todayCount,
    allTimeCount,
    needsCall,
    byStatus,
    byType,
    roadAgg,
    revenueRows,
    trendOrders,
    trendRevenue,
    productRows,
    wilayaRows,
    lowStockRows,
  ] = await Promise.all([
    prisma.order.count({ where: created }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: PENDING } } }),
    prisma.order.groupBy({ by: ["status"], where: created, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["deliveryType"], where: { ...created, status: { not: "CANCELED" } }, _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: { in: IN_TRANSIT } },
      _sum: { subtotal: true, discount: true },
      _count: { _all: true },
    }),
    // Revenue counts the products of orders delivered in the period (delivery fees go to the courier).
    prisma.$queryRaw<{ amount: unknown; fees: unknown; delivered: unknown }[]>`
      SELECT COALESCE(SUM(o."subtotal" - o."discount"), 0) AS amount,
             COALESCE(SUM(o."deliveryFee"), 0) AS fees,
             COUNT(*) AS delivered
      FROM "Order" o
      JOIN "OrderStatusHistory" h ON h."orderId" = o."id" AND h."status" = 'DELIVERED'
      WHERE o."status" = 'DELIVERED' ${deliveredSince}`,
    prisma.$queryRaw<{ bucket: string; orders: unknown }[]>`
      SELECT to_char(o."createdAt" AT TIME ZONE ${TZ}, ${fmt}) AS bucket, COUNT(*) AS orders
      FROM "Order" o
      ${from ? Prisma.sql`WHERE o."createdAt" >= ${from}` : Prisma.empty}
      GROUP BY 1`,
    prisma.$queryRaw<{ bucket: string; revenue: unknown }[]>`
      SELECT to_char(h."createdAt" AT TIME ZONE ${TZ}, ${fmt}) AS bucket,
             SUM(o."subtotal" - o."discount") AS revenue
      FROM "Order" o
      JOIN "OrderStatusHistory" h ON h."orderId" = o."id" AND h."status" = 'DELIVERED'
      WHERE o."status" = 'DELIVERED' ${deliveredSince}
      GROUP BY 1`,
    prisma.$queryRaw<{ id: bigint; name: string; revenue: unknown; units: unknown }[]>`
      SELECT p."id", p."name", SUM(i."priceAtPurchase" * i."quantity") AS revenue, SUM(i."quantity") AS units
      FROM "OrderItem" i
      JOIN "Order" o ON o."id" = i."orderId" AND o."status" = 'DELIVERED'
      JOIN "OrderStatusHistory" h ON h."orderId" = o."id" AND h."status" = 'DELIVERED'
      JOIN "ProductVariant" v ON v."id" = i."variantId"
      JOIN "Product" p ON p."id" = v."productId"
      WHERE TRUE ${deliveredSince}
      GROUP BY p."id", p."name"
      ORDER BY revenue DESC
      LIMIT 8`,
    prisma.$queryRaw<{ name: string; code: string; orders: unknown }[]>`
      SELECT w."name", w."code", COUNT(*) AS orders
      FROM "Order" o JOIN "Wilaya" w ON w."id" = o."wilayaId"
      WHERE o."status" <> 'CANCELED' ${from ? Prisma.sql`AND o."createdAt" >= ${from}` : Prisma.empty}
      GROUP BY w."name", w."code"
      ORDER BY orders DESC, w."code"
      LIMIT 8`,
    prisma.$queryRaw<{ productId: bigint; product: string; size: string | null; color: string | null; available: number }[]>`
      SELECT p."id" AS "productId", p."name" AS product, v."size", v."color",
             (v."physicalStock" - v."reservedStock") AS available
      FROM "ProductVariant" v JOIN "Product" p ON p."id" = v."productId"
      WHERE v."active" AND p."active" AND v."physicalStock" - v."reservedStock" <= 3
      ORDER BY available ASC, p."name"
      LIMIT 10`,
  ]);

  const status = (list: string[]) => byStatus.filter((g) => list.includes(g.status)).reduce((s, g) => s + g._count._all, 0);
  const total = byStatus.reduce((s, g) => s + g._count._all, 0);
  const decided = total - status(PENDING);
  const confirmed = status(CONFIRMED_OR_LATER);
  const delivered = status(["DELIVERED"]);
  const refusedOrReturned = status(["REFUSED", "RETURNED"]);
  const outcomes = delivered + refusedOrReturned;

  const rev = revenueRows[0];
  const revenueAmount = n(rev?.amount);
  const deliveredCount = n(rev?.delivered);

  return {
    period,
    bucket,
    fromDate: from ? algiersDate(from) : null,
    orders: { period: periodCount, today: todayCount, allTime: allTimeCount },
    revenue: {
      amount: revenueAmount,
      delivered: deliveredCount,
      deliveryFees: n(rev?.fees),
      average: deliveredCount ? Math.round(revenueAmount / deliveredCount) : 0,
    },
    needsCall,
    confirmation: { rate: decided ? confirmed / decided : null, confirmed, decided },
    delivery: {
      successRate: outcomes ? delivered / outcomes : null,
      returnRate: outcomes ? refusedOrReturned / outcomes : null,
      delivered,
      refusedOrReturned,
    },
    onTheRoad: {
      amount: n(roadAgg._sum.subtotal) - n(roadAgg._sum.discount),
      orders: roadAgg._count._all,
    },
    split: {
      home: byType.find((g) => g.deliveryType === "HOME")?._count._all ?? 0,
      stopDesk: byType.find((g) => g.deliveryType === "STOP_DESK")?._count._all ?? 0,
    },
    trend: buildTrend(bucket, from, now, trendOrders, trendRevenue),
    byProduct: productRows.map((r) => ({ id: r.id.toString(), name: r.name, revenue: n(r.revenue), units: n(r.units) })),
    byWilaya: wilayaRows.map((r) => ({ name: `${r.code} ${r.name}`, orders: n(r.orders) })),
    lowStock: lowStockRows.map((r) => ({
      productId: r.productId.toString(),
      product: r.product,
      variant: [r.color, r.size].filter(Boolean).join(" / ") || "One size",
      available: Math.max(0, n(r.available)),
    })),
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Every bucket in the range, including empty ones, so gaps show as zero instead of disappearing. */
function buildTrend(
  bucket: "day" | "month",
  from: Date | null,
  now: Date,
  orders: { bucket: string; orders: unknown }[],
  revenue: { bucket: string; revenue: unknown }[]
): TrendPoint[] {
  const keyOf = (d: Date) => d.toISOString().slice(0, bucket === "day" ? 10 : 7);
  const ordersBy = new Map(orders.map((r) => [r.bucket, n(r.orders)]));
  const revenueBy = new Map(revenue.map((r) => [r.bucket, n(r.revenue)]));

  const nowLocal = new Date(now.getTime() + OFFSET_MS);
  let cursor: Date;
  if (from) {
    cursor = new Date(from.getTime() + OFFSET_MS);
  } else {
    const firstKey = [...ordersBy.keys(), ...revenueBy.keys()].sort()[0];
    cursor = firstKey ? new Date(`${firstKey.length === 7 ? `${firstKey}-01` : firstKey}T00:00:00Z`) : nowLocal;
  }
  cursor = bucket === "day"
    ? new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate()))
    : new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));

  const points: TrendPoint[] = [];
  while (cursor <= nowLocal && points.length < 400) {
    const key = keyOf(cursor);
    points.push({
      key,
      label: bucket === "day" ? `${cursor.getUTCDate()} ${MONTHS[cursor.getUTCMonth()]}` : `${MONTHS[cursor.getUTCMonth()]} ${String(cursor.getUTCFullYear()).slice(2)}`,
      revenue: revenueBy.get(key) ?? 0,
      orders: ordersBy.get(key) ?? 0,
    });
    cursor = bucket === "day"
      ? new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
      : new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return points;
}
