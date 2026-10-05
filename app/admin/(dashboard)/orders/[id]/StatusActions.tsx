"use client";

import { useState, useTransition } from "react";
import { STATUS_LABELS, STATUS_TRANSITIONS, type OrderStatus } from "@/lib/order-status";
import { setOrderStatus } from "../actions";

const CONFIRM_TEXT: Partial<Record<OrderStatus, string>> = {
  CANCELED: "Cancel this order? Its reserved stock goes back on sale.",
  DELIVERED: "Mark as delivered? Stock is removed for good.",
  REFUSED: "Mark as refused by the customer?",
  RETURNED: "Mark as returned? Its stock goes back on sale.",
};

const SUCCESS: OrderStatus[] = ["CONFIRMED", "DELIVERED"];
const PRIMARY: OrderStatus[] = ["PREPARING", "OUT_FOR_DELIVERY", "AT_DELIVERY_DESK"];

export default function StatusActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const next = STATUS_TRANSITIONS[status];

  if (next.length === 0) return <p className="text-sm text-secondary">This order is closed.</p>;

  const change = (to: OrderStatus) => {
    const question = CONFIRM_TEXT[to];
    if (question && !window.confirm(question)) return;
    setError(null);
    startTransition(async () => {
      const result = await setOrderStatus(orderId, status, to);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {next.map((to) => (
          <button
            key={to}
            onClick={() => change(to)}
            disabled={pending}
            className={`px-4 py-2.5 text-xs font-medium tracking-label uppercase border disabled:opacity-40 ${
              SUCCESS.includes(to)
                ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800"
                : PRIMARY.includes(to)
                ? "bg-primary text-on-primary border-primary"
                : to === "CANCELED" || to === "REFUSED"
                  ? "border-error text-error hover:bg-error/5"
                  : "border-outline-variant hover:border-primary"
            }`}
          >
            {STATUS_LABELS[to]}
          </button>
        ))}
      </div>
      {error && <p className="text-error text-sm mt-3">{error}</p>}
    </div>
  );
}
