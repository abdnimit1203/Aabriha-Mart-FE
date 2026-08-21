import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiFetch, ApiError } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { Product } from "@/types/catalog";

export const revalidate = 60;

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Aabriha Mart`,
    description: product.description ?? `Buy ${product.name} at Aabriha Mart.`,
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = typeof product.category === "object" ? product.category : null;

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
          {product.ratingCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              ★ {product.ratingAverage.toFixed(1)} ({product.ratingCount} reviews)
            </p>
          )}

          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold sm:text-base">Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
