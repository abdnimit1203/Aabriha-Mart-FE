import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Category, Product } from "@/types/catalog";
import { ProductCard } from "@/components/ProductCard";

// Re-fetch categories/products at most once a minute instead of freezing
// them at build time — admin changes should show up without a redeploy.
export const revalidate = 60;

async function getTopLevelCategories(): Promise<Category[]> {
  const categories = await apiFetch<Category[]>("/api/categories");
  return categories.filter((c) => !c.parent && c.isActive);
}

async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>("/api/products?status=active&limit=8");
  return products;
}

export default async function HomePage() {
  const [categories, products] = await Promise.all([getTopLevelCategories(), getFeaturedProducts()]);

  return (
    <main className="flex-1">
      <section className="border-b border-border bg-surface px-6 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Everyday essentials, delivered.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Clothing, shoes, bags & electronics — picked for everyday Bangladesh.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-strong px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Shop now
        </Link>
      </section>

      <section className="px-6 py-12">
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
                className="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm font-medium transition-colors hover:border-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-6 py-12">
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
