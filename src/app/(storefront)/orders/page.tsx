"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listOrders } from "@/lib/orders";
import { Order, OrderStatus } from "@/types/order";

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-background text-muted-foreground",
  confirmed: "bg-primary/10 text-primary-strong",
  processing: "bg-primary/10 text-primary-strong",
  packed: "bg-primary/10 text-primary-strong",
  shipped: "bg-primary/10 text-primary-strong",
  out_for_delivery: "bg-primary/10 text-primary-strong",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
  returned: "bg-danger/10 text-danger",
};

export default function OrdersPage() {
  const { user, loading, getIdToken, openLoginModal } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!loading && !user) openLoginModal();
  }, [loading, user, openLoginModal]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const idToken = await getIdToken();
      if (!idToken) return;
      try {
        const result = await listOrders(idToken);
        if (!cancelled) setOrders(result.orders);
      } catch {
        if (!cancelled) setOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // getIdToken isn't memoized in AuthContext — omitted to avoid re-fetching
    // on every unrelated parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-14">
      <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">My Orders</h1>

      {!orders ? (
        <div className="mt-6 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-surface" />
          <div className="h-24 animate-pulse rounded-2xl bg-surface" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center sm:mt-8 sm:gap-4 sm:p-12">
          <p className="text-sm text-muted-foreground sm:text-base">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:px-6 sm:py-3"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium sm:text-base">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} —{" "}
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold sm:text-base">৳{order.total.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
