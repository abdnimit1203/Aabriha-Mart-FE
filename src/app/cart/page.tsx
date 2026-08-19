"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CartLineItem } from "@/components/CartLineItem";

export default function CartPage() {
  const { items, subtotal } = useCart();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  function handleCheckout() {
    router.push(firebaseUser ? "/checkout" : "/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-14">
      <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center sm:mt-8 sm:gap-4 sm:p-12">
          <p className="text-sm text-muted-foreground sm:text-base">Your cart is empty.</p>
          <Link
            href="/"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:px-6 sm:py-3"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:mt-8 sm:p-8">
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.variantId ?? "simple"}`} item={item} />
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-5 sm:mt-6 sm:pt-6">
            <div className="flex items-center justify-between text-sm font-medium sm:text-base">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Delivery charge is calculated at checkout, based on your address.
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:mt-5 sm:w-auto sm:py-3"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
