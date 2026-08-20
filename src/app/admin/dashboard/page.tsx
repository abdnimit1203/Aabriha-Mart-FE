import Link from "next/link";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ReceiptIcon } from "@/components/icons";

export default function AdminDashboardPage() {
  return (
    <div>
      <AdminPageHeader title="Dashboard" description="An overview of today's operations." />
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Dashboard metrics are coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Today&apos;s orders, revenue, and low-stock alerts will show up here. In the meantime, head to Orders to manage
          incoming orders.
        </p>
        <Link
          href="/admin/orders"
          className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
        >
          Go to Orders
        </Link>
      </div>
    </div>
  );
}
