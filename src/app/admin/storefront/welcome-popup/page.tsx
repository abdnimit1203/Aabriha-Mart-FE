"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getWelcomePopup } from "@/lib/catalog";
import { updateWelcomePopup } from "@/lib/admin/storefrontConfig";
import { uploadCatalogImage } from "@/lib/upload";
import { WelcomePopup } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function AdminWelcomePopupPage() {
  const { getIdToken } = useAuth();
  const [config, setConfig] = useState<WelcomePopup | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getWelcomePopup()
      .then(setConfig)
      .catch(() => setConfig({ enabled: false, image: "", ctaUrl: "" }));
  }, []);

  async function uploadImage(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/welcome-popup");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setSaving(true);
    try {
      const updated = await updateWelcomePopup(idToken, config);
      setConfig(updated);
      toast.success("Welcome popup updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the welcome popup.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Welcome Popup"
        description="The first-visit promotional popup — image only, no title/description. The whole image becomes a link if you set a URL below."
      />
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

        <ImageUploadField
          label="Image"
          image={config.image}
          onChange={(url) => setConfig({ ...config, image: url })}
          onUploadFile={uploadImage}
          uploading={uploading}
          setUploading={setUploading}
          previewSize="h-24 w-20"
        />

        <div>
          <label htmlFor="ctaUrl" className="mb-1 block text-sm font-medium">
            Link URL (optional)
          </label>
          <input
            id="ctaUrl"
            value={config.ctaUrl}
            onChange={(e) => setConfig({ ...config, ctaUrl: e.target.value })}
            placeholder="/products?category=..."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank for a plain image popup with no click-through.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
