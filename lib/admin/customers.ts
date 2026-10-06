import "server-only";
import { prisma } from "../prisma";
import type { Prisma } from "../generated/prisma/client";
import type { OrderStatus } from "../order-status";

export const CLIENTS_PAGE_SIZE = 50;

export type ClientStats = {
  orders: number;
  delivered: number;
  refusedOrReturned: number;
  canceled: number;
  spent: number; // total of delivered orders
};

export type ClientRow = ClientStats & {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  lastOrderAt: string | null;
};

const emptyStats = (): ClientStats => ({ orders: 0, delivered: 0, refusedOrReturned: 0, canceled: 0, spent: 0 });

async function statsFor(customerIds: bigint[]) {
  const grouped = await prisma.order.groupBy({
    by: ["customerId", "status"],
    where: { customerId: { in: customerIds } },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  });
  const stats = new Map<string, ClientStats & { last: Date | null }>();
  for (const g of grouped) {
    const key = g.customerId.toString();
    const s = stats.get(key) ?? { ...emptyStats(), last: null };
    s.orders += g._count._all;
    if (g.status === "DELIVERED") {
      s.delivered += g._count._all;
      s.spent += g._sum.total?.toNumber() ?? 0;
    }
    if (g.status === "REFUSED" || g.status === "RETURNED") s.refusedOrReturned += g._count._all;
    if (g.status === "CANCELED") s.canceled += g._count._all;
    if (g._max.createdAt && (!s.last || g._max.createdAt > s.last)) s.last = g._max.createdAt;
    stats.set(key, s);
  }
  return stats;
}

export async function listClients(params: { q?: string; page?: number }) {
  const q = params.q?.trim();
  const where: Prisma.CustomerWhereInput = {};
  if (q) {
    const digits = q.replace(/[\s.\-+]/g, "");
    where.OR = /^\d+$/.test(digits)
      ? [{ phone: { contains: digits.replace(/^213/, "0") } }]
      : [{ fullName: { contains: q, mode: "insensitive" } }];
  }
  const page = Math.max(1, params.page ?? 1);

  // updatedAt moves on every new order, so this lists recent buyers first.
  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * CLIENTS_PAGE_SIZE,
      take: CLIENTS_PAGE_SIZE,
      include: { wilaya: { select: { code: true, name: true } } },
    }),
    prisma.customer.count({ where }),
  ]);
  const stats = await statsFor(rows.map((c) => c.id));

  return {
    page,
    total,
    pageCount: Math.max(1, Math.ceil(total / CLIENTS_PAGE_SIZE)),
    rows: rows.map((c): ClientRow => {
      const s = stats.get(c.id.toString()) ?? { ...emptyStats(), last: null };
      return {
        id: c.id.toString(),
        name: c.fullName,
        phone: c.phone,
        wilaya: `${c.wilaya.code} – ${c.wilaya.name}`,
        orders: s.orders,
        delivered: s.delivered,
        refusedOrReturned: s.refusedOrReturned,
        canceled: s.canceled,
        spent: s.spent,
        lastOrderAt: s.last?.toISOString() ?? null,
      };
    }),
  };
}

export type ClientDetail = ClientRow & {
  firstOrderAt: string | null;
  orderList: { id: string; createdAt: string; status: OrderStatus; total: number; items: number; wilaya: string }[];
};

export async function getClient(idParam: string): Promise<ClientDetail | null> {
  if (!/^\d{1,18}$/.test(idParam)) return null;
  const c = await prisma.customer.findUnique({
    where: { id: BigInt(idParam) },
    include: {
      wilaya: { select: { code: true, name: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { wilaya: { select: { code: true, name: true } }, items: { select: { quantity: true } } },
      },
    },
  });
  if (!c) return null;
  const s = (await statsFor([c.id])).get(c.id.toString()) ?? { ...emptyStats(), last: null };

  return {
    id: c.id.toString(),
    name: c.fullName,
    phone: c.phone,
    wilaya: `${c.wilaya.code} – ${c.wilaya.name}`,
    orders: s.orders,
    delivered: s.delivered,
    refusedOrReturned: s.refusedOrReturned,
    canceled: s.canceled,
    spent: s.spent,
    lastOrderAt: s.last?.toISOString() ?? null,
    firstOrderAt: c.orders.at(-1)?.createdAt.toISOString() ?? null,
    orderList: c.orders.map((o) => ({
      id: o.id.toString(),
      createdAt: o.createdAt.toISOString(),
      status: o.status as OrderStatus,
      total: o.total.toNumber(),
      items: o.items.reduce((n, i) => n + i.quantity, 0),
      wilaya: `${o.wilaya.code} – ${o.wilaya.name}`,
    })),
  };
}
