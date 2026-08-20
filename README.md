# Aabriha Mart — Frontend

Next.js (App Router) storefront and admin dashboard for Aabriha Mart. React 19 + TypeScript + Tailwind CSS v4. Talks to the [backend](../Aabriha-Mart-BE) exclusively over HTTP via `src/lib/api.ts` — no direct database access.

See [`../docs/architecture.md`](../docs/architecture.md) for the full architectural record.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Runs at `http://localhost:3000` (Turbopack dev server). The backend must be running separately — see [`../Aabriha-Mart-BE/README.md`](../Aabriha-Mart-BE/README.md) — and reachable at whatever `NEXT_PUBLIC_API_URL` points to (default `http://localhost:5000`).

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in real values. Never commit `.env.local` (already gitignored).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |
| `NEXT_PUBLIC_SITE_URL` | This site's own public URL (used for Open Graph / social-share image links) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (safe client-side) |
| `NEXT_PUBLIC_BKASH_NUMBER` | bKash merchant "Send Money" number shown at checkout |
| `NEXT_PUBLIC_NAGAD_NUMBER` | Nagad merchant "Send Money" number shown at checkout |
| `NEXT_PUBLIC_ANNOUNCEMENT_TEXT` | Legacy env-driven announcement fallback text (the announcement bar is now backend/CMS-driven; see architecture doc) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp click-to-chat number (country code, no `+`/spaces) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer contact email (hidden if unset) |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | Footer contact address (hidden if unset) |
| `NEXT_PUBLIC_FACEBOOK_URL` | Footer social link (hidden if unset) |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Footer social link (hidden if unset) |
| `NEXT_PUBLIC_LINKEDIN_URL` | Footer social link (hidden if unset) |
| `NEXT_PUBLIC_TWITTER_URL` | Footer social link (hidden if unset) |

All `NEXT_PUBLIC_*` variables are shipped to the browser by Next.js convention — never put a real secret in one. Genuinely secret values (Stripe secret key, ImageKit private key, Firebase service-account credentials) live only in the backend's environment.

## Build, typecheck, lint

```bash
npm run build   # production build (also type-checks via Next's build-time TS check)
npm run lint     # ESLint (eslint-config-next)
npx tsc --noEmit  # standalone type-check, no separate npm script defined
npm run start     # serve the production build
```

## Local URLs

- Frontend (this app): `http://localhost:3000`
- Backend API: `http://localhost:5000` (default; configurable via `NEXT_PUBLIC_API_URL`)

## Project structure

```text
src/
├── app/
│   ├── (storefront)/   Customer-facing pages — own layout (header, footer, popups, etc.)
│   │                    products, categories, cart, checkout, orders, account, login/signup...
│   └── admin/           Admin dashboard — own layout (sidebar, role-aware nav)
│       ├── products/, categories/, orders/   Catalog and order management
│       └── storefront/                        Homepage CMS (hero banners, promotions,
│                                                announcement bar, welcome popup) — super_admin only
├── components/          Shared UI (ProductCard, HeroSlider, Footer, ImageUploadField, ...)
├── context/              AuthContext, CartContext (React context providers)
├── lib/                  API client, catalog/orders/auth data-fetch helpers, admin CRUD clients
│   └── admin/            Admin-only API clients (categories, products, orders, storefront CMS)
├── hooks/                Shared hooks (usePrefersReducedMotion, useVariantSelector, ...)
├── types/                Shared TypeScript types mirroring backend response shapes
└── data/                 Static reference data (Bangladesh division/district list)
```

`(storefront)` and `admin` are Next.js route groups — they don't affect URLs, only which layout wraps each page.
