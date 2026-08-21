import toast from "react-hot-toast";

/** Replaces window.confirm() with an in-design-system toast so destructive
 * actions (delete, etc.) never fall back to the browser's native dialog.
 * Use this for every future confirm-before-destructive-action prompt.
 * `confirmLabel`/`tone` default to the original delete-flow look so every
 * existing caller is unaffected; pass them for a non-delete confirmation
 * (e.g. a role change) where a red "Delete" button would read wrong. */
export function confirmToast(
  message: string,
  options?: { confirmLabel?: string; tone?: "danger" | "primary" }
): Promise<boolean> {
  const confirmLabel = options?.confirmLabel ?? "Delete";
  const tone = options?.tone ?? "danger";

  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 ${
                tone === "danger" ? "bg-danger" : "bg-primary"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}
