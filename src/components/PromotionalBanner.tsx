import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Promotion } from "@/types/storefront";

// object-contain inside a fixed max-height box, rather than a fixed aspect
// ratio: the container's size never depends on the uploaded image's
// dimensions (per the "unusual image dimensions must not break layout"
// requirement), and unlike object-cover it never crops a self-contained
// flyer that already bakes its own text/CTA into the artwork. Wrapped in a
// bg-surface card (rather than floating directly on the page) so a portrait
// flyer sits centered with balanced framing instead of looking like a
// random image dropped between product grids.
export function PromotionalBanner({ promotion }: { promotion: Promotion | null }) {
  if (!promotion) return null;

  const hasOverlay = Boolean(promotion.titleEn || promotion.descriptionEn);

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <Link
          href={promotion.ctaUrl}
          className="group relative flex max-h-136 w-full items-center justify-center overflow-hidden rounded-3xl bg-surface"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promotion.image}
            alt={promotion.titleEn || "Promotion"}
            className="max-h-136 w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {hasOverlay && (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-6 text-white sm:p-8">
              {promotion.titleEn && <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{promotion.titleEn}</h3>}
              {promotion.descriptionEn && <p className="mt-1.5 max-w-md text-sm text-white/90 sm:text-base">{promotion.descriptionEn}</p>}
              {promotion.ctaLabelEn && (
                <span className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium transition-colors group-hover:bg-primary-strong">
                  {promotion.ctaLabelEn}
                </span>
              )}
            </div>
          )}
        </Link>
      </ScrollReveal>
    </section>
  );
}
