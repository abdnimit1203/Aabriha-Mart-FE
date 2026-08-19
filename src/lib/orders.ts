import { apiFetch } from "@/lib/api";
import { Address } from "@/types/user";
import { CheckoutItemInput, CheckoutSummary, StripeIntentResponse, Order, PaymentMethod } from "@/types/order";

interface CheckoutRequest {
  items: CheckoutItemInput[];
  address: Address;
}

export async function getCheckoutSummary(idToken: string, req: CheckoutRequest) {
  return apiFetch<CheckoutSummary>("/api/orders/summary", { method: "POST", body: JSON.stringify(req) }, idToken);
}

export async function createStripeIntent(idToken: string, req: CheckoutRequest) {
  return apiFetch<StripeIntentResponse>("/api/orders/stripe/intent", { method: "POST", body: JSON.stringify(req) }, idToken);
}

interface CreateOrderRequest extends CheckoutRequest {
  phone: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentIntentId?: string;
}

export async function createOrder(idToken: string, req: CreateOrderRequest) {
  return apiFetch<Order>("/api/orders", { method: "POST", body: JSON.stringify(req) }, idToken);
}

export async function getOrder(idToken: string, id: string) {
  return apiFetch<Order>(`/api/orders/${id}`, {}, idToken);
}
