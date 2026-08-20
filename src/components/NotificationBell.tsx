"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/admin/notifications";
import { AdminNotification, NotificationFeed, NotificationType } from "@/types/notification";
import { BellIcon } from "@/components/icons";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

const POLL_INTERVAL_MS = 25000;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// Stock-depletion alerts read as urgent (red); every other type is a normal
// order-lifecycle event (blue) — two categories, matching how admins
// actually triage these (act now vs. good to know).
const STOCK_TYPES: NotificationType[] = ["low_stock", "out_of_stock"];

function isStockAlert(type: NotificationType): boolean {
  return STOCK_TYPES.includes(type);
}

function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
}: {
  notification: AdminNotification;
  onOpen: (n: AdminNotification) => void;
  onMarkRead: (n: AdminNotification) => void;
}) {
  const stockAlert = isStockAlert(notification.type);
  const borderColor = stockAlert ? "border-l-danger/50" : "border-l-green-500/50";
  const unreadTint = stockAlert ? "bg-danger/5" : "bg-primary/5";
  const dotColor = stockAlert ? "bg-danger" : "bg-primary";

  return (
    <div
      className={`group flex items-start gap-2.5 border-b border-l-4 border-border px-3 py-3  last:border-b-0 ${borderColor} ${notification.read ? "" : unreadTint
        }`}
    >
      <button type="button" onClick={() => onOpen(notification)} className="min-w-0  flex-1 text-left">
        <div className="flex items-center gap-2">
          {!notification.read && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} aria-hidden />}
          <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</p>
      </button>
      {!notification.read && (
        <button
          type="button"
          onClick={() => onMarkRead(notification)}
          title="Mark as read"
          className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
        >
          Mark read
        </button>
      )}
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => (idToken ? listNotifications(idToken) : null))
      .then((result) => {
        if (result) setFeed(result);
      })
      .catch(() => {
        // Polling failure is silent — the bell just keeps showing the last
        // known state until the next successful poll.
      });
    // getIdToken isn't memoized in AuthContext — omitted to avoid re-creating the interval below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const dropdownRef = useDismissableOverlay<HTMLDivElement>({ open, onDismiss: () => setOpen(false) });

  async function handleOpenNotification(notification: AdminNotification) {
    setOpen(false);
    if (!notification.read) {
      setFeed((prev) =>
        prev
          ? {
            unreadCount: Math.max(0, prev.unreadCount - 1),
            notifications: prev.notifications.map((n) => (n._id === notification._id ? { ...n, read: true } : n)),
          }
          : prev
      );
      const idToken = await getIdToken();
      if (idToken) markNotificationRead(idToken, notification._id).catch(() => { });
    }
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  async function handleMarkRead(notification: AdminNotification) {
    setFeed((prev) =>
      prev
        ? {
          unreadCount: Math.max(0, prev.unreadCount - 1),
          notifications: prev.notifications.map((n) => (n._id === notification._id ? { ...n, read: true } : n)),
        }
        : prev
    );
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await markNotificationRead(idToken, notification._id);
      toast.success("Notification marked as read.");
    } catch {
      toast.error("Couldn't update the notification.");
      load();
    }
  }

  async function handleMarkAllRead() {
    if (!feed || feed.unreadCount === 0) return;
    setFeed((prev) => (prev ? { unreadCount: 0, notifications: prev.notifications.map((n) => ({ ...n, read: true })) } : prev));
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await markAllNotificationsRead(idToken);
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Couldn't update notifications.");
      load();
    }
  }

  const unreadCount = feed?.unreadCount ?? 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="text-xs font-medium text-primary-strong hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {feed === null ? (
              <p className="px-3.5 py-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : feed.notifications.length === 0 ? (
              <p className="px-3.5 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              feed.notifications.map((n) => (
                <NotificationRow key={n._id} notification={n} onOpen={handleOpenNotification} onMarkRead={handleMarkRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
