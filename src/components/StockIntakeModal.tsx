"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { createStockIntake } from "@/lib/admin/stockIntakes";
import { uploadCatalogImage } from "@/lib/upload";
import { Product } from "@/types/catalog";
import { CloseIcon } from "@/components/icons";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// A simple retroactive log of stock a supplier delivered — not a multi-stage
// purchase-order workflow. Saving bumps stock immediately (mirrors the
// backend's createStockIntake, which does the same in one step), same as the
// manual +/- adjuster right next to it in the Inventory list.
export function StockIntakeModal({
  product,
  variantId,
  variantLabel,
  onClose,
  onSaved,
}: {
  product: Product;
  variantId?: string;
  variantLabel?: string;
  onClose: () => void;
  onSaved: (updated: Product) => void;
}) {
  const { getIdToken } = useAuth();
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open: true, onDismiss: onClose });

  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [intakeDate, setIntakeDate] = useState(todayIsoDate());
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadImage(file: File): Promise<string> {
    const idToken = await getIdToken();
    if (!idToken) throw new Error("Not signed in.");
    return uploadCatalogImage(file, idToken, "/stock-intakes");
  }

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const quantityNum = Number(quantity);
  const unitCostNum = Number(unitCost);
  const canSave =
    supplier.trim().length > 0 &&
    Number.isFinite(quantityNum) &&
    quantityNum > 0 &&
    Number.isFinite(unitCostNum) &&
    unitCostNum >= 0 &&
    intakeDate.length > 0;

  async function handleSave() {
    if (!canSave || saving) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    setSaving(true);
    try {
      const result = await createStockIntake(idToken, {
        product: product._id,
        variantId,
        supplier: supplier.trim(),
        quantity: quantityNum,
        unitCost: unitCostNum,
        note: note.trim() || undefined,
        intakeDate,
        image: image || undefined,
      });
      toast.success(`Logged ${quantityNum} unit${quantityNum !== 1 ? "s" : ""} from ${supplier.trim()}.`);
      onSaved(result.product);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't log this stock intake.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Log stock intake">
      <div className="absolute inset-0 bg-black/40" />
      <div ref={rootRef} className="relative w-full max-w-md rounded-t-md bg-surface p-5 shadow-xl sm:rounded-md">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Log stock intake</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.name}
              {variantLabel && ` — ${variantLabel}`}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" disabled={saving} className="rounded p-1.5 hover:bg-background disabled:opacity-50">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Supplier</label>
            <input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Karim Textiles"
              disabled={saving}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity received</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                disabled={saving}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Unit cost (৳)</label>
              <input
                type="number"
                min={0}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0"
                disabled={saving}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date received</label>
            <input
              type="date"
              value={intakeDate}
              onChange={(e) => setIntakeDate(e.target.value)}
              max={todayIsoDate()}
              disabled={saving}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. restock ahead of Eid"
              disabled={saving}
              className={inputClass}
            />
          </div>

          <ImageUploadField
            label="Receipt / invoice photo (optional)"
            image={image}
            onChange={setImage}
            onUploadFile={uploadImage}
            uploading={uploading}
            setUploading={setUploading}
            previewSize="h-14 w-14"
          />

          {quantityNum > 0 && unitCostNum >= 0 && (
            <p className="text-xs text-muted-foreground">
              Total cost: ৳{(quantityNum * unitCostNum).toLocaleString()} — stock will increase by {quantityNum} immediately on save.
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border border-border px-3 py-2 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving || uploading}
            className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save intake"}
          </button>
        </div>
      </div>
    </div>
  );
}
