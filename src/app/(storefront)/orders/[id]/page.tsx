"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getOrder } from "@/lib/orders";
import { Order, PaymentStatus } from "@/types/order";

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid (pay on delivery)",
  pending_verification: "Payment pending verification",
  paid: "Paid",
  refunded: "Refunded",
};

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, getIdToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const idToken = await getIdToken();
      if (!idToken) return;
      try {
        const result = await getOrder(idToken, id);
        if (!cancelled) setOrder(result);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // getIdToken isn't memoized in AuthContext — omitted to avoid re-fetching
    // the order on every unrelated parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  if (notFound) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-14">
        <p className="text-sm text-muted-foreground">Order not found.</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-14">
        <div className="h-6 w-40 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-14">
      <div className="rounded-2xl border border-primary bg-primary/10 p-4 text-center sm:p-6">
        <p className="text-lg font-semibold text-primary-strong">Order placed!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Order #{order._id.slice(-8).toUpperCase()} — we&apos;ll call you at {order.phone} to confirm.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-sm font-semibold sm:text-base">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.nameSnapshot}</p>
                {Object.keys(item.attributesSnapshot).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Object.values(item.attributesSnapshot).join(" • ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span>৳{(item.unitPrice * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>৳{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery ({order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
            <span>৳{order.deliveryCharge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span>Total</span>
            <span>৳{order.total.toLocaleString()}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-sm font-semibold sm:text-base">Delivery address</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {order.deliveryAddress.detailedAddress}, {order.deliveryAddress.area}, {order.deliveryAddress.district},{" "}
          {order.deliveryAddress.division}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-sm font-semibold sm:text-base">Status</h2>
        <div className="mt-2 space-y-1 text-sm">
          <p>
            Order status: <span className="font-medium capitalize">{order.status.replace(/_/g, " ")}</span>
          </p>
          <p>
            Payment: <span className="font-medium">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
