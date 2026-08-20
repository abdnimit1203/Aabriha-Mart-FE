"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getHeroBanners } from "@/lib/catalog";
import { HeroBanner } from "@/types/storefront";
import { HeroBannerForm } from "../../HeroBannerForm";

export default function EditHeroBannerPage() {
  const { id } = useParams<{ id: string }>();
  const [banners, setBanners] = useState<HeroBanner[] | null>(null);

  useEffect(() => {
    getHeroBanners().then(setBanners).catch(() => setBanners([]));
  }, []);

  if (!banners) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const banner = banners.find((b) => b._id === id);
  if (!banner) return <p className="text-sm text-danger">Hero banner not found.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Edit Hero Banner</h2>
      <HeroBannerForm banner={banner} />
    </div>
  );
}
