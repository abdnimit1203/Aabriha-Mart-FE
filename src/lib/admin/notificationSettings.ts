import { apiFetch } from "@/lib/api";
import { NotificationSettings, TelegramSendResult } from "@/types/notification";

export async function getNotificationSettings(idToken: string) {
  return apiFetch<NotificationSettings>("/api/admin/notification-settings", {}, idToken);
}

export async function updateNotificationSettings(
  idToken: string,
  input: { telegramEnabled: boolean; telegramChatId: string }
) {
  return apiFetch<NotificationSettings>(
    "/api/admin/notification-settings",
    { method: "PUT", body: JSON.stringify(input) },
    idToken
  );
}

export async function sendTestTelegramNotification(idToken: string) {
  return apiFetch<TelegramSendResult>("/api/admin/notification-settings/test-telegram", { method: "POST" }, idToken);
}
