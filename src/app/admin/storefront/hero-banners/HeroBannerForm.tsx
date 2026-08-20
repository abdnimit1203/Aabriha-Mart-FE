"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { HeroBanner } from "@/types/storefront";
import { createHeroBanner, updateHeroBanner, HeroBannerInput } from "@/lib/admin/heroBanners";
import { uploadCatalogImage } from "@/lib/upload";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export function HeroBannerForm({ banner }: { banner?: HeroBanner }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const isEdit = Boolean(banner);

  const [titleEn, setTitleEn] = useState(banner?.titleEn ?? "");
  const [titleBn, setTitleBn] = useState(banner?.titleBn ?? "");
  const [subtitleEn, setSubtitleEn] = useState(banner?.subtitleEn ?? "");
  const [subtitleBn, setSubtitleBn] = useState(banner?.subtitleBn ?? "");
  const [ctaLabelEn, setCtaLabelEn] = useState(banner?.ctaLabelEn ?? "");
  const [ctaLabelBn, setCtaLabelBn] = useState(banner?.ctaLabelBn ?? "");
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl ?? "");
  const [desktopImage, setDesktopImage] = useState(banner?.desktopImage ?? "");
  const [mobileImage, setMobileImage] = useState(banner?.mobileImage ?? "");
  const [objectPosition, setObjectPosition] = useState(banner?.objectPosition ?? "");
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(banner?.sortOrder ?? 0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadImage(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/hero-banners");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    if (!desktopImage) {
      toast.error("A desktop image is required.");
      return;
    }

    const input: HeroBannerInput = {
      titleEn,
      titleBn,
      subtitleEn,
      subtitleBn,
      ctaLabelEn,
      ctaLabelBn,
      ctaUrl,
      desktopImage,
      mobileImage: mobileImage || undefined,
      objectPosition: objectPosition || undefined,
      isActive,
      sortOrder,
    };

    setSaving(true);
    try {
      if (banner) {
        await updateHeroBanner(idToken, banner._id, input);
        toast.success("Hero banner updated.");
      } else {
        await createHeroBanner(idToken, input);
        toast.success("Hero banner created.");
      }
      router.push("/admin/storefront/hero-banners");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the hero banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="titleEn" className="mb-1 block text-sm font-medium">
            Title (English)
          </label>
          <input id="titleEn" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleBn" className="mb-1 block text-sm font-medium">
            Title (Bangla)
          </label>
          <input id="titleBn" required value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="subtitleEn" className="mb-1 block text-sm font-medium">
            Subtitle (English)
          </label>
          <input id="subtitleEn" value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="subtitleBn" className="mb-1 block text-sm font-medium">
            Subtitle (Bangla)
          </label>
          <input id="subtitleBn" value={subtitleBn} onChange={(e) => setSubtitleBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ctaLabelEn" className="mb-1 block text-sm font-medium">
            CTA label (English)
          </label>
          <input id="ctaLabelEn" value={ctaLabelEn} onChange={(e) => setCtaLabelEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ctaLabelBn" className="mb-1 block text-sm font-medium">
            CTA label (Bangla)
          </label>
          <input id="ctaLabelBn" value={ctaLabelBn} onChange={(e) => setCtaLabelBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="ctaUrl" className="mb-1 block text-sm font-medium">
          CTA URL
        </label>
        <input id="ctaUrl" required placeholder="/categories/womens-dresses" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} />
      </div>

      <ImageUploadField
        label="Desktop image"
        image={desktopImage}
        onChange={setDesktopImage}
        onUploadFile={uploadImage}
        uploading={uploading}
        setUploading={setUploading}
        previewSize="h-16 w-24"
      />
      <ImageUploadField
        label="Mobile image (optional)"
        image={mobileImage}
        onChange={setMobileImage}
        onUploadFile={uploadImage}
        uploading={uploading}
        setUploading={setUploading}
        previewSize="h-16 w-24"
      />

      <div>
        <label htmlFor="objectPosition" className="mb-1 block text-sm font-medium">
          Focal point (optional CSS object-position, e.g. &quot;80% center&quot;)
        </label>
        <input id="objectPosition" value={objectPosition} onChange={(e) => setObjectPosition(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium">
            Sort order
          </label>
          <input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
            Active
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create hero banner"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/storefront/hero-banners")}
          disabled={saving}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
