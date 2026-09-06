"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getMarketingSettings } from "@/lib/catalog";
import { disableFacebookPixel, initFacebookPixel, trackPageView } from "@/lib/fbPixel";

interface PixelConfig {
  enabled: boolean;
  pixelId: string;
}

// Mounted once in (storefront)/layout.tsx only — never in the admin layout,
// so staff visits to the dashboard never pollute ad data. Renders nothing;
// its only job is to load the Pixel (if configured) and fire PageView on
// every route change.
export function FacebookPixel() {
  const pathname = usePathname();
  const [config, setConfig] = useState<PixelConfig | null>(null);

  useEffect(() => {
    getMarketingSettings()
      .then((settings) => setConfig({ enabled: settings.facebookPixelEnabled, pixelId: settings.facebookPixelId }))
      .catch(() => setConfig({ enabled: false, pixelId: "" }));
  }, []);

  useEffect(() => {
    if (!config) return; // still loading — anything fired elsewhere meanwhile is buffered, not lost
    if (!config.enabled || !config.pixelId) {
      disableFacebookPixel();
      return;
    }
    initFacebookPixel(config.pixelId); // idempotent — only truly runs once
    trackPageView(); // fires for the initial path once config loads, and again on every later route change
  }, [config, pathname]);

  return null;
}
