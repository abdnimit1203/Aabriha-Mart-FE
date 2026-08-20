import Link from "next/link";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ImageIcon, BellIcon } from "@/components/icons";

const SECTIONS = [
  { href: "/admin/storefront/hero-banners", label: "Hero Banners", icon: ImageIcon, description: "Slides shown in the homepage hero carousel." },
  { href: "/admin/storefront/promotions", label: "Promotions", icon: ImageIcon, description: "The campaign banner shown on the homepage." },
  { href: "/admin/storefront/announcement", label: "Announcement Bar", icon: BellIcon, description: "The site-wide message strip above the navbar." },
  { href: "/admin/storefront/welcome-popup", label: "Welcome Popup", icon: ImageIcon, description: "The first-visit promotional popup." },
];

export default function AdminStorefrontHomePage() {
  return (
    <div>
      <AdminPageHeader title="Storefront" description="Manage homepage content — Super Admin only." />
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
          >
            <section.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-strong" />
            <div>
              <p className="text-sm font-medium">{section.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
