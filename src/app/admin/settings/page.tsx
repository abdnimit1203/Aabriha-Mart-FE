"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getNotificationSettings, updateNotificationSettings, sendTestTelegramNotification } from "@/lib/admin/notificationSettings";
import { NotificationSettings } from "@/types/notification";
import { AdminPageHeader } from "@/components/AdminPageHeader";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

function formatWhen(iso: string | null): string {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminSettingsPage() {
  const { getIdToken } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [chatId, setChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getIdToken()
      .then((idToken) => (idToken ? getNotificationSettings(idToken) : null))
      .then((result) => {
        if (!result) return;
        setSettings(result);
        setEnabled(result.telegramEnabled);
        setChatId(result.telegramChatId);
      })
      .catch(() => {
        toast.error("Couldn't load notification settings.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;
    setSaving(true);
    try {
      const updated = await updateNotificationSettings(idToken, { telegramEnabled: enabled, telegramChatId: chatId.trim() });
      setSettings(updated);
      toast.success("Notification settings saved.");
    } catch {
      toast.error("Couldn't save notification settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    const idToken = await getIdToken();
    if (!idToken) return;
    setTesting(true);
    try {
      const result = await sendTestTelegramNotification(idToken);
      if (result.success) {
        toast.success("Test Telegram notification sent.");
      } else {
        toast.error(result.error ? `Telegram notification failed: ${result.error}` : "Telegram notification failed.");
      }
      const idToken2 = await getIdToken();
      if (idToken2) setSettings(await getNotificationSettings(idToken2));
    } catch {
      toast.error("Telegram notification failed.");
    } finally {
      setTesting(false);
    }
  }

  if (!settings) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <AdminPageHeader title="Settings" description="Admin notification delivery." />

      <div className="max-w-xl rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Telegram admin alerts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get a Telegram message the moment a new order comes in — no need to keep the dashboard open. This is separate from
          the notification bell above, which always works regardless of this setting.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Telegram notifications enabled
          </label>

          <div>
            <label htmlFor="chatId" className="mb-1 block text-sm font-medium">
              Telegram chat ID
            </label>
            <input
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Not a phone number — Telegram bots message a numeric <span className="font-medium">chat ID</span>. See setup
              steps below to find yours.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs">
            <span className={`h-2 w-2 shrink-0 rounded-full ${settings.telegramLastError ? "bg-danger" : settings.telegramLastNotifiedAt ? "bg-success" : "bg-muted-foreground/40"}`} />
            <span className="text-muted-foreground">
              {settings.telegramLastError ? (
                <>
                  Last attempt failed: <span className="text-danger">{settings.telegramLastError}</span>
                  {settings.telegramLastNotifiedAt && <> (last sent successfully {formatWhen(settings.telegramLastNotifiedAt)})</>}
                </>
              ) : settings.telegramLastNotifiedAt ? (
                <>Last sent successfully {formatWhen(settings.telegramLastNotifiedAt)}.</>
              ) : (
                <>No Telegram messages sent yet.</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !chatId.trim()}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? "Sending…" : "Send Test Notification"}
            </button>
          </div>
        </form>

        <details className="mt-6 rounded-lg border border-border bg-background p-3.5 text-sm">
          <summary className="cursor-pointer font-medium text-foreground">How to set this up</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
            <li>
              In Telegram, message <span className="font-medium text-foreground">@BotFather</span> and create a bot with{" "}
              <span className="font-mono">/newbot</span>. It gives you a bot token — add that to the backend as{" "}
              <span className="font-mono">TELEGRAM_BOT_TOKEN</span> (an environment variable, not set here).
            </li>
            <li>Search for your new bot by its username and send it any message (e.g. &ldquo;hi&rdquo;) to start a chat.</li>
            <li>
              Find your numeric chat ID — the easiest way is messaging{" "}
              <span className="font-medium text-foreground">@userinfobot</span>, which replies with your ID. (Alternatively,
              visit <span className="font-mono break-all">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</span> after
              messaging your bot, and read the <span className="font-mono">chat.id</span> field.)
            </li>
            <li>Paste that numeric ID into the field above, save, and send a test notification to confirm it works.</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
