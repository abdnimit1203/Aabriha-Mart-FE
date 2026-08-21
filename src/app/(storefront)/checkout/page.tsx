"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { FaMoneyBillWave, FaCreditCard, FaCheck, FaLocationDot } from "react-icons/fa6";
import { ChevronIcon } from "@/components/icons";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { BD_DIVISIONS, districtsForDivision } from "@/data/bd-locations";
import { getCheckoutSummary, createStripeIntent, createOrder } from "@/lib/orders";
import { stripePromise } from "@/lib/stripe";
import { StripeCardSection } from "@/components/StripeCardSection";
import { CheckoutItemInput, CheckoutSummary, Order, PaymentMethod } from "@/types/order";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; logo?: string }[] = [
  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
  { value: "bkash", label: "bKash", description: "Send money via the bKash app", logo: "/logo-bkash.png" },
  { value: "nagad", label: "Nagad", description: "Send money via the Nagad app", logo: "/logo-nagad.png" },
  { value: "stripe", label: "Card", description: "Pay securely with a debit or credit card" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, loading, getIdToken } = useAuth();
  const { items, subtotal, hydrated, clearCart } = useCart();

  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [transactionId, setTransactionId] = useState("");
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  // Placing an order clears the cart before navigating away — set so the
  // "cart is empty" redirect below doesn't hijack that navigation back to /cart.
  const [orderPlaced, setOrderPlaced] = useState(false);
  // Tracks which profile the form fields were last prefilled from, so a
  // freshly loaded profile can populate the form during render.
  const [prefilledFromId, setPrefilledFromId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (hydrated && items.length === 0 && !orderPlaced) router.replace("/cart");
  }, [hydrated, items.length, orderPlaced, router]);

  if (profile && profile._id !== prefilledFromId) {
    setPrefilledFromId(profile._id);
    setDivision(profile.defaultAddress?.division ?? "");
    setDistrict(profile.defaultAddress?.district ?? "");
    setArea(profile.defaultAddress?.area ?? "");
    setDetailedAddress(profile.defaultAddress?.detailedAddress ?? "");
    setPhone(profile.phone);
  }

  const cartItemInputs = useMemo<CheckoutItemInput[]>(
    () => items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    [items]
  );
  const address = useMemo(() => ({ division, district, area, detailedAddress }), [division, district, area, detailedAddress]);
  const addressComplete = Boolean(division && district && area && detailedAddress);
  const canQuote = addressComplete && items.length > 0;
  const displaySummary = canQuote ? summary : null;

  useEffect(() => {
    if (!canQuote) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const idToken = await getIdToken();
      if (!idToken || cancelled) return;
      setSummaryLoading(true);
      try {
        const result = await getCheckoutSummary(idToken, { items: cartItemInputs, address });
        if (!cancelled) setSummary(result);
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // getIdToken isn't memoized; cartItemInputs/address are stringified since
    // their identities change every render despite equal content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuote, JSON.stringify(cartItemInputs), JSON.stringify(address)]);

  // PaymentElement needs a clientSecret up front (unlike the old CardElement),
  // so the intent is created as soon as pricing is known for Stripe — and
  // recreated whenever price-relevant state changes, so it can't go stale.
  const wantsStripeIntent = paymentMethod === "stripe" && Boolean(displaySummary);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const displayClientSecret = wantsStripeIntent ? clientSecret : null;

  useEffect(() => {
    if (!wantsStripeIntent) return;
    let cancelled = false;
    (async () => {
      const idToken = await getIdToken();
      if (!idToken || cancelled) return;
      try {
        const intent = await createStripeIntent(idToken, { items: cartItemInputs, address });
        if (!cancelled) setClientSecret(intent.clientSecret);
      } catch {
        if (!cancelled) setClientSecret(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsStripeIntent, JSON.stringify(cartItemInputs), JSON.stringify(address)]);

  function handleOrderPlaced(order: Order) {
    setOrderPlaced(true);
    clearCart();
    toast.success("Order placed!");
    router.push(`/orders/${order._id}`);
  }

  async function handlePlaceOrder() {
    if (!displaySummary || !phone) return;
    if (paymentMethod !== "cod" && !transactionId && paymentMethod !== "stripe") {
      toast.error("Enter the transaction ID from your payment.");
      return;
    }

    const idToken = await getIdToken();
    if (!idToken) return;

    setPlacing(true);
    try {
      const order = await createOrder(idToken, {
        items: cartItemInputs,
        address,
        phone,
        paymentMethod,
        transactionId: paymentMethod === "bkash" || paymentMethod === "nagad" ? transactionId : undefined,
      });
      handleOrderPlaced(order);
    } catch {
      toast.error("Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading || !hydrated || items.length === 0) {
    return (
      <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
        <div className="h-6 w-40 animate-pulse rounded bg-surface" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">Checkout</h1>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Delivery address</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="division" className="mb-1 block text-sm font-medium">
                    Division
                  </label>
                  <div className="relative">
                    <select
                      id="division"
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value);
                        setDistrict("");
                      }}
                      className={`${inputClass} appearance-none pr-8`}
                    >
                      <option value="">Select division</option>
                      {BD_DIVISIONS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label htmlFor="district" className="mb-1 block text-sm font-medium">
                    District
                  </label>
                  <div className="relative">
                    <select
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!division}
                      className={`${inputClass} appearance-none pr-8 disabled:opacity-50`}
                    >
                      <option value="">Select district</option>
                      {districtsForDivision(division).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="area" className="mb-1 block text-sm font-medium">
                  Area
                </label>
                <input id="area" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label htmlFor="detailedAddress" className="mb-1 block text-sm font-medium">
                  Detailed address
                </label>
                <textarea
                  id="detailedAddress"
                  rows={2}
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              {displaySummary && (
                <div
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                    displaySummary.deliveryZone === "inside_dhaka"
                      ? "border-primary-strong bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <FaLocationDot className="h-4 w-4 shrink-0 text-primary-strong" />
                  <span>
                    Delivery zone:{" "}
                    <span className="font-medium text-foreground">
                      {displaySummary.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                    </span>{" "}
                    — please confirm this looks right.
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Payment method</h2>
            <div className="mt-4 space-y-2">
              {PAYMENT_METHODS.map((m) => {
                const selected = paymentMethod === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      selected ? "border-primary-strong bg-primary/10" : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        selected ? "bg-primary-strong text-white" : "border border-border"
                      }`}
                    >
                      {selected && <FaCheck className="h-2.5 w-2.5" />}
                    </span>

                    {m.logo ? (
                      <span className="flex h-8 w-20 shrink-0 items-center justify-center rounded-md bg-white p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo} alt={m.label} className="max-h-full max-w-full object-contain" />
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface text-primary-strong">
                        {m.value === "cod" ? <FaMoneyBillWave className="h-4 w-4" /> : <FaCreditCard className="h-4 w-4" />}
                      </span>
                    )}

                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{m.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-background p-3">
                <p className="text-sm">
                  Send ৳{displaySummary?.total.toLocaleString() ?? "—"} to{" "}
                  <span className="font-medium">
                    {(paymentMethod === "bkash"
                      ? process.env.NEXT_PUBLIC_BKASH_NUMBER
                      : process.env.NEXT_PUBLIC_NAGAD_NUMBER) || "not configured yet — contact the seller"}
                  </span>{" "}
                  via {paymentMethod === "bkash" ? "bKash" : "Nagad"} &ldquo;Send Money&rdquo;, then enter the transaction ID below.
                </p>
                <div>
                  <label htmlFor="transactionId" className="mb-1 block text-sm font-medium">
                    Transaction ID
                  </label>
                  <input
                    id="transactionId"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "stripe" && (
              <div className="mt-5">
                {displaySummary && displayClientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret: displayClientSecret }}>
                    <StripeCardSection
                      items={cartItemInputs}
                      address={address}
                      phone={phone}
                      summary={displaySummary}
                      onSuccess={handleOrderPlaced}
                    />
                  </Elements>
                ) : displaySummary ? (
                  <p className="text-sm text-muted-foreground">Preparing payment…</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete your address above to continue to payment.</p>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Order summary</h2>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "simple"}`} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">
                        {Object.values(item.attributes).filter(Boolean).join(" • ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">৳{(item.unitPrice * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {!addressComplete
                    ? "Enter address"
                    : summaryLoading
                      ? "Calculating…"
                      : displaySummary
                        ? `৳${displaySummary.deliveryCharge.toLocaleString()}`
                        : "—"}
                </span>
              </div>
              {displaySummary && (
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>৳{displaySummary.total.toLocaleString()}</span>
                </div>
              )}
            </div>

            {paymentMethod !== "stripe" && (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!displaySummary || !phone || placing}
                className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? "Placing order…" : `Place Order — ৳${displaySummary?.total.toLocaleString() ?? "—"}`}
              </button>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
