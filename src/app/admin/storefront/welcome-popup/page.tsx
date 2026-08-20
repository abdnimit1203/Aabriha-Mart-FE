"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getWelcomePopup } from "@/lib/catalog";
import { updateWelcomePopup } from "@/lib/admin/storefrontConfig";
import { uploadCatalogImage } from "@/lib/upload";
import { WelcomePopup } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export default function AdminWelcomePopupPage() {
  const { getIdToken } = useAuth();
  const [config, setConfig] = useState<WelcomePopup | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getWelcomePopup()
      .then(setConfig)
      .catch(() =>
        setConfig({ enabled: false, image: "", titleEn: "", titleBn: "", descriptionEn: "", descriptionBn: "", ctaLabel: "", ctaUrl: "" })
      );
  }, []);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setUploading(true);
    try {
      const url = await uploadCatalogImage(file, idToken, "/welcome-popup");
      setConfig({ ...config, image: url });
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <AdminPageHeader title="Welcome Popup" description="The first-visit promotional popup." />
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
          <span className="mb-1 block text-sm font-medium">Image</span>
          <div className="flex items-center gap-3">
            {config.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.image} alt="" className="h-24 w-20 rounded-lg border border-border object-cover" />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                None
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="titleEn" className="mb-1 block text-sm font-medium">
              Title (English)
            </label>
            <input id="titleEn" value={config.titleEn} onChange={(e) => setConfig({ ...config, titleEn: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="titleBn" className="mb-1 block text-sm font-medium">
              Title (Bangla)
            </label>
            <input id="titleBn" value={config.titleBn} onChange={(e) => setConfig({ ...config, titleBn: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="descriptionEn" className="mb-1 block text-sm font-medium">
              Description (English)
            </label>
            <input
              id="descriptionEn"
              value={config.descriptionEn}
              onChange={(e) => setConfig({ ...config, descriptionEn: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="descriptionBn" className="mb-1 block text-sm font-medium">
              Description (Bangla)
            </label>
            <input
              id="descriptionBn"
              value={config.descriptionBn}
              onChange={(e) => setConfig({ ...config, descriptionBn: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ctaLabel" className="mb-1 block text-sm font-medium">
              CTA label
            </label>
            <input id="ctaLabel" value={config.ctaLabel} onChange={(e) => setConfig({ ...config, ctaLabel: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="ctaUrl" className="mb-1 block text-sm font-medium">
              CTA URL
            </label>
            <input id="ctaUrl" value={config.ctaUrl} onChange={(e) => setConfig({ ...config, ctaUrl: e.target.value })} className={inputClass} />
          </div>
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
