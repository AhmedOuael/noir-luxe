import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOrderDetail } from "@/lib/admin/orders";
import { DETAILS_EDITABLE, STATUS_LABELS } from "@/lib/order-status";
import { formatDateTime, formatDZD, formatPhone } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import DeliveryDetailsForm from "./DeliveryDetailsForm";
import StatusActions from "./StatusActions";

const card = "border border-outline-variant p-5";
const cardTitle = "text-[11px] font-semibold tracking-label uppercase text-secondary mb-4";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const previous = order.history.total - 1;

  return (
    <div className="max-w-6xl">
      <Link href="/admin/orders" className="text-xs tracking-label uppercase text-secondary hover:text-primary">
        ← All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3 mt-3 mb-8">
        <h1 className="font-display text-3xl">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-secondary">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* Customer */}
          <section className={card}>
            <h2 className={cardTitle}>Customer</h2>
            <Link href={`/admin/clients/${order.customer.id}`} className="text-lg hover:underline underline-offset-4">{order.customer.name}</Link>
            <a href={`tel:${order.customer.phone}`} className="inline-block mt-1 text-lg font-semibold underline underline-offset-4">
              {formatPhone(order.customer.phone)}
            </a>
            <p className={`text-xs mt-3 ${order.history.refusedOrReturned > 0 ? "text-error font-medium" : "text-secondary"}`}>
              {previous === 0
                ? "First order from this number."
                : `${previous} other order${previous > 1 ? "s" : ""} from this number: ${order.history.delivered} delivered, ${order.history.refusedOrReturned} refused/returned, ${order.history.canceled} canceled.`}
            </p>
          </section>

          {/* Items */}
          <section className={card}>
            <h2 className={cardTitle}>Items</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant last:border-0">
                    <td className="py-3 pr-3">
                      <div>{item.name}</div>
                      <div className="text-xs text-secondary">
                        {[item.color, item.size].filter(Boolean).join(" / ")} · {item.sku}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">× {item.quantity}</td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">{formatDZD(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-outline-variant space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Subtotal</span>
                <span>{formatDZD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Delivery ({order.deliveryType === "HOME" ? "home" : "stop-desk"})</span>
                <span>{formatDZD(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary">Discount</span>
                  <span>−{formatDZD(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total to collect</span>
                <span>{formatDZD(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className={card}>
            <h2 className={cardTitle}>History</h2>
            <ol className="space-y-2 text-sm">
              {order.timeline.map((t, i) => (
                <li key={i} className="flex flex-wrap gap-x-3">
                  <span className="text-secondary w-28 shrink-0">{formatDateTime(t.at)}</span>
                  <span className="font-medium">{STATUS_LABELS[t.status]}</span>
                  <span className="text-secondary">{t.by ? `by ${t.by}` : "by customer"}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className={card}>
            <h2 className={cardTitle}>Update status</h2>
            <StatusActions orderId={order.id} status={order.status} />
          </section>

          <section className={card}>
            <h2 className={cardTitle}>Delivery details</h2>
            <DeliveryDetailsForm
              key={`${order.status}-${order.communeId}-${order.address}-${order.deliveryFee}-${order.deliveryType}`}
              orderId={order.id}
              editable={DETAILS_EDITABLE.includes(order.status)}
              wilayaLabel={`${order.wilaya.code} – ${order.wilaya.name}`}
              deliveryType={order.deliveryType}
              communeId={order.communeId}
              address={order.address}
              deliveryFee={order.deliveryFee}
              communes={order.communes}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
