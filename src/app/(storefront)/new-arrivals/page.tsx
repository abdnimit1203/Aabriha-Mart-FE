import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SortFilterBar } from "@/components/SortFilterBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductListingLayout } from "@/components/ProductListingLayout";
import { apiFetch } from "@/lib/api";
import { getAllCategories } from "@/lib/catalog";
import { Product } from "@/types/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "New Arrivals — Aabriha Mart",
  description: "The newest additions to Aabriha Mart — clothing, shoes, bags & electronics.",
};

export default async function NewArrivalsPage(props: PageProps<"/new-arrivals">) {
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const inStock = searchParams.inStock === "true";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";

  const categories = await getAllCategories();

  const query = new URLSearchParams({ status: "active", sort, limit: "24" });
  if (inStock) query.set("inStock", "true");
  if (category) query.set("category", category);

  const { products, total } = await apiFetch<{ products: Product[]; total: number }>(
    `/api/products?${query.toString()}`
  );

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New Arrivals</h1>

      <ProductListingLayout categories={categories}>
        <SortFilterBar resultCount={total} />
        {products.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No products found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </ProductListingLayout>
    </main>
  );
}
