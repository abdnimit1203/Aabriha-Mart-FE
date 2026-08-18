import Link from "next/link";
import Image from "next/image";
import { getTopLevelCategories } from "@/lib/catalog";
import { CategoriesMenu } from "@/components/CategoriesMenu";
import { SearchIcon, CartIcon, UserIcon } from "@/components/icons";

export async function Header() {
  // A header that fails to render breaks every page — degrade to an empty
  // category list instead of throwing if the API is briefly unreachable.
  const categories = await getTopLevelCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={36} height={36} className="object-contain" priority />
          <span className="text-lg font-semibold tracking-tight">Aabriha Mart</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <CategoriesMenu categories={categories} />
          <Link
            href="/new-arrivals"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-background"
          >
            New Arrivals
          </Link>
          <Link
            href="/offers"
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-background"
          >
            Offers
          </Link>
        </nav>

        <form
          action="/search"
          className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 sm:flex"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

        <Link
          href="/search"
          aria-label="Search"
          className="ml-auto rounded-full p-2 hover:bg-background sm:ml-0 sm:hidden"
        >
          <SearchIcon className="h-5 w-5" />
        </Link>
        <Link href="/account" aria-label="Account" className="rounded-full p-2 hover:bg-background">
          <UserIcon className="h-5 w-5" />
        </Link>
        <Link href="/cart" aria-label="Cart" className="rounded-full p-2 hover:bg-background">
          <CartIcon className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
