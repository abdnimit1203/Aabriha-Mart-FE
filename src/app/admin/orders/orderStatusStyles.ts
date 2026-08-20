import { DeliveryZone, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "COD",
  bkash: "bKash",
  nagad: "Nagad",
  stripe: "Card",
};

export const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

// Mirrors the backend's NEXT_STATUSES (src/models/Order.ts) — the backend
// enforces this on every write, this copy exists purely to decide which
// actions/options to render. cancelled/returned are terminal.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const DELIVERY_ZONE_OPTIONS: DeliveryZone[] = ["inside_dhaka", "outside_dhaka"];

export const DELIVERY_ZONE_LABEL: Record<DeliveryZone, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

// bg-black/5 rather than bg-background: this pill sometimes sits directly on
// the page background (e.g. the order-detail header) and sometimes on a
// white card (the orders table) — a flat bg-background pill is invisible in
// the first case since both resolve to the exact same color. An alpha
// overlay reads as a subtle chip against either.
export const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-black/5 text-muted-foreground",
  confirmed: "bg-primary/10 text-primary-strong",
  processing: "bg-primary/10 text-primary-strong",
  packed: "bg-primary/10 text-primary-strong",
  shipped: "bg-primary/10 text-primary-strong",
  out_for_delivery: "bg-primary/10 text-primary-strong",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-danger/10 text-danger",
  returned: "bg-danger/10 text-danger",
};

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["unpaid", "pending_verification", "paid", "refunded"];

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-black/5 text-muted-foreground",
  pending_verification: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-danger/10 text-danger",
};

export function formatStatusLabel(value: string): string {
  return value.replace(/_/g, " ");
}
