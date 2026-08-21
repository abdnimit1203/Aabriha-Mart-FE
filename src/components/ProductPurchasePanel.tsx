"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useVariantSelector } from "@/hooks/useVariantSelector";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { user, openLoginModal } = useAuth();
  const v = useVariantSelector(product);

  function lineItem() {
    return {
      productId: product._id,
      productSlug: product.slug,
      variantId: v.activeVariant?._id,
      name: product.name,
      image: (v.activeVariant?.images[0] ?? product.images[0])?.url,
      attributes: v.hasVariants ? v.activeVariant?.attributes : undefined,
      unitPrice: v.unitPrice,
      maxStock: v.stock,
    };
  }

  function handleAddToCart() {
    if (!v.available) return;
    addItem(lineItem(), v.quantity);
    toast.success(`Added ${product.name} to cart`);
    openDrawer();
  }

  function handleBuyNow() {
    if (!v.available) return;
    addItem(lineItem(), v.quantity);
    if (user) router.push("/checkout");
    else openLoginModal();
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline gap-2">
          {v.price !== undefined && <span className="text-2xl font-semibold">৳{v.unitPrice.toLocaleString()}</span>}
          {v.isOnSale && <span className="text-muted-foreground line-through">৳{v.price!.toLocaleString()}</span>}
        </div>
        <p className={`mt-1 text-sm ${v.available ? "text-success" : "text-danger"}`}>
          {v.hasVariants && !v.activeVariant
            ? "This combination is not available"
            : v.available
              ? v.stock <= 5
                ? `Only ${v.stock} left in stock`
                : "In stock"
              : "Out of stock"}
        </p>
      </div>

      {product.attributeNames.map((attributeName) => (
        <div key={attributeName}>
          <p className="mb-2 text-sm font-medium capitalize">{attributeName}</p>
          <div className="flex flex-wrap gap-2">
            {v.valuesFor(attributeName).map((value) => {
              const isSelected = v.selected[attributeName] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => v.selectAttribute(attributeName, value)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-primary-strong bg-primary-strong text-white"
                      : "border-border bg-surface hover:border-primary"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!v.available}
          className="flex-1 rounded-full border border-primary-strong px-6 py-3 text-sm font-medium text-primary-strong transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!v.available}
          className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
