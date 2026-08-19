"use client";

import { useCart } from "@/context/CartContext";
import { CartIcon } from "@/components/icons";

export function CartButton() {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative rounded-full p-1.5 hover:bg-background sm:p-2"
    >
      <CartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-strong px-1 text-[10px] font-medium text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
