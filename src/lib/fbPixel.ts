// Centralized Facebook Pixel tracking — every event call in the app funnels
// through this module; nothing calls window.fbq directly from a component.
// This is deliberate: it's the single place a consent gate would go later
// (one check inside `fire()` below would cover every event site at once),
// and the single place that knows how initialization/idempotency works.

interface FbqFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: unknown;
  }
}

// Whether the Pixel is initializing, confirmed on, or confirmed off. Starts
// "pending" because <FacebookPixel> (mounted once in the storefront layout)
// fetches the marketing-settings config asynchronously — every OTHER
// component that fires an event (ProductPurchasePanel's ViewContent,
// CartContext's AddToCart, the checkout page's InitiateCheckout/Purchase)
// mounts and fires independently of that fetch, and can easily run before
// it resolves. Without this buffering, an event fired during that window
// would silently no-op against a `window.fbq` that doesn't exist yet.
type PixelState = "pending" | "enabled" | "disabled";
let state: PixelState = "pending";
let initialized = false;
const pendingEvents: { event: string; params?: Record<string, unknown> }[] = [];

/** Injects Meta's base Pixel script and calls fbq('init', pixelId) — once.
 * Safe to call on every render/mount; only the first real call does
 * anything, matching Meta's own snippet's own idempotency guard (`if
 * (f.fbq) return`) with an extra guard of our own so we don't even attempt
 * the script-injection DOM work more than once. Flushes anything fired
 * while the pixel was still "pending". */
export function initFacebookPixel(pixelId: string): void {
  if (initialized || !pixelId || typeof window === "undefined") return;
  initialized = true;

  if (!window.fbq) {
    const n: FbqFunction = Object.assign(
      function (...args: unknown[]) {
        if (n.callMethod) {
          n.callMethod(...args);
        } else {
          n.queue.push(args);
        }
      },
      { queue: [] as unknown[], loaded: true, version: "2.0" }
    );
    window.fbq = n;
    if (!window._fbq) window._fbq = n;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq("init", pixelId);
  state = "enabled";
  for (const { event, params } of pendingEvents) window.fbq("track", event, params);
  pendingEvents.length = 0;
}

/** Called once <FacebookPixel> learns the config is disabled/unset — drops
 * anything that was buffered while "pending" (correctly: there's no pixel
 * to ever deliver them to) and makes every future call a plain no-op. */
export function disableFacebookPixel(): void {
  state = "disabled";
  pendingEvents.length = 0;
}

// The one choke point every tracked event passes through. A future consent
// gate is a single early-return here — e.g. `if (!hasConsent()) return;` —
// rather than a change at every call site below.
function fire(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || state === "disabled") return;
  if (state === "pending") {
    pendingEvents.push({ event, params });
    return;
  }
  window.fbq?.("track", event, params);
}

export function trackPageView(): void {
  fire("PageView");
}

// No customer-identifying data in any of these (no email/phone/name) — just
// product IDs and monetary value, per the "no Advanced Matching/PII" scope
// this was built under.
const CURRENCY = "BDT";

export function trackViewContent(params: { contentId: string; value: number }): void {
  fire("ViewContent", { content_ids: [params.contentId], content_type: "product", value: params.value, currency: CURRENCY });
}

export function trackAddToCart(params: { contentId: string; value: number }): void {
  fire("AddToCart", { content_ids: [params.contentId], content_type: "product", value: params.value, currency: CURRENCY });
}

export function trackInitiateCheckout(params: { contentIds: string[]; value: number; numItems: number }): void {
  fire("InitiateCheckout", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    num_items: params.numItems,
    currency: CURRENCY,
  });
}

// Meta's two required parameters for Purchase are value + currency — both
// always supplied here, never omitted.
export function trackPurchase(params: { contentIds: string[]; value: number }): void {
  fire("Purchase", { content_ids: params.contentIds, content_type: "product", value: params.value, currency: CURRENCY });
}
