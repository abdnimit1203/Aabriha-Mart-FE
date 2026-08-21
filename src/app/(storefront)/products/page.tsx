import type { Metadata } from "next";
import { SortFilterBar } from "@/components/SortFilterBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductListingLayout } from "@/components/ProductListingLayout";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { apiFetch } from "@/lib/api";
import { getAllCategories } from "@/lib/catalog";
import { buildCategoryTree, collectIds, findNode } from "@/lib/categoryTree";
import { Product } from "@/types/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products — Aabriha Mart",
  description: "Browse everything at Aabriha Mart — clothing, shoes, bags & electronics.",
};

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const inStock = searchParams.inStock === "true";
  const categoryParam = typeof searchParams.category === "string" ? searchParams.category : "";
  const categoryIds = categoryParam.split(",").filter(Boolean);

  const categories = await getAllCategories();

  // Categories are a filter on this one page now, not a separate
  // destination — there's no dedicated /categories/[slug] page anymore. The
  // `category` param already carries the complete, expanded id set (every
  // category link and the sidebar's own checkboxes funnel through
  // expandCategorySelection/collectIds before ever reaching this URL), so
  // this page just passes it through verbatim rather than re-deriving it —
  // exactly one place computes "this category + its descendants."
  //
  // For the heading, work backwards: if the current selection is *exactly*
  // one category's full expanded set, show that category's name instead of
  // a generic "Products" — a courtesy for the common single-category case,
  // without needing a second copy of the expansion logic to get there.
  const tree = buildCategoryTree(categories);
  const selectedIdSet = new Set(categoryIds);
  const matchedCategory =
    categoryIds.length > 0
      ? categories.find((c) => {
          const node = findNode(tree, c._id);
          if (!node) return false;
          const nodeIds = collectIds(node);
          return nodeIds.length === selectedIdSet.size && nodeIds.every((id) => selectedIdSet.has(id));
        })
      : undefined;

  const baseQuery = new URLSearchParams({ status: "active", sort });
  if (inStock) baseQuery.set("inStock", "true");
  if (categoryParam) baseQuery.set("category", categoryParam);

  const query = new URLSearchParams(baseQuery);
  query.set("limit", "24");

  const { products, total } = await apiFetch<{ products: Product[]; total: number }>(
    `/api/products?${query.toString()}`
  );

  const heading = matchedCategory?.name ?? "All Products";

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(matchedCategory ? [{ label: "Products", href: "/products" }] : []),
          { label: heading },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>

      <ProductListingLayout categories={categories}>
        <SortFilterBar resultCount={total} />
        <CategoryProductGrid initialProducts={products} total={total} baseQuery={baseQuery.toString()} />
      </ProductListingLayout>
    </main>
  );
}
