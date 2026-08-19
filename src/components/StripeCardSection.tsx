"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/orders";
import { CheckoutItemInput, CheckoutSummary, Order } from "@/types/order";
import { Address } from "@/types/user";

// No billing details collected — the delivery address above already covers
// "where," and nothing else in checkout needs a name/email/postal code.
const PAYMENT_ELEMENT_OPTIONS = {
  fields: {
    billingDetails: { name: "never" as const, email: "never" as const, phone: "never" as const, address: "never" as const },
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

    const idToken = await getIdToken();
    if (!idToken) return;

    setSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message ?? "Please check your card details.");
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/checkout` },
        redirect: "if_required",
      });

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
      <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />
      <p className="text-xs text-muted-foreground">Test mode — use card number 4242 4242 4242 4242, any future date, any CVC.</p>
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Processing…" : `Pay ৳${summary.total.toLocaleString()}`}
      </button>
    </div>
  );
}
