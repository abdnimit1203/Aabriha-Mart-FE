"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CloseIcon } from "@/components/icons";
import { CartLineItem } from "@/components/CartLineItem";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const { user, openLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isDrawerOpen]);

  // Outside-click is off — the backdrop div below already closes on click.
  useDismissableOverlay({ open: isDrawerOpen, onDismiss: closeDrawer, outsideClick: false });

  function handleCheckout() {
    closeDrawer();
    if (user) router.push("/checkout");
    else openLoginModal();
  }

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isDrawerOpen}
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-surface shadow-xl transition-transform duration-300 sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none ${
          isDrawerOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-6">
          <h2 className="text-base font-semibold sm:text-xl">Your Cart</h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="rounded-full p-1.5 hover:bg-background sm:p-2"
          >
            <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center sm:gap-4 sm:p-8">
            <p className="text-sm text-muted-foreground sm:text-base">Your cart is empty.</p>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:px-6 sm:py-3"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4 sm:space-y-3 sm:p-6">
              {items.map((item) => (
                <CartLineItem key={`${item.productId}-${item.variantId ?? "simple"}`} item={item} />
              ))}
            </div>

            <div className="border-t border-border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground sm:text-base">Subtotal</span>
                <span className="text-lg font-semibold sm:text-xl">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-3">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex-1 rounded-full border border-primary-strong px-5 py-2.5 text-center text-sm font-medium text-primary-strong transition-colors hover:bg-primary/10 sm:py-3"
                >
                  View Cart
                </Link>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:py-3"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
