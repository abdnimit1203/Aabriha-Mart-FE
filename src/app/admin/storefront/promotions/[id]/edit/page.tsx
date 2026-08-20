"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPromotions } from "@/lib/catalog";
import { Promotion } from "@/types/storefront";
import { PromotionForm } from "../../PromotionForm";

export default function EditPromotionPage() {
  const { id } = useParams<{ id: string }>();
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  useEffect(() => {
    getPromotions().then(setPromotions).catch(() => setPromotions([]));
  }, []);

  if (!promotions) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const promotion = promotions.find((p) => p._id === id);
  if (!promotion) return <p className="text-sm text-danger">Promotion not found.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Edit Promotion</h2>
      <PromotionForm promotion={promotion} />
    </div>
  );
}
