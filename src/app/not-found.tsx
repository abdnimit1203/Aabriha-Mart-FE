import Link from "next/link";

// Root-level fallback — catches a URL that doesn't match any route at all
// (so no route group's own not-found.tsx, like (storefront)'s, ever gets a
// chance to render). Standalone since it renders outside any route group's
// layout, but kept visually consistent with the storefront's version.
export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-20 text-center text-foreground">
      <span className="font-logo text-7xl font-semibold text-primary/25 sm:text-8xl">404</span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">This page wandered off</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        The link you followed may be old or the page may have moved. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong"
      >
        Back to Home
      </Link>
    </main>
  );
}
