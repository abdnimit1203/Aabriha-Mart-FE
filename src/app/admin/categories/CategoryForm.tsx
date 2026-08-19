"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Category } from "@/types/catalog";
import { createCategory, updateCategory, CategoryInput } from "@/lib/admin/categories";
import { uploadCatalogImage } from "@/lib/upload";
import { slugify } from "@/lib/slugify";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

/** A category can't be its own ancestor — collects the category's own id plus
 * every descendant id so the parent picker can exclude all of them. */
function selfAndDescendantIds(categoryId: string, all: Category[]): Set<string> {
  const ids = new Set([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of all) {
      if (c.parent && ids.has(c.parent) && !ids.has(c._id)) {
        ids.add(c._id);
        grew = true;
      }
    }
  }
  return ids;
}

export function CategoryForm({ category, allCategories }: { category?: Category; allCategories: Category[] }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [parent, setParent] = useState(category?.parent ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const excludedParentIds = category ? selfAndDescendantIds(category._id, allCategories) : new Set<string>();
  const parentOptions = allCategories.filter((c) => !excludedParentIds.has(c._id));

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setUploading(true);
    try {
      const url = await uploadCatalogImage(file, idToken, "/categories");
      setImage(url);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    const input: CategoryInput = { name, slug, parent: parent || null, image: image || undefined, isActive, sortOrder };

    setSaving(true);
    try {
      if (category) {
        await updateCategory(idToken, category._id, input);
        toast.success("Category updated.");
      } else {
        await createCategory(idToken, input);
        toast.success("Category created.");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="parent" className="mb-1 block text-sm font-medium">
          Parent category
        </label>
        <select id="parent" value={parent ?? ""} onChange={(e) => setParent(e.target.value)} className={inputClass}>
          <option value="">None (top-level)</option>
          {parentOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">Image</span>
        <div className="flex items-center gap-3">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              None
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Active
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
      </button>
    </form>
  );
}
