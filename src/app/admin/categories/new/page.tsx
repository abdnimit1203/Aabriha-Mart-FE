"use client";

import { useEffect, useState } from "react";
import { getAllCategories } from "@/lib/catalog";
import { Category } from "@/types/catalog";
import { CategoryForm } from "@/app/admin/categories/CategoryForm";

export default function NewCategoryPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (!categories) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">New Category</h2>
      <CategoryForm allCategories={categories} />
    </div>
  );
}
