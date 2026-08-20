"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Promotion } from "@/types/storefront";
import { createPromotion, updatePromotion, PromotionInput } from "@/lib/admin/promotions";
import { uploadCatalogImage } from "@/lib/upload";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function PromotionForm({ promotion }: { promotion?: Promotion }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const isEdit = Boolean(promotion);

  const [image, setImage] = useState(promotion?.image ?? "");
  const [titleEn, setTitleEn] = useState(promotion?.titleEn ?? "");
  const [titleBn, setTitleBn] = useState(promotion?.titleBn ?? "");
  const [descriptionEn, setDescriptionEn] = useState(promotion?.descriptionEn ?? "");
  const [descriptionBn, setDescriptionBn] = useState(promotion?.descriptionBn ?? "");
  const [ctaLabelEn, setCtaLabelEn] = useState(promotion?.ctaLabelEn ?? "");
  const [ctaLabelBn, setCtaLabelBn] = useState(promotion?.ctaLabelBn ?? "");
  const [ctaUrl, setCtaUrl] = useState(promotion?.ctaUrl ?? "");
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(promotion?.sortOrder ?? 0);
  const [startDate, setStartDate] = useState(toDateInputValue(promotion?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(promotion?.endDate));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadImage(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/promotions");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    if (!image) {
      toast.error("An image is required.");
      return;
    }

    const input: PromotionInput = {
      image,
      titleEn: titleEn || undefined,
      titleBn: titleBn || undefined,
      descriptionEn: descriptionEn || undefined,
      descriptionBn: descriptionBn || undefined,
      ctaLabelEn: ctaLabelEn || undefined,
      ctaLabelBn: ctaLabelBn || undefined,
      ctaUrl,
      isActive,
      sortOrder,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    setSaving(true);
    try {
      if (promotion) {
        await updatePromotion(idToken, promotion._id, input);
        toast.success("Promotion updated.");
      } else {
        await createPromotion(idToken, input);
        toast.success("Promotion created.");
      }
      router.push("/admin/storefront/promotions");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the promotion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <ImageUploadField
          label="Image"
          image={image}
          onChange={setImage}
          onUploadFile={uploadImage}
          uploading={uploading}
          setUploading={setUploading}
          previewSize="h-20 w-16"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          A self-contained flyer (text baked into the image) works fine — leave Title/Description below blank and it renders as-is.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="titleEn" className="mb-1 block text-sm font-medium">
            Title (English, optional)
          </label>
          <input id="titleEn" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleBn" className="mb-1 block text-sm font-medium">
            Title (Bangla, optional)
          </label>
          <input id="titleBn" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="descriptionEn" className="mb-1 block text-sm font-medium">
            Description (English, optional)
          </label>
          <input id="descriptionEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="descriptionBn" className="mb-1 block text-sm font-medium">
            Description (Bangla, optional)
          </label>
          <input id="descriptionBn" value={descriptionBn} onChange={(e) => setDescriptionBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ctaLabelEn" className="mb-1 block text-sm font-medium">
            CTA label (English, optional)
          </label>
          <input id="ctaLabelEn" value={ctaLabelEn} onChange={(e) => setCtaLabelEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ctaLabelBn" className="mb-1 block text-sm font-medium">
            CTA label (Bangla, optional)
          </label>
          <input id="ctaLabelBn" value={ctaLabelBn} onChange={(e) => setCtaLabelBn(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="ctaUrl" className="mb-1 block text-sm font-medium">
          Click-through URL
        </label>
        <input id="ctaUrl" required placeholder="/offers" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
            Start date (optional)
          </label>
          <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
            End date (optional)
          </label>
          <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
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
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create promotion"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/storefront/promotions")}
          disabled={saving}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
