import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SortFilterBar } from "@/components/SortFilterBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductListingLayout } from "@/components/ProductListingLayout";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { ScrollReveal } from "@/components/ScrollReveal";
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
  // Explicit selection (from the sidebar) overrides the default rollup of
  // this category + its children, so checking a sibling/other-branch
  // category in the sidebar actually changes the results shown here.
  const categoryParam = typeof searchParams.category === "string" ? searchParams.category : "";
  const categoryIds = categoryParam ? categoryParam.split(",").filter(Boolean) : categoryAndChildrenIds(category, categories);

  const baseQuery = new URLSearchParams({
    category: categoryIds.join(","),
    status: "active",
    sort,
  });
  if (inStock) baseQuery.set("inStock", "true");

  const query = new URLSearchParams(baseQuery);
  query.set("limit", "24");

  const { products, total } = await apiFetch<{ products: Product[]; total: number }>(
    `/api/products?${query.toString()}`
  );

  const parent = category.parent ? categories.find((c) => c._id === category.parent) : null;
  const children = categories.filter((c) => c.parent === category._id && c.isActive);

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
          { label: category.name },
        ]}
      />

      <ScrollReveal>
        <div
          className={`relative mt-3 overflow-hidden rounded-3xl border border-border ${
            category.image ? "bg-primary-strong" : "bg-surface"
          }`}
        >
          {category.image && (
            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URLs aren't in next/image's allowed hosts; every other dynamic image in this app (ProductCard, FeaturedCollections, banners) uses a plain <img> for the same reason.
            <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          )}
          <div className={`relative px-6 py-10 sm:px-10 sm:py-14 ${category.image ? "text-white" : ""}`}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{category.name}</h1>
            <p className={`mt-1.5 text-sm ${category.image ? "text-white/80" : "text-muted-foreground"}`}>
              {total} product{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {children.length > 0 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {children.map((child) => (
              <Link
                key={child._id}
                href={`/categories/${child.slug}`}
                className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-background"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </ScrollReveal>

      <ProductListingLayout categories={categories} defaultSelectedId={category._id}>
        <SortFilterBar resultCount={total} />
        <CategoryProductGrid initialProducts={products} total={total} baseQuery={baseQuery.toString()} />
      </ProductListingLayout>
    </main>
  );
}
