import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Product } from "@/types/catalog";

/** Shared presentation for every homepage product row (Popular, New
 * Arrivals, Special Offers) — one heading/description/"View all" pattern
 * instead of three copy-pasted blocks. Renders nothing when there are no
 * qualifying products, rather than an empty heading or a "no products"
 * message on a public storefront homepage. */
export function ProductSection({
  title,
  description,
  products,
  viewAllHref,
  tone = "default",
}: {
  title: string;
  description?: string;
  products: Product[];
  viewAllHref: string;
  /** "sale" gives Special Offers its own visual identity — a soft tinted
   * band — so it doesn't read as just another product grid. */
  tone?: "default" | "sale";
}) {
  if (products.length === 0) return null;

  const content = (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Link href={viewAllHref} className="shrink-0 text-sm font-medium text-primary-strong hover:underline">
          View all →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );

  if (tone === "sale") {
    return (
      <section className="mt-14 rounded-3xl bg-danger/5 p-5 sm:mt-20 sm:p-8">
        <ScrollReveal>{content}</ScrollReveal>
      </section>
    );
  }

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>{content}</ScrollReveal>
    </section>
  );
}
