import toast from "react-hot-toast";

/** Replaces window.confirm() with an in-design-system toast so destructive
 * actions (delete, etc.) never fall back to the browser's native dialog.
 * Use this for every future confirm-before-destructive-action prompt. */
export function confirmToast(message: string): Promise<boolean> {
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
              className="rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}
