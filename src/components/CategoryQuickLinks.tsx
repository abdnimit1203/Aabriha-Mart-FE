import Link from "next/link";
import { Category } from "@/types/catalog";

export function CategoryQuickLinks({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Quick category links" className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/categories/${category.slug}`}
          className="shrink-0 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary-strong"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
