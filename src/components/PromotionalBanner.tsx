import Link from "next/link";
import { Promotion } from "@/types/storefront";

// object-contain inside a fixed max-height box, rather than a fixed aspect
// ratio: the container's size never depends on the uploaded image's
// dimensions (per the "unusual image dimensions must not break layout"
// requirement), and unlike object-cover it never crops a self-contained
// flyer that already bakes its own text/CTA into the artwork.
export function PromotionalBanner({ promotion }: { promotion: Promotion | null }) {
  if (!promotion) return null;

  const hasOverlay = Boolean(promotion.titleEn || promotion.descriptionEn);

  return (
    <section className="mt-16">
      <Link
        href={promotion.ctaUrl}
        className="group relative mx-auto flex max-h-120 w-full max-w-2xl items-center justify-center overflow-hidden rounded-3xl bg-background"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={promotion.image}
          alt={promotion.titleEn || "Promotion"}
          className="max-h-120 w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {hasOverlay && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-6 text-white">
            {promotion.titleEn && <h3 className="text-xl font-semibold">{promotion.titleEn}</h3>}
            {promotion.descriptionEn && <p className="mt-1 text-sm text-white/90">{promotion.descriptionEn}</p>}
            {promotion.ctaLabelEn && (
              <span className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium">
                {promotion.ctaLabelEn}
              </span>
            )}
          </div>
        )}
      </Link>
    </section>
  );
}
