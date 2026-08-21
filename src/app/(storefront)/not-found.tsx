import Link from "next/link";

// Lives inside (storefront)'s route group, so it automatically gets the
// same AnnouncementBar/Header/Footer/WhatsApp/MobileBottomNav chrome as
// every other storefront page — a lost link still feels like the same
// site, not a dead end outside it.
export default function StorefrontNotFound() {
  return (
    <main className="mx-auto flex max-w-350 flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="font-logo text-7xl font-semibold text-primary/25 sm:text-8xl">404</span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">This page wandered off</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        The link you followed may be old or the page may have moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong"
        >
          Back to Home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-medium hover:bg-background"
        >
          Browse Products
        </Link>
      </div>
    </main>
  );
}
