import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getClient } from "@/lib/admin/customers";
import { formatDateTime, formatDZD, formatPhone } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const card = "border border-outline-variant p-5";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const stats = [
    { label: "Orders", value: client.orders },
    { label: "Delivered", value: client.delivered },
    { label: "Refused / returned", value: client.refusedOrReturned, alert: client.refusedOrReturned > 0 },
    { label: "Canceled", value: client.canceled },
    { label: "Spent (delivered)", value: formatDZD(client.spent) },
  ];

  return (
    <div className="max-w-5xl">
      <Link href="/admin/clients" className="text-xs tracking-label uppercase text-secondary hover:text-primary">
        ← All clients
      </Link>
      <div className="mt-3 mb-8">
        <h1 className="font-display text-3xl">{client.name}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          <a href={`tel:${client.phone}`} className="font-semibold underline underline-offset-4">{formatPhone(client.phone)}</a>
          <span className="text-secondary">{client.wilaya}</span>
          {client.firstOrderAt && <span className="text-secondary">Client since {formatDateTime(client.firstOrderAt)}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-xs text-secondary">{s.label}</p>
            <p className={`text-xl font-semibold mt-1 ${s.alert ? "text-error" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <section className={card}>
        <h2 className="text-[11px] font-semibold tracking-label uppercase text-secondary mb-4">Order history</h2>
        {client.orderList.length === 0 ? (
          <p className="text-sm text-secondary">No orders.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {client.orderList.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-surface-container-low -mx-2 px-2">
                  <span className="font-semibold w-16">#{o.id}</span>
                  <span className="text-sm text-secondary w-32">{formatDateTime(o.createdAt)}</span>
                  <span className="text-sm flex-1 min-w-32">{o.items} item{o.items > 1 ? "s" : ""} · {o.wilaya}</span>
                  <span className="text-sm whitespace-nowrap">{formatDZD(o.total)}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
