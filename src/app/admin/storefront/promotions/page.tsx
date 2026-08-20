"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getPromotions } from "@/lib/catalog";
import { deletePromotion } from "@/lib/admin/promotions";
import { Promotion } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { TrashIcon } from "@/components/icons";
import { confirmToast } from "@/lib/confirmToast";

export default function AdminPromotionsPage() {
  const { getIdToken } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  const load = useCallback(() => {
    getPromotions()
      .then((res) => setPromotions([...res].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setPromotions([]));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(promotion: Promotion) {
    if (!(await confirmToast(`Delete this promotion? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await deletePromotion(idToken, promotion._id);
      toast.success("Promotion deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this promotion.");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="The campaign banner shown on the homepage."
        actions={
          <Link href="/admin/storefront/promotions/new" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            New Promotion
          </Link>
        }
      />

      {!promotions ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : promotions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No promotions yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Promotion</th>
              <th className="pb-2 font-medium">Sort</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion._id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={promotion.image} alt="" className="h-12 w-10 rounded-lg border border-border object-cover" />
                    <span className="text-sm font-medium">{promotion.titleEn || "(image only)"}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-sm text-muted-foreground">{promotion.sortOrder}</td>
                <td className="py-2.5 pr-3">
                  {promotion.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/storefront/promotions/${promotion._id}/edit`} className="mr-3 text-sm text-primary-strong hover:underline">
                    Edit
                  </Link>
                  <button type="button" onClick={() => handleDelete(promotion)} aria-label="Delete promotion" className="text-danger hover:opacity-70">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
