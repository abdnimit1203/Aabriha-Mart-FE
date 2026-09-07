"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/lib/auth";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { NotificationBell } from "@/components/NotificationBell";
import { AdminSearch, AdminSearchItem } from "@/components/AdminSearch";


import {
  HomeIcon,
  ReceiptIcon,
  GridIcon,
  TagIcon,
  BoxesIcon,
  UsersIcon,
  ChartIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronIcon,
  CloseIcon,
  MenuIcon,
  ImageIcon,
  BellIcon,
  SearchIcon,
} from "@/components/icons";
import { FaStore } from "react-icons/fa";

type Role = "super_admin" | "order_manager";
type IconComponent = (props: { className?: string }) => React.ReactElement;

interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
  roles: Role[];
  soon?: boolean;
  viewOnlyFor?: Role[];
  /** Exact-match only for the active check — needed for an "index" item
   * whose href is itself a path prefix of its own sibling items (e.g.
   * /admin/storefront vs /admin/storefront/hero-banners), where a plain
   * startsWith would light up both at once. */
  exact?: boolean;
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon, roles: ["super_admin", "order_manager"] },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIcon, roles: ["super_admin", "order_manager"] },
  {
    href: "/admin/products",
    label: "Products",
    icon: GridIcon,
    roles: ["super_admin", "order_manager"],
    viewOnlyFor: ["order_manager"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: TagIcon,
    roles: ["super_admin", "order_manager"],
    viewOnlyFor: ["order_manager"],
  },
  { href: "/admin/inventory", label: "Inventory", icon: BoxesIcon, roles: ["super_admin", "order_manager"] },
];

// Super Admin only — Order Manager has no access to any storefront/CMS
// content, stricter than the per-item viewOnlyFor pattern used above (this
// whole group simply isn't in the filtered list for that role).
const STOREFRONT_NAV: NavItem[] = [
  { href: "/admin/storefront", label: "Homepage", icon: HomeIcon, roles: ["super_admin"], exact: true },
  { href: "/admin/storefront/hero-banners", label: "Hero Banners", icon: ImageIcon, roles: ["super_admin"] },
  { href: "/admin/storefront/promotions", label: "Promotions", icon: ImageIcon, roles: ["super_admin"] },
  { href: "/admin/storefront/testimonials", label: "Testimonials", icon: ImageIcon, roles: ["super_admin"] },
  { href: "/admin/storefront/announcement", label: "Announcement Bar", icon: BellIcon, roles: ["super_admin"] },
  { href: "/admin/storefront/welcome-popup", label: "Welcome Popup", icon: ImageIcon, roles: ["super_admin"] },
];

const SECONDARY_NAV: NavItem[] = [
  { href: "/admin/customers", label: "Customers", icon: UsersIcon, roles: ["super_admin"] },
  { href: "/admin/analytics", label: "Analytics", icon: ChartIcon, roles: ["super_admin"] },
];

const SETTINGS_NAV: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, roles: ["super_admin"] },
];

const SIDEBAR_COLLAPSED_KEY = "aabriha-admin-sidebar-collapsed";
const NAV_GROUPS_OPEN_KEY = "aabriha-admin-nav-groups-open";
const EXPANDED_WIDTH = 212;
const COLLAPSED_WIDTH = 60;

function roleLabel(role: Role): string {
  return role === "super_admin" ? "Super Admin" : "Order Manager";
}

function NavLink({
  item,
  active,
  collapsed,
  viewOnly,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  viewOnly: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (item.soon) {
    return (
      <div
        title={collapsed ? `${item.label} (coming soon)` : undefined}
        className="flex cursor-not-allowed items-center gap-2.5 rounded px-2.5 py-1.5 text-sm font-medium text-muted-foreground/50"
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <span className="flex flex-1 items-center justify-between">
            {item.label}
            <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Soon
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/8 hover:text-foreground"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between">
          {item.label}
          {viewOnly && !active && <span className="text-[10px] font-medium uppercase tracking-wide opacity-60">View</span>}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  pathname,
  role,
  name,
  onNavigate,
  openGroups,
  onToggleGroup,
}: {
  collapsed: boolean;
  pathname: string;
  role: Role;
  name: string;
  onNavigate?: () => void;
  openGroups: Record<string, boolean>;
  onToggleGroup: (label: string, currentlyOpen: boolean) => void;
}) {
  const groups = [
    { items: PRIMARY_NAV },
    { label: "Storefront", items: STOREFRONT_NAV },
    { items: SECONDARY_NAV },
    { items: SETTINGS_NAV },
  ]
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2.5">
        {groups.map((group, i) => {
          // A labeled group (currently just "Storefront") collapses to just
          // its header by default — expand on click, or automatically while
          // the admin is actually on one of its pages so they're never
          // looking at a collapsed group hiding the page they're on. Groups
          // without a label (Dashboard/Orders/... at the top) always show.
          const hasActiveItem = group.items.some((item) => isNavItemActive(item, pathname));
          const isOpen = group.label ? (openGroups[group.label] ?? hasActiveItem) : true;
          const showItems = collapsed || isOpen;

          return (
            <div key={i} className={i > 0 ? "border-t border-border pt-2.5" : undefined}>
              {group.label && !collapsed && (
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.label!, isOpen)}
                  aria-expanded={isOpen}
                  className="mb-1 flex w-full items-center justify-between rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 hover:bg-white/8 hover:text-muted-foreground"
                >
                  {group.label}
                  <ChevronIcon className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
              )}
              {showItems && (
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isNavItemActive(item, pathname)}
                      collapsed={collapsed}
                      viewOnly={Boolean(item.viewOnlyFor?.includes(role))}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-2.5">
        {!collapsed && (
          <div className="mb-1.5 px-2.5">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
          </div>
        )}
        <Link
          href="/"
          title={collapsed ? "Back to store" : undefined}
          className="flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-white/8 hover:text-foreground"
        >
          <HomeIcon className="h-4 w-4 shrink-0" />
          {!collapsed && "Back to store"}
        </Link>
        <SignOutRow collapsed={collapsed} />
      </div>
    </>
  );
}

function SignOutRow({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }
  return (
    <button
      type="button"
      onClick={handleSignOut}
      title={collapsed ? "Sign out" : undefined}
      className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-sm text-danger hover:bg-white/8"
    >
      <LogoutIcon className="h-4 w-4 shrink-0" />
      {!collapsed && "Sign out"}
    </button>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const role = profile?.role === "super_admin" || profile?.role === "order_manager" ? profile.role : null;

  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDrawerRef = useDismissableOverlay<HTMLDivElement>({
    open: mobileOpen,
    onDismiss: () => setMobileOpen(false),
    outsideClick: false,
  });

  useEffect(() => {
    try {
      // Genuine exception to the "no setState in an effect" rule (matches
      // CartContext's precedent): reads an external system (localStorage)
      // the server can't see, right after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
      const rawGroups = localStorage.getItem(NAV_GROUPS_OPEN_KEY);
      if (rawGroups) setOpenGroups(JSON.parse(rawGroups));
    } catch {
      // localStorage unavailable/corrupt — keep defaults.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
      localStorage.setItem(NAV_GROUPS_OPEN_KEY, JSON.stringify(openGroups));
    } catch {
      // Non-fatal — these preferences just won't persist this session.
    }
  }, [collapsed, openGroups, hydrated]);

  // SidebarContent already knows a group's effective open/closed state
  // (openGroups[label], falling back to "is one of its items active" when
  // there's no explicit preference yet) — it passes that resolved value
  // back here so toggling always flips what's actually on screen, rather
  // than this component needing its own copy of that fallback logic.
  function toggleGroup(label: string, currentlyOpen: boolean) {
    setOpenGroups((prev) => ({ ...prev, [label]: !currentlyOpen }));
  }

  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K/Cmd+K opens the page search from anywhere in the admin area, not
  // just when a particular input is focused — a global listener rather than
  // a per-page one.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (profile && !role) {
      router.replace("/");
    }
  }, [loading, user, profile, role, router]);

  if (loading || !user || !role) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  const currentLabel =
    [...PRIMARY_NAV, ...STOREFRONT_NAV, ...SECONDARY_NAV, ...SETTINGS_NAV].find((item) => isNavItemActive(item, pathname))
      ?.label ?? "Admin";

  // Page-name-only search — deliberately not products/orders/customers
  // content, per the admin-redesign grilling round that scoped this out.
  const searchGroups: [string | undefined, NavItem[]][] = [
    [undefined, PRIMARY_NAV],
    ["Storefront", STOREFRONT_NAV],
    [undefined, SECONDARY_NAV],
    [undefined, SETTINGS_NAV],
  ];
  const searchItems: AdminSearchItem[] = searchGroups.flatMap(([group, navItems]) =>
    navItems
      .filter((item) => item.roles.includes(role) && !item.soon)
      .map((item) => ({ href: item.href, label: item.label, group }))
  );

  return (
    <div className="admin-shell flex min-h-dvh flex-col bg-background sm:flex-row">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="admin-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface sm:flex"
      >
        <div className={`flex items-center border-b border-border py-4 ${collapsed ? "justify-center px-2.5" : "justify-between px-4"}`}>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">Aabriha Mart</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded p-1.5 text-muted-foreground hover:bg-white/8 hover:text-foreground"
          >
            <ChevronIcon className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          role={role}
          name={profile?.name ?? "Admin"}
          openGroups={openGroups}
          onToggleGroup={toggleGroup}
        />
      </motion.aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded p-1.5 text-muted-foreground hover:bg-black/3"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <p className="text-sm font-semibold text-foreground">{currentLabel}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search pages"
            className="rounded p-1.5 text-muted-foreground hover:bg-black/3"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <NotificationBell />
          <Link href="/" className="px-1 text-xs text-muted-foreground hover:underline">
            <FaStore className="h-5 w-5 text-danger" />
          </Link>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 sm:hidden ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <div
          ref={mobileDrawerRef}
          role="dialog"
          aria-label="Admin navigation"
          aria-modal="true"
          className={`admin-sidebar absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Aabriha Mart</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="rounded p-1.5 text-muted-foreground hover:bg-white/8"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <SidebarContent
            collapsed={false}
            pathname={pathname}
            role={role}
            name={profile?.name ?? "Admin"}
            onNavigate={() => setMobileOpen(false)}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar — the sidebar/mobile bar have no room for a
           persistent bell, so this exists purely to host it on sm+. */}
        <div className="sticky top-0 z-20 hidden items-center justify-between border-b border-border bg-surface px-8 py-2.5 sm:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-background"
          >
            <SearchIcon className="h-4 w-4" />
            Search pages…
            <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </button>
          <NotificationBell />
        </div>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>

      <AdminSearch items={searchItems} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
