"use client";

import { useCart } from "@/context/CartContext";
import { CloseIcon } from "@/components/icons";
import { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const attributeSummary = item.attributes
    ? Object.values(item.attributes).filter(Boolean).join(" • ")
    : undefined;

  return (
    <div className="relative flex gap-3 rounded-2xl border border-border bg-background p-3 sm:gap-4 sm:p-4">
      <button
        type="button"
        aria-label={`Remove ${item.name} from cart`}
        onClick={() => removeItem(item.productId, item.variantId)}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-danger"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:h-24 sm:w-24">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 pr-5 sm:gap-3">
        <div>
          <p className="text-sm font-medium leading-snug sm:text-base">{item.name}</p>
          {attributeSummary && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{attributeSummary}</p>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="px-2 py-1 text-base disabled:opacity-40 sm:px-3 sm:py-1.5 sm:text-lg"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="min-w-6 text-center text-xs font-medium sm:min-w-7 sm:text-sm">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="px-2 py-1 text-base disabled:opacity-40 sm:px-3 sm:py-1.5 sm:text-lg"
              disabled={item.quantity >= item.maxStock}
            >
              +
            </button>
          </div>
          <p className="text-sm font-semibold sm:text-base">
            ৳{(item.unitPrice * item.quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
