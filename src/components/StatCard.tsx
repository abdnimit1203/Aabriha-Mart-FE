import Link from "next/link";

/** Shared KPI tile — used by the admin Dashboard and Analytics pages so both
 * present numbers with the same visual weight instead of two near-identical
 * hand-rolled cards. */
export function StatCard({
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

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 h-9 w-9 animate-pulse rounded-lg bg-background" />
      <div className="h-7 w-16 animate-pulse rounded bg-background" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-background" />
    </div>
  );
}
