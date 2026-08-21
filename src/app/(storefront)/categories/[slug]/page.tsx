import { redirect } from "next/navigation";
import { getAllCategories } from "@/lib/catalog";
import { expandCategorySelection } from "@/lib/categoryTree";

// Categories are a filter on /products now, not a separate page — this
// route only exists so old bookmarks/links to a category slug still land
// somewhere useful instead of 404ing. The redirect target carries the full
// expanded id set (this category + every descendant), computed the same
// way any other category link on the site does.
//
// A slug that doesn't match anything (renamed/deleted category, a stale
// external bookmark, or — as actually happened — a hardcoded content
// reference that never matched a real category) falls back to plain
// /products rather than notFound(). This route's only job now is legacy-link
// compatibility, so a dead-end 404 is a worse failure mode than "show
// everything" for exactly this kind of stale reference.
export default async function CategorySlugRedirect(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug && c.isActive);
  if (!category) redirect("/products");

  const ids = expandCategorySelection([category._id], categories);
  redirect(`/products?category=${ids.join(",")}`);
}
