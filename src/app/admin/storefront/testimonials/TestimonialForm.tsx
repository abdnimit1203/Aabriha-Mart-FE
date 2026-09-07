"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Testimonial } from "@/types/storefront";
import { createTestimonial, updateTestimonial, TestimonialInput } from "@/lib/admin/testimonials";
import { uploadCatalogImage } from "@/lib/upload";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const isEdit = Boolean(testimonial);

  const [name, setName] = useState(testimonial?.name ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [photo, setPhoto] = useState(testimonial?.photo ?? "");
  const [isActive, setIsActive] = useState(testimonial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(testimonial?.sortOrder ?? 0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadPhoto(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/testimonials");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    if (!name.trim() || !quote.trim()) {
      toast.error("Name and quote are required.");
      return;
    }

    const input: TestimonialInput = {
      name: name.trim(),
      quote: quote.trim(),
      rating,
      photo: photo || undefined,
      isActive,
      sortOrder,
    };

    setSaving(true);
    try {
      if (testimonial) {
        await updateTestimonial(idToken, testimonial._id, input);
        toast.success("Testimonial updated.");
      } else {
        await createTestimonial(idToken, input);
        toast.success("Testimonial created.");
      }
      router.push("/admin/storefront/testimonials");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the testimonial.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <ImageUploadField
          label="Photo (optional)"
          image={photo}
          onChange={setPhoto}
          onUploadFile={uploadPhoto}
          uploading={uploading}
          setUploading={setUploading}
          previewSize="h-16 w-16"
        />
        <p className="mt-1 text-xs text-muted-foreground">Left blank, the customer&apos;s initial shows instead.</p>
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Customer name
        </label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="quote" className="mb-1 block text-sm font-medium">
          Quote
        </label>
        <textarea
          id="quote"
          required
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rating" className="mb-1 block text-sm font-medium">
            Rating
          </label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={inputClass}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium">
            Sort order
          </label>
          <input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Active
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create testimonial"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/storefront/testimonials")}
          disabled={saving}
          className="rounded border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
