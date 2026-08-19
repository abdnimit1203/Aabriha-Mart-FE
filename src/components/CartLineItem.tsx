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
    <div className="flex gap-3 py-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          {attributeSummary && <p className="text-xs text-muted-foreground">{attributeSummary}</p>}
          <p className="mt-1 text-sm font-semibold">৳{item.unitPrice.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="px-2.5 py-1 text-base disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="min-w-6 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="px-2.5 py-1 text-base disabled:opacity-40"
              disabled={item.quantity >= item.maxStock}
            >
              +
            </button>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => removeItem(item.productId, item.variantId)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
