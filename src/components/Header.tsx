"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";
import { CartButton } from "@/components/CartButton";
import { MobileSearchButton } from "@/components/MobileSearchButton";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/offers", label: "Offers" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-350 items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            priority
          />
          <span className="font-logo text-lg font-normal tracking-wide sm:text-xl">Aabriha Mart</span>
        </Link>

        {/* Absolutely centered on the header's own width, not the leftover
           space between logo and icons — so it stays dead-center regardless
           of how wide either side is. A frosted "glass" pill (blur + border
           + shadow) rather than plain inline links. */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/70 p-1.5 shadow-sm backdrop-blur-md md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-base font-medium transition-colors ${
                  active ? "bg-primary text-white" : "hover:bg-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <MobileSearchButton />
          <AccountMenu />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
