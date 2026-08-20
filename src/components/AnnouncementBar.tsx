"use client";

import { useEffect, useState } from "react";
import { getAnnouncement } from "@/lib/catalog";
import { Announcement } from "@/types/storefront";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CloseIcon } from "@/components/icons";

const DISMISS_KEY_PREFIX = "aabriha-announcement-dismissed-";

// Cheap non-cryptographic hash — just needs to change when the message
// changes, so a *new* announcement re-shows even if a prior one was
// dismissed, without storing the whole message string as the key.
function hashMessage(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 31 + message.charCodeAt(i)) | 0;
  }
  return String(hash);
}

export function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    getAnnouncement()
      .then((a) => {
        setAnnouncement(a);
        if (a.enabled && a.messageEn) {
          try {
            setDismissed(localStorage.getItem(DISMISS_KEY_PREFIX + hashMessage(a.messageEn)) === "true");
          } catch {
            // localStorage unavailable — just show it, non-fatal.
          }
        }
      })
      .catch(() => setAnnouncement(null));
  }, []);

  if (!announcement?.enabled || !announcement.messageEn || dismissed) return null;

  function handleDismiss() {
    if (!announcement) return;
    try {
      localStorage.setItem(DISMISS_KEY_PREFIX + hashMessage(announcement.messageEn), "true");
    } catch {
      // Non-fatal — it just won't stay dismissed across reloads.
    }
    setDismissed(true);
  }

  const content = (
    <span className="text-xs font-medium sm:text-sm">
      {announcement.messageEn}
      {announcement.url && announcement.linkLabel && (
        <a href={announcement.url} className="ml-2 underline underline-offset-2">
          {announcement.linkLabel}
        </a>
      )}
    </span>
  );

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-primary-strong px-10 py-2 text-white">
      {announcement.marquee && !reducedMotion ? (
        <div className="animate-marquee whitespace-nowrap">{content}</div>
      ) : (
        <div className="text-center">{content}</div>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
