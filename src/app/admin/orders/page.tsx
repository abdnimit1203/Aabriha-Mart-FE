"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { listOrdersAdmin, updateOrderStatus as updateOrderStatusApi } from "@/lib/admin/orders";
import { AdminOrder, DeliveryZone, OrderStatus, PaymentStatus } from "@/types/order";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ReceiptIcon } from "@/components/icons";
import { OrderActionsMenu } from "./OrderActionsMenu";
import {
  STATUS_OPTIONS,
  STATUS_CLASS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_STATUS_CLASS,
  PAYMENT_METHOD_LABEL,
  DELIVERY_ZONE_OPTIONS,
  DELIVERY_ZONE_LABEL,
  formatStatusLabel,
} from "./orderStatusStyles";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";
const LIMIT = 20;

function StatusPill({ order }: { order: AdminOrder }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
      {formatStatusLabel(order.status)}
    </span>
  );
}

function PaymentCell({ order }: { order: AdminOrder }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}>
        {formatStatusLabel(order.paymentStatus)}
      </span>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          <td colSpan={10} className="py-3">
            <div className="h-8 animate-pulse rounded-lg bg-background" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AdminOrdersPage() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const hasActiveFilters = Boolean(status || paymentStatus || deliveryZone || dateFrom || dateTo || search);

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        setError(false);
        return listOrdersAdmin(idToken, {
          status: status || undefined,
          paymentStatus: paymentStatus || undefined,
          deliveryZone: deliveryZone || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: search || undefined,
          page,
          limit: LIMIT,
        }).then((res) => {
          setOrders(res.orders);
          setTotal(res.total);
          setSelected(new Set());
        });
      })
      .catch(() => {
        setOrders(null);
        setError(true);
      });
    // getIdToken isn't memoized in AuthContext — omitted to avoid re-fetching on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus, deliveryZone, dateFrom, dateTo, search, page]);

  useEffect(load, [load]);

  function resetFilters() {
    setStatus("");
    setPaymentStatus("");
    setDeliveryZone("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  }

  function withFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  async function handleStatusChange(id: string, newStatus: OrderStatus) {
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      const updated = await updateOrderStatusApi(idToken, id, newStatus);
      setOrders((prev) => prev?.map((o) => (o._id === id ? updated : o)) ?? prev);
      toast.success(`Order marked ${formatStatusLabel(newStatus)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the order.");
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedOrders = orders?.filter((o) => selected.has(o._id)) ?? [];
  const canBulkConfirm = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "pending");

  async function handleBulkConfirm() {
    const idToken = await getIdToken();
    if (!idToken) return;
    setBulkSaving(true);
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => updateOrderStatusApi(idToken, id, "confirmed")));
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded > 0) {
      toast.success(`Confirmed ${succeeded} order${succeeded !== 1 ? "s" : ""}.`);
    }
    if (succeeded < ids.length) {
      toast.error(`${ids.length - succeeded} order${ids.length - succeeded !== 1 ? "s" : ""} couldn't be confirmed.`);
    }
    setBulkSaving(false);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const allOnPageSelected = orders !== null && orders.length > 0 && orders.every((o) => selected.has(o._id));

  return (
    <div>
      <AdminPageHeader title="Orders" description="Manage and process customer orders." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => withFilterChange(setSearch)(e.target.value)}
          placeholder="Search by phone or order ID…"
          className={`${inputClass} w-full max-w-xs`}
        />
        <select value={status} onChange={(e) => withFilterChange(setStatus)(e.target.value as OrderStatus | "")} className={inputClass}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {formatStatusLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => withFilterChange(setPaymentStatus)(e.target.value as PaymentStatus | "")}
          className={inputClass}
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {formatStatusLabel(p)}
            </option>
          ))}
        </select>
        <select
          value={deliveryZone}
          onChange={(e) => withFilterChange(setDeliveryZone)(e.target.value as DeliveryZone | "")}
          className={inputClass}
        >
          <option value="">All delivery zones</option>
          {DELIVERY_ZONE_OPTIONS.map((z) => (
            <option key={z} value={z}>
              {DELIVERY_ZONE_LABEL[z]}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input type="date" value={dateFrom} onChange={(e) => withFilterChange(setDateFrom)(e.target.value)} className={inputClass} />
          <span className="text-xs text-muted-foreground">to</span>
          <input type="date" value={dateTo} onChange={(e) => withFilterChange(setDateTo)(e.target.value)} className={inputClass} />
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={resetFilters} className="text-sm text-primary-strong hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium">Selected: {selected.size}</span>
          <button
            type="button"
            onClick={handleBulkConfirm}
            disabled={!canBulkConfirm || bulkSaving}
            className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkSaving ? "Confirming…" : "Confirm selected"}
          </button>
          {!canBulkConfirm && <span className="text-xs text-muted-foreground">Only pending orders can be bulk-confirmed.</span>}
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load orders</p>
          <button type="button" onClick={load} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            Retry
          </button>
        </div>
      ) : orders !== null && orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{hasActiveFilters ? "No orders match your filters" : "No orders yet"}</p>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="text-sm text-primary-strong hover:underline">
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table — horizontal scroll lives on this wrapper, never the page */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
            <table className="w-full min-w-225 border-collapse">
              <thead>
                <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 py-3.5 pl-4">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={(e) => setSelected(e.target.checked ? new Set(orders!.map((o) => o._id)) : new Set())}
                      className="h-4 w-4 rounded border-border accent-primary"
                      aria-label="Select all orders on this page"
                    />
                  </th>
                  <th className="py-3.5 pr-3 font-medium">Order</th>
                  <th className="py-3.5 pr-3 font-medium">Customer</th>
                  <th className="py-3.5 pr-3 font-medium">Items</th>
                  <th className="py-3.5 pr-3 font-medium">Total</th>
                  <th className="py-3.5 pr-3 font-medium">Payment</th>
                  <th className="py-3.5 pr-3 font-medium">Status</th>
                  <th className="py-3.5 pr-3 font-medium">Delivery</th>
                  <th className="py-3.5 pr-3 font-medium">Date</th>
                  <th className="w-10 py-3.5 pr-4" />
                </tr>
              </thead>
              <tbody>
                {orders === null ? (
                  <SkeletonRows />
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-border last:border-0 hover:bg-black/1.5">
                      <td className="py-3.5 pl-4">
                        <input
                          type="checkbox"
                          checked={selected.has(order._id)}
                          onChange={() => toggleSelected(order._id)}
                          className="h-4 w-4 rounded border-border accent-primary"
                          aria-label={`Select order ${order._id}`}
                        />
                      </td>
                      <td className="py-3.5 pr-3">
                        <Link href={`/admin/orders/${order._id}`} className="text-sm font-medium text-primary-strong hover:underline">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-3 text-sm">
                        <p>{order.customer?.username ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="py-3.5 pr-3 text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="py-3.5 pr-3 text-sm font-medium">৳{order.total.toLocaleString()}</td>
                      <td className="py-3.5 pr-3">
                        <PaymentCell order={order} />
                      </td>
                      <td className="py-3.5 pr-3">
                        <StatusPill order={order} />
                      </td>
                      <td className="py-3.5 pr-3 text-sm text-muted-foreground">{DELIVERY_ZONE_LABEL[order.deliveryZone]}</td>
                      <td className="py-3.5 pr-3 text-sm text-muted-foreground">
                        <p>{formatDate(order.createdAt)}</p>
                        <p className="text-xs">{formatTime(order.createdAt)}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <OrderActionsMenu order={order} onStatusChange={handleStatusChange} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 sm:hidden">
            {orders === null
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />)
              : orders.map((order) => (
                  <Link
                    key={order._id}
                    href={`/admin/orders/${order._id}`}
                    className="block rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary-strong">#{order._id.slice(-8).toUpperCase()}</span>
                      <StatusPill order={order} />
                    </div>
                    <p className="mt-1 text-sm">{order.customer?.username ?? order.phone}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium">৳{order.total.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>

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
