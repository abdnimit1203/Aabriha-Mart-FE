"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GridIcon, FilterIcon, CartIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/admin/orders", label: "Orders", icon: CartIcon },
  { href: "/admin/products", label: "Products", icon: GridIcon },
  { href: "/admin/categories", label: "Categories", icon: FilterIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = profile?.role === "super_admin";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (profile && !isAdmin) {
      router.replace("/");
    }
  }, [loading, user, profile, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-border bg-surface sm:flex sm:w-56 sm:flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="text-lg font-semibold">Dashboard</p>
          <p className="text-xs text-muted-foreground">Aabriha Mart</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-white" : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="sticky top-0 z-20 border-b border-border bg-surface sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-base font-semibold">Dashboard</p>
          <Link href="/" className="text-xs text-muted-foreground hover:underline">
            Back to site
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
