"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAllCategories } from "@/lib/catalog";
import { getProductAdmin } from "@/lib/admin/products";
import { Category, Product } from "@/types/catalog";
import { ProductForm } from "@/app/admin/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
    getProductAdmin(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  if (!categories || product === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!product) return <p className="text-sm text-danger">Product not found.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Edit Product</h2>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
