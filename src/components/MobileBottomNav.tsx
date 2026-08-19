"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { HomeIcon, GridIcon, CartIcon, UserIcon } from "@/components/icons";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
      active ? "text-primary-strong" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex items-center justify-around">
        <Link href="/" className={itemClass(pathname === "/")}>
          <HomeIcon className="h-5 w-5" />
          Home
        </Link>
        <Link href="/categories" className={itemClass(pathname.startsWith("/categories"))}>
          <GridIcon className="h-5 w-5" />
          Categories
        </Link>

        {/* Opens the cart drawer as a bottom sheet instead of navigating away —
            keeps the shopper on whatever page they were browsing. */}
        <button type="button" onClick={openDrawer} className={itemClass(false)}>
          <span className="relative">
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary-strong px-0.5 text-[9px] font-medium text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </span>
          Cart
        </button>

        <Link href="/account" className={itemClass(pathname.startsWith("/account"))}>
          <UserIcon className="h-5 w-5" />
          Account
        </Link>
      </div>
    </nav>
  );
}
