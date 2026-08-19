export interface CartItem {
  productId: string;
  productSlug: string;
  variantId?: string;
  name: string;
  image?: string;
  attributes?: Record<string, string>;
  /** Snapshot for display only — checkout re-validates against the database. */
  unitPrice: number;
  quantity: number;
  /** Caps the quantity stepper; a snapshot too, re-checked at checkout. */
  maxStock: number;
}
