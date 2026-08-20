"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getAnnouncement } from "@/lib/catalog";
import { updateAnnouncement } from "@/lib/admin/storefrontConfig";
import { Announcement } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function AdminAnnouncementPage() {
  const { getIdToken } = useAuth();
  const [config, setConfig] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAnnouncement()
      .then(setConfig)
      .catch(() => setConfig({ enabled: false, messageEn: "", messageBn: "", marquee: false }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setSaving(true);
    try {
      const updated = await updateAnnouncement(idToken, config);
      setConfig(updated);
      toast.success("Announcement bar updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the announcement.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <AdminPageHeader title="Announcement Bar" description="The site-wide message strip above the navbar." />
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Enabled
        </label>

        <div>
          <label htmlFor="messageEn" className="mb-1 block text-sm font-medium">
            Message (English)
          </label>
          <input
            id="messageEn"
            value={config.messageEn}
            onChange={(e) => setConfig({ ...config, messageEn: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="messageBn" className="mb-1 block text-sm font-medium">
            Message (Bangla)
          </label>
          <input
            id="messageBn"
            value={config.messageBn}
            onChange={(e) => setConfig({ ...config, messageBn: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="url" className="mb-1 block text-sm font-medium">
              Link URL (optional)
            </label>
            <input
              id="url"
              value={config.url ?? ""}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="linkLabel" className="mb-1 block text-sm font-medium">
              Link label (optional)
            </label>
            <input
              id="linkLabel"
              value={config.linkLabel ?? ""}
              onChange={(e) => setConfig({ ...config, linkLabel: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={config.marquee}
            onChange={(e) => setConfig({ ...config, marquee: e.target.checked })}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Scrolling marquee
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
