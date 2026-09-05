import type { ReactNode } from "react";
import toast from "react-hot-toast";

/** Replaces window.confirm() with an in-design-system toast so destructive
 * actions (delete, etc.) never fall back to the browser's native dialog.
 * Use this for every future confirm-before-destructive-action prompt.
 * `confirmLabel`/`cancelLabel`/`tone` default to the original delete-flow
 * look so every existing caller is unaffected; pass them for a non-delete
 * confirmation (e.g. a role change, or an order cancellation with its own
 * "Keep Order"/"Cancel Order" wording) where the defaults would read wrong.
 * `message` accepts JSX (not just a string) for prompts that need more than
 * one line — e.g. a consequence and an irreversibility warning as separate
 * paragraphs rather than one run-on sentence. */
export function confirmToast(
  message: ReactNode,
  options?: { confirmLabel?: string; cancelLabel?: string; tone?: "danger" | "primary" }
): Promise<boolean> {
  const confirmLabel = options?.confirmLabel ?? "Delete";
  const cancelLabel = options?.cancelLabel ?? "Cancel";
  const tone = options?.tone ?? "danger";

  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5 text-sm text-foreground">{message}</div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
            >
              {cancelLabel}
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
