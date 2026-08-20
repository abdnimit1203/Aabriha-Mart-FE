"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

/** Single-image field used across every admin form that holds one image URL
 * (Category, Hero Banner, Promotion, Welcome Popup): a file picker that
 * uploads to ImageKit, plus a "paste an existing URL" fallback so an image
 * already sitting in ImageKit (e.g. from a product recreated after data
 * loss, or handed over as a plain link) can be reused without a duplicate
 * upload. The caller supplies `onUploadFile` so this stays agnostic to
 * which backend folder/compression settings apply. */
export function ImageUploadField({
  label,
  image,
  onChange,
  onUploadFile,
  uploading,
  setUploading,
  previewSize = "h-16 w-16",
}: {
  label: string;
  image: string;
  onChange: (url: string) => void;
  onUploadFile: (file: File) => Promise<string>;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  /** Tailwind size classes for the preview/placeholder box, e.g. "h-20 w-16". */
  previewSize?: string;
}) {
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadFile(file);
      onChange(url);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange(url);
    setUrlInput("");
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={`${previewSize} rounded-lg border border-border object-cover`} />
        ) : (
          <div className={`${previewSize} flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground`}>
            None
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="cursor-pointer text-xs text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="Or paste an existing image URL"
          className={`${inputClass} max-w-md`}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
        >
          Add
        </button>
      </div>
    </div>
  );
}
