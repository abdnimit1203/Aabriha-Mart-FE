"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { CartItem } from "@/types/cart";

const STORAGE_KEY = "aabriha-cart-v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** False until localStorage has been read — guard "cart is empty" redirects on it. */
  hydrated: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, productId: string, variantId: string | undefined) {
  return a.productId === productId && a.variantId === variantId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  // Cart starts empty on both server and first client render (localStorage
  // isn't available server-side) — hydrate right after mount instead, to
  // avoid an SSR/CSR markup mismatch.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Genuine exception to the "no setState in an effect" rule: this reads
      // an external system (localStorage), which the server can't see — the
      // effect is what keeps the very first client render matching the
      // server's empty-cart HTML, avoiding a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((line) => sameLine(line, item.productId, item.variantId));
      if (existing) {
        const nextQty = Math.min(existing.maxStock, existing.quantity + quantity);
        return prev.map((line) => (line === existing ? { ...line, quantity: nextQty } : line));
      }
      return [...prev, { ...item, quantity: Math.min(item.maxStock, quantity) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    setItems((prev) =>
      prev
        .map((line) =>
          sameLine(line, productId, variantId)
            ? { ...line, quantity: Math.max(1, Math.min(line.maxStock, quantity)) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string, variantId: string | undefined) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, productId, variantId)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        hydrated,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
