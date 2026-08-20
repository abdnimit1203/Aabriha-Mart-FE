import { apiFetch } from "@/lib/api";
import { NotificationFeed, AdminNotification } from "@/types/notification";

export async function listNotifications(idToken: string) {
  return apiFetch<NotificationFeed>("/api/admin/notifications", {}, idToken);
}

export async function markNotificationRead(idToken: string, id: string) {
  return apiFetch<AdminNotification>(`/api/admin/notifications/${id}/read`, { method: "PATCH" }, idToken);
}

export async function markAllNotificationsRead(idToken: string) {
  return apiFetch<{ success: boolean }>("/api/admin/notifications/mark-all-read", { method: "POST" }, idToken);
}
