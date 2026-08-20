"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/orders";
import { CheckoutItemInput, CheckoutSummary, Order } from "@/types/order";
import { Address } from "@/types/user";

// Billing details aren't collected again here — the checkout form above
// already has the customer's phone/address, and the account has their
// email/username. Those get passed to stripe.confirmPayment() instead
// (Stripe requires *something* for any field suppressed like this).
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
  const { getIdToken, profile } = useAuth();
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
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          // Every billing_details field the Payment Element opts out of
          // collecting (fields.billingDetails: all "never" above) must be
          // supplied here instead — Stripe requires it, even though we
          // don't need to show these fields again since we already have
          // them from the account/checkout form.
          payment_method_data: {
            billing_details: {
              name: profile?.username || phone,
              email: profile?.email,
              phone,
              address: {
                line1: address.detailedAddress,
                city: address.district,
                state: address.division,
                // Not collected anywhere in this app (Bangladeshi delivery
                // addresses here don't use postal codes) — Stripe still
                // requires the key to be present since address collection
                // is suppressed in the Payment Element.
                postal_code: "",
                country: "BD",
              },
            },
          },
        },
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
