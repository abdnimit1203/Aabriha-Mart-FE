export type NotificationType =
  | "new_order"
  | "payment_submitted"
  | "order_cancelled"
  | "return_event"
  | "low_stock"
  | "out_of_stock"
  | "order_status_attention";

export interface AdminNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationFeed {
  notifications: AdminNotification[];
  unreadCount: number;
}

export interface NotificationSettings {
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramLastNotifiedAt: string | null;
  telegramLastError: string | null;
}

export interface TelegramSendResult {
  success: boolean;
  error?: string;
}
