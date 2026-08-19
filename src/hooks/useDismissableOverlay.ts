"use client";

import { useEffect, useRef } from "react";

interface UseDismissableOverlayOptions {
  open: boolean;
  onDismiss: () => void;
  /** Also dismiss on a pointerdown outside the returned ref's element. Off
   * for surfaces that already have their own outside-click target (e.g. a
   * drawer's backdrop). Defaults to on. */
  outsideClick?: boolean;
}

/** Escape-to-close and outside-click-to-close for any open/closed overlay —
 * a dropdown menu, a drawer. Attach the returned ref to the element that
 * should be treated as "inside". */
export function useDismissableOverlay<T extends HTMLElement>({
  open,
  onDismiss,
  outsideClick = true,
}: UseDismissableOverlayOptions) {
  const rootRef = useRef<T>(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismissRef.current();
    }
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onDismissRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    if (outsideClick) document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (outsideClick) document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, outsideClick]);

  return rootRef;
}
