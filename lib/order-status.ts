// Shared by the admin UI (client) and order logic (server).
// Must match the "Order_status_valid" CHECK constraint in the database.
export const ORDER_STATUSES = [
  "NEW",
  "CALLED",
  "CUSTOMER_UNREACHABLE",
  "CONFIRMED",
  "PREPARING",
  "AT_DELIVERY_DESK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REFUSED",
  "RETURNED",
  "CANCELED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "New",
  CALLED: "Called",
  CUSTOMER_UNREACHABLE: "Unreachable",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  AT_DELIVERY_DESK: "At stop-desk",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  REFUSED: "Refused",
  RETURNED: "Returned",
  CANCELED: "Canceled",
};

/** Which statuses an order can move to from each status. Empty = final. */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["CALLED", "CONFIRMED", "CUSTOMER_UNREACHABLE", "CANCELED"],
  CALLED: ["CONFIRMED", "CUSTOMER_UNREACHABLE", "CANCELED"],
  CUSTOMER_UNREACHABLE: ["CALLED", "CONFIRMED", "CANCELED"],
  CONFIRMED: ["PREPARING", "CANCELED"],
  PREPARING: ["OUT_FOR_DELIVERY", "AT_DELIVERY_DESK", "CANCELED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "REFUSED"],
  AT_DELIVERY_DESK: ["DELIVERED", "REFUSED"],
  REFUSED: ["RETURNED"],
  DELIVERED: [],
  RETURNED: [],
  CANCELED: [],
};

/** Before the confirmation call is done: delivery details can still be filled in. */
export const PRE_CONFIRMATION: OrderStatus[] = ["NEW", "CALLED", "CUSTOMER_UNREACHABLE"];

/** Delivery details (commune, address, fee, type) are editable until the parcel is being prepared. */
export const DETAILS_EDITABLE: OrderStatus[] = [...PRE_CONFIRMATION, "CONFIRMED"];
