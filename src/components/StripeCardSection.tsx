"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createStripeIntent, createOrder } from "@/lib/orders";
import { CheckoutItemInput, CheckoutSummary, Order } from "@/types/order";
import { Address } from "@/types/user";

const CARD_ELEMENT_OPTIONS = {
  // The delivery address above already covers "where," and a US-style ZIP
  // doesn't map onto Bangladeshi addresses — asking for one here would just
  // confuse customers over a field nothing else in checkout uses.
  hidePostalCode: true,
  style: {
    base: { fontSize: "14px", color: "#1c1917", "::placeholder": { color: "#a8a29e" } },
    invalid: { color: "#dc2626" },
  },
};

export function StripeCardSection({
  items,
  address,
  phone,
  summary,
  onSuccess,
}: {
  items: CheckoutItemInput[];
  address: Address;
  phone: string;
  summary: CheckoutSummary;
  onSuccess: (order: Order) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { getIdToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    const idToken = await getIdToken();
    if (!idToken) return;

    setSubmitting(true);
    try {
      const intent = await createStripeIntent(idToken, { items, address });
      const result = await stripe.confirmCardPayment(intent.clientSecret, { payment_method: { card } });

      if (result.error) {
        toast.error(result.error.message ?? "Card payment failed.");
        return;
      }
      if (result.paymentIntent?.status !== "succeeded") {
        toast.error("Payment could not be confirmed.");
        return;
      }

      const order = await createOrder(idToken, {
        items,
        address,
        phone,
        paymentMethod: "stripe",
        paymentIntentId: result.paymentIntent.id,
      });
      onSuccess(order);
    } catch {
      toast.error("Couldn't process your payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background px-3 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <p className="text-xs text-muted-foreground">Test mode — use card number 4242 4242 4242 4242, any future date, any CVC.</p>
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Processing…" : `Pay ৳${summary.total.toLocaleString()}`}
      </button>
    </div>
  );
}
