import { ChevronIcon } from "@/components/icons";

/** Which page numbers to actually render as boxes, with "…" gaps marked as
 * null — always first, last, current, and current's immediate neighbors, so
 * the control stays a fixed, scannable width regardless of how many pages
 * exist (a 400-page catalog doesn't render 400 boxes). */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push(null);
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disables all navigation, e.g. while a background refetch is already in flight. */
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-center gap-1.5 text-sm">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || disabled}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded border border-border disabled:cursor-not-allowed disabled:opacity-40 hover:bg-background"
      >
        <ChevronIcon className="h-4 w-4 rotate-180" />
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={disabled}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium tabular-nums disabled:cursor-not-allowed disabled:opacity-40 ${
              p === page
                ? "border-primary bg-primary text-white"
                : "border-border text-foreground hover:bg-background"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || disabled}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded border border-border disabled:cursor-not-allowed disabled:opacity-40 hover:bg-background"
      >
        <ChevronIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
