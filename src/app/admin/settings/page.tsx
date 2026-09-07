"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTelegram, FaMoneyBillWave } from "react-icons/fa6";
import { SiMeta } from "react-icons/si";
import { useAuth } from "@/context/AuthContext";
import { getNotificationSettings, updateNotificationSettings, sendTestTelegramNotification } from "@/lib/admin/notificationSettings";
import { updateMarketingSettings } from "@/lib/admin/marketingSettings";
import { updatePaymentSettings } from "@/lib/admin/paymentSettings";
import { getMarketingSettings, getPaymentSettings } from "@/lib/catalog";
import { NotificationSettings } from "@/types/notification";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadCatalogImage } from "@/lib/upload";

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

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

  const [pixelEnabled, setPixelEnabled] = useState(false);
  const [pixelId, setPixelId] = useState("");
  const [pixelLoaded, setPixelLoaded] = useState(false);
  const [savingPixel, setSavingPixel] = useState(false);

  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [bkashQrImage, setBkashQrImage] = useState("");
  const [nagadEnabled, setNagadEnabled] = useState(true);
  const [nagadQrImage, setNagadQrImage] = useState("");
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [uploadingBkashQr, setUploadingBkashQr] = useState(false);
  const [uploadingNagadQr, setUploadingNagadQr] = useState(false);

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
    getMarketingSettings()
      .then((result) => {
        setPixelEnabled(result.facebookPixelEnabled);
        setPixelId(result.facebookPixelId);
      })
      .catch(() => toast.error("Couldn't load marketing settings."))
      .finally(() => setPixelLoaded(true));
    getPaymentSettings()
      .then((result) => {
        setBkashEnabled(result.bkashEnabled);
        setBkashQrImage(result.bkashQrImage ?? "");
        setNagadEnabled(result.nagadEnabled);
        setNagadQrImage(result.nagadQrImage ?? "");
      })
      .catch(() => toast.error("Couldn't load payment settings."))
      .finally(() => setPaymentLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadBkashQr(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/payment-qr");
  }

  async function uploadNagadQr(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/payment-qr");
  }

  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingPayment(true);
    try {
      const updated = await updatePaymentSettings(idToken, {
        bkashEnabled,
        bkashQrImage: bkashQrImage || null,
        nagadEnabled,
        nagadQrImage: nagadQrImage || null,
      });
      setBkashEnabled(updated.bkashEnabled);
      setBkashQrImage(updated.bkashQrImage ?? "");
      setNagadEnabled(updated.nagadEnabled);
      setNagadQrImage(updated.nagadQrImage ?? "");
      toast.success("Payment settings saved.");
    } catch {
      toast.error("Couldn't save payment settings.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleSavePixel(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;
    setSavingPixel(true);
    try {
      const updated = await updateMarketingSettings(idToken, {
        facebookPixelEnabled: pixelEnabled,
        facebookPixelId: pixelId.trim(),
      });
      setPixelEnabled(updated.facebookPixelEnabled);
      setPixelId(updated.facebookPixelId);
      toast.success("Marketing settings saved.");
    } catch {
      toast.error("Couldn't save marketing settings.");
    } finally {
      setSavingPixel(false);
    }
  }

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
      <div className="flex flex-col lg:flex-row gap-3 items-baseline justify-center">
        <div className="relative max-w-xl rounded-md border border-border bg-surface p-5 sm:p-6 drop-shadow-sm hover:drop-shadow-lg transition-all hover:border-[#26A5E4] duration-300 cursor-pointer">
          <FaTelegram className="absolute right-5 top-5 h-6 w-6 text-[#26A5E4] sm:right-6 sm:top-6" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground"><span className="text-lg text-blue-400">Telegram</span> admin alerts</h2>
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

            <div className="flex items-center gap-3 rounded border border-border bg-background px-3.5 py-2.5 text-xs">
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
                className="rounded bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !chatId.trim()}
                className="rounded border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testing ? "Sending…" : "Send Test Notification"}
              </button>
            </div>
          </form>

          <details className="mt-6 rounded border border-border bg-background p-3.5 text-sm">
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

        <div className="relative  max-w-xl rounded-md border border-border bg-surface p-5 sm:p-6 drop-shadow-sm hover:drop-shadow-lg transition-all hover:border-blue-500 duration-300 cursor-pointer">
          <SiMeta className="absolute right-5 top-5 h-6 w-6 text-[#0866FF] sm:right-6 sm:top-6" aria-hidden />
          <h2 className="text-lg font-semibold  text-[#1973ed]">Facebook Pixel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tracks storefront visits and purchases for future ad campaigns. Leave disabled (or the ID blank) and nothing
            loads on the storefront at all.
          </p>

          {!pixelLoaded ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={handleSavePixel} className="mt-5 space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={pixelEnabled}
                  onChange={(e) => setPixelEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Facebook Pixel enabled
              </label>

              <div>
                <label htmlFor="pixelId" className="mb-1 block text-sm font-medium">
                  Pixel ID
                </label>
                <input
                  id="pixelId"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Found in Meta Events Manager under your Pixel&apos;s settings — a numeric ID, not a name.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingPixel}
                className="rounded bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPixel ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </div>

        <div className="relative max-w-xl rounded-md border border-border bg-surface p-5 sm:p-6 drop-shadow-sm hover:drop-shadow-lg transition-all hover:border-[#e2136e] duration-300 cursor-pointer">
          <FaMoneyBillWave className="absolute right-5 top-5 h-6 w-6 text-[#e2136e] sm:right-6 sm:top-6" aria-hidden />
          <h2 className="text-lg font-semibold text-[#e2136e]">Payment QR Codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toggle bKash/Nagad on or off at checkout, and set the QR code shown for each. Merchant numbers stay
            environment-configured; only the QR image and on/off state live here.
          </p>

          {!paymentLoaded ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={handleSavePayment} className="mt-5 space-y-5">
              <div className="space-y-3 rounded border border-border bg-background p-3.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={bkashEnabled}
                    onChange={(e) => setBkashEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-[#e2136e]"
                  />
                  bKash enabled at checkout
                </label>
                <ImageUploadField
                  label="bKash QR code"
                  image={bkashQrImage}
                  onChange={setBkashQrImage}
                  onUploadFile={uploadBkashQr}
                  uploading={uploadingBkashQr}
                  setUploading={setUploadingBkashQr}
                  previewSize="h-20 w-20"
                />
                {bkashQrImage && (
                  <button
                    type="button"
                    onClick={() => setBkashQrImage("")}
                    className="text-xs font-medium text-danger hover:underline"
                  >
                    Remove QR image
                  </button>
                )}
              </div>

              <div className="space-y-3 rounded border border-border bg-background p-3.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={nagadEnabled}
                    onChange={(e) => setNagadEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-[#f6921e]"
                  />
                  Nagad enabled at checkout
                </label>
                <ImageUploadField
                  label="Nagad QR code"
                  image={nagadQrImage}
                  onChange={setNagadQrImage}
                  onUploadFile={uploadNagadQr}
                  uploading={uploadingNagadQr}
                  setUploading={setUploadingNagadQr}
                  previewSize="h-20 w-20"
                />
                {nagadQrImage && (
                  <button
                    type="button"
                    onClick={() => setNagadQrImage("")}
                    className="text-xs font-medium text-danger hover:underline"
                  >
                    Remove QR image
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={savingPayment}
                className="rounded bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPayment ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
