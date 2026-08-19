import { Address } from "@/types/user";

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";
export type PaymentMethod = "cod" | "bkash" | "nagad" | "stripe";
export type PaymentStatus = "unpaid" | "pending_verification" | "paid" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  product: string;
  variantId?: string;
  nameSnapshot: string;
  attributesSnapshot: Record<string, string>;
  unitPrice: number;
  quantity: number;
  weightGrams: number;
}

export interface CheckoutItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CheckoutSummary {
  items: OrderItem[];
  subtotal: number;
  deliveryZone: DeliveryZone;
  deliveryCharge: number;
  total: number;
}

export interface StripeIntentResponse extends CheckoutSummary {
  clientSecret: string;
}

export interface Order extends CheckoutSummary {
  _id: string;
  customer: string;
  phone: string;
  deliveryAddress: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}
