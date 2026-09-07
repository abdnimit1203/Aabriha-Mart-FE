"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { FaPrint } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { getOrderAdmin, updateOrderStatus, updateOrderPayment, updateOrderVat } from "@/lib/admin/orders";
import { AdminOrder, OrderStatus, PaymentStatus } from "@/types/order";
import {
  STATUS_CLASS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_STATUS_CLASS,
  PAYMENT_METHOD_LABEL,
  DELIVERY_ZONE_LABEL,
  NEXT_STATUSES,
  formatStatusLabel,
} from "@/lib/orderStatusStyles";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PackingSlip } from "@/components/PackingSlip";
import { confirmToast } from "@/lib/confirmToast";

const inputClass =
  "rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>;
}

// Wording for the primary "next step" action button — cosmetic only. The
// actual set of statuses this can ever be offered for still comes entirely
// from NEXT_STATUSES (orderStatusStyles.ts, mirroring the backend's own
// copy in Order.ts), never invented here.
const PRIMARY_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm Order",
  processing: "Mark as Processing",
  packed: "Mark as Packed",
  shipped: "Mark as Shipped",
  out_for_delivery: "Mark as Out for Delivery",
  delivered: "Mark as Delivered",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getIdToken, profile } = useAuth();
  const isSuperAdmin = profile?.role === "super_admin";
  const [order, setOrder] = useState<AdminOrder | null | undefined>(undefined);

  // Non-null exactly while one status mutation is in flight, naming its
  // target — doubles as the double-submit guard (every status-changing
  // control below disables while this is set, not just the one clicked) and
  // as the per-button "which one shows a loading label" flag.
  const [savingStatusTo, setSavingStatusTo] = useState<OrderStatus | null>(null);
  const [manualStatusOpen, setManualStatusOpen] = useState(false);
  const [manualStatusDraft, setManualStatusDraft] = useState<OrderStatus | "">("");

  const [paymentStatusDraft, setPaymentStatusDraft] = useState<PaymentStatus>("unpaid");
  const [refundAmount, setRefundAmount] = useState<number | undefined>(undefined);
  const [refundReference, setRefundReference] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const [courierNameDraft, setCourierNameDraft] = useState("");
  const [trackingNumberDraft, setTrackingNumberDraft] = useState("");
  const [savingCourier, setSavingCourier] = useState(false);

  const [vatAmountDraft, setVatAmountDraft] = useState("");
  const [savingVat, setSavingVat] = useState(false);

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return getOrderAdmin(idToken, id).then((result) => {
          setOrder(result);
          setPaymentStatusDraft(result.paymentStatus);
          setRefundAmount(result.refundAmount);
          setRefundReference(result.refundReference ?? "");
          setCourierNameDraft(result.courierName ?? "");
          setTrackingNumberDraft(result.trackingNumber ?? "");
          setVatAmountDraft(result.vatAmount !== undefined && result.vatAmount !== null ? String(result.vatAmount) : "");
        });
      })
      .catch(() => setOrder(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(load, [load]);

  // The single path every status-changing control below goes through —
  // primary next-step button, the manual-correction dropdown, Cancel, and
  // Return alike — so there's exactly one place that calls the backend, one
  // place that guards against double submission, and one place that decides
  // what happens on success/failure.
  async function changeOrderStatus(target: OrderStatus, successMessage: string) {
    if (savingStatusTo) return; // already mid-mutation — ignore a second click from any control
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingStatusTo(target);
    try {
      const updated = await updateOrderStatus(idToken, id, target);
      setOrder(updated);
      toast.success(successMessage);
      setManualStatusOpen(false);
      setManualStatusDraft("");
    } catch (err) {
      // Failure leaves `order` untouched — no optimistic update to roll back.
      toast.error(err instanceof Error ? err.message : "Couldn't update the order status.");
    } finally {
      setSavingStatusTo(null);
    }
  }

  async function handleCancelOrder() {
    if (!order) return;
    const shortId = order._id.slice(-8).toUpperCase();
    const confirmed = await confirmToast(
      <>
        <p className="font-medium text-foreground">Cancel Order #{shortId}?</p>
        <p>The order will be marked cancelled and removed from the active fulfillment pipeline.</p>
        <p>Stock will be restored for every item in this order.</p>
        <p className="font-medium text-danger">This action cannot be undone.</p>
      </>,
      { confirmLabel: "Cancel Order", cancelLabel: "Keep Order", tone: "danger" }
    );
    if (!confirmed) return;
    await changeOrderStatus("cancelled", "Order cancelled.");
  }

  async function handleReturnOrder() {
    if (!order) return;
    const shortId = order._id.slice(-8).toUpperCase();
    const confirmed = await confirmToast(
      <>
        <p className="font-medium text-foreground">Mark Order #{shortId} as Returned?</p>
        <p>Stock will be restored for every item in this order.</p>
        <p className="font-medium text-danger">This action cannot be undone.</p>
      </>,
      { confirmLabel: "Confirm Return", cancelLabel: "Go Back", tone: "danger" }
    );
    if (!confirmed) return;
    await changeOrderStatus("returned", "Order marked as returned.");
  }

  async function handleSaveCourier() {
    if (!order) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingCourier(true);
    try {
      const updated = await updateOrderStatus(idToken, id, order.status, {
        courierName: courierNameDraft.trim() || undefined,
        trackingNumber: trackingNumberDraft.trim() || undefined,
      });
      setOrder(updated);
      toast.success("Courier details updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update courier details.");
    } finally {
      setSavingCourier(false);
    }
  }

  // Bookkeeping only — never recomputed from a rate, never touches
  // `order.total`. An empty field clears a previously-entered amount
  // (sends null) rather than silently coercing to 0.
  async function handleSaveVat() {
    const idToken = await getIdToken();
    if (!idToken) return;
    const trimmed = vatAmountDraft.trim();
    if (trimmed && (!Number.isFinite(Number(trimmed)) || Number(trimmed) < 0)) {
      toast.error("VAT amount must be zero or more.");
      return;
    }
    setSavingVat(true);
    try {
      const updated = await updateOrderVat(idToken, id, trimmed ? Number(trimmed) : null);
      setOrder(updated);
      toast.success("VAT amount saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the VAT amount.");
    } finally {
      setSavingVat(false);
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

  // Everything below derives from this one shared list — the same
  // NEXT_STATUSES the backend enforces on every write (orderStatusStyles.ts
  // mirrors Order.ts) — so the primary action, the manual-correction
  // dropdown, and the Cancel/Return buttons can never offer a transition the
  // backend would reject.
  const nextStatuses = NEXT_STATUSES[order.status];
  const normalNextStatus = nextStatuses.find((s) => s !== "cancelled" && s !== "returned") ?? null;
  const canCancel = nextStatuses.includes("cancelled");
  const canReturn = nextStatuses.includes("returned");
  const isFinal = nextStatuses.length === 0;
  const busy = savingStatusTo !== null;

  return (
    <>
    <div className="max-w-4xl print:hidden">
      <Link href="/admin/orders" className="mb-3 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Orders
      </Link>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {formatStatusLabel(order.source)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
          >
            <FaPrint className="h-3.5 w-3.5" />
            Print packing slip
          </button>
          <span className={`rounded px-3 py-1 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
            {formatStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4">
          <SectionLabel>Customer</SectionLabel>
          {/* recipientName is who the delivery is actually for — the
              primary line delivery staff need. Falls back to the account
              name for orders placed before this field existed. */}
          <p className="text-sm font-medium">{order.recipientName ?? order.customer?.name ?? "Deleted user"}</p>
          {order.recipientName && (
            <p className="text-xs text-muted-foreground">Account: {order.customer?.name ?? "Deleted user"}</p>
          )}
          <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
          <p className="text-sm text-muted-foreground">{order.phone}</p>
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <SectionLabel>Delivery address</SectionLabel>
          <p className="text-sm">{order.deliveryAddress.detailedAddress}</p>
          <p className="text-sm text-muted-foreground">
            {order.deliveryAddress.area}, {order.deliveryAddress.district}, {order.deliveryAddress.division}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{DELIVERY_ZONE_LABEL[order.deliveryZone]}</p>
          {order.deliveryNote && (
            <p className="mt-2 rounded border border-dashed border-border bg-background px-2 py-1.5 text-xs text-muted-foreground">
              Note: {order.deliveryNote}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border bg-surface p-4">
        <SectionLabel>Items</SectionLabel>
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

        {/* Separate from the arithmetic above on purpose — this is a
            bookkeeping record for the seller's own tax filing, not a charge
            to the customer, so it deliberately never touches Total. */}
        {isSuperAdmin ? (
          <div className="mt-3 border-t border-dashed border-border pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">VAT (bookkeeping only)</p>
                <p className="text-xs text-muted-foreground">For your own tax records — doesn&apos;t affect the total above.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={vatAmountDraft}
                  onChange={(e) => setVatAmountDraft(e.target.value)}
                  placeholder="0"
                  disabled={savingVat}
                  className={`${inputClass} w-28 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={handleSaveVat}
                  disabled={savingVat || vatAmountDraft.trim() === (order.vatAmount !== undefined && order.vatAmount !== null ? String(order.vatAmount) : "")}
                  className="rounded border border-border px-3 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingVat ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          order.vatAmount !== undefined &&
          order.vatAmount !== null && (
            <div className="mt-3 flex justify-between border-t border-dashed border-border pt-3 text-sm">
              <span className="text-muted-foreground">VAT (records only)</span>
              <span>৳{order.vatAmount.toLocaleString()}</span>
            </div>
          )
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-md border border-border bg-surface p-4">
          <SectionLabel>Tracking timeline</SectionLabel>
          <OrderTimeline
            statusHistory={order.statusHistory}
            currentStatus={order.status}
            createdAt={order.createdAt}
            courierName={order.courierName}
            trackingNumber={order.trackingNumber}
          />

          {/* Normal progression: one prominent action for the next step in
              the pipeline — cancel/return are deliberately never offered
              here, so this area never reads as a place to do something
              destructive. */}
          {normalNextStatus && (
            <button
              type="button"
              onClick={() =>
                changeOrderStatus(normalNextStatus, `Order marked as ${formatStatusLabel(normalNextStatus)}.`)
              }
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {savingStatusTo === normalNextStatus
                ? "Updating…"
                : `${PRIMARY_ACTION_LABEL[normalNextStatus] ?? `Mark as ${formatStatusLabel(normalNextStatus)}`} →`}
            </button>
          )}
          {!normalNextStatus && !isFinal && (
            <p className="mt-4 text-sm font-medium text-green-700">✓ Order delivered</p>
          )}
          {isFinal && <p className="mt-4 text-xs text-muted-foreground">This order is in a final state.</p>}

          {/* Secondary, de-emphasized escape hatch for a legitimate manual
              correction — same NEXT_STATUSES-derived options as the primary
              action above, just a plainer control rather than a second
              prominent button. */}
          {normalNextStatus && (
            <div className="mt-3">
              {!manualStatusOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setManualStatusOpen(true);
                    setManualStatusDraft(normalNextStatus);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Change status manually
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={manualStatusDraft}
                    onChange={(e) => setManualStatusDraft(e.target.value as OrderStatus)}
                    disabled={busy}
                    className="rounded border border-border bg-surface px-2 py-1.5 text-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                  >
                    {nextStatuses
                      .filter((s) => s !== "cancelled" && s !== "returned")
                      .map((s) => (
                        <option key={s} value={s}>
                          {formatStatusLabel(s)}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      manualStatusDraft &&
                      changeOrderStatus(manualStatusDraft, `Order marked as ${formatStatusLabel(manualStatusDraft)}.`)
                    }
                    disabled={busy || !manualStatusDraft}
                    className="rounded border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingStatusTo === manualStatusDraft ? "Applying…" : "Apply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatusOpen(false)}
                    disabled={busy}
                    className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <SectionLabel>Courier &amp; tracking</SectionLabel>
          <div className="space-y-2">
            <input
              value={courierNameDraft}
              onChange={(e) => setCourierNameDraft(e.target.value)}
              placeholder="Courier name (e.g. Pathao, Sundarban)"
              className={`${inputClass} w-full`}
            />
            <input
              value={trackingNumberDraft}
              onChange={(e) => setTrackingNumberDraft(e.target.value)}
              placeholder="Tracking number"
              className={`${inputClass} w-full`}
            />
            <button
              type="button"
              onClick={handleSaveCourier}
              disabled={
                savingCourier ||
                (courierNameDraft === (order.courierName ?? "") && trackingNumberDraft === (order.trackingNumber ?? ""))
              }
              className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save courier details
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-danger/30 bg-surface p-4">
          <SectionLabel>Order actions</SectionLabel>
          {canCancel || canReturn ? (
            <div className="flex flex-wrap gap-2">
              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={busy}
                  className="rounded border border-danger/40 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingStatusTo === "cancelled" ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
              {canReturn && (
                <button
                  type="button"
                  onClick={handleReturnOrder}
                  disabled={busy}
                  className="rounded border border-danger/40 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingStatusTo === "returned" ? "Marking returned…" : "Mark as Returned"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No cancellation or return is available for this order.</p>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <SectionLabel>Payment</SectionLabel>
          <p className="mb-2 text-xs text-muted-foreground">
            {PAYMENT_METHOD_LABEL[order.paymentMethod]}
            {order.paymentTransactionId && ` · Ref: ${order.paymentTransactionId}`}
            {order.paymentSenderNumber && ` · From: ${order.paymentSenderNumber}`}
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
            <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}>
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
            className="mt-3 rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save payment status
          </button>
        </div>
      </div>
    </div>

    <PackingSlip order={order} />
    </>
  );
}
