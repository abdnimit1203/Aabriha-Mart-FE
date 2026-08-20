"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listOrdersAdmin } from "@/lib/admin/orders";
import { AdminOrder, OrderStatus, PaymentStatus } from "@/types/order";
import { STATUS_OPTIONS, STATUS_CLASS, PAYMENT_STATUS_OPTIONS, PAYMENT_STATUS_CLASS, formatStatusLabel } from "./orderStatusStyles";

const inputClass =
  "rounded-full border border-border bg-surface px-3 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function AdminOrdersPage() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return listOrdersAdmin(idToken, {
          status: status || undefined,
          paymentStatus: paymentStatus || undefined,
          search: search || undefined,
          page,
          limit,
        }).then((res) => {
          setOrders(res.orders);
          setTotal(res.total);
        });
      })
      .catch(() => setOrders([]));
    // getIdToken isn't memoized in AuthContext — omitted to avoid re-fetching on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus, search, page]);

  useEffect(load, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by phone or order ID…"
          className={`${inputClass} w-full max-w-xs`}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {formatStatusLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value as PaymentStatus | "");
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {formatStatusLabel(p)}
            </option>
          ))}
        </select>
      </div>

      {!orders ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Payment</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3">
                    <Link href={`/admin/orders/${order._id}`} className="text-sm font-medium text-primary-strong hover:underline">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-sm">
                    <p>{order.customer?.username ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-sm">৳{order.total.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
                      {formatStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}
                    >
                      {formatStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-2.5 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
