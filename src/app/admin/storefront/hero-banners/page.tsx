"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getHeroBanners } from "@/lib/catalog";
import { deleteHeroBanner } from "@/lib/admin/heroBanners";
import { HeroBanner } from "@/types/storefront";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { TrashIcon } from "@/components/icons";
import { confirmToast } from "@/lib/confirmToast";

export default function AdminHeroBannersPage() {
  const { getIdToken } = useAuth();
  const [banners, setBanners] = useState<HeroBanner[] | null>(null);

  const load = useCallback(() => {
    getHeroBanners()
      .then((res) => setBanners([...res].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setBanners([]));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(banner: HeroBanner) {
    if (!(await confirmToast(`Delete "${banner.titleEn}"? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await deleteHeroBanner(idToken, banner._id);
      toast.success("Hero banner deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this hero banner.");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Hero Banners"
        description="Slides shown in the homepage hero carousel."
        actions={
          <Link href="/admin/storefront/hero-banners/new" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong">
            New Hero Banner
          </Link>
        }
      />

      {!banners ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hero banners yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Banner</th>
              <th className="pb-2 font-medium">Sort</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner._id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.desktopImage} alt="" className="h-10 w-16 rounded-lg border border-border object-cover" />
                    <span className="text-sm font-medium">{banner.titleEn}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-sm text-muted-foreground">{banner.sortOrder}</td>
                <td className="py-2.5 pr-3">
                  {banner.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">Hidden</span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/storefront/hero-banners/${banner._id}/edit`} className="mr-3 text-sm text-primary-strong hover:underline">
                    Edit
                  </Link>
                  <button type="button" onClick={() => handleDelete(banner)} aria-label={`Delete ${banner.titleEn}`} className="text-danger hover:opacity-70">
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
