// Matches ProductCard's exact box model (aspect-square image + ~3 text
// lines + padding) so a loading grid doesn't visibly reflow once real cards
// swap in.
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="aspect-square animate-pulse bg-background" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-background" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-background" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-background" />
      </div>
    </div>
  );
}
