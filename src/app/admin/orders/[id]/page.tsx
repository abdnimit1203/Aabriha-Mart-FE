"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getOrderAdmin, updateOrderStatus, updateOrderPayment } from "@/lib/admin/orders";
import { AdminOrder, OrderStatus, PaymentStatus } from "@/types/order";
import { STATUS_OPTIONS, STATUS_CLASS, PAYMENT_STATUS_OPTIONS, PAYMENT_STATUS_CLASS, formatStatusLabel } from "../orderStatusStyles";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getIdToken } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null | undefined>(undefined);

  const [statusDraft, setStatusDraft] = useState<OrderStatus>("pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const [paymentStatusDraft, setPaymentStatusDraft] = useState<PaymentStatus>("unpaid");
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [refundReference, setRefundReference] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return getOrderAdmin(idToken, id).then((result) => {
          setOrder(result);
          setStatusDraft(result.status);
          setPaymentStatusDraft(result.paymentStatus);
          setRefundAmount(result.refundAmount);
          setRefundReference(result.refundReference ?? "");
        });
      })
      .catch(() => setOrder(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(load, [load]);

  async function handleSaveStatus() {
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingStatus(true);
    try {
      const updated = await updateOrderStatus(idToken, id, statusDraft);
      setOrder(updated);
      toast.success("Order status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the status.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSavePayment() {
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingPayment(true);
    try {
      const updated = await updateOrderPayment(idToken, id, {
        paymentStatus: paymentStatusDraft,
        refundAmount: paymentStatusDraft === "refunded" ? refundAmount : undefined,
        refundReference: paymentStatusDraft === "refunded" ? refundReference || undefined : undefined,
      });
      setOrder(updated);
      toast.success("Payment status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update payment status.");
    } finally {
      setSavingPayment(false);
    }
  }

  if (order === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!order) return <p className="text-sm text-danger">Order not found.</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {formatStatusLabel(order.source)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
          {formatStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold">Customer</h2>
          <p className="text-sm">{order.customer?.username ?? "Deleted user"}</p>
          <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
          <p className="text-sm text-muted-foreground">{order.phone}</p>
        </div>

        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold">Delivery address</h2>
          <p className="text-sm">{order.deliveryAddress.detailedAddress}</p>
          <p className="text-sm text-muted-foreground">
            {order.deliveryAddress.area}, {order.deliveryAddress.district}, {order.deliveryAddress.division}
          </p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{formatStatusLabel(order.deliveryZone)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <table className="w-full border-collapse">
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 text-sm">
                  <p className="font-medium">{item.nameSnapshot}</p>
                  {Object.keys(item.attributesSnapshot).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Object.entries(item.attributesSnapshot)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                </td>
                <td className="py-2 pr-3 text-sm text-muted-foreground">×{item.quantity}</td>
                <td className="py-2 text-right text-sm">৳{(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>−৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery charge</span>
            <span>৳{order.deliveryCharge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>৳{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Order status</h2>
          <div className="flex items-center gap-2">
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
              className={`${inputClass} flex-1`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {formatStatusLabel(s)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={savingStatus || statusDraft === order.status}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {(statusDraft === "cancelled" || statusDraft === "returned") && statusDraft !== order.status && (
            <p className="mt-2 text-xs text-muted-foreground">Saving this will restore stock for every item in the order.</p>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Payment</h2>
          <p className="mb-2 text-xs text-muted-foreground capitalize">
            {formatStatusLabel(order.paymentMethod)}
            {order.paymentTransactionId && ` · Ref: ${order.paymentTransactionId}`}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={paymentStatusDraft}
              onChange={(e) => setPaymentStatusDraft(e.target.value as PaymentStatus)}
              className={`${inputClass} flex-1`}
            >
              {PAYMENT_STATUS_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {formatStatusLabel(p)}
                </option>
              ))}
            </select>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}>
              {formatStatusLabel(order.paymentStatus)}
            </span>
          </div>

          {paymentStatusDraft === "refunded" && (
            <div className="mt-3 space-y-2">
              <input
                type="number"
                min={0}
                placeholder="Refund amount"
                value={refundAmount ?? ""}
                onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : undefined)}
                className={`${inputClass} w-full`}
              />
              <input
                placeholder="Refund reference"
                value={refundReference}
                onChange={(e) => setRefundReference(e.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSavePayment}
            disabled={savingPayment || paymentStatusDraft === order.paymentStatus}
            className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save payment status
          </button>
        </div>
      </div>
    </div>
  );
}
