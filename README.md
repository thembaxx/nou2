# Carpur · Ownership forecasting

A South African automotive marketplace project with editable vehicle-ownership forecasting.

[Browse the source](https://github.com/thembaxx/nou2)

## Engineering highlights

Routed Next.js UI, Prisma/PostgreSQL and Better Auth tooling, plus Vitest and Playwright scripts. Deployment and external-service configuration must be verified separately.

## Technology

Declared in [package.json](package.json): Next.js `16.4.0` · React `^19.2.0` · TypeScript `^5.9.0` · Tailwind CSS `^4.1.0` · Three.js `^0.180.0` · Motion `^12.0.0` · React Three Fiber `^9.0.0` · Prisma `6.19.3` · Better Auth `1.7.7` · Zod `^4.0.0`.

**Quality tooling:** `typecheck`, `lint`, `format:check`, `test`, `test:e2e` scripts are available. See the setup guide below for prerequisites; this documentation pass does not assert that those checks were run.

---

## Project guide

South African automotive marketplace with editable ownership forecasting. Built from the supplied `carpur-source.zip`; its cinematic Carpur design, editorial imagery, initial financial module and product direction are retained and expanded into a routed application.

GitHub target: **thembaxx/nou2** (updated by the user during implementation).

## Stack

Next.js 16 App Router, React, TypeScript, Tailwind 4, shadcn-style Radix primitives, pnpm 10.18, Oxlint, Oxfmt, Motion, adaptive React Three Fiber / Three.js, Recharts, PostgreSQL, Prisma 6 and Better Auth.

## Local setup

Use Node 22+ and the pinned pnpm version. Copy `.env.example` to `.env.development.local`; configure your own local PostgreSQL URL and a cryptographically random `BETTER_AUTH_SECRET`. Do not commit secrets. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local development. Prisma CLI scripts need `DATABASE_URL` exported or supplied through an env-file loader; only Next.js automatically loads `.env.development.local`.

```sh
corepack enable
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

In managed environments whose fallback `pnpm` differs, use `npx -y pnpm@10.18.0` for each command. `pnpm-workspace.yaml` permits only the reviewed Prisma, esbuild and sharp build scripts.

Without database/auth configuration, the manufacturer catalogue, browser garage, 3D explorer and financial tools work. Publishing and enquiries fail closed rather than reporting success.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Browser tests require a running app with an isolated PostgreSQL database and configured auth:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium` when the host provides Chromium. Use `BASE_URL` to test a deployment. Tests create clearly labelled QA fixtures and remove listings in a `finally` block. Use an isolated database; remove QA accounts after testing. Do not use real personal data.

## Features

- Buying-first home with new cars before used cars, manufacturer catalogue, seller inventory and explicitly illustrative examples. New/used condition, make, price, body, powertrain and seller filters.
- 44 real Toyota variants from ten official South African model pages, dated reference prices/specifications, source links and external manufacturer buying options. Catalogue models are never disguised as stock. Seller listings accept any make and broad body/powertrain types.
- Routed vehicle details with full-screen photo inspection, pinch/double-tap zoom, panning, swipe/keyboard navigation, seller information, safety guidance and enquiry inbox delivery.
- Private and dealership listings, compressed uploads or HTTPS photo URLs, drafts, publish/edit/sold/archive/delete workflows and owner checks.
- Seller dashboard, buyer garage with authenticated cross-device saves and anonymous browser saves.
- Editable fixed-rate finance, deposit, balloon, term, fuel/energy, insurance, maintenance and depreciation; separate PHEV charging allowances; 1/3/5-year cash and net ownership projections; stress scenarios, different energy prices in comparison and accessible chart tables.
- No credit scores or finance approvals. All default financial figures are illustrative. Official source links and methodology are documented at `/sources`.
- Mobile-first squircle layouts from 320 px to wide desktops; light/dark/device themes, Phosphor SVG icons with no emoji, 44 px touch targets, keyboard controls, reduced motion, staggered scroll/filter reveals and responsive touch/hover feedback. Use individual server-compatible Phosphor icon imports for UI controls; keep decorative icons hidden from assistive technology and label their controls.
- Native real-car 3D models of Ferrari 458 family and BMW M3 E30 with drag/pinch gestures, damped camera transitions, camera presets, zoom/reset, paint preview, interior visibility and opt-in rotation that preserves the viewing angle when paused. Responsive eight-angle previews rendered from those actual assets for modest devices; demand rendering, bounded DPR, enhanced materials/studio lighting/shadows, a lighter software-graphics path, offscreen/background suspension and persistent battery/detail overrides. Toyota Corolla Cross is a licensed source reference with an external viewing link; no embedded integration is claimed. Rich charts and Motion load only when useful.
- Sharp editorial derivatives up to 3200px (Golf up to 2400px), loaded by size and pixel density. Public manufacturer imagery uses Next.js responsive WebP optimisation from its larger original source, with a direct-source fallback. Data saving lowers compression quality; CPU/GPU power does not force 100px thumbnails. Seller photo processing retains higher quality within the existing upload limits; private photo routes are excluded from optimisation and service-worker caching.
- Installable PWA manifest and PNG icons, public asset caching and an offline fallback. Account pages, messages, RSC responses and APIs are never cached by the service worker.
- Page metadata, structured data for actual listings, dynamic sitemap, robots and llms.txt.

## Deployment

Create/link the Vercel project to `thembaxx/nou2`, set its framework to Next.js and use `pnpm install --frozen-lockfile` / `pnpm build`. Connect a **new** Neon PostgreSQL database. Set `DATABASE_URL`, a private `BETTER_AUTH_SECRET`, production-only `BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS production origin. Keep preview databases separate from production. Do not give preview builds production database credentials.

Apply migrations before enabling accounts. Normal PostgreSQL uses `pnpm db:migrate`. For managed executors with HTTPS-only access to Neon, the included script applies these SQL migrations transactionally and records Prisma-compatible checksums:

```sh
node --env-file=.env.local scripts/migrate-neon.mjs
```

The migration script only creates Carpur tables and indexes. It does not insert sample listings, rewrite existing data or drop tables. Use it only against the intended Carpur database. `/api/health` verifies database tables and auth configuration without exposing secrets.

## Current limits

No external inventory feed, lender, insurer, credit bureau, vehicle-history, payment or automated email integration. Enquiries are delivered to the seller's Carpur inbox; the seller replies by email. Email verification and password recovery are pending. Seller/dealership identity and vehicle condition are unverified. Dealership team seats, moderation tooling and a dedicated privacy/support channel are pending. Photos are capped at 6 and 1 MB total per listing and stored as separate PostgreSQL bytea records, served on demand; object storage/CDN is recommended at scale. Inventory shows up to 200 published listings, new cars first and accounts support up to 100 listings; server pagination is pending. Comparison uses separate energy prices and charging allowances, with shared insurance/maintenance and conservative disclosed PHEV consumption; individual calculators support separate quotations. Native 3D coverage is currently Ferrari 458 family and BMW M3 E30. Model-family/year matching prevents showing those assets as unrelated cars; unmatched vehicles use photographs. These are artist models, not scans of seller stock. See public/models/CREDITS.md. Manufacturer coverage is currently Toyota; new sources and a verified stock feed are still needed for complete market coverage. Manufacturer photos are externally hosted. See docs/catalogue.md.

## Photography

Editorial images retain the archive’s Unsplash references for the hero, BMW and Mercedes-Benz. The archive’s incorrect Golf and Toyota images were replaced with attributed Wikimedia Commons photos. Editorial derivatives are bundled locally; manufacturer catalogue images stay on the manufacturer’s CDN. They are not evidence of model, trim, condition or a vehicle offered for sale. See `docs/photography.md` for source URLs.
