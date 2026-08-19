"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { FaCartPlus } from "react-icons/fa";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/CartContext";
import { useVariantSelector } from "@/hooks/useVariantSelector";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { CloseIcon } from "@/components/icons";

export function QuickAddModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, openDrawer } = useCart();
  const v = useVariantSelector(product);
  const image = v.activeVariant?.images[0] ?? product.images[0];
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open: true, onDismiss: onClose });

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function handleAdd() {
    if (!v.available) return;
    addItem(
      {
        productId: product._id,
        productSlug: product.slug,
        variantId: v.activeVariant?._id,
        name: product.name,
        image: image?.url,
        attributes: v.hasVariants ? v.activeVariant?.attributes : undefined,
        unitPrice: v.unitPrice,
        maxStock: v.stock,
      },
      v.quantity
    );
    toast.success(`Added ${product.name} to cart`);
    onClose();
    openDrawer();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Add to cart">
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={rootRef}
        className="relative w-full max-w-sm rounded-t-3xl bg-surface p-5 shadow-xl sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Add to Cart</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-background">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-snug">{product.name}</p>
            {product.ratingCount > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                ★ {product.ratingAverage.toFixed(1)} ({product.ratingCount})
              </p>
            )}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-semibold">৳{v.unitPrice.toLocaleString()}</span>
              {v.isOnSale && <span className="text-xs text-muted-foreground line-through">৳{v.price!.toLocaleString()}</span>}
            </div>
            {v.hasVariants && (
              <p className={`mt-0.5 text-xs ${v.available ? "text-success" : "text-danger"}`}>
                {!v.activeVariant ? "Not available" : v.stock <= 5 ? `Only ${v.stock} left` : "In stock"}
              </p>
            )}
          </div>
        </div>

        {product.attributeNames.map((attributeName) => (
          <div key={attributeName} className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{attributeName}</p>
            <div className="flex flex-wrap gap-2">
              {v.valuesFor(attributeName).map((value) => {
                const isSelected = v.selected[attributeName] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => v.selectAttribute(attributeName, value)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary-strong bg-primary-strong text-white"
                        : "border-border bg-background hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium">Quantity</p>
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => v.setQuantity((q) => Math.max(1, q - 1))}
              disabled={v.quantity <= 1}
              aria-label="Decrease quantity"
              className="px-3 py-1.5 text-lg disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm">{v.quantity}</span>
            <button
              type="button"
              onClick={() => v.setQuantity((q) => Math.min(v.stock || 1, q + 1))}
              disabled={!v.available || v.quantity >= v.stock}
              aria-label="Increase quantity"
              className="px-3 py-1.5 text-lg disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-base font-semibold">৳{(v.unitPrice * v.quantity).toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!v.available}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaCartPlus className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
