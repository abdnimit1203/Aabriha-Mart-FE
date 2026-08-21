import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Promotion } from "@/types/storefront";

/** A wide, asymmetric lifestyle/merchandising banner — visually distinct
 * from PromotionalBanner's centered "campaign flyer" treatment even though
 * both read from the same Promotion model (this is deliberately the 2nd
 * active promotion, not a separate CMS concept — see getActivePromotions).
 * Text and CTA sit over one side of a full-bleed image rather than a
 * centered overlay, and the CTA is an outline pill rather than a filled one,
 * so the two banner types don't look like copies of each other. */
export function EditorialBanner({ promotion }: { promotion: Promotion | null }) {
  if (!promotion) return null;

  const hasText = Boolean(promotion.titleEn || promotion.descriptionEn);

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <Link
          href={promotion.ctaUrl}
          className="group relative block aspect-[16/10] w-full overflow-hidden rounded-3xl bg-background sm:aspect-[21/9]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promotion.image}
            alt={promotion.titleEn || "Featured collection"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {hasText && (
            <>
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/20 to-transparent sm:from-black/65 sm:via-transparent" />
              <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-6 sm:p-10">
                {promotion.titleEn && (
                  <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{promotion.titleEn}</h3>
                )}
                {promotion.descriptionEn && <p className="mt-2 text-sm text-white/85 sm:text-base">{promotion.descriptionEn}</p>}
                {promotion.ctaLabelEn && (
                  <span className="mt-5 inline-flex w-fit items-center rounded-full border border-white/70 px-5 py-2 text-sm font-medium text-white transition-colors group-hover:bg-white group-hover:text-foreground">
                    {promotion.ctaLabelEn}
                  </span>
                )}
              </div>
            </>
          )}
        </Link>
      </ScrollReveal>
    </section>
  );
}
