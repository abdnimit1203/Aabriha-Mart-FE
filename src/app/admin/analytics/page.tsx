"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useAuth } from "@/context/AuthContext";
import { getAnalyticsAdmin, AnalyticsRange } from "@/lib/admin/analytics";
import { Analytics } from "@/types/analytics";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { ReceiptIcon, ChartIcon, UsersIcon, BoxesIcon, SpinnerIcon } from "@/components/icons";
import { STATUS_CLASS, formatStatusLabel } from "@/app/admin/orders/orderStatusStyles";
import { OrderStatus } from "@/types/order";

const DAY_OPTIONS = [7, 30, 90] as const;

const PIPELINE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: number, year: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function trendPointLabel(date: string, days: number): string {
  // A 7-day range reads better as weekday names; longer ranges need the
  // actual date since the same weekday repeats many times over.
  return new Date(date).toLocaleDateString("en-GB", days <= 7 ? { weekday: "short", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" });
}

function TrendTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload as { date: string; revenue: number; orders: number };
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">৳{day.revenue.toLocaleString()}</p>
      <p className="text-muted-foreground">
        {day.orders} order{day.orders !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeletons — sized to match each card's real content, not a generic box, so
// the page's shape is recognizable the instant it starts loading.
// ---------------------------------------------------------------------------

function TrendCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-1 h-4 w-28 animate-pulse rounded bg-background" />
      <div className="mb-5 h-3 w-56 animate-pulse rounded bg-background" />
      <div className="h-64 animate-pulse rounded-lg bg-background" />
    </div>
  );
}

function TopProductsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-background" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-background" />
        ))}
      </div>
    </div>
  );
}

function OrderStatusSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-background" />
      <div className="h-2 animate-pulse rounded-full bg-background" />
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-5 animate-pulse rounded-full bg-background" />
        ))}
      </div>
    </div>
  );
}

function NewVsReturningSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-1 h-4 w-48 animate-pulse rounded bg-background" />
      <div className="mb-4 h-3 w-64 animate-pulse rounded bg-background" />
      <div className="h-3 animate-pulse rounded-full bg-background" />
      <div className="mt-3 flex gap-6">
        <div className="h-4 w-20 animate-pulse rounded bg-background" />
        <div className="h-4 w-24 animate-pulse rounded bg-background" />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { getIdToken } = useAuth();
  const [rangeMode, setRangeMode] = useState<"days" | "month">("days");
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(30);
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [data, setData] = useState<Analytics | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const range: AnalyticsRange =
    rangeMode === "month"
      ? (() => {
          const [yearStr, monthStr] = monthValue.split("-");
          return { mode: "month", year: Number(yearStr), month: Number(monthStr) };
        })()
      : { mode: "days", days };

  const load = useCallback(() => {
    const thisRequest = ++requestId.current;
    setFetching(true);
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return getAnalyticsAdmin(idToken, range).then((res) => {
          if (thisRequest !== requestId.current) return; // a newer request already superseded this one
          setData(res);
          setError(false);
        });
      })
      .catch(() => {
        if (thisRequest !== requestId.current) return;
        setError(true);
        // A failed refetch keeps whatever was already on screen — only a
        // first-ever load with nothing to show falls back to the full error
        // card below. A subsequent failure just toasts, so a transient blip
        // never wipes a working page. Read via the functional form rather
        // than the outer `data` closure so this is correct regardless of
        // exactly when `load` was last recreated relative to `data` changing.
        setData((prev) => {
          if (prev !== null) toast.error("Couldn't refresh analytics — showing the last loaded data.");
          return prev;
        });
      })
      .finally(() => {
        if (thisRequest === requestId.current) setFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeMode, days, monthValue]);

  // Genuine exception to the "no setState in an effect" rule (same as
  // DashboardHeader's clock): flipping the loading flag the instant a fetch
  // starts is the whole point here, not a sign the effect is unnecessary.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [load]);

  const chartData = data?.trend.map((d) => ({ ...d, label: trendPointLabel(d.date, data.days) })) ?? [];
  const pipelineTotal = data ? PIPELINE_STATUSES.reduce((sum, s) => sum + data.statusCounts[s], 0) || 1 : 1;
  const totalCustomersInRange = (data?.newCustomers ?? 0) + (data?.returningCustomers ?? 0);

  const rangeDescription = data
    ? data.range === "month" && data.month && data.year
      ? monthLabel(data.month, data.year)
      : `the last ${data.days} days`
    : "…";

  const isInitialLoad = data === null && fetching;
  const isInitialError = data === null && !fetching && error;

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description={
          <span className="flex items-center gap-1.5">
            Store performance over time.
            {fetching && data !== null && <SpinnerIcon className="h-3.5 w-3.5 text-muted-foreground" />}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
              {DAY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={fetching}
                  onClick={() => {
                    setRangeMode("days");
                    setDays(option);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    rangeMode === "days" && days === option ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
                  }`}
                >
                  {option}d
                </button>
              ))}
              <button
                type="button"
                disabled={fetching}
                onClick={() => setRangeMode("month")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  rangeMode === "month" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
                }`}
              >
                Month
              </button>
            </div>
            {rangeMode === "month" && (
              <input
                type="month"
                value={monthValue}
                disabled={fetching}
                onChange={(e) => setMonthValue(e.target.value)}
                max={currentMonthValue()}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              />
            )}
          </div>
        }
      />

      {isInitialError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">!</div>
          <p className="text-sm font-medium text-foreground">Couldn&apos;t load analytics</p>
          <button type="button" onClick={load} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            Retry
          </button>
        </div>
      ) : isInitialLoad ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TrendCardSkeleton />
            <TopProductsSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OrderStatusSkeleton />
            <NewVsReturningSkeleton />
          </div>
        </>
      ) : (
        data && (
          <div className={fetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={<span className="text-base font-semibold leading-none">৳</span>} label="Revenue" value={`৳${data.summary.revenue.toLocaleString()}`} />
              <StatCard icon={<ReceiptIcon className="h-4.5 w-4.5" />} label="Orders" value={String(data.summary.orders)} />
              <StatCard
                icon={<ChartIcon className="h-4.5 w-4.5" />}
                label="Avg. Order Value"
                value={`৳${Math.round(data.summary.averageOrderValue).toLocaleString()}`}
              />
              <StatCard icon={<UsersIcon className="h-4.5 w-4.5" />} label="New Customers" value={String(data.newCustomers)} />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground">Revenue Trend</h2>
                <p className="mb-5 text-xs text-muted-foreground">Daily order revenue, in ৳, over {rangeDescription}.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }} barCategoryGap={data.days <= 7 ? "30%" : "10%"}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        interval={data.days > 7 ? Math.ceil(data.days / 10) : 0}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        tickFormatter={(value: number) => (value >= 1000 ? `৳${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `৳${value}`)}
                        allowDecimals={false}
                      />
                      <Tooltip content={TrendTooltip} cursor={{ fill: "var(--color-background)" }} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={24} fill="var(--color-primary-strong)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Top Products</h2>
                {data.topProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-1 py-8 text-center">
                    <BoxesIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No sales in this period yet.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {data.topProducts.map((p) => (
                      <Link key={p._id} href={`/admin/products/${p._id}/edit`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover" />
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded-lg border border-dashed border-border" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.unitsSold} sold</p>
                        </div>
                        <span className="shrink-0 text-sm font-medium">৳{p.revenue.toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Order Status</h2>
                <div className="flex h-2 overflow-hidden rounded-full bg-background">
                  {PIPELINE_STATUSES.map((status, i) => {
                    const count = data.statusCounts[status];
                    if (count === 0) return null;
                    const OPACITY = ["bg-primary/30", "bg-primary/40", "bg-primary/50", "bg-primary/60", "bg-primary/70", "bg-primary/85", "bg-primary"];
                    return (
                      <div
                        key={status}
                        title={`${formatStatusLabel(status)}: ${count}`}
                        style={{ width: `${(count / pipelineTotal) * 100}%` }}
                        className={`h-full ${OPACITY[i]} first:rounded-l-full last:rounded-r-full`}
                      />
                    );
                  })}
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  {PIPELINE_STATUSES.map((status) => (
                    <li key={status} className="flex items-center justify-between gap-2 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[status]}`}>
                        {formatStatusLabel(status)}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{data.statusCounts[status]}</span>
                    </li>
                  ))}
                </ul>
                {(data.statusCounts.cancelled > 0 || data.statusCounts.returned > 0) && (
                  <div className="mt-4 flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>Cancelled: {data.statusCounts.cancelled}</span>
                    <span>Returned: {data.statusCounts.returned}</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground">New vs. Returning Customers</h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  Based on whether each customer&apos;s first-ever order fell inside {rangeDescription}.
                </p>
                {totalCustomersInRange === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders in this period yet.</p>
                ) : (
                  <>
                    <div className="flex h-3 overflow-hidden rounded-full bg-background">
                      <div
                        style={{ width: `${(data.newCustomers / totalCustomersInRange) * 100}%` }}
                        className="h-full rounded-l-full bg-success"
                      />
                      <div
                        style={{ width: `${(data.returningCustomers / totalCustomersInRange) * 100}%` }}
                        className="h-full rounded-r-full bg-primary-strong"
                      />
                    </div>
                    <div className="mt-3 flex gap-6 text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-success" /> New — {data.newCustomers}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-strong" /> Returning — {data.returningCustomers}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
