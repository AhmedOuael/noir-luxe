import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listOrders } from "@/lib/admin/orders";
import { ORDER_STATUSES, STATUS_LABELS, isOrderStatus } from "@/lib/order-status";
import { formatDateTime, formatDZD, formatPhone } from "@/lib/format";
import StatusBadge, { STATUS_COLORS } from "@/components/admin/StatusBadge";

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

function href(params: { status?: string; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const s = sp.toString();
  return `/admin/orders${s ? `?${s}` : ""}`;
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const sp = await searchParams;
  const status = isOrderStatus(sp.status) ? sp.status : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const { rows, total, pageCount, counts } = await listOrders({ status, q, page });
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] font-medium tracking-label uppercase border whitespace-nowrap transition-colors ${
      active ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-secondary hover:border-primary hover:text-primary"
    }`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl">Orders</h1>
        <form action="/admin/orders" className="flex gap-2 w-full md:w-auto">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Order #, phone or name"
            className="flex-1 md:w-72 bg-transparent border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button className="px-4 py-2 bg-primary text-on-primary text-xs font-medium tracking-label uppercase">Search</button>
        </form>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6">
        <Link href={href({ q })} className={chip(!status)}>
          All {allCount}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={href({ status: s, q })} className={`${chip(status === s)} inline-flex items-center gap-1.5`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[s].dot}`} aria-hidden="true" />
            {STATUS_LABELS[s]} {counts[s]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-secondary py-24 text-center">No orders{q ? ` matching "${q}"` : ""}.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-outline-variant overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left text-[11px] tracking-label uppercase text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Wilaya</th>
                  <th className="px-4 py-3 font-medium text-right">Items</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  // Every cell links to the order so the whole row is clickable (and
                  // still opens in a new tab with middle/ctrl-click). Only the first
                  // link is focusable, so keyboard users tab once per row.
                  const cell = (content: React.ReactNode, className = "", first = false) => (
                    <td className="p-0">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        tabIndex={first ? undefined : -1}
                        aria-hidden={first ? undefined : true}
                        className={`block px-4 py-3 ${className}`}
                      >
                        {content}
                      </Link>
                    </td>
                  );
                  return (
                    <tr key={o.id} className="border-t border-outline-variant hover:bg-surface-container-low cursor-pointer">
                      {cell(`#${o.id}`, "font-semibold", true)}
                      {cell(formatDateTime(o.createdAt), "text-secondary whitespace-nowrap")}
                      {cell(
                        <>
                          <div>{o.customerName}</div>
                          <div className="text-secondary text-xs">{formatPhone(o.phone)}</div>
                        </>
                      )}
                      {cell(
                        <>
                          <div>{o.wilaya}</div>
                          <div className="text-secondary text-xs">{o.deliveryType === "HOME" ? "Home" : "Stop-desk"}</div>
                        </>
                      )}
                      {cell(o.itemCount, "text-right")}
                      {cell(formatDZD(o.total), "text-right whitespace-nowrap")}
                      {cell(<StatusBadge status={o.status} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards: the confirmation team often works from a phone */}
          <div className="md:hidden space-y-3">
            {rows.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="block border border-outline-variant p-4">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <span className="font-semibold">#{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-sm">{o.customerName} · {formatPhone(o.phone)}</div>
                <div className="text-xs text-secondary mt-1">
                  {o.wilaya} · {formatDZD(o.total)} · {formatDateTime(o.createdAt)}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 text-sm">
            <span className="text-secondary">{total} orders</span>
            <div className="flex items-center gap-4">
              {page > 1 && <Link href={href({ status, q, page: page - 1 })} className="hover:underline">← Newer</Link>}
              <span className="text-secondary">
                Page {page} / {pageCount}
              </span>
              {page < pageCount && <Link href={href({ status, q, page: page + 1 })} className="hover:underline">Older →</Link>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
