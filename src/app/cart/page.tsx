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
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-base text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="space-y-4">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.variantId ?? "simple"}`} item={item} />
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center justify-between text-base font-medium">
              <span>Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Delivery charge is calculated at checkout, based on your address.
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong sm:w-auto"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
