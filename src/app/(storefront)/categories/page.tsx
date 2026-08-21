import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getAllCategories, getTopLevelCategories } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categories — Aabriha Mart",
  description: "Shop by category at Aabriha Mart — clothing, shoes, bags & electronics.",
};

export default async function CategoriesPage() {
  const [topLevel, all] = await Promise.all([getTopLevelCategories(), getAllCategories()]);

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>

      {topLevel.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topLevel.map((category) => {
            const children = all.filter((c) => c.parent === category._id && c.isActive);
            return (
              <div key={category._id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <Link href={`/categories/${category.slug}`} className="text-sm font-semibold hover:text-primary-strong">
                  {category.name}
                </Link>
                {children.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {children.map((child) => (
                      <li key={child._id}>
                        <Link
                          href={`/categories/${child.slug}`}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
