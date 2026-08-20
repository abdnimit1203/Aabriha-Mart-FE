"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { getWelcomePopup } from "@/lib/catalog";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DISMISS_KEY = "aabriha-welcome-popup-dismissed";

// Renders nothing itself — fires an imperative SweetAlert2 dialog on first
// visit only, heavily restyled via customClass (see .aabriha-popup* rules in
// globals.css) so it reads as an Aabriha Mart promo, not default SweetAlert
// chrome. No `icon` option is passed, which is what keeps SweetAlert2's
// default checkmark/warning icon from ever appearing.
export function WelcomePopup() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;

    getWelcomePopup()
      .then((popup) => {
        if (cancelled || !popup.enabled) return;

        let alreadyDismissed = false;
        try {
          alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "true";
        } catch {
          // localStorage unavailable — treat as not-yet-dismissed.
        }
        if (alreadyDismissed) return;

        const hasCta = Boolean(popup.ctaLabel && popup.ctaUrl);

        Swal.fire({
          html: `
            <div class="aabriha-popup-body">
              ${popup.image ? `<img src="${popup.image}" alt="" class="aabriha-popup-image" />` : ""}
              ${popup.titleEn ? `<h2 class="aabriha-popup-title">${popup.titleEn}</h2>` : ""}
              ${popup.descriptionEn ? `<p class="aabriha-popup-description">${popup.descriptionEn}</p>` : ""}
            </div>
          `,
          showConfirmButton: hasCta,
          confirmButtonText: popup.ctaLabel || "Shop Now",
          showCloseButton: true,
          buttonsStyling: false,
          animation: !reducedMotion,
          customClass: {
            popup: "aabriha-popup",
            htmlContainer: "aabriha-popup-html",
            confirmButton: "aabriha-popup-cta",
            closeButton: "aabriha-popup-close",
          },
        }).then((result) => {
          if (result.isConfirmed && popup.ctaUrl) {
            window.location.href = popup.ctaUrl;
          }
        });

        try {
          localStorage.setItem(DISMISS_KEY, "true");
        } catch {
          // Non-fatal — it just may show again next visit.
        }
      })
      .catch(() => {
        // No popup config yet, or the fetch failed — fail silent, never
        // block the homepage on this.
      });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return null;
}
