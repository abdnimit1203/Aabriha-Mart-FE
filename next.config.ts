import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev-mode build-activity badge only ever shows in `next dev`
  // (never in production) — off so it doesn't clutter admin-dashboard review.
  devIndicators: false,
};

export default nextConfig;
