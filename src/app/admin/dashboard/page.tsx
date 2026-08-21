"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getDashboardSummary, DashboardSummary, DashboardTrendDay } from "@/lib/admin/dashboard";
import { listOrdersAdmin } from "@/lib/admin/orders";
import { listProductsAdmin } from "@/lib/admin/products";
import { AdminOrder, OrderStatus } from "@/types/order";
import { Product } from "@/types/catalog";
import { StockBadge } from "@/components/StockBadge";
import { productLevel, totalStock } from "@/lib/stockLevel";
import { STATUS_CLASS, PAYMENT_METHOD_LABEL, formatStatusLabel } from "@/app/admin/orders/orderStatusStyles";
import { ReceiptIcon, BellIcon, BoxesIcon, GridIcon, TagIcon, ClockIcon } from "@/components/icons";

// ---------------------------------------------------------------------------
// Header — a dark hero card (greeting, live clock/date chip, a one-line
// operational note, a gradient CTA) rather than a plain title — this is the
// one place on the page that earns a heavier visual treatment, the same way
// a "vault health" dashboard leads with a hero card before settling into
// plain data cards. The notification bell already lives in the admin
// topbar (admin/layout.tsx) — not duplicated here.
// ---------------------------------------------------------------------------

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function greetingEmoji(hour: number): string {
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

function DashboardHeader({
  username,
  role,
  pendingOrders,
}: {
  username: string;
  role: "super_admin" | "order_manager";
  pendingOrders: number | null;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Genuine exception to the "no setState in an effect" rule (matches
    // admin/layout.tsx's localStorage read): the current wall-clock time is
    // an external system the server can't see, so it can only be read after
    // mount — computing it during render would mismatch SSR's render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const cta = role === "super_admin" ? { href: "/admin/products/new", label: "Add Product" } : { href: "/admin/orders", label: "View Orders" };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b0d16] to-[#111a2e] p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{now ? greetingEmoji(now.getHours()) : "👋"}</span>
            <h1 className="text-xl font-semibold text-white">
              {now ? greetingForHour(now.getHours()) : "Welcome"}, {username}!
            </h1>
          </div>

          {now && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
              <ClockIcon className="h-3 w-3" />
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}

          <p className="mt-2.5 text-sm text-white/60">
            {pendingOrders === null
              ? "Loading today's operations…"
              : pendingOrders > 0
                ? `${pendingOrders} order${pendingOrders !== 1 ? "s" : ""} waiting on confirmation.`
                : "All orders are confirmed — nothing waiting on you."}
          </p>
        </div>

        <Link
          href={cta.href}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-strong px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-strong/30 transition-transform hover:scale-[1.02]"
        >
          <span className="text-base leading-none">+</span> {cta.label}
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI cards (unchanged from the first pass)
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  href,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  tone?: "default" | "warning";
}) {
  const content = (
    <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/40">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          tone === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-primary/10 text-primary-strong"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 h-9 w-9 animate-pulse rounded-lg bg-background" />
      <div className="h-7 w-16 animate-pulse rounded bg-background" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-background" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick actions — role-gated: Order Manager can't create products/categories,
// so those two shortcuts simply aren't rendered for that role (same rule the
// nav sidebar already enforces, backend still the actual authority).
// ---------------------------------------------------------------------------

function QuickActions({ role }: { role: "super_admin" | "order_manager" }) {
  const actions = [
    { href: "/admin/products/new", label: "Add Product", icon: GridIcon, roles: ["super_admin"] },
    { href: "/admin/categories/new", label: "Add Category", icon: TagIcon, roles: ["super_admin"] },
    { href: "/admin/orders", label: "View Orders", icon: ReceiptIcon, roles: ["super_admin", "order_manager"] },
    { href: "/admin/inventory", label: "Inventory", icon: BoxesIcon, roles: ["super_admin", "order_manager"] },
  ].filter((a) => a.roles.includes(role));

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent Orders
// ---------------------------------------------------------------------------

function formatOrderDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function formatOrderTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function RecentOrdersCard() {
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return null;
        setError(false);
        return listOrdersAdmin(idToken, { limit: 8 });
      })
      .then((res) => {
        if (res) setOrders(res.orders);
      })
      .catch(() => setError(true));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
        <Link href="/admin/orders" className="text-xs font-medium text-primary-strong hover:underline">
          View all
        </Link>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load recent orders.</p>
          <button type="button" onClick={load} className="text-sm font-medium text-primary-strong hover:underline">
            Retry
          </button>
        </div>
      ) : orders === null ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-background" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-150 border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2.5 pl-5 pr-3 font-medium">Order</th>
                  <th className="py-2.5 pr-3 font-medium">Customer</th>
                  <th className="py-2.5 pr-3 font-medium">Amount</th>
                  <th className="py-2.5 pr-3 font-medium">Payment</th>
                  <th className="py-2.5 pr-3 font-medium">Status</th>
                  <th className="py-2.5 pr-5 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-black/1.5">
                    <td className="py-2.5 pl-5 pr-3">
                      <Link href={`/admin/orders/${order._id}`} className="font-medium text-primary-strong hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3">{order.customer?.username ?? order.phone}</td>
                    <td className="py-2.5 pr-3 font-medium">৳{order.total.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-5 text-xs text-muted-foreground">
                      {formatOrderDate(order.createdAt)}, {formatOrderTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 p-3 sm:hidden">
            {orders.map((order) => (
              <Link key={order._id} href={`/admin/orders/${order._id}`} className="block rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-strong">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[order.status]}`}>
                    {formatStatusLabel(order.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{order.customer?.username ?? order.phone}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {PAYMENT_METHOD_LABEL[order.paymentMethod]} · {formatOrderDate(order.createdAt)}, {formatOrderTime(order.createdAt)}
                  </span>
                  <span className="font-medium text-foreground">৳{order.total.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Needs Attention — actual products, not just a count
// ---------------------------------------------------------------------------

function NeedsAttentionCard() {
  const { getIdToken } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return null;
        setError(false);
        return listProductsAdmin({ stockStatus: "needs_attention", limit: 5 });
      })
      .then((res) => {
        if (res) setProducts(res.products);
      })
      .catch(() => setError(true));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Needs Attention</h2>
        <Link href="/admin/inventory" className="text-xs font-medium text-primary-strong hover:underline">
          View all
        </Link>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load inventory status.</p>
          <button type="button" onClick={load} className="text-sm font-medium text-primary-strong hover:underline">
            Retry
          </button>
        </div>
      ) : products === null ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-background" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
          <BoxesIcon className="h-6 w-6 text-green-600" />
          <p className="text-sm font-medium text-foreground">All inventory looks good.</p>
          <p className="text-xs text-muted-foreground">No products are low or out of stock right now.</p>
        </div>
      ) : (
        <div className="p-2">
          {products.map((product) => {
            const level = productLevel(product);
            const stock = totalStock(product);
            return (
              <Link
                key={product._id}
                href={`/admin/products/${product._id}/edit`}
                className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-background"
              >
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0].url} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover" />
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-lg border border-dashed border-border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{stock} in stock</p>
                </div>
                <StockBadge level={level} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order Status pipeline — real statuses, real order, no invented stages.
// cancelled/returned are terminal side-branches, shown separately.
// ---------------------------------------------------------------------------

const PIPELINE_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

// Ordinal encoding (this is a progress sequence, not a set of distinct
// identities) — one hue, light-to-solid across the 7 stages, using the
// app's own accent rather than seven arbitrary distinct colors.
const PIPELINE_OPACITY_CLASS = ["bg-primary/30", "bg-primary/40", "bg-primary/50", "bg-primary/60", "bg-primary/70", "bg-primary/85", "bg-primary"];

function OrderStatusPipeline({ statusCounts }: { statusCounts: Record<OrderStatus, number> }) {
  const pipelineTotal = PIPELINE_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0) || 1;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">Order Pipeline</h2>

      <div className="flex h-2 overflow-hidden rounded-full bg-background">
        {PIPELINE_STATUSES.map((status, i) => {
          const count = statusCounts[status];
          if (count === 0) return null;
          return (
            <div
              key={status}
              title={`${formatStatusLabel(status)}: ${count}`}
              style={{ width: `${(count / pipelineTotal) * 100}%` }}
              className={`h-full ${PIPELINE_OPACITY_CLASS[i]} first:rounded-l-full last:rounded-r-full`}
            />
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1">
        {PIPELINE_STATUSES.map((status) => (
          <li key={status} className="flex items-center justify-between gap-2 text-sm">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[status]}`}>
              {formatStatusLabel(status)}
            </span>
            <span className="tabular-nums text-muted-foreground">{statusCounts[status]}</span>
          </li>
        ))}
      </ul>

      {(statusCounts.cancelled > 0 || statusCounts.returned > 0) && (
        <div className="mt-4 flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>Cancelled: {statusCounts.cancelled}</span>
          <span>Returned: {statusCounts.returned}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7-day performance — single series (revenue), order count as a direct
// label rather than a second axis. Bars ≤24px, 4px rounded tops, hover
// tooltip carries the exact numbers; no legend needed for one series.
// ---------------------------------------------------------------------------

function WeeklyTrendChart({ days }: { days: DashboardTrendDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxRevenue = Math.max(...days.map((d) => d.revenue), 1);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-5 text-sm font-semibold text-foreground">Last 7 Days</h2>
      <div className="flex h-36 items-end justify-between gap-3">
        {days.map((day, i) => {
          const heightPct = Math.max(2, (day.revenue / maxRevenue) * 100);
          const isHovered = hovered === i;
          return (
            <div
              key={day.date}
              className="relative flex flex-1 flex-col items-center"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div className="absolute -top-14 z-10 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-lg">
                  <p className="font-medium text-foreground">৳{day.revenue.toLocaleString()}</p>
                  <p className="text-muted-foreground">{day.orders} order{day.orders !== 1 ? "s" : ""}</p>
                </div>
              )}
              <div className="flex h-28 w-full max-w-6 items-end justify-center">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm transition-colors ${isHovered ? "bg-primary-strong" : "bg-primary"}`}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {/* timeZone: "UTC" forces the weekday to come from the date
                   string as written (a Dhaka calendar day from the backend),
                   not re-shifted by the viewer's own browser timezone. */}
                {new Date(day.date).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { getIdToken, profile } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState(false);

  function load() {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return null;
        setError(false);
        return getDashboardSummary(idToken);
      })
      .then((result) => {
        if (result) setSummary(result);
      })
      .catch(() => setError(true));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const role = profile?.role === "super_admin" ? "super_admin" : "order_manager";

  return (
    <div>
      <DashboardHeader username={profile?.username ?? "Admin"} role={role} pendingOrders={summary?.pendingOrders ?? null} />

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load dashboard metrics</p>
          <button type="button" onClick={load} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {!summary ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard icon={<ReceiptIcon className="h-4.5 w-4.5" />} label="Today's Orders" value={String(summary.todayOrders)} href="/admin/orders" />
                <StatCard
                  icon={<span className="text-base font-semibold leading-none">৳</span>}
                  label="Today's Revenue"
                  value={`৳${summary.todayRevenue.toLocaleString()}`}
                  href="/admin/orders"
                />
                <StatCard
                  icon={<BellIcon className="h-4.5 w-4.5" />}
                  label="Pending Orders"
                  value={String(summary.pendingOrders)}
                  href="/admin/orders"
                  tone={summary.pendingOrders > 0 ? "warning" : "default"}
                />
                <StatCard
                  icon={<BoxesIcon className="h-4.5 w-4.5" />}
                  label="Needs Attention"
                  value={String(summary.needsAttentionCount)}
                  href="/admin/inventory"
                  tone={summary.needsAttentionCount > 0 ? "warning" : "default"}
                />
              </>
            )}
          </div>

          <QuickActions role={role} />

          <div className="mb-6">
            <RecentOrdersCard />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <NeedsAttentionCard />
            {summary && <OrderStatusPipeline statusCounts={summary.statusCounts} />}
          </div>

          {summary && <WeeklyTrendChart days={summary.last7Days} />}
        </>
      )}
    </div>
  );
}
