import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { getTopLevelCategories, getFeaturedProducts } from "@/lib/catalog";

// Re-fetch categories/products at most once a minute instead of freezing
// them at build time — admin changes should show up without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const [categories, products] = await Promise.all([getTopLevelCategories(), getFeaturedProducts()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14">
      <section className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Everyday essentials, delivered.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Clothing, shoes, bags & electronics — picked for everyday Bangladesh.
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl sm:mt-10">
        <HeroSlider />
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">Shop by category</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No categories yet. They will appear here once added in the admin dashboard.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">Popular products</h2>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No products found. Check back soon, or explore another category.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
