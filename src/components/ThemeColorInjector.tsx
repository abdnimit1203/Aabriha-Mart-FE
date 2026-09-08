"use client";

import { useEffect } from "react";
import { getThemeSettings } from "@/lib/catalog";

/** Applies the admin-configured brand color as inline CSS custom properties
 * on <html> — every existing bg-primary/text-primary-strong/etc utility
 * class already resolves through --primary/--primary-strong
 * (globals.css's @theme block), so this is the one place that needs to
 * change for the whole storefront to pick up a new color, no per-component
 * edits anywhere else.
 *
 * Mounted only in the storefront layout, never admin — but Next.js keeps
 * <html> mounted across a client-side route change, so this alone wouldn't
 * stop the color leaking into /admin if someone navigates there without a
 * full reload. globals.css's .admin-shell pins --primary/--primary-strong
 * back to their fixed defaults explicitly for exactly that reason — this
 * component and that CSS rule are a matched pair, not independent. */
export function ThemeColorInjector() {
  useEffect(() => {
    getThemeSettings()
      .then(({ primaryColor, primaryColorStrong }) => {
        document.documentElement.style.setProperty("--primary", primaryColor);
        document.documentElement.style.setProperty("--primary-strong", primaryColorStrong);
      })
      .catch(() => {
        // Default CSS values already in globals.css cover this — no
        // fallback logic needed, just don't let a failed fetch throw.
      });
  }, []);

  return null;
}
