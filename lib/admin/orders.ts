import "server-only";
import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";
import { isDeliveryType, type DeliveryType } from "../delivery";
import { getCommuneOptions, type CommuneOption } from "../communes";
import {
  DETAILS_EDITABLE,
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
  isOrderStatus,
  type OrderStatus,
} from "../order-status";
import type { SessionUser } from "../auth/session";

export const ORDERS_PAGE_SIZE = 50;

export type ActionResult = { ok: true } | { ok: false; error: string };

class OrderActionError extends Error {}

const CONFLICT = "This order was just updated by someone else. Refresh the page and try again.";

// ---------------------------------------------------------------- list

export type OrderListRow = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  wilaya: string;
  deliveryType: DeliveryType;
  itemCount: number;
  total: number;
};

export async function listOrders(params: { status?: string; q?: string; page?: number }) {
  const where: Prisma.OrderWhereInput = {};
  if (isOrderStatus(params.status)) where.status = params.status;

  const q = params.q?.trim();
  if (q) {
    const digits = q.replace(/[\s#]/g, "");
    where.OR = /^\d+$/.test(digits)
      ? [
          ...(digits.length <= 12 ? [{ id: BigInt(digits) }] : []),
          { customer: { phone: { contains: digits } } },
        ]
      : [{ customer: { fullName: { contains: q, mode: "insensitive" } } }];
  }

  const page = Math.max(1, params.page ?? 1);
  const [rows, total, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      include: {
        customer: { select: { fullName: true, phone: true } },
        wilaya: { select: { code: true, name: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const g of grouped) if (isOrderStatus(g.status)) counts[g.status] = g._count._all;

  return {
    page,
    total,
    pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
    counts,
    rows: rows.map(
      (o): OrderListRow => ({
        id: o.id.toString(),
        createdAt: o.createdAt.toISOString(),
        status: o.status as OrderStatus,
        customerName: o.customer.fullName,
        phone: o.customer.phone,
        wilaya: `${o.wilaya.code} – ${o.wilaya.name}`,
        deliveryType: o.deliveryType as DeliveryType,
        itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
        total: o.total.toNumber(),
      })
    ),
  };
}

// ---------------------------------------------------------------- detail

export type OrderDetail = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string };
  // Other orders from the same phone: helps spot fake / serial-refusal customers.
  history: { total: number; delivered: number; refusedOrReturned: number; canceled: number };
  wilaya: { code: string; name: string };
  deliveryType: DeliveryType;
  communeId: string | null;
  address: string | null;
  communes: CommuneOption[];
  items: { id: string; name: string; size: string | null; color: string | null; quantity: number; price: number; sku: string }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  timeline: { status: OrderStatus; at: string; by: string | null }[];
};

export async function getOrderDetail(idParam: string): Promise<OrderDetail | null> {
  if (!/^\d{1,18}$/.test(idParam)) return null;
  const order = await prisma.order.findUnique({
    where: { id: BigInt(idParam) },
    include: {
      customer: true,
      wilaya: true,
      items: { include: { variant: { select: { sku: true } } }, orderBy: { id: "asc" } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { changedByUser: { select: { name: true, email: true } } },
      },
    },
  });
  if (!order) return null;

  const [byStatus, communes] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { customer: { phone: order.customer.phone } },
      _count: { _all: true },
    }),
    getCommuneOptions(order.wilayaId),
  ]);
  const count = (...statuses: string[]) =>
    byStatus.filter((g) => statuses.includes(g.status)).reduce((n, g) => n + g._count._all, 0);

  return {
    id: order.id.toString(),
    createdAt: order.createdAt.toISOString(),
    status: order.status as OrderStatus,
    customer: { name: order.customer.fullName, phone: order.customer.phone },
    history: {
      total: byStatus.reduce((n, g) => n + g._count._all, 0),
      delivered: count("DELIVERED"),
      refusedOrReturned: count("REFUSED", "RETURNED"),
      canceled: count("CANCELED"),
    },
    wilaya: { code: order.wilaya.code, name: order.wilaya.name },
    deliveryType: order.deliveryType as DeliveryType,
    communeId: order.communeId?.toString() ?? null,
    address: order.address,
    communes,
    items: order.items.map((i) => ({
      id: i.id.toString(),
      name: i.productNameAtPurchase,
      size: i.sizeAtPurchase,
      color: i.colorAtPurchase,
      quantity: i.quantity,
      price: i.priceAtPurchase.toNumber(),
      sku: i.variant.sku,
    })),
    subtotal: order.subtotal.toNumber(),
    deliveryFee: order.deliveryFee.toNumber(),
    discount: order.discount.toNumber(),
    total: order.total.toNumber(),
    timeline: order.statusHistory.map((h) => ({
      status: h.status as OrderStatus,
      at: h.createdAt.toISOString(),
      by: h.changedByUser ? h.changedByUser.name || h.changedByUser.email : null,
    })),
  };
}

// ---------------------------------------------------------------- update details

/** Fills in what the confirmation team collected on the call. */
export async function updateOrderDetails(
  orderIdParam: string,
  input: { deliveryType: unknown; communeId: unknown; address: unknown; deliveryFee: unknown }
): Promise<ActionResult> {
  if (!/^\d{1,18}$/.test(orderIdParam)) return { ok: false, error: "Order not found." };
  const order = await prisma.order.findUnique({ where: { id: BigInt(orderIdParam) } });
  if (!order) return { ok: false, error: "Order not found." };
  if (!DETAILS_EDITABLE.includes(order.status as OrderStatus)) {
    return { ok: false, error: "Delivery details can't be changed once the order is being prepared." };
  }

  if (!isDeliveryType(input.deliveryType)) return { ok: false, error: "Choose home or stop-desk delivery." };

  let communeId: bigint | null = null;
  if (typeof input.communeId === "string" && input.communeId !== "") {
    if (!/^\d{1,18}$/.test(input.communeId)) return { ok: false, error: "Invalid commune." };
    const commune = await prisma.commune.findFirst({
      where: { id: BigInt(input.communeId), wilayaId: order.wilayaId, active: true },
    });
    if (!commune) return { ok: false, error: "That commune isn't in the order's wilaya." };
    communeId = commune.id;
  }

  const address = typeof input.address === "string" ? input.address.trim().replace(/\s+/g, " ") : "";
  if (address.length > 300) return { ok: false, error: "Address is too long." };

  const feeText = typeof input.deliveryFee === "string" ? input.deliveryFee.trim() : "";
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(feeText)) return { ok: false, error: "Enter a valid delivery fee." };
  const deliveryFee = new Prisma.Decimal(feeText);

  if (order.status === "CONFIRMED") {
    const missing = await missingForConfirmation({ ...order, communeId, address: address || null, deliveryType: input.deliveryType });
    if (missing) return { ok: false, error: missing };
  }

  const updated = await prisma.order.updateMany({
    where: { id: order.id, status: order.status, updatedAt: order.updatedAt },
    data: {
      deliveryType: input.deliveryType,
      communeId,
      address: address || null,
      deliveryFee,
      total: order.subtotal.add(deliveryFee).sub(order.discount),
    },
  });
  return updated.count === 1 ? { ok: true } : { ok: false, error: CONFLICT };
}

/** Why the order can't be confirmed yet, or null if it can. */
async function missingForConfirmation(order: {
  wilayaId: bigint;
  communeId: bigint | null;
  address: string | null;
  deliveryType: string;
}): Promise<string | null> {
  if (!order.communeId) {
    const hasCommunes = await prisma.commune.count({ where: { wilayaId: order.wilayaId, active: true } });
    if (hasCommunes > 0) return "Choose the customer's commune before confirming.";
  }
  if (order.deliveryType === "HOME" && !order.address) return "Enter the delivery address before confirming.";
  return null;
}

// ---------------------------------------------------------------- status

export async function changeOrderStatus(
  orderIdParam: string,
  fromParam: unknown,
  toParam: unknown,
  user: SessionUser
): Promise<ActionResult & { slugs?: string[] }> {
  if (!/^\d{1,18}$/.test(orderIdParam) || !isOrderStatus(fromParam) || !isOrderStatus(toParam)) {
    return { ok: false, error: "Invalid request." };
  }
  const orderId = BigInt(orderIdParam);
  const from = fromParam;
  const to = toParam;
  if (!STATUS_TRANSITIONS[from].includes(to)) return { ok: false, error: "That status change isn't allowed." };

  try {
    const slugs = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { variant: { select: { product: { select: { slug: true } } } } } } },
      });
      if (!order) throw new OrderActionError("Order not found.");
      if (order.status !== from) throw new OrderActionError(CONFLICT);

      if (to === "CONFIRMED") {
        const missing = await missingForConfirmation(order);
        if (missing) throw new OrderActionError(missing);
      }

      // Guarded update: only one of two simultaneous clicks wins.
      const updated = await tx.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } });
      if (updated.count !== 1) throw new OrderActionError(CONFLICT);

      // Stock stays reserved while the order is active. It's released when the
      // order ends without a sale, and leaves the shelf for good on delivery.
      for (const item of order.items) {
        if (to === "CANCELED" || to === "RETURNED") {
          await tx.$executeRaw`
            UPDATE "ProductVariant"
            SET "reservedStock" = "reservedStock" - ${item.quantity}, "updatedAt" = now()
            WHERE "id" = ${item.variantId}`;
        } else if (to === "DELIVERED") {
          await tx.$executeRaw`
            UPDATE "ProductVariant"
            SET "physicalStock" = "physicalStock" - ${item.quantity},
                "reservedStock" = "reservedStock" - ${item.quantity},
                "updatedAt" = now()
            WHERE "id" = ${item.variantId}`;
        }
      }

      await tx.orderStatusHistory.create({ data: { orderId, status: to, changedBy: user.id } });
      return [...new Set(order.items.map((i) => i.variant.product.slug))];
    });
    return { ok: true, slugs };
  } catch (error) {
    if (error instanceof OrderActionError) return { ok: false, error: error.message };
    throw error;
  }
}
