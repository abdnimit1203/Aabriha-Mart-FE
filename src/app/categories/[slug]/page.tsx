import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SortFilterBar } from "@/components/SortFilterBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { apiFetch } from "@/lib/api";
import { getAllCategories, categoryAndChildrenIds } from "@/lib/catalog";
import { Product } from "@/types/catalog";

export const revalidate = 60;

async function getCategory(slug: string) {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug && c.isActive);
  return { category, categories };
}

export async function generateMetadata(props: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const { category } = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Aabriha Mart`,
    description: `Shop ${category.name} at Aabriha Mart — clothing, shoes, bags & electronics for everyday Bangladesh.`,
  };
}

export default async function CategoryPage(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const { category, categories } = await getCategory(slug);
  if (!category) notFound();

  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const inStock = searchParams.inStock === "true";

  const categoryIds = categoryAndChildrenIds(category, categories);
  const query = new URLSearchParams({
    category: categoryIds.join(","),
    status: "active",
    sort,
    limit: "24",
  });
  if (inStock) query.set("inStock", "true");

  const { products, total } = await apiFetch<{ products: Product[]; total: number }>(
    `/api/products?${query.toString()}`
  );

  const parent = category.parent ? categories.find((c) => c._id === category.parent) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
          { label: category.name },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{category.name}</h1>

      <div className="mt-6">
        <SortFilterBar resultCount={total} />
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No products found. Try another category or filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
