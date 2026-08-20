"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Category, Product, ProductImage } from "@/types/catalog";
import { createProduct, updateProduct, ProductInput, VariantInput } from "@/lib/admin/products";
import { uploadCatalogImage } from "@/lib/upload";
import { slugify } from "@/lib/slugify";
import { TrashIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";
// Variant fields sit inside an already-bordered card on a light admin
// background — the default border was too faint to read as a distinct box,
// and placeholder-only labels disappeared once a value was typed. Darker
// border + a persistent label above each field fixes both.
const variantInputClass =
  "w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";
const MAX_IMAGES = 6;

function VariantField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function flattenForSelect(categories: Category[]): { id: string; label: string }[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parent ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);

  const out: { id: string; label: string }[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ id: c._id, label: `${"— ".repeat(depth)}${c.name}` });
      walk(c._id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}

function emptyVariant(): VariantInput {
  return { sku: "", attributes: {}, price: 0, stock: 0, images: [], status: "active" };
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const isEdit = Boolean(product);
  const categoryOptions = flattenForSelect(categories);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(
    typeof product?.category === "string" ? product.category : (product?.category?._id ?? "")
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [weightGrams, setWeightGrams] = useState(product?.weightGrams ?? 0);
  const [status, setStatus] = useState<"active" | "inactive">(product?.status ?? "active");
  const [attributeNames, setAttributeNames] = useState<string[]>(product?.attributeNames ?? []);
  const [newAttribute, setNewAttribute] = useState("");
  const [hasVariants, setHasVariants] = useState((product?.variants.length ?? 0) > 0);
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.length
      ? product.variants.map((v) => ({ ...v, images: v.images ?? [] }))
      : [emptyVariant()]
  );
  const [price, setPrice] = useState(product?.price ?? 0);
  const [discountPrice, setDiscountPrice] = useState(product?.discountPrice);
  const [stock, setStock] = useState(product?.stock ?? 0);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`A product can have at most ${MAX_IMAGES} images.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const idToken = await getIdToken();
    if (!idToken) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadCatalogImage(f, idToken, "/products")));
      setImages((prev) => [...prev, ...uploaded.map((url) => ({ url }))]);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Lets an admin relink an image already sitting in ImageKit (e.g. from a
  // product that was recreated after a data loss) without re-uploading a
  // duplicate file — the uploader only otherwise supports picking a new one.
  function addImageByUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= MAX_IMAGES) {
      toast.error(`A product can have at most ${MAX_IMAGES} images.`);
      return;
    }
    setImages((prev) => [...prev, { url }]);
    setImageUrlInput("");
  }

  function addAttribute() {
    const trimmed = newAttribute.trim();
    if (!trimmed || attributeNames.includes(trimmed)) return;
    setAttributeNames((prev) => [...prev, trimmed]);
    setNewAttribute("");
  }

  function removeAttribute(nameToRemove: string) {
    setAttributeNames((prev) => prev.filter((n) => n !== nameToRemove));
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        attributes: Object.fromEntries(Object.entries(v.attributes).filter(([key]) => key !== nameToRemove)),
      }))
    );
  }

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function updateVariantAttribute(index: number, attrName: string, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, attributes: { ...v.attributes, [attrName]: value } } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idToken = await getIdToken();
    if (!idToken) return;

    if (hasVariants && variants.length === 0) {
      toast.error("Add at least one variant, or turn off variants for a simple product.");
      return;
    }

    const input: ProductInput = {
      name,
      slug,
      category,
      description: description || undefined,
      images,
      weightGrams,
      attributeNames: hasVariants ? attributeNames : [],
      variants: hasVariants ? variants : [],
      price: hasVariants ? undefined : price,
      discountPrice: hasVariants ? undefined : discountPrice,
      stock: hasVariants ? undefined : stock,
      status,
    };

    setSaving(true);
    try {
      if (product) {
        await updateProduct(idToken, product._id, input);
        toast.success("Product updated.");
      } else {
        await createProduct(idToken, input);
        toast.success("Product created.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Category
        </label>
        <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="" disabled>
            Select a category
          </option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">Images ({images.length}/{MAX_IMAGES})</span>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.url} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-20 w-20 rounded-lg border border-border object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary-strong">
              {uploading ? "…" : "+ Add"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
        {images.length < MAX_IMAGES && (
          <div className="mt-2 flex gap-2">
            <input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageByUrl();
                }
              }}
              placeholder="Or paste an existing image URL (e.g. from ImageKit)"
              className={`${inputClass} max-w-md`}
            />
            <button
              type="button"
              onClick={addImageByUrl}
              className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="weightGrams" className="mb-1 block text-sm font-medium">
            Weight (grams)
          </label>
          <input
            id="weightGrams"
            type="number"
            required
            min={0}
            value={weightGrams}
            onChange={(e) => setWeightGrams(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")} className={inputClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          This product has variants (size, color, etc.)
        </label>
      </div>

      {hasVariants ? (
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium">Variant attributes</span>
            <div className="mb-2 flex flex-wrap gap-2">
              {attributeNames.map((attr) => (
                <span key={attr} className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs">
                  {attr}
                  <button type="button" onClick={() => removeAttribute(attr)} aria-label={`Remove ${attr}`}>
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAttribute();
                  }
                }}
                placeholder="e.g. Size"
                className={`${inputClass} max-w-xs`}
              />
              <button
                type="button"
                onClick={addAttribute}
                className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
              >
                Add attribute
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {variants.map((variant, i) => (
              <div key={i} className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Variant {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={variants.length === 1}
                    aria-label="Remove variant"
                    className="text-danger hover:opacity-70 disabled:opacity-30"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <VariantField label="SKU">
                    <input
                      required
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      className={variantInputClass}
                    />
                  </VariantField>
                  {attributeNames.map((attr) => (
                    <VariantField key={attr} label={attr}>
                      <input
                        required
                        placeholder={attr}
                        value={variant.attributes[attr] ?? ""}
                        onChange={(e) => updateVariantAttribute(i, attr, e.target.value)}
                        className={variantInputClass}
                      />
                    </VariantField>
                  ))}
                  <VariantField label="Price">
                    <input
                      required
                      type="number"
                      min={0}
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                      className={variantInputClass}
                    />
                  </VariantField>
                  <VariantField label="Discount price">
                    <input
                      type="number"
                      min={0}
                      placeholder="Discount price"
                      value={variant.discountPrice ?? ""}
                      onChange={(e) => updateVariant(i, { discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className={variantInputClass}
                    />
                  </VariantField>
                  <VariantField label="Stock">
                    <input
                      required
                      type="number"
                      min={0}
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                      className={variantInputClass}
                    />
                  </VariantField>
                  <VariantField label="Status">
                    <select
                      value={variant.status}
                      onChange={(e) => updateVariant(i, { status: e.target.value as "active" | "inactive" })}
                      className={variantInputClass}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </VariantField>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-background"
          >
            + Add variant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="discountPrice" className="mb-1 block text-sm font-medium">
              Discount price
            </label>
            <input
              id="discountPrice"
              type="number"
              min={0}
              value={discountPrice ?? ""}
              onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="stock" className="mb-1 block text-sm font-medium">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
