"use client";

import { useCart } from "@/context/CartContext";
import { TrashIcon } from "@/components/icons";
import { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const attributeSummary = item.attributes
    ? Object.values(item.attributes).filter(Boolean).join(" • ")
    : undefined;

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div>
          <p className="text-base font-medium leading-snug">{item.name}</p>
          {attributeSummary && <p className="mt-0.5 text-sm text-muted-foreground">{attributeSummary}</p>}
          <p className="mt-1.5 text-base font-semibold">৳{item.unitPrice.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="px-3 py-1.5 text-lg disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="min-w-7 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="px-3 py-1.5 text-lg disabled:opacity-40"
              disabled={item.quantity >= item.maxStock}
            >
              +
            </button>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => removeItem(item.productId, item.variantId)}
            className="rounded-full p-2.5 text-muted-foreground hover:bg-surface hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
