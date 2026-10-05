import { STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

// Soft tinted pills + a dot, so statuses are scannable at a glance.
export const STATUS_COLORS: Record<OrderStatus, { pill: string; dot: string }> = {
  NEW: { pill: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  CALLED: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  CUSTOMER_UNREACHABLE: { pill: "bg-orange-50 text-orange-800 ring-orange-200", dot: "bg-orange-500" },
  CONFIRMED: { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  PREPARING: { pill: "bg-teal-50 text-teal-800 ring-teal-200", dot: "bg-teal-500" },
  AT_DELIVERY_DESK: { pill: "bg-indigo-50 text-indigo-800 ring-indigo-200", dot: "bg-indigo-500" },
  OUT_FOR_DELIVERY: { pill: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  DELIVERED: { pill: "bg-emerald-700 text-white ring-emerald-700", dot: "bg-emerald-200" },
  REFUSED: { pill: "bg-rose-50 text-rose-800 ring-rose-200", dot: "bg-rose-500" },
  RETURNED: { pill: "bg-red-50 text-red-800 ring-red-200", dot: "bg-red-500" },
  CANCELED: { pill: "bg-zinc-100 text-zinc-600 ring-zinc-200", dot: "bg-zinc-400" },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { pill, dot } = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-label uppercase ring-1 ring-inset ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
