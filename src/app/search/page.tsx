import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SortFilterBar } from "@/components/SortFilterBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { apiFetch } from "@/lib/api";
import { Product } from "@/types/catalog";

export const revalidate = 60;

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  return { title: q ? `"${q}" — Search results — Aabriha Mart` : "Search — Aabriha Mart" };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const inStock = searchParams.inStock === "true";

  let products: Product[] = [];
  let total = 0;

  if (q) {
    const query = new URLSearchParams({ search: q, status: "active", sort, limit: "24" });
    if (inStock) query.set("inStock", "true");
    const result = await apiFetch<{ products: Product[]; total: number }>(`/api/products?${query.toString()}`);
    products = result.products;
    total = result.total;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {q ? `Search results for "${q}"` : "Search"}
      </h1>

      {!q ? (
        <p className="mt-8 text-sm text-muted-foreground">Enter a search term above to find products.</p>
      ) : (
        <>
          <div className="mt-6">
            <SortFilterBar resultCount={total} />
          </div>

          {products.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No products found. Try a different search term.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
