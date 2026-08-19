"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAllCategories } from "@/lib/catalog";
import { Category } from "@/types/catalog";
import { CategoryForm } from "@/app/admin/categories/CategoryForm";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (!categories) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const category = categories.find((c) => c._id === id);
  if (!category) return <p className="text-sm text-danger">Category not found.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Edit Category</h2>
      <CategoryForm category={category} allCategories={categories} />
    </div>
  );
}
